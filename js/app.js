// ==================== Modern Contract Assistant Application ====================
// Main application entry point with ES6+ features and modular architecture

import { ContractProcessor } from './modules/contractProcessor.js';
import { UIManager } from './modules/uiManager.js';
import { ValidationManager } from './modules/validationManager.js';
import { ThemeManager } from './modules/themeManager.js';
import { StatisticsManager } from './modules/statisticsManager.js';
import { FieldManager } from './modules/fieldManager.js';

class ContractAssistantApp {
    constructor() {
        this.version = '2.0.0';
        this.isInitialized = false;
        this.state = {
            referenceFile: null,
            originalContent: '',
            originalValues: {},
            contractsToProcess: [],
            isProcessing: false,
            detectedFields: new Set(),
            currentTask: 'در انتظار شروع...',
            processingStartTime: null
        };
        
        // Initialize managers
        this.contractProcessor = new ContractProcessor();
        this.uiManager = new UIManager();
        this.validationManager = new ValidationManager();
        this.themeManager = new ThemeManager();
        this.statisticsManager = new StatisticsManager();
        this.fieldManager = new FieldManager();
        
        // Bind methods
        this.init = this.init.bind(this);
        this.handleFileUpload = this.handleFileUpload.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.processContracts = this.processContracts.bind(this);
        this.reset = this.reset.bind(this);
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log(`🚀 Contract Assistant v${this.version} initializing...`);
            
            // Show loading screen
            this.showLoadingScreen();
            
            // Initialize all managers
            await this.initializeManagers();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize UI components
            this.initializeUIComponents();
            
            // Load saved state if available
            this.loadSavedState();
            
            // Hide loading screen and show main app
            this.hideLoadingScreen();
            
            this.isInitialized = true;
            console.log('✅ Application initialized successfully');
            
            // Show welcome message
            this.uiManager.showWelcomeMessage();
            
        } catch (error) {
            console.error('❌ Application initialization failed:', error);
            this.uiManager.showMessage('خطا در راه‌اندازی برنامه. لطفاً صفحه را تازه کنید.', 'error');
        }
    }

    /**
     * Initialize all managers
     */
    async initializeManagers() {
        const managers = [
            this.uiManager,
            this.themeManager,
            this.validationManager,
            this.statisticsManager,
            this.fieldManager,
            this.contractProcessor
        ];

        for (const manager of managers) {
            if (manager.init) {
                await manager.init();
            }
        }
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // File upload events
        this.setupFileUploadEvents();
        
        // Form events
        this.setupFormEvents();
        
        // Button events
        this.setupButtonEvents();
        
        // Modal events
        this.setupModalEvents();
        
        // Keyboard events
        this.setupKeyboardEvents();
        
        // Window events
        this.setupWindowEvents();
    }

    /**
     * Setup file upload event listeners
     */
    setupFileUploadEvents() {
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');

        // Click to select file
        dropZone?.addEventListener('click', () => fileInput?.click());
        
        // File input change
        fileInput?.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files[0]);
        });

        // Drag and drop events
        dropZone?.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('active');
        });

        dropZone?.addEventListener('dragleave', (e) => {
            if (!dropZone.contains(e.relatedTarget)) {
                dropZone.classList.remove('active');
            }
        });

        dropZone?.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('active');
            this.handleFileUpload(e.dataTransfer.files[0]);
        });

        // Keyboard accessibility for drop zone
        dropZone?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInput?.click();
            }
        });
    }

    /**
     * Setup form event listeners
     */
    setupFormEvents() {
        const contractForm = document.getElementById('contractForm');
        contractForm?.addEventListener('submit', this.handleFormSubmit);

        // Field selection events
        this.fieldManager.setupFieldSelectionEvents();
    }

    /**
     * Setup button event listeners
     */
    setupButtonEvents() {
        // Process contracts button
        const processBtn = document.getElementById('processBtn');
        processBtn?.addEventListener('click', this.processContracts);

        // Clear form button
        const clearFormBtn = document.getElementById('clearFormBtn');
        clearFormBtn?.addEventListener('click', () => {
            this.clearForm();
            this.uiManager.showMessage('فرم پاک شد.', 'success');
        });

        // Fill sample button
        const fillSampleBtn = document.getElementById('fillSampleBtn');
        fillSampleBtn?.addEventListener('click', () => {
            this.fillSampleData();
        });

        // Validate form button
        const validateFormBtn = document.getElementById('validateFormBtn');
        validateFormBtn?.addEventListener('click', () => {
            this.validateForm();
        });

        // Reset button
        const resetBtn = document.getElementById('resetBtn');
        resetBtn?.addEventListener('click', this.reset);

        // Clear queue button
        const clearQueueBtn = document.getElementById('clearQueueBtn');
        clearQueueBtn?.addEventListener('click', () => {
            this.clearQueue();
        });

        // Select all fields button
        const selectAllBtn = document.getElementById('selectAllFields');
        selectAllBtn?.addEventListener('click', () => {
            this.fieldManager.selectAllFields();
        });

        // Deselect all fields button
        const deselectAllBtn = document.getElementById('deselectAllFields');
        deselectAllBtn?.addEventListener('click', () => {
            this.fieldManager.deselectAllFields();
        });

        // Theme toggle button
        const themeToggle = document.getElementById('themeToggle');
        themeToggle?.addEventListener('click', () => {
            this.themeManager.toggleTheme();
        });

        // Help button
        const helpBtn = document.getElementById('helpBtn');
        helpBtn?.addEventListener('click', () => {
            this.showHelpModal();
        });
    }

    /**
     * Setup modal event listeners
     */
    setupModalEvents() {
        const helpModal = document.getElementById('helpModal');
        const closeHelpModal = document.getElementById('closeHelpModal');

        closeHelpModal?.addEventListener('click', () => {
            this.hideHelpModal();
        });

        helpModal?.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                this.hideHelpModal();
            }
        });
    }

    /**
     * Setup keyboard event listeners
     */
    setupKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            // Escape key to close modals
            if (e.key === 'Escape') {
                this.hideHelpModal();
            }

            // Ctrl+R to reset (prevent default browser refresh)
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                this.reset();
            }

            // Ctrl+Enter to submit form
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                const form = document.getElementById('contractForm');
                if (form) {
                    this.handleFormSubmit(new Event('submit'));
                }
            }
        });
    }

    /**
     * Setup window event listeners
     */
    setupWindowEvents() {
        // Save state before unload
        window.addEventListener('beforeunload', () => {
            this.saveState();
        });

        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.state.isProcessing) {
                // Pause processing if tab becomes hidden (optional)
                console.log('Tab hidden during processing');
            }
        });

        // Handle online/offline status
        window.addEventListener('online', () => {
            this.uiManager.showMessage('اتصال اینترنت برقرار شد.', 'success', 3000);
        });

        window.addEventListener('offline', () => {
            this.uiManager.showMessage('اتصال اینترنت قطع شد. برنامه همچنان کار می‌کند.', 'warning', 5000);
        });
    }

    /**
     * Initialize UI components
     */
    initializeUIComponents() {
        // Generate field checkboxes
        this.fieldManager.generateFieldCheckboxes();
        
        // Generate form sections
        this.fieldManager.generateFormSections();
        
        // Update statistics
        this.updateStatistics();
    }

    /**
     * Handle file upload
     */
    async handleFileUpload(file) {
        if (!file) {
            this.uiManager.showMessage('لطفاً یک فایل انتخاب کنید.', 'error');
            return;
        }

        if (!this.validationManager.validateFile(file)) {
            return;
        }

        try {
            this.state.referenceFile = file;
            this.uiManager.updateFileName(file.name);
            this.uiManager.updateFileAnalysis(file);
            
            // Extract data from file
            const result = await this.contractProcessor.extractDataFromFile(file);
            
            if (result.success) {
                this.state.originalContent = result.content;
                this.state.originalValues = result.values;
                this.state.detectedFields = new Set(Object.keys(result.values));
                
                // Populate form with extracted values
                this.populateForm(result.values);
                
                // Update UI
                this.fieldManager.updateDetectedFields(this.state.detectedFields);
                this.updateStatistics();
                
                this.uiManager.showMessage('تحلیل با موفقیت انجام شد. مقادیر شناسایی‌شده در فرم قرار گرفت.', 'success');
                
                // Enable add to list button
                this.enableAddToListButton();
                
            } else {
                throw new Error(result.error);
            }
            
        } catch (error) {
            console.error('File processing error:', error);
            this.uiManager.showMessage(`خطا در تحلیل فایل: ${error.message}`, 'error');
            this.disableAddToListButton();
        }
    }

    /**
     * Handle form submission
     */
    async handleFormSubmit(e) {
        e.preventDefault();

        try {
            // Get selected fields
            const selectedFields = this.fieldManager.getSelectedFields();
            
            if (selectedFields.length === 0) {
                this.uiManager.showMessage('لطفاً حداقل یک فیلد را برای ویرایش انتخاب کنید.', 'error');
                return;
            }

            // Get form values
            const formValues = this.getFormValues();
            
            // Validate form data
            const validation = this.validationManager.validateFormData(formValues, selectedFields);
            if (!validation.isValid) {
                this.uiManager.showMessage(validation.message, 'error');
                return;
            }

            // Create contract object
            const contract = {
                id: Date.now(),
                newValues: formValues,
                selectedFields: selectedFields,
                timestamp: new Date().toISOString()
            };

            // Add to processing queue
            this.state.contractsToProcess.push(contract);
            
            // Update UI
            this.updateContractList();
            this.updateStatistics();
            
            // Show success message
            const ownerName = formValues.owner_full_name || 'نامشخص';
            this.uiManager.showMessage(`قرارداد برای "${ownerName}" به صف ساخت اضافه شد.`, 'success');
            
            // Clear form after adding
            this.clearForm();
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.uiManager.showMessage(`خطا در افزودن قرارداد: ${error.message}`, 'error');
        }
    }

    /**
     * Process all contracts in queue
     */
    async processContracts() {
        if (this.state.contractsToProcess.length === 0) {
            this.uiManager.showMessage('هیچ قراردادی برای ساخت در صف وجود ندارد.', 'error');
            return;
        }

        try {
            this.state.isProcessing = true;
            this.state.processingStartTime = Date.now();
            
            // Disable UI elements
            this.disableProcessingButtons();
            
            // Show progress
            this.uiManager.showProgressSection();
            this.uiManager.updateProgress(0, 'شروع پردازش...');
            
            this.uiManager.showMessage('در حال ساخت گروهی قراردادها...', 'processing');

            // Process contracts
            const result = await this.contractProcessor.processContracts(
                this.state.contractsToProcess,
                this.state.referenceFile,
                this.state.originalContent,
                this.state.originalValues,
                (progress, task) => {
                    this.uiManager.updateProgress(progress, task);
                    this.state.currentTask = task;
                }
            );

            if (result.success) {
                // Download the ZIP file
                await this.contractProcessor.downloadZipFile(result.zipBlob);
                
                // Update statistics
                this.statisticsManager.addProcessedContracts(this.state.contractsToProcess.length);
                const processingTime = Math.round((Date.now() - this.state.processingStartTime) / 1000);
                this.statisticsManager.addProcessingTime(processingTime);
                
                // Show success message
                this.uiManager.showMessage(`✅ ${this.state.contractsToProcess.length} قرارداد با موفقیت ساخته و دانلود شد.`, 'success');
                
                // Clear the queue
                this.clearQueue();
                
            } else {
                throw new Error(result.error);
            }

        } catch (error) {
            console.error('Contract processing error:', error);
            this.uiManager.showMessage(`❌ خطای جدی در ساخت فایل‌ها: ${error.message}`, 'error');
        } finally {
            this.state.isProcessing = false;
            this.enableProcessingButtons();
            this.uiManager.hideProgressSection();
        }
    }

    /**
     * Reset the application
     */
    reset() {
        if (this.state.isProcessing) {
            this.uiManager.showMessage('نمی‌توان در حین پردازش ریست کرد.', 'warning');
            return;
        }

        // Reset state
        this.state = {
            referenceFile: null,
            originalContent: '',
            originalValues: {},
            contractsToProcess: [],
            isProcessing: false,
            detectedFields: new Set(),
            currentTask: 'در انتظار شروع...',
            processingStartTime: null
        };

        // Reset UI
        this.clearForm();
        this.fieldManager.resetFields();
        this.updateContractList();
        this.updateStatistics();
        this.uiManager.resetFileUpload();
        this.uiManager.hideAnalysisResults();
        
        this.uiManager.showMessage('برنامه ریست شد.', 'success');
    }

    /**
     * Clear the contract queue
     */
    clearQueue() {
        this.state.contractsToProcess = [];
        this.updateContractList();
        this.updateStatistics();
        this.uiManager.showMessage('صف قراردادها پاک شد.', 'success');
    }

    /**
     * Clear the form
     */
    clearForm() {
        const form = document.getElementById('contractForm');
        if (form) {
            form.reset();
        }
        this.fieldManager.deselectAllFields();
    }

    /**
     * Fill form with sample data
     */
    fillSampleData() {
        // Select all fields first
        this.fieldManager.selectAllFields();
        
        // Sample data
        const sampleData = {
            owner_full_name: 'علی محمدی',
            owner_father_name: 'حسین',
            owner_national_id: '1234567890',
            owner_mobile: '09123456789',
            owner_address: 'تهران، خیابان ولیعصر، پلاک 123',
            contract_start_date: '1403/01/01',
            contract_end_date: '1404/01/01',
            guarantee_amount: '10,000,000'
        };

        this.populateForm(sampleData);
        this.uiManager.showMessage('فرم با اطلاعات نمونه پر شد.', 'success');
    }

    /**
     * Validate the form
     */
    validateForm() {
        const selectedFields = this.fieldManager.getSelectedFields();
        const formValues = this.getFormValues();
        
        const validation = this.validationManager.validateFormData(formValues, selectedFields);
        
        if (validation.isValid) {
            this.uiManager.showMessage('✅ تمام فیلدها معتبر هستند.', 'success');
        } else {
            this.uiManager.showMessage(`❌ ${validation.message}`, 'error');
        }
    }

    /**
     * Show help modal
     */
    showHelpModal() {
        const modal = document.getElementById('helpModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Hide help modal
     */
    hideHelpModal() {
        const modal = document.getElementById('helpModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    /**
     * Get form values
     */
    getFormValues() {
        const formValues = {};
        const inputs = document.querySelectorAll('#contractForm [data-key]');
        
        inputs.forEach(input => {
            const key = input.dataset.key;
            formValues[key] = input.value.trim();
        });

        return formValues;
    }

    /**
     * Populate form with values
     */
    populateForm(values) {
        Object.entries(values).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element) {
                element.value = value || '';
            }
        });
    }

    /**
     * Update contract list display
     */
    updateContractList() {
        const contractList = document.getElementById('contractList');
        if (!contractList) return;

        if (this.state.contractsToProcess.length === 0) {
            contractList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox fa-2x"></i>
                    <p>قراردادی در صف ساخت نیست.</p>
                </div>
            `;
            this.disableProcessButton();
            this.disableClearQueueButton();
            return;
        }

        const contractItems = this.state.contractsToProcess.map((contract, index) => `
            <div class="contract-item" data-contract-id="${contract.id}">
                <div class="contract-info">
                    <div class="contract-index">${index + 1}</div>
                    <div class="contract-name">
                        قرارداد برای: <strong>${contract.newValues.owner_full_name || 'نامشخص'}</strong>
                    </div>
                </div>
                <button class="contract-remove" onclick="app.removeContract(${contract.id})" title="حذف از لیست">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        contractList.innerHTML = contractItems;
        this.enableProcessButton();
        this.enableClearQueueButton();
    }

    /**
     * Remove contract from queue
     */
    removeContract(contractId) {
        this.state.contractsToProcess = this.state.contractsToProcess.filter(
            contract => contract.id !== contractId
        );
        this.updateContractList();
        this.updateStatistics();
        this.uiManager.showMessage('قرارداد از صف حذف شد.', 'success');
    }

    /**
     * Update statistics display
     */
    updateStatistics() {
        this.statisticsManager.updateStats({
            fileCount: this.state.referenceFile ? 1 : 0,
            contractCount: this.state.contractsToProcess.length,
            detectedFields: this.state.detectedFields.size
        });
    }

    /**
     * Enable/disable buttons
     */
    enableAddToListButton() {
        const btn = document.getElementById('addToListBtn');
        if (btn) btn.disabled = false;
    }

    disableAddToListButton() {
        const btn = document.getElementById('addToListBtn');
        if (btn) btn.disabled = true;
    }

    enableProcessButton() {
        const btn = document.getElementById('processBtn');
        if (btn) btn.disabled = false;
    }

    disableProcessButton() {
        const btn = document.getElementById('processBtn');
        if (btn) btn.disabled = true;
    }

    enableClearQueueButton() {
        const btn = document.getElementById('clearQueueBtn');
        if (btn) btn.disabled = false;
    }

    disableClearQueueButton() {
        const btn = document.getElementById('clearQueueBtn');
        if (btn) btn.disabled = true;
    }

    disableProcessingButtons() {
        const buttons = ['processBtn', 'addToListBtn', 'clearFormBtn', 'fillSampleBtn', 'resetBtn'];
        buttons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.disabled = true;
        });
    }

    enableProcessingButtons() {
        const buttons = ['addToListBtn', 'clearFormBtn', 'fillSampleBtn', 'resetBtn'];
        buttons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.disabled = false;
        });
        
        if (this.state.contractsToProcess.length > 0) {
            this.enableProcessButton();
        }
    }

    /**
     * Show loading screen
     */
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        const mainApp = document.getElementById('mainApp');
        
        if (loadingScreen) loadingScreen.classList.remove('hidden');
        if (mainApp) mainApp.style.display = 'none';
    }

    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loadingScreen');
            const mainApp = document.getElementById('mainApp');
            
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }
            
            if (mainApp) {
                mainApp.style.display = 'block';
                mainApp.classList.add('fadeIn');
            }
        }, 1500); // Show loading for at least 1.5 seconds
    }

    /**
     * Save application state to localStorage
     */
    saveState() {
        try {
            const stateToSave = {
                contractsToProcess: this.state.contractsToProcess,
                originalValues: this.state.originalValues,
                detectedFields: Array.from(this.state.detectedFields),
                theme: this.themeManager.getCurrentTheme(),
                statistics: this.statisticsManager.getStats()
            };
            
            localStorage.setItem('contractAssistantState', JSON.stringify(stateToSave));
        } catch (error) {
            console.warn('Could not save state:', error);
        }
    }

    /**
     * Load application state from localStorage
     */
    loadSavedState() {
        try {
            const saved = localStorage.getItem('contractAssistantState');
            if (saved) {
                const state = JSON.parse(saved);
                
                // Restore contracts queue
                if (state.contractsToProcess) {
                    this.state.contractsToProcess = state.contractsToProcess;
                    this.updateContractList();
                }
                
                // Restore detected fields
                if (state.detectedFields) {
                    this.state.detectedFields = new Set(state.detectedFields);
                }
                
                // Restore theme
                if (state.theme) {
                    this.themeManager.setTheme(state.theme);
                }
                
                // Restore statistics
                if (state.statistics) {
                    this.statisticsManager.loadStats(state.statistics);
                }
                
                this.updateStatistics();
            }
        } catch (error) {
            console.warn('Could not load saved state:', error);
        }
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ContractAssistantApp();
    window.app.init();
});

// Handle module loading errors
window.addEventListener('error', (e) => {
    if (e.filename && e.filename.includes('.js')) {
        console.error('Module loading error:', e);
        // Fallback to basic functionality
    }
});

export default ContractAssistantApp;