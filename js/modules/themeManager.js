// ==================== Theme Manager Module ====================
// Manages dark/light theme switching and user preferences

export class ThemeManager {
    constructor() {
        this.currentTheme = 'light';
        this.themes = {
            light: {
                name: 'روز',
                icon: 'fas fa-sun',
                properties: {
                    '--bg-primary': '#ffffff',
                    '--bg-secondary': '#f8f9fa',
                    '--bg-tertiary': '#e9ecef',
                    '--text-primary': '#212529',
                    '--text-secondary': '#6c757d',
                    '--text-muted': '#adb5bd',
                    '--border-color': '#dee2e6',
                    '--shadow-sm': '0 2px 4px rgba(0, 0, 0, 0.1)',
                    '--shadow-md': '0 4px 12px rgba(0, 0, 0, 0.15)',
                    '--shadow-lg': '0 8px 25px rgba(0, 0, 0, 0.2)'
                }
            },
            dark: {
                name: 'شب',
                icon: 'fas fa-moon',
                properties: {
                    '--bg-primary': '#1a1a1a',
                    '--bg-secondary': '#2d2d2d',
                    '--bg-tertiary': '#404040',
                    '--text-primary': '#ffffff',
                    '--text-secondary': '#b3b3b3',
                    '--text-muted': '#666666',
                    '--border-color': '#404040',
                    '--shadow-sm': '0 2px 4px rgba(0, 0, 0, 0.3)',
                    '--shadow-md': '0 4px 12px rgba(0, 0, 0, 0.4)',
                    '--shadow-lg': '0 8px 25px rgba(0, 0, 0, 0.5)'
                }
            },
            auto: {
                name: 'خودکار',
                icon: 'fas fa-adjust',
                properties: {} // Will be set based on system preference
            }
        };
        
        this.storageKey = 'contractAssistant_theme';
        this.transitionDuration = 300; // ms
    }

    /**
     * Initialize the theme manager
     */
    async init() {
        console.log('🎨 Theme Manager initialized');
        
        // Load saved theme preference
        this.loadThemePreference();
        
        // Set up system theme detection
        this.setupSystemThemeDetection();
        
        // Apply initial theme
        this.applyTheme(this.currentTheme);
        
        // Update theme toggle button
        this.updateThemeToggleButton();
    }

    /**
     * Load theme preference from localStorage
     */
    loadThemePreference() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved && this.themes[saved]) {
            this.currentTheme = saved;
        } else {
            // Default to system preference if no saved preference
            this.currentTheme = this.getSystemTheme();
        }
    }

    /**
     * Save theme preference to localStorage
     */
    saveThemePreference() {
        try {
            localStorage.setItem(this.storageKey, this.currentTheme);
        } catch (error) {
            console.warn('Could not save theme preference:', error);
        }
    }

    /**
     * Get system theme preference
     */
    getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    /**
     * Setup system theme detection
     */
    setupSystemThemeDetection() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            // Listen for changes in system theme
            mediaQuery.addEventListener('change', (e) => {
                if (this.currentTheme === 'auto') {
                    const systemTheme = e.matches ? 'dark' : 'light';
                    this.applyTheme(systemTheme, false);
                }
            });
        }
    }

    /**
     * Toggle between themes
     */
    toggleTheme() {
        const themeOrder = ['light', 'dark', 'auto'];
        const currentIndex = themeOrder.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themeOrder.length;
        const nextTheme = themeOrder[nextIndex];
        
        this.setTheme(nextTheme);
        
        // Show notification
        this.showThemeChangeNotification(nextTheme);
    }

    /**
     * Set specific theme
     */
    setTheme(themeName) {
        if (!this.themes[themeName]) {
            console.warn(`Unknown theme: ${themeName}`);
            return;
        }

        this.currentTheme = themeName;
        this.applyTheme(themeName);
        this.saveThemePreference();
        this.updateThemeToggleButton();
    }

    /**
     * Apply theme to document
     */
    applyTheme(themeName, animate = true) {
        const theme = this.themes[themeName];
        const root = document.documentElement;
        
        // Add transition for smooth theme change
        if (animate) {
            root.style.transition = `all ${this.transitionDuration}ms ease`;
        }

        // Determine actual theme to apply
        let actualTheme = theme;
        if (themeName === 'auto') {
            const systemTheme = this.getSystemTheme();
            actualTheme = this.themes[systemTheme];
        }

        // Apply CSS custom properties
        Object.entries(actualTheme.properties).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });

        // Set data attribute for CSS targeting
        root.setAttribute('data-theme', themeName);

        // Handle special cases for dark theme
        if (themeName === 'dark' || (themeName === 'auto' && this.getSystemTheme() === 'dark')) {
            this.applyDarkThemeSpecifics();
        } else {
            this.removeDarkThemeSpecifics();
        }

        // Remove transition after animation completes
        if (animate) {
            setTimeout(() => {
                root.style.transition = '';
            }, this.transitionDuration);
        }

        // Emit theme change event
        this.emitThemeChangeEvent(themeName);
    }

    /**
     * Apply dark theme specific styles
     */
    applyDarkThemeSpecifics() {
        // Invert images that might look better inverted
        const images = document.querySelectorAll('img:not([data-no-invert])');
        images.forEach(img => {
            if (!img.classList.contains('no-dark-invert')) {
                img.style.filter = 'brightness(0.8) contrast(1.2)';
            }
        });

        // Adjust scrollbar for dark theme
        this.injectDarkScrollbarStyles();
    }

    /**
     * Remove dark theme specific styles
     */
    removeDarkThemeSpecifics() {
        // Restore image filters
        const images = document.querySelectorAll('img:not([data-no-invert])');
        images.forEach(img => {
            img.style.filter = '';
        });

        // Remove dark scrollbar styles
        this.removeDarkScrollbarStyles();
    }

    /**
     * Inject dark scrollbar styles
     */
    injectDarkScrollbarStyles() {
        let darkScrollbarStyle = document.getElementById('dark-scrollbar-style');
        
        if (!darkScrollbarStyle) {
            darkScrollbarStyle = document.createElement('style');
            darkScrollbarStyle.id = 'dark-scrollbar-style';
            document.head.appendChild(darkScrollbarStyle);
        }

        darkScrollbarStyle.textContent = `
            /* Dark theme scrollbar */
            ::-webkit-scrollbar {
                width: 8px;
                height: 8px;
            }
            
            ::-webkit-scrollbar-track {
                background: var(--bg-secondary);
            }
            
            ::-webkit-scrollbar-thumb {
                background: var(--text-secondary);
                border-radius: 4px;
            }
            
            ::-webkit-scrollbar-thumb:hover {
                background: var(--text-primary);
            }
            
            /* Firefox */
            * {
                scrollbar-width: thin;
                scrollbar-color: var(--text-secondary) var(--bg-secondary);
            }
        `;
    }

    /**
     * Remove dark scrollbar styles
     */
    removeDarkScrollbarStyles() {
        const darkScrollbarStyle = document.getElementById('dark-scrollbar-style');
        if (darkScrollbarStyle) {
            darkScrollbarStyle.remove();
        }
    }

    /**
     * Update theme toggle button
     */
    updateThemeToggleButton() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;

        const theme = this.themes[this.currentTheme];
        const icon = themeToggle.querySelector('i');
        
        if (icon) {
            icon.className = theme.icon;
        }
        
        themeToggle.title = `تم فعلی: ${theme.name}`;
        
        // Add visual feedback
        themeToggle.classList.add('theme-changing');
        setTimeout(() => {
            themeToggle.classList.remove('theme-changing');
        }, this.transitionDuration);
    }

    /**
     * Show theme change notification
     */
    showThemeChangeNotification(themeName) {
        const theme = this.themes[themeName];
        const message = `تم به "${theme.name}" تغییر یافت`;
        
        if (window.app && window.app.uiManager) {
            window.app.uiManager.showMessage(message, 'info', 3000);
        }
    }

    /**
     * Emit theme change event
     */
    emitThemeChangeEvent(themeName) {
        const event = new CustomEvent('themeChanged', {
            detail: {
                theme: themeName,
                actualTheme: themeName === 'auto' ? this.getSystemTheme() : themeName
            }
        });
        
        document.dispatchEvent(event);
    }

    /**
     * Get current theme
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * Get effective theme (resolves 'auto' to actual theme)
     */
    getEffectiveTheme() {
        if (this.currentTheme === 'auto') {
            return this.getSystemTheme();
        }
        return this.currentTheme;
    }

    /**
     * Check if dark theme is active
     */
    isDarkTheme() {
        return this.getEffectiveTheme() === 'dark';
    }

    /**
     * Add theme-specific classes to elements
     */
    addThemeClasses() {
        const body = document.body;
        const effectiveTheme = this.getEffectiveTheme();
        
        // Remove existing theme classes
        body.classList.remove('theme-light', 'theme-dark');
        
        // Add current theme class
        body.classList.add(`theme-${effectiveTheme}`);
    }

    /**
     * Preload theme assets
     */
    async preloadThemeAssets() {
        // Preload any theme-specific images or resources
        const themeAssets = {
            dark: [
                // Add any dark theme specific assets
            ],
            light: [
                // Add any light theme specific assets
            ]
        };

        for (const [theme, assets] of Object.entries(themeAssets)) {
            for (const asset of assets) {
                try {
                    const link = document.createElement('link');
                    link.rel = 'preload';
                    link.href = asset;
                    link.as = 'image';
                    document.head.appendChild(link);
                } catch (error) {
                    console.warn(`Failed to preload theme asset: ${asset}`, error);
                }
            }
        }
    }

    /**
     * Create theme selection menu
     */
    createThemeMenu() {
        const menu = document.createElement('div');
        menu.className = 'theme-menu';
        menu.innerHTML = `
            <div class="theme-menu-header">
                <h4>انتخاب تم</h4>
            </div>
            <div class="theme-options">
                ${Object.entries(this.themes).map(([key, theme]) => `
                    <button class="theme-option ${key === this.currentTheme ? 'active' : ''}" 
                            data-theme="${key}">
                        <i class="${theme.icon}"></i>
                        <span>${theme.name}</span>
                    </button>
                `).join('')}
            </div>
        `;

        // Add event listeners
        menu.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const selectedTheme = e.currentTarget.dataset.theme;
                this.setTheme(selectedTheme);
                
                // Update active state
                menu.querySelectorAll('.theme-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                e.currentTarget.classList.add('active');
            });
        });

        return menu;
    }

    /**
     * Handle reduced motion preference
     */
    respectReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            this.transitionDuration = 0;
            document.documentElement.style.setProperty('--transition-base', 'none');
            document.documentElement.style.setProperty('--transition-fast', 'none');
            document.documentElement.style.setProperty('--transition-slow', 'none');
        }
    }

    /**
     * Export theme configuration
     */
    exportThemeConfig() {
        return {
            currentTheme: this.currentTheme,
            effectiveTheme: this.getEffectiveTheme(),
            themes: this.themes,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Import theme configuration
     */
    importThemeConfig(config) {
        try {
            if (config.currentTheme && this.themes[config.currentTheme]) {
                this.setTheme(config.currentTheme);
                return true;
            }
        } catch (error) {
            console.warn('Failed to import theme config:', error);
        }
        return false;
    }

    /**
     * Add custom CSS for theme-specific styles
     */
    injectThemeStyles() {
        if (document.getElementById('theme-manager-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'theme-manager-styles';
        style.textContent = `
            .theme-changing {
                animation: themeChange 0.3s ease;
            }
            
            @keyframes themeChange {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
            
            .theme-menu {
                background: var(--bg-primary);
                border: 1px solid var(--border-color);
                border-radius: var(--border-radius);
                box-shadow: var(--shadow-lg);
                padding: var(--spacing-md);
                min-width: 200px;
            }
            
            .theme-menu-header {
                padding-bottom: var(--spacing-sm);
                border-bottom: 1px solid var(--border-color);
                margin-bottom: var(--spacing-sm);
            }
            
            .theme-menu-header h4 {
                margin: 0;
                color: var(--text-primary);
            }
            
            .theme-options {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-xs);
            }
            
            .theme-option {
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                padding: var(--spacing-sm);
                border: none;
                background: transparent;
                border-radius: var(--border-radius);
                cursor: pointer;
                transition: var(--transition-fast);
                color: var(--text-primary);
                text-align: right;
                width: 100%;
            }
            
            .theme-option:hover {
                background: var(--bg-secondary);
            }
            
            .theme-option.active {
                background: var(--secondary-color);
                color: var(--text-light);
            }
            
            .theme-option i {
                width: 1.2rem;
                text-align: center;
            }
            
            /* Dark theme specific adjustments */
            [data-theme="dark"] .upload-icon {
                filter: brightness(1.2);
            }
            
            [data-theme="dark"] .feature-icon {
                filter: brightness(1.1);
            }
            
            /* Auto theme indicator */
            [data-theme="auto"] body::before {
                content: "تم خودکار فعال";
                position: fixed;
                bottom: 20px;
                left: 20px;
                background: var(--primary-color);
                color: var(--text-light);
                padding: 0.5rem 1rem;
                border-radius: var(--border-radius);
                font-size: var(--font-size-sm);
                opacity: 0.8;
                z-index: var(--z-tooltip);
                pointer-events: none;
                animation: fadeInOut 3s ease;
            }
            
            @keyframes fadeInOut {
                0%, 100% { opacity: 0; }
                20%, 80% { opacity: 0.8; }
            }
        `;
        
        document.head.appendChild(style);
    }
}

export default ThemeManager;