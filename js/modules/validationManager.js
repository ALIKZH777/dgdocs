// ==================== Validation Manager Module ====================
// Comprehensive validation for files, forms, and data integrity

export class ValidationManager {
    constructor() {
        this.validationRules = {
            file: {
                maxSize: 10 * 1024 * 1024, // 10MB
                allowedExtensions: ['.docx'],
                allowedMimeTypes: [
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/octet-stream'
                ]
            },
            nationalId: {
                length: 10,
                pattern: /^\d{10}$/,
                invalidPatterns: [
                    /^(\d)\1{9}$/ // All same digits
                ]
            },
            mobile: {
                pattern: /^09\d{9}$/,
                length: 11
            },
            persianText: {
                pattern: /^[\u0600-\u06FF\u200C\u200D\s]+$/,
                minLength: 2,
                maxLength: 100
            },
            date: {
                pattern: /^\d{4}\/\d{1,2}\/\d{1,2}$/,
                yearRange: { min: 1300, max: 1500 }
            },
            amount: {
                pattern: /^[\d,]+$/,
                minValue: 1000,
                maxValue: 999999999999
            }
        };
        
        this.errorMessages = {
            fa: {
                required: 'این فیلد الزامی است.',
                invalidFormat: 'فرمت وارد شده صحیح نیست.',
                tooShort: 'مقدار وارد شده کوتاه است.',
                tooLong: 'مقدار وارد شده بلند است.',
                invalidNationalId: 'کد ملی وارد شده معتبر نیست.',
                invalidMobile: 'شماره موبایل معتبر نیست.',
                invalidDate: 'تاریخ وارد شده معتبر نیست.',
                invalidAmount: 'مبلغ وارد شده معتبر نیست.',
                fileTooLarge: 'حجم فایل بیش از حد مجاز است.',
                invalidFileType: 'نوع فایل پشتیبانی نمی‌شود.',
                invalidPersianText: 'فقط حروف فارسی مجاز است.'
            }
        };
    }

    /**
     * Initialize the validation manager
     */
    async init() {
        console.log('✅ Validation Manager initialized');
    }

    /**
     * Validate uploaded file
     */
    validateFile(file) {
        if (!file) {
            this.showValidationError('فایلی انتخاب نشده است.');
            return false;
        }

        // Check file size
        if (file.size > this.validationRules.file.maxSize) {
            const maxSizeMB = (this.validationRules.file.maxSize / (1024 * 1024)).toFixed(1);
            this.showValidationError(`حجم فایل نباید از ${maxSizeMB} مگابایت بیشتر باشد.`);
            return false;
        }

        // Check file extension
        const fileName = file.name.toLowerCase();
        const hasValidExtension = this.validationRules.file.allowedExtensions.some(ext => 
            fileName.endsWith(ext)
        );

        if (!hasValidExtension) {
            const allowedExts = this.validationRules.file.allowedExtensions.join(', ');
            this.showValidationError(`فقط فایل‌های با پسوند ${allowedExts} پشتیبانی می‌شوند.`);
            return false;
        }

        // Check MIME type (if available)
        if (file.type && !this.validationRules.file.allowedMimeTypes.includes(file.type)) {
            console.warn('MIME type mismatch, but proceeding due to extension check');
        }

        return true;
    }

    /**
     * Validate form data
     */
    validateFormData(formData, selectedFields) {
        const validationResults = {
            isValid: true,
            errors: [],
            warnings: [],
            message: ''
        };

        // Check if at least one field is selected
        if (!selectedFields || selectedFields.length === 0) {
            validationResults.isValid = false;
            validationResults.message = 'لطفاً حداقل یک فیلد را برای ویرایش انتخاب کنید.';
            return validationResults;
        }

        // Validate each selected field
        selectedFields.forEach(fieldKey => {
            const value = formData[fieldKey];
            const fieldValidation = this.validateField(fieldKey, value);
            
            if (!fieldValidation.isValid) {
                validationResults.isValid = false;
                validationResults.errors.push({
                    field: fieldKey,
                    message: fieldValidation.message
                });
            }

            if (fieldValidation.warnings && fieldValidation.warnings.length > 0) {
                validationResults.warnings.push(...fieldValidation.warnings.map(warning => ({
                    field: fieldKey,
                    message: warning
                })));
            }
        });

        // Cross-field validation
        const crossValidation = this.validateCrossFields(formData, selectedFields);
        if (!crossValidation.isValid) {
            validationResults.isValid = false;
            validationResults.errors.push(...crossValidation.errors);
        }

        // Generate summary message
        if (!validationResults.isValid) {
            const errorFields = validationResults.errors.map(error => 
                this.getFieldLabel(error.field)
            ).join('، ');
            validationResults.message = `خطا در فیلدهای: ${errorFields}`;
        } else if (validationResults.warnings.length > 0) {
            validationResults.message = `${validationResults.warnings.length} هشدار موجود است.`;
        } else {
            validationResults.message = 'همه اطلاعات معتبر است.';
        }

        return validationResults;
    }

    /**
     * Validate individual field
     */
    validateField(fieldKey, value) {
        const result = {
            isValid: true,
            message: '',
            warnings: []
        };

        // Handle empty values
        if (!value || value.trim() === '') {
            // For now, we allow empty optional fields
            return result;
        }

        const trimmedValue = value.trim();

        // Field-specific validation
        switch (fieldKey) {
            case 'owner_full_name':
            case 'owner_father_name':
                return this.validatePersianName(trimmedValue);
                
            case 'owner_national_id':
                return this.validateNationalId(trimmedValue);
                
            case 'owner_mobile':
                return this.validateMobileNumber(trimmedValue);
                
            case 'owner_address':
                return this.validateAddress(trimmedValue);
                
            case 'contract_start_date':
            case 'contract_end_date':
                return this.validateDate(trimmedValue);
                
            case 'guarantee_amount':
                return this.validateAmount(trimmedValue);
                
            case 'owner_id_number':
                return this.validateIdNumber(trimmedValue);
                
            default:
                return this.validateGenericText(trimmedValue);
        }
    }

    /**
     * Validate Persian name
     */
    validatePersianName(name) {
        const result = { isValid: true, message: '', warnings: [] };

        if (name.length < 2) {
            result.isValid = false;
            result.message = 'نام باید حداقل ۲ کاراکتر باشد.';
            return result;
        }

        if (name.length > 50) {
            result.isValid = false;
            result.message = 'نام نباید از ۵۰ کاراکتر بیشتر باشد.';
            return result;
        }

        if (!this.validationRules.persianText.pattern.test(name)) {
            result.isValid = false;
            result.message = 'نام باید فقط شامل حروف فارسی باشد.';
            return result;
        }

        // Check for suspicious patterns
        if (name.includes('  ')) {
            result.warnings.push('فاصله‌های اضافی در نام یافت شد.');
        }

        return result;
    }

    /**
     * Validate national ID
     */
    validateNationalId(nationalId) {
        const result = { isValid: true, message: '', warnings: [] };

        // Remove any non-digit characters
        const cleaned = nationalId.replace(/\D/g, '');

        if (cleaned.length !== 10) {
            result.isValid = false;
            result.message = 'کد ملی باید دقیقاً ۱۰ رقم باشد.';
            return result;
        }

        // Check for invalid patterns (all same digits)
        if (/^(\d)\1{9}$/.test(cleaned)) {
            result.isValid = false;
            result.message = 'کد ملی نمی‌تواند شامل ارقام یکسان باشد.';
            return result;
        }

        // Checksum validation
        if (!this.validateNationalIdChecksum(cleaned)) {
            result.isValid = false;
            result.message = 'کد ملی وارد شده معتبر نیست.';
            return result;
        }

        return result;
    }

    /**
     * Validate national ID checksum
     */
    validateNationalIdChecksum(nationalId) {
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(nationalId[i]) * (10 - i);
        }

        const remainder = sum % 11;
        const checkDigit = parseInt(nationalId[9]);

        return (remainder < 2 && checkDigit === remainder) || 
               (remainder >= 2 && checkDigit === 11 - remainder);
    }

    /**
     * Validate mobile number
     */
    validateMobileNumber(mobile) {
        const result = { isValid: true, message: '', warnings: [] };

        // Remove any non-digit characters
        const cleaned = mobile.replace(/\D/g, '');

        if (!this.validationRules.mobile.pattern.test(cleaned)) {
            result.isValid = false;
            result.message = 'شماره موبایل باید با ۰۹ شروع شده و ۱۱ رقم باشد.';
            return result;
        }

        // Check for known operator prefixes
        const operatorPrefixes = ['0901', '0902', '0903', '0905', '0910', '0911', '0912', '0913', '0914', '0915', '0916', '0917', '0918', '0919', '0990', '0991', '0992', '0993', '0994', '0995', '0996', '0997', '0998', '0999'];
        const prefix = cleaned.substring(0, 4);
        
        if (!operatorPrefixes.includes(prefix)) {
            result.warnings.push('پیش‌شماره موبایل ممکن است معتبر نباشد.');
        }

        return result;
    }

    /**
     * Validate address
     */
    validateAddress(address) {
        const result = { isValid: true, message: '', warnings: [] };

        if (address.length < 10) {
            result.isValid = false;
            result.message = 'آدرس باید حداقل ۱۰ کاراکتر باشد.';
            return result;
        }

        if (address.length > 200) {
            result.isValid = false;
            result.message = 'آدرس نباید از ۲۰۰ کاراکتر بیشتر باشد.';
            return result;
        }

        // Check for minimum required components
        const hasStreetInfo = /خیابان|کوچه|بلوار|جاده/.test(address);
        const hasNumberInfo = /پلاک|شماره|\d+/.test(address);

        if (!hasStreetInfo && !hasNumberInfo) {
            result.warnings.push('آدرس ممکن است ناقص باشد. اطلاعات خیابان یا پلاک اضافه کنید.');
        }

        return result;
    }

    /**
     * Validate date (Persian format)
     */
    validateDate(date) {
        const result = { isValid: true, message: '', warnings: [] };

        if (!this.validationRules.date.pattern.test(date)) {
            result.isValid = false;
            result.message = 'فرمت تاریخ صحیح نیست. مثال صحیح: ۱۴۰۳/۰۱/۰۱';
            return result;
        }

        // Parse date components
        const [year, month, day] = date.split('/').map(Number);

        // Validate year range
        if (year < this.validationRules.date.yearRange.min || year > this.validationRules.date.yearRange.max) {
            result.isValid = false;
            result.message = `سال باید بین ${this.validationRules.date.yearRange.min} تا ${this.validationRules.date.yearRange.max} باشد.`;
            return result;
        }

        // Validate month
        if (month < 1 || month > 12) {
            result.isValid = false;
            result.message = 'ماه باید بین ۱ تا ۱۲ باشد.';
            return result;
        }

        // Validate day
        const maxDays = month <= 6 ? 31 : (month <= 11 ? 30 : (this.isLeapYear(year) ? 30 : 29));
        if (day < 1 || day > maxDays) {
            result.isValid = false;
            result.message = `روز برای ماه ${month} معتبر نیست.`;
            return result;
        }

        return result;
    }

    /**
     * Check if a Persian year is leap year
     */
    isLeapYear(persianYear) {
        // Simplified leap year calculation for Persian calendar
        const cycle = persianYear % 128;
        const leapYears = [1, 5, 9, 13, 17, 22, 26, 30, 34, 38, 43, 47, 51, 55, 59, 64, 68, 72, 76, 80, 85, 89, 93, 97, 101, 106, 110, 114, 118, 122];
        return leapYears.includes(cycle);
    }

    /**
     * Validate amount
     */
    validateAmount(amount) {
        const result = { isValid: true, message: '', warnings: [] };

        if (!this.validationRules.amount.pattern.test(amount)) {
            result.isValid = false;
            result.message = 'مبلغ باید فقط شامل اعداد و کاما باشد.';
            return result;
        }

        // Parse amount (remove commas)
        const numericAmount = parseInt(amount.replace(/,/g, ''));

        if (isNaN(numericAmount)) {
            result.isValid = false;
            result.message = 'مبلغ وارد شده معتبر نیست.';
            return result;
        }

        if (numericAmount < this.validationRules.amount.minValue) {
            result.isValid = false;
            result.message = `مبلغ نباید از ${this.validationRules.amount.minValue.toLocaleString()} کمتر باشد.`;
            return result;
        }

        if (numericAmount > this.validationRules.amount.maxValue) {
            result.isValid = false;
            result.message = `مبلغ نباید از ${this.validationRules.amount.maxValue.toLocaleString()} بیشتر باشد.`;
            return result;
        }

        // Warning for unusually large amounts
        if (numericAmount > 1000000000) { // 1 billion
            result.warnings.push('مبلغ وارد شده بسیار بالا است. لطفاً صحت آن را بررسی کنید.');
        }

        return result;
    }

    /**
     * Validate ID number (شماره شناسنامه)
     */
    validateIdNumber(idNumber) {
        const result = { isValid: true, message: '', warnings: [] };

        const cleaned = idNumber.replace(/\D/g, '');

        if (cleaned.length < 1 || cleaned.length > 10) {
            result.isValid = false;
            result.message = 'شماره شناسنامه باید بین ۱ تا ۱۰ رقم باشد.';
            return result;
        }

        return result;
    }

    /**
     * Validate generic text
     */
    validateGenericText(text) {
        const result = { isValid: true, message: '', warnings: [] };

        if (text.length > 1000) {
            result.isValid = false;
            result.message = 'متن نباید از ۱۰۰۰ کاراکتر بیشتر باشد.';
            return result;
        }

        return result;
    }

    /**
     * Cross-field validation
     */
    validateCrossFields(formData, selectedFields) {
        const result = {
            isValid: true,
            errors: []
        };

        // Validate date range (start date should be before end date)
        if (selectedFields.includes('contract_start_date') && selectedFields.includes('contract_end_date')) {
            const startDate = formData.contract_start_date;
            const endDate = formData.contract_end_date;

            if (startDate && endDate) {
                const startParts = startDate.split('/').map(Number);
                const endParts = endDate.split('/').map(Number);

                const startDateObj = new Date(startParts[0], startParts[1] - 1, startParts[2]);
                const endDateObj = new Date(endParts[0], endParts[1] - 1, endParts[2]);

                if (startDateObj >= endDateObj) {
                    result.isValid = false;
                    result.errors.push({
                        field: 'contract_dates',
                        message: 'تاریخ شروع باید قبل از تاریخ پایان باشد.'
                    });
                }

                // Check for reasonable contract duration
                const diffDays = (endDateObj - startDateObj) / (1000 * 60 * 60 * 24);
                if (diffDays > 3650) { // More than 10 years
                    result.warnings = result.warnings || [];
                    result.warnings.push({
                        field: 'contract_dates',
                        message: 'مدت قرارداد بیش از ۱۰ سال است. لطفاً صحت تاریخ‌ها را بررسی کنید.'
                    });
                }
            }
        }

        return result;
    }

    /**
     * Get field label in Persian
     */
    getFieldLabel(fieldKey) {
        const labels = {
            owner_full_name: 'نام و نام خانوادگی',
            owner_father_name: 'نام پدر',
            owner_national_id: 'کد ملی',
            owner_id_number: 'شماره شناسنامه',
            owner_mobile: 'شماره موبایل',
            owner_address: 'آدرس',
            contract_start_date: 'تاریخ شروع',
            contract_end_date: 'تاریخ پایان',
            guarantee_amount: 'مبلغ سفته'
        };

        return labels[fieldKey] || fieldKey;
    }

    /**
     * Show validation error
     */
    showValidationError(message) {
        if (window.app && window.app.uiManager) {
            window.app.uiManager.showMessage(message, 'error');
        } else {
            console.error('Validation Error:', message);
        }
    }

    /**
     * Sanitize input value
     */
    sanitizeInput(value, type = 'text') {
        if (!value || typeof value !== 'string') {
            return '';
        }

        let sanitized = value.trim();

        switch (type) {
            case 'numeric':
                sanitized = sanitized.replace(/[^\d]/g, '');
                break;
            case 'persian':
                sanitized = sanitized.replace(/[^\u0600-\u06FF\u200C\u200D\s]/g, '');
                break;
            case 'phone':
                sanitized = sanitized.replace(/[^\d]/g, '');
                break;
            case 'amount':
                sanitized = sanitized.replace(/[^\d,]/g, '');
                break;
            case 'date':
                sanitized = sanitized.replace(/[^\d/]/g, '');
                break;
            default:
                // Remove potentially dangerous characters for text fields
                sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
                break;
        }

        return sanitized;
    }

    /**
     * Format phone number
     */
    formatPhoneNumber(phone) {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 11 && cleaned.startsWith('09')) {
            return cleaned.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');
        }
        return phone;
    }

    /**
     * Format national ID
     */
    formatNationalId(nationalId) {
        const cleaned = nationalId.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
        }
        return nationalId;
    }

    /**
     * Get validation summary
     */
    getValidationSummary(validationResults) {
        const summary = {
            totalFields: 0,
            validFields: 0,
            invalidFields: 0,
            warnings: 0,
            errors: validationResults.errors || [],
            warningsList: validationResults.warnings || []
        };

        summary.totalFields = summary.errors.length + summary.validFields;
        summary.invalidFields = summary.errors.length;
        summary.warnings = summary.warningsList.length;

        return summary;
    }

    /**
     * Create validation report
     */
    createValidationReport(validationResults) {
        const summary = this.getValidationSummary(validationResults);
        
        let report = `گزارش اعتبارسنجی:\n`;
        report += `- تعداد کل فیلدها: ${summary.totalFields}\n`;
        report += `- فیلدهای معتبر: ${summary.validFields}\n`;
        report += `- فیلدهای نامعتبر: ${summary.invalidFields}\n`;
        report += `- تعداد هشدارها: ${summary.warnings}\n\n`;

        if (summary.errors.length > 0) {
            report += `خطاها:\n`;
            summary.errors.forEach((error, index) => {
                report += `${index + 1}. ${this.getFieldLabel(error.field)}: ${error.message}\n`;
            });
            report += '\n';
        }

        if (summary.warningsList.length > 0) {
            report += `هشدارها:\n`;
            summary.warningsList.forEach((warning, index) => {
                report += `${index + 1}. ${this.getFieldLabel(warning.field)}: ${warning.message}\n`;
            });
        }

        return report;
    }
}

export default ValidationManager;