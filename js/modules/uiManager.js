// ==================== UI Manager Module ====================
// Manages all user interface interactions and updates

export class UIManager {
    constructor() {
        this.messageTimeout = null;
        this.animations = {
            fadeIn: 'fadeIn',
            slideDown: 'slideDown',
            bounce: 'bounce',
            pulse: 'pulse',
            shimmer: 'shimmer'
        };
    }

    /**
     * Initialize the UI manager
     */
    async init() {
        console.log('🎨 UI Manager initialized');
        this.setupTooltips();
        this.setupAnimationObserver();
    }

    /**
     * Show welcome message
     */
    showWelcomeMessage() {
        setTimeout(() => {
            this.showMessage('خوش آمدید! فایل قرارداد مرجع خود را آپلود کنید تا شروع کنیم.', 'info', 5000);
        }, 2000);
    }

    /**
     * Show message with auto-hide functionality
     */
    showMessage(text, type = 'info', duration = 8000) {
        const statusMessage = document.getElementById('statusMessage');
        if (!statusMessage) return;

        // Clear previous timeout
        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout);
        }

        // Set message
        statusMessage.textContent = text;
        statusMessage.className = `status-message ${type}`;
        statusMessage.style.display = 'block';

        // Add animation
        statusMessage.classList.add(this.animations.slideDown);

        // Auto-hide after duration
        if (duration > 0) {
            this.messageTimeout = setTimeout(() => {
                this.hideMessage();
            }, duration);
        }

        // Remove animation class after animation completes
        setTimeout(() => {
            statusMessage.classList.remove(this.animations.slideDown);
        }, 500);
    }

    /**
     * Hide status message
     */
    hideMessage() {
        const statusMessage = document.getElementById('statusMessage');
        if (statusMessage) {
            statusMessage.style.display = 'none';
            statusMessage.className = 'status-message';
        }

        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout);
            this.messageTimeout = null;
        }
    }

    /**
     * Update file name display
     */
    updateFileName(fileName) {
        const fileNameElement = document.getElementById('fileName');
        if (fileNameElement) {
            fileNameElement.textContent = `فایل مرجع: ${fileName}`;
            fileNameElement.classList.add(this.animations.fadeIn);
            
            // Add success styling
            const dropZone = document.getElementById('dropZone');
            if (dropZone) {
                dropZone.classList.add('active');
            }
        }
    }

    /**
     * Update file analysis results
     */
    updateFileAnalysis(file) {
        const analysisResults = document.getElementById('analysisResults');
        const fileSize = document.getElementById('fileSize');
        const lastModified = document.getElementById('lastModified');
        
        if (analysisResults && fileSize && lastModified) {
            // Show analysis section
            analysisResults.style.display = 'block';
            analysisResults.classList.add(this.animations.fadeIn);
            
            // Update file size
            const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
            fileSize.textContent = `${sizeInMB} مگابایت`;
            
            // Update last modified date
            const modifiedDate = new Date(file.lastModified).toLocaleDateString('fa-IR');
            lastModified.textContent = modifiedDate;
        }
    }

    /**
     * Hide analysis results
     */
    hideAnalysisResults() {
        const analysisResults = document.getElementById('analysisResults');
        if (analysisResults) {
            analysisResults.style.display = 'none';
        }
    }

    /**
     * Reset file upload display
     */
    resetFileUpload() {
        const fileNameElement = document.getElementById('fileName');
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        
        if (fileNameElement) {
            fileNameElement.textContent = '';
        }
        
        if (dropZone) {
            dropZone.classList.remove('active');
        }
        
        if (fileInput) {
            fileInput.value = '';
        }
        
        this.hideAnalysisResults();
    }

    /**
     * Show progress section
     */
    showProgressSection() {
        const progressSection = document.getElementById('progressSection');
        if (progressSection) {
            progressSection.style.display = 'block';
            progressSection.classList.add(this.animations.fadeIn);
        }
    }

    /**
     * Hide progress section
     */
    hideProgressSection() {
        const progressSection = document.getElementById('progressSection');
        if (progressSection) {
            progressSection.style.display = 'none';
        }
    }

    /**
     * Update progress bar and text
     */
    updateProgress(percentage, task = '') {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const currentTask = document.getElementById('currentTask');
        
        if (progressFill) {
            progressFill.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${Math.round(percentage)}%`;
        }
        
        if (currentTask && task) {
            currentTask.textContent = task;
        }
    }

    /**
     * Create animated notification
     */
    createNotification(title, message, type = 'info', duration = 5000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-header">
                <h4>${title}</h4>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="notification-body">
                <p>${message}</p>
            </div>
        `;
        
        // Add to page
        let notificationContainer = document.querySelector('.notification-container');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.className = 'notification-container';
            document.body.appendChild(notificationContainer);
        }
        
        notificationContainer.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.parentElement.removeChild(notification);
                    }
                }, 300);
            }, duration);
        }
    }

    /**
     * Show loading overlay on specific element
     */
    showElementLoading(elementId, message = 'در حال بارگذاری...') {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        // Create loading overlay
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <p>${message}</p>
            </div>
        `;
        
        // Add to element
        element.style.position = 'relative';
        element.appendChild(overlay);
    }

    /**
     * Hide loading overlay
     */
    hideElementLoading(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const overlay = element.querySelector('.loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    /**
     * Create modal dialog
     */
    createModal(title, content, options = {}) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                ${options.showFooter ? `
                    <div class="modal-footer">
                        ${options.footerContent || ''}
                    </div>
                ` : ''}
            </div>
        `;
        
        // Add event listeners
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => this.closeModal(modal));
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal);
            }
        });
        
        // Add to page
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        return modal;
    }

    /**
     * Close modal
     */
    closeModal(modal) {
        if (modal && modal.parentElement) {
            modal.parentElement.removeChild(modal);
            document.body.style.overflow = 'auto';
        }
    }

    /**
     * Setup tooltips for elements with title attribute
     */
    setupTooltips() {
        document.addEventListener('mouseover', (e) => {
            if (e.target.hasAttribute('title') || e.target.hasAttribute('data-tooltip')) {
                this.showTooltip(e.target, e);
            }
        });
        
        document.addEventListener('mouseout', (e) => {
            if (e.target.hasAttribute('title') || e.target.hasAttribute('data-tooltip')) {
                this.hideTooltip();
            }
        });
    }

    /**
     * Show tooltip
     */
    showTooltip(element, event) {
        const text = element.getAttribute('title') || element.getAttribute('data-tooltip');
        if (!text) return;
        
        // Remove title to prevent default browser tooltip
        if (element.hasAttribute('title')) {
            element.setAttribute('data-original-title', text);
            element.removeAttribute('title');
        }
        
        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'custom-tooltip';
        tooltip.textContent = text;
        
        document.body.appendChild(tooltip);
        
        // Position tooltip
        const rect = element.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 5}px`;
        
        // Show tooltip
        setTimeout(() => {
            tooltip.classList.add('show');
        }, 10);
    }

    /**
     * Hide tooltip
     */
    hideTooltip() {
        const tooltip = document.querySelector('.custom-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
        
        // Restore original title
        const elements = document.querySelectorAll('[data-original-title]');
        elements.forEach(el => {
            el.setAttribute('title', el.getAttribute('data-original-title'));
            el.removeAttribute('data-original-title');
        });
    }

    /**
     * Setup animation observer for scroll-triggered animations
     */
    setupAnimationObserver() {
        if (!window.IntersectionObserver) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Observe elements with animation classes
        document.querySelectorAll('.feature-card, .stat-card, .panel').forEach(el => {
            observer.observe(el);
        });
    }

    /**
     * Smooth scroll to element
     */
    scrollToElement(elementId, offset = 0) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const targetPosition = element.offsetTop - offset;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }

    /**
     * Highlight element temporarily
     */
    highlightElement(elementId, duration = 2000) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        element.classList.add('highlight');
        
        setTimeout(() => {
            element.classList.remove('highlight');
        }, duration);
    }

    /**
     * Create confirm dialog
     */
    async confirm(title, message, options = {}) {
        return new Promise((resolve) => {
            const modal = this.createModal(title, `
                <p>${message}</p>
            `, {
                showFooter: true,
                footerContent: `
                    <button class="btn btn-outline confirm-cancel">انصراف</button>
                    <button class="btn btn-accent confirm-ok">تأیید</button>
                `
            });
            
            const cancelBtn = modal.querySelector('.confirm-cancel');
            const okBtn = modal.querySelector('.confirm-ok');
            
            cancelBtn.addEventListener('click', () => {
                this.closeModal(modal);
                resolve(false);
            });
            
            okBtn.addEventListener('click', () => {
                this.closeModal(modal);
                resolve(true);
            });
        });
    }

    /**
     * Create alert dialog
     */
    alert(title, message) {
        const modal = this.createModal(title, `
            <p>${message}</p>
        `, {
            showFooter: true,
            footerContent: `
                <button class="btn btn-primary alert-ok">تأیید</button>
            `
        });
        
        const okBtn = modal.querySelector('.alert-ok');
        okBtn.addEventListener('click', () => {
            this.closeModal(modal);
        });
        
        // Focus the OK button
        setTimeout(() => {
            okBtn.focus();
        }, 100);
    }

    /**
     * Update button loading state
     */
    setButtonLoading(buttonId, loading = true, originalText = '') {
        const button = document.getElementById(buttonId);
        if (!button) return;
        
        if (loading) {
            if (!button.hasAttribute('data-original-text')) {
                button.setAttribute('data-original-text', button.textContent);
            }
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال پردازش...';
            button.disabled = true;
        } else {
            const original = button.getAttribute('data-original-text') || originalText;
            button.textContent = original;
            button.disabled = false;
            button.removeAttribute('data-original-text');
        }
    }

    /**
     * Create progress toast notification
     */
    createProgressToast(title, initialMessage = '') {
        const toast = document.createElement('div');
        toast.className = 'progress-toast';
        toast.innerHTML = `
            <div class="progress-toast-header">
                <h4>${title}</h4>
                <button class="progress-toast-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="progress-toast-body">
                <p class="progress-message">${initialMessage}</p>
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
            </div>
        `;
        
        // Position toast
        toast.style.position = 'fixed';
        toast.style.top = '20px';
        toast.style.right = '20px';
        toast.style.zIndex = '10000';
        
        document.body.appendChild(toast);
        
        // Add close functionality
        const closeBtn = toast.querySelector('.progress-toast-close');
        closeBtn.addEventListener('click', () => {
            toast.remove();
        });
        
        return {
            element: toast,
            updateProgress: (percentage, message = '') => {
                const progressFill = toast.querySelector('.progress-fill');
                const progressMessage = toast.querySelector('.progress-message');
                
                if (progressFill) {
                    progressFill.style.width = `${percentage}%`;
                }
                
                if (progressMessage && message) {
                    progressMessage.textContent = message;
                }
            },
            close: () => {
                toast.remove();
            }
        };
    }

    /**
     * Add custom CSS for dynamic elements
     */
    addCustomStyles() {
        if (document.getElementById('ui-manager-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'ui-manager-styles';
        style.textContent = `
            .notification-container {
                position: fixed;
                top: 20px;
                left: 20px;
                z-index: 10000;
                pointer-events: none;
            }
            
            .notification {
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                margin-bottom: 10px;
                transform: translateX(-100%);
                transition: transform 0.3s ease;
                pointer-events: auto;
                max-width: 400px;
            }
            
            .notification.show {
                transform: translateX(0);
            }
            
            .custom-tooltip {
                position: absolute;
                background: #333;
                color: white;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 0.8rem;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.2s ease;
                pointer-events: none;
            }
            
            .custom-tooltip.show {
                opacity: 1;
            }
            
            .loading-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255,255,255,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }
            
            .loading-spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid var(--primary-color);
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .highlight {
                animation: highlight 2s ease;
            }
            
            @keyframes highlight {
                0%, 100% { background-color: transparent; }
                50% { background-color: rgba(255, 235, 59, 0.3); }
            }
            
            .progress-toast {
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                min-width: 300px;
                animation: slideInRight 0.3s ease;
            }
            
            @keyframes slideInRight {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
            }
        `;
        
        document.head.appendChild(style);
    }
}

export default UIManager;