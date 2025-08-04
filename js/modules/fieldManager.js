// ==================== Field Manager Module ====================
// Manages form fields, checkboxes, and field-related operations

export class FieldManager {
    constructor() {
        this.fieldDefinitions = {
            owner_full_name: {
                label: 'نام و نام خانوادگی مالک',
                type: 'text',
                required: true,
                placeholder: 'نام و نام خانوادگی کامل',
                validation: {
                    minLength: 2,
                    maxLength: 50,
                    pattern: /^[\u0600-\u06FF\s]+$/
                }
            },
            owner_father_name: {
                label: 'نام پدر',
                type: 'text',
                required: false,
                placeholder: 'نام پدر',
                validation: {
                    minLength: 2,
                    maxLength: 30,
                    pattern: /^[\u0600-\u06FF\s]+$/
                }
            },
            owner_national_id: {
                label: 'کد ملی مالک',
                type: 'text',
                required: false,
                placeholder: '1234567890',
                validation: {
                    pattern: /^\d{10}$/,
                    custom: this.validateNationalId
                }
            },
            owner_id_number: {
                label: 'شماره شناسنامه',
                type: 'text',
                required: false,
                placeholder: '123456',
                validation: {
                    pattern: /^\d{1,10}$/
                }
            },
            owner_mobile: {
                label: 'شماره موبایل',
                type: 'tel',
                required: false,
                placeholder: '09123456789',
                validation: {
                    pattern: /^09\d{9}$/
                }
            },
            owner_address: {
                label: 'آدرس مالک',
                type: 'textarea',
                required: false,
                placeholder: 'آدرس کامل محل سکونت',
                validation: {
                    minLength: 5,
                    maxLength: 200
                }
            },
            contract_start_date: {
                label: 'تاریخ شروع قرارداد',
                type: 'text',
                required: false,
                placeholder: '1403/01/01',
                validation: {
                    pattern: /^\d{4}\/\d{1,2}\/\d{1,2}$/
                }
            },
            contract_end_date: {
                label: 'تاریخ پایان قرارداد',
                type: 'text',
                required: false,
                placeholder: '1404/01/01',
                validation: {
                    pattern: /^\d{4}\/\d{1,2}\/\d{1,2}$/
                }
            },
            guarantee_amount: {
                label: 'مبلغ سفته',
                type: 'text',
                required: false,
                placeholder: '10,000,000',
                validation: {
                    pattern: /^[\d,]+$/
                }
            }
        };

        this.selectedFields = new Set();
        this.detectedFields = new Set();
    }

    /**
     * Initialize the field manager
     */
    async init() {
        console.log('📝 Field Manager initialized');
    }

    /**
     * Generate field checkboxes
     */
    generateFieldCheckboxes() {
        const container = document.getElementById('fieldCheckboxes');
        if (!container) return;

        container.innerHTML = '';

        Object.entries(this.fieldDefinitions).forEach(([fieldKey, fieldDef]) => {
            const checkboxDiv = document.createElement('div');
            checkboxDiv.className = 'field-checkbox';
            checkboxDiv.innerHTML = `
                <input type="checkbox" id="chk_${fieldKey}" data-field="${fieldKey}">
                <label for="chk_${fieldKey}">${fieldDef.label}</label>
                <div class="field-status">
                    <i class="fas fa-eye-slash field-detected-icon" title="فیلد شناسایی نشده"></i>
                </div>
            `;

            container.appendChild(checkboxDiv);
        });

        this.setupFieldCheckboxEvents();
    }

    /**
     * Generate form sections
     */
    generateFormSections() {
        const container = document.getElementById('fieldSections');
        if (!container) return;

        container.innerHTML = '';

        Object.entries(this.fieldDefinitions).forEach(([fieldKey, fieldDef]) => {
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'field-section';
            sectionDiv.id = `section_${fieldKey}`;

            let inputElement;
            if (fieldDef.type === 'textarea') {
                inputElement = `
                    <textarea 
                        id="${fieldKey}" 
                        data-key="${fieldKey}" 
                        placeholder="${fieldDef.placeholder}"
                        rows="3"
                        ${fieldDef.required ? 'required' : ''}
                    ></textarea>
                `;
            } else {
                inputElement = `
                    <input 
                        type="${fieldDef.type}" 
                        id="${fieldKey}" 
                        data-key="${fieldKey}" 
                        placeholder="${fieldDef.placeholder}"
                        ${fieldDef.required ? 'required' : ''}
                    >
                `;
            }

            // Special handling for date fields
            if (fieldKey === 'contract_start_date' || fieldKey === 'contract_end_date') {
                if (fieldKey === 'contract_start_date') {
                    sectionDiv.innerHTML = `
                        <div class="input-group">
                            <div class="form-group">
                                <label for="contract_start_date">تاریخ شروع قرارداد</label>
                                <input type="text" id="contract_start_date" data-key="contract_start_date" placeholder="1403/01/01">
                            </div>
                            <div class="form-group">
                                <label for="contract_end_date">تاریخ پایان قرارداد</label>
                                <input type="text" id="contract_end_date" data-key="contract_end_date" placeholder="1404/01/01">
                            </div>
                        </div>
                    `;
                }
                // Skip contract_end_date as it's handled with start_date
                if (fieldKey === 'contract_end_date') return;
            } else {
                sectionDiv.innerHTML = `
                    <div class="form-group">
                        <label for="${fieldKey}">
                            ${fieldDef.label}
                            ${fieldDef.required ? '<span class="required">*</span>' : ''}
                        </label>
                        ${inputElement}
                        <div class="field-validation-message" id="validation_${fieldKey}"></div>
                    </div>
                `;
            }

            container.appendChild(sectionDiv);
        });

        this.setupFormValidation();
    }

    /**
     * Setup field checkbox events
     */
    setupFieldCheckboxEvents() {
        document.querySelectorAll('.field-checkbox input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.handleFieldSelection(e.target);
                this.updateFieldVisibility();
            });
        });
    }

    /**
     * Setup field selection events (called from main app)
     */
    setupFieldSelectionEvents() {
        // This method is called from the main app to ensure proper integration
        this.setupFieldCheckboxEvents();
    }

    /**
     * Handle field selection
     */
    handleFieldSelection(checkbox) {
        const fieldKey = checkbox.dataset.field;
        const checkboxContainer = checkbox.closest('.field-checkbox');

        if (checkbox.checked) {
            this.selectedFields.add(fieldKey);
            checkboxContainer.classList.add('checked');
            
            // Special handling for contract dates
            if (fieldKey === 'contract_dates') {
                this.selectedFields.add('contract_start_date');
                this.selectedFields.add('contract_end_date');
            }
        } else {
            this.selectedFields.delete(fieldKey);
            checkboxContainer.classList.remove('checked');
            
            // Special handling for contract dates
            if (fieldKey === 'contract_dates') {
                this.selectedFields.delete('contract_start_date');
                this.selectedFields.delete('contract_end_date');
            }
        }

        this.updateFieldSectionVisibility(fieldKey, checkbox.checked);
    }

    /**
     * Update field visibility based on selection
     */
    updateFieldVisibility() {
        Object.keys(this.fieldDefinitions).forEach(fieldKey => {
            const isSelected = this.selectedFields.has(fieldKey);
            this.updateFieldSectionVisibility(fieldKey, isSelected);
        });
    }

    /**
     * Update field section visibility
     */
    updateFieldSectionVisibility(fieldKey, isVisible) {
        let sectionId = `section_${fieldKey}`;
        
        // Special handling for contract dates
        if (fieldKey === 'contract_dates') {
            sectionId = 'section_contract_start_date';
        }

        const section = document.getElementById(sectionId);
        if (section) {
            if (isVisible) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        }
    }

    /**
     * Select all fields
     */
    selectAllFields() {
        document.querySelectorAll('.field-checkbox input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = true;
            this.handleFieldSelection(checkbox);
        });
        
        this.showMessage('همه فیلدها انتخاب شدند.', 'success');
    }

    /**
     * Deselect all fields
     */
    deselectAllFields() {
        document.querySelectorAll('.field-checkbox input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
            this.handleFieldSelection(checkbox);
        });
        
        this.selectedFields.clear();
        this.showMessage('انتخاب همه فیلدها لغو شد.', 'info');
    }

    /**
     * Get selected fields
     */
    getSelectedFields() {
        return Array.from(this.selectedFields);
    }

    /**
     * Update detected fields
     */
    updateDetectedFields(detectedFields) {
        this.detectedFields = new Set(detectedFields);
        
        // Update field status indicators
        Object.keys(this.fieldDefinitions).forEach(fieldKey => {
            const checkbox = document.getElementById(`chk_${fieldKey}`);
            const icon = checkbox?.closest('.field-checkbox')?.querySelector('.field-detected-icon');
            
            if (icon) {
                if (this.detectedFields.has(fieldKey)) {
                    icon.className = 'fas fa-eye field-detected-icon';
                    icon.title = 'فیلد شناسایی شده';
                    icon.style.color = 'var(--success-color)';
                } else {
                    icon.className = 'fas fa-eye-slash field-detected-icon';
                    icon.title = 'فیلد شناسایی نشده';
                    icon.style.color = 'var(--text-muted)';
                }
            }
        });

        // Update detected fields count
        const detectedFieldsElement = document.getElementById('detectedFields');
        if (detectedFieldsElement) {
            detectedFieldsElement.textContent = this.detectedFields.size;
        }
    }

    /**
     * Reset all fields
     */
    resetFields() {
        this.selectedFields.clear();
        this.detectedFields.clear();
        
        // Reset checkboxes
        document.querySelectorAll('.field-checkbox input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
            checkbox.closest('.field-checkbox').classList.remove('checked');
        });
        
        // Hide all sections
        document.querySelectorAll('.field-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Reset field status indicators
        document.querySelectorAll('.field-detected-icon').forEach(icon => {
            icon.className = 'fas fa-eye-slash field-detected-icon';
            icon.title = 'فیلد شناسایی نشده';
            icon.style.color = 'var(--text-muted)';
        });
    }

    /**
     * Setup form validation
     */
    setupFormValidation() {
        Object.keys(this.fieldDefinitions).forEach(fieldKey => {
            const input = document.getElementById(fieldKey);
            if (input) {
                // Real-time validation
                input.addEventListener('input', () => {
                    this.validateField(fieldKey);
                });
                
                input.addEventListener('blur', () => {
                    this.validateField(fieldKey);
                });
            }
        });
    }

    /**
     * Validate a single field
     */
    validateField(fieldKey) {
        const fieldDef = this.fieldDefinitions[fieldKey];
        const input = document.getElementById(fieldKey);
        const validationMessage = document.getElementById(`validation_${fieldKey}`);
        
        if (!input || !fieldDef) return true;
        
        const value = input.value.trim();
        
        // Clear previous validation styling
        input.classList.remove('invalid', 'valid');
        if (validationMessage) {
            validationMessage.textContent = '';
        }
        
        // Skip validation if field is not selected or empty (and not required)
        if (!this.selectedFields.has(fieldKey) || (!value && !fieldDef.required)) {
            return true;
        }
        
        // Required field validation
        if (fieldDef.required && !value) {
            this.showFieldError(input, validationMessage, 'این فیلد الزامی است.');
            return false;
        }
        
        if (!value) return true; // Empty optional field is valid
        
        // Length validation
        if (fieldDef.validation?.minLength && value.length < fieldDef.validation.minLength) {
            this.showFieldError(input, validationMessage, `حداقل ${fieldDef.validation.minLength} کاراکتر وارد کنید.`);
            return false;
        }
        
        if (fieldDef.validation?.maxLength && value.length > fieldDef.validation.maxLength) {
            this.showFieldError(input, validationMessage, `حداکثر ${fieldDef.validation.maxLength} کاراکتر مجاز است.`);
            return false;
        }
        
        // Pattern validation
        if (fieldDef.validation?.pattern && !fieldDef.validation.pattern.test(value)) {
            this.showFieldError(input, validationMessage, this.getPatternErrorMessage(fieldKey));
            return false;
        }
        
        // Custom validation
        if (fieldDef.validation?.custom && !fieldDef.validation.custom(value)) {
            this.showFieldError(input, validationMessage, this.getCustomErrorMessage(fieldKey));
            return false;
        }
        
        // If we get here, field is valid
        input.classList.add('valid');
        return true;
    }

    /**
     * Show field error
     */
    showFieldError(input, messageElement, message) {
        input.classList.add('invalid');
        if (messageElement) {
            messageElement.textContent = message;
            messageElement.style.color = 'var(--error-color)';
        }
    }

    /**
     * Get pattern error message
     */
    getPatternErrorMessage(fieldKey) {
        const messages = {
            owner_full_name: 'نام باید فقط شامل حروف فارسی باشد.',
            owner_father_name: 'نام پدر باید فقط شامل حروف فارسی باشد.',
            owner_national_id: 'کد ملی باید ۱۰ رقم باشد.',
            owner_id_number: 'شماره شناسنامه باید فقط شامل اعداد باشد.',
            owner_mobile: 'شماره موبایل باید با ۰۹ شروع شده و ۱۱ رقم باشد.',
            contract_start_date: 'فرمت تاریخ صحیح نیست. (مثال: ۱۴۰۳/۰۱/۰۱)',
            contract_end_date: 'فرمت تاریخ صحیح نیست. (مثال: ۱۴۰۳/۰۱/۰۱)',
            guarantee_amount: 'مبلغ باید فقط شامل اعداد و کاما باشد.'
        };
        
        return messages[fieldKey] || 'فرمت وارد شده صحیح نیست.';
    }

    /**
     * Get custom error message
     */
    getCustomErrorMessage(fieldKey) {
        const messages = {
            owner_national_id: 'کد ملی وارد شده معتبر نیست.'
        };
        
        return messages[fieldKey] || 'مقدار وارد شده معتبر نیست.';
    }

    /**
     * Validate national ID
     */
    validateNationalId(id) {
        if (!id || typeof id !== 'string') return false;
        
        const cleaned = id.replace(/\D/g, '');
        if (cleaned.length !== 10) return false;
        
        // Check for invalid patterns
        if (/^(\d)\1{9}$/.test(cleaned)) return false;
        
        // Checksum validation
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cleaned[i]) * (10 - i);
        }
        
        const remainder = sum % 11;
        const checkDigit = parseInt(cleaned[9]);
        
        return (remainder < 2 && checkDigit === remainder) || 
               (remainder >= 2 && checkDigit === 11 - remainder);
    }

    /**
     * Validate all selected fields
     */
    validateAllFields() {
        let isValid = true;
        const errors = [];
        
        this.getSelectedFields().forEach(fieldKey => {
            if (!this.validateField(fieldKey)) {
                isValid = false;
                const fieldDef = this.fieldDefinitions[fieldKey];
                errors.push(fieldDef.label);
            }
        });
        
        return {
            isValid,
            errors,
            message: isValid ? 'همه فیلدها معتبر هستند.' : `خطا در فیلدهای: ${errors.join('، ')}`
        };
    }

    /**
     * Get field definition
     */
    getFieldDefinition(fieldKey) {
        return this.fieldDefinitions[fieldKey];
    }

    /**
     * Get all field definitions
     */
    getAllFieldDefinitions() {
        return this.fieldDefinitions;
    }

    /**
     * Show message (utility method)
     */
    showMessage(message, type) {
        // This will be called from the main app's UI manager
        if (window.app && window.app.uiManager) {
            window.app.uiManager.showMessage(message, type);
        }
    }

    /**
     * Auto-format field values
     */
    setupAutoFormatting() {
        // National ID formatting
        const nationalIdInput = document.getElementById('owner_national_id');
        if (nationalIdInput) {
            nationalIdInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').substring(0, 10);
            });
        }
        
        // Mobile number formatting
        const mobileInput = document.getElementById('owner_mobile');
        if (mobileInput) {
            mobileInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 11) {
                    value = value.substring(0, 11);
                }
                if (value.length > 0 && !value.startsWith('09')) {
                    if (value.startsWith('9')) {
                        value = '0' + value;
                    }
                }
                e.target.value = value;
            });
        }
        
        // Amount formatting (add commas)
        const amountInput = document.getElementById('guarantee_amount');
        if (amountInput) {
            amountInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/[^\d]/g, '');
                if (value) {
                    value = parseInt(value).toLocaleString();
                }
                e.target.value = value;
            });
        }
    }
}

export default FieldManager;