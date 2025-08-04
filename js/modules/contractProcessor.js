// ==================== Contract Processor Module ====================
// Advanced contract processing with AI-powered field detection

export class ContractProcessor {
    constructor() {
        this.fieldDefinitions = {
            owner_full_name: {
                label: 'نام و نام خانوادگی مالک',
                patterns: [
                    /نام و نام خانوادگی[:\s]*([^<\n\r]+)/i,
                    /نام مالک[:\s]*([^<\n\r]+)/i,
                    /نام کامل[:\s]*([^<\n\r]+)/i
                ],
                tablePattern: this.createTableAwareRegex('نام و نام خانوادگی:'),
                validation: (value) => value.length >= 2 && value.length <= 50
            },
            owner_father_name: {
                label: 'نام پدر',
                patterns: [
                    /نام پدر[:\s]*([^<\n\r]+)/i,
                    /فرزند[:\s]*([^<\n\r]+)/i
                ],
                tablePattern: this.createTableAwareRegex('نام پدر:'),
                validation: (value) => value.length >= 2 && value.length <= 30
            },
            owner_national_id: {
                label: 'کد ملی مالک',
                patterns: [
                    /کد ملی[:\s]*([0-9]{8,10})/i,
                    /شماره ملی[:\s]*([0-9]{8,10})/i
                ],
                tablePattern: this.createTableAwareRegex('کد ملی:'),
                validation: (value) => this.validateNationalId(value)
            },
            owner_id_number: {
                label: 'شماره شناسنامه',
                patterns: [
                    /شماره شناسنامه[:\s]*([0-9]+)/i,
                    /ش\.ش[:\s]*([0-9]+)/i
                ],
                tablePattern: this.createTableAwareRegex('شماره شناسنامه:'),
                validation: (value) => /^\d{1,10}$/.test(value)
            },
            owner_mobile: {
                label: 'شماره موبایل',
                patterns: [
                    /شماره تلفن همراه[:\s]*([0-9\-\s+()]+)/i,
                    /موبایل[:\s]*([0-9\-\s+()]+)/i,
                    /تلفن[:\s]*([0-9\-\s+()]+)/i
                ],
                tablePattern: this.createTableAwareRegex('شماره تلفن همراه:'),
                validation: (value) => this.validatePhoneNumber(value)
            },
            owner_address: {
                label: 'آدرس مالک',
                patterns: [
                    /نشانی اقامتگاه[:\s]*([^<]+?)(?=<|$)/i,
                    /آدرس[:\s]*([^<]+?)(?=<|$)/i,
                    /محل سکونت[:\s]*([^<]+?)(?=<|$)/i
                ],
                tablePattern: this.createTableAwareRegex('نشانی اقامتگاه:'),
                validation: (value) => value.length >= 5 && value.length <= 200
            },
            contract_start_date: {
                label: 'تاریخ شروع قرارداد',
                patterns: [
                    /از\s*تاریخ\s*([0-9/\-\s]+)/i,
                    /شروع\s*از[:\s]*([0-9/\-\s]+)/i
                ],
                validation: (value) => this.validateDate(value)
            },
            contract_end_date: {
                label: 'تاریخ پایان قرارداد',
                patterns: [
                    /تا\s*([0-9/\-\s]+)\s*معتبر است/i,
                    /پایان[:\s]*([0-9/\-\s]+)/i
                ],
                validation: (value) => this.validateDate(value)
            },
            guarantee_amount: {
                label: 'مبلغ سفته',
                patterns: [
                    /یک عدد سفته به مبلغ\s*([0-9,\s]+)\s*ریال/i,
                    /مبلغ سفته[:\s]*([0-9,\s]+)/i,
                    /مبلغ ضمانت[:\s]*([0-9,\s]+)/i
                ],
                validation: (value) => this.validateAmount(value)
            }
        };
    }

    /**
     * Initialize the processor
     */
    async init() {
        console.log('📄 Contract Processor initialized');
    }

    /**
     * Create table-aware regex for Word document structure
     */
    createTableAwareRegex(label) {
        return new RegExp(`<w:t>${label}<\\/w:t>.*?<\\/w:tc>.*?<w:tc.*?>(.*?)<\\/w:tc>`, 'i');
    }

    /**
     * Extract data from uploaded Word file
     */
    async extractDataFromFile(file) {
        try {
            console.log('🔍 Starting file analysis...');
            
            // Validate file before processing
            if (!this.validateFileFormat(file)) {
                throw new Error('فرمت فایل نامعتبر است');
            }

            // Read file as array buffer
            const buffer = await file.arrayBuffer();
            
            // Extract content using JSZip
            const zip = await JSZip.loadAsync(buffer);
            const docFile = zip.file("word/document.xml");
            
            if (!docFile) {
                throw new Error("فایل Word نامعتبر است یا آسیب دیده");
            }

            const originalContent = await docFile.async("string");
            
            // Extract field values
            const extractedValues = await this.extractFieldValues(originalContent);
            
            // Post-process and clean values
            const cleanedValues = this.postProcessValues(extractedValues);
            
            console.log('✅ File analysis completed successfully');
            console.log('Extracted fields:', Object.keys(cleanedValues));

            return {
                success: true,
                content: originalContent,
                values: cleanedValues,
                fieldsCount: Object.keys(cleanedValues).length
            };

        } catch (error) {
            console.error('❌ File extraction failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Validate file format and size
     */
    validateFileFormat(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/octet-stream' // Sometimes .docx files are detected as this
        ];

        if (file.size > maxSize) {
            throw new Error('حجم فایل بیش از حد مجاز است (حداکثر 10 مگابایت)');
        }

        if (!file.name.toLowerCase().endsWith('.docx')) {
            throw new Error('فقط فایل‌های با پسوند .docx پشتیبانی می‌شوند');
        }

        return true;
    }

    /**
     * Extract field values from document content
     */
    async extractFieldValues(content) {
        const extractedValues = {};
        
        // Clean content for better text analysis
        const cleanTextContent = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        const structuralContent = content.replace(/(\r\n|\n|\r)/gm, " ");

        // Extract each field
        for (const [fieldKey, fieldDef] of Object.entries(this.fieldDefinitions)) {
            try {
                let value = null;

                // Try table-aware extraction first (for structured documents)
                if (fieldDef.tablePattern) {
                    const tableMatch = structuralContent.match(fieldDef.tablePattern);
                    if (tableMatch && tableMatch[1]) {
                        value = this.cleanExtractedValue(tableMatch[1]);
                    }
                }

                // If no table match, try text patterns
                if (!value && fieldDef.patterns) {
                    for (const pattern of fieldDef.patterns) {
                        const match = cleanTextContent.match(pattern);
                        if (match && match[1]) {
                            value = this.cleanExtractedValue(match[1]);
                            break;
                        }
                    }
                }

                // Special handling for dates (combined extraction)
                if (fieldKey === 'contract_start_date' || fieldKey === 'contract_end_date') {
                    const dateMatch = cleanTextContent.match(/از\s*تاریخ\s*(.*?)\s*تا\s*(.*?)\s*معتبر است/i);
                    if (dateMatch) {
                        if (fieldKey === 'contract_start_date') {
                            value = this.cleanExtractedValue(dateMatch[1]);
                        } else if (fieldKey === 'contract_end_date') {
                            value = this.cleanExtractedValue(dateMatch[2]);
                        }
                    }
                }

                if (value && value.trim()) {
                    extractedValues[fieldKey] = value.trim();
                }

            } catch (error) {
                console.warn(`Warning: Could not extract ${fieldKey}:`, error);
            }
        }

        return extractedValues;
    }

    /**
     * Clean extracted value from XML tags and extra whitespace
     */
    cleanExtractedValue(value) {
        if (!value) return '';
        
        let cleaned = value.replace(/<[^>]+>/g, ' '); // Remove XML tags
        cleaned = cleaned.replace(/\s+/g, ' '); // Normalize whitespace
        cleaned = cleaned.replace(/\s*\/\s*/g, '/'); // Clean date separators
        cleaned = cleaned.trim();
        
        // Remove common prefixes/suffixes
        cleaned = cleaned.replace(/^[:\-\s]+|[:\-\s]+$/g, '');
        
        return cleaned;
    }

    /**
     * Post-process extracted values
     */
    postProcessValues(values) {
        const processed = {};
        
        for (const [key, value] of Object.entries(values)) {
            if (!value) continue;
            
            let processedValue = value;
            
            // Field-specific processing
            switch (key) {
                case 'owner_national_id':
                    processedValue = this.formatNationalId(value);
                    break;
                case 'owner_mobile':
                    processedValue = this.formatPhoneNumber(value);
                    break;
                case 'contract_start_date':
                case 'contract_end_date':
                    processedValue = this.formatDate(value);
                    break;
                case 'guarantee_amount':
                    processedValue = this.formatAmount(value);
                    break;
                case 'owner_full_name':
                case 'owner_father_name':
                    processedValue = this.formatName(value);
                    break;
                case 'owner_address':
                    processedValue = this.formatAddress(value);
                    break;
            }
            
            // Validate processed value
            const fieldDef = this.fieldDefinitions[key];
            if (fieldDef && fieldDef.validation && !fieldDef.validation(processedValue)) {
                console.warn(`Validation failed for ${key}: ${processedValue}`);
                continue;
            }
            
            processed[key] = processedValue;
        }
        
        return processed;
    }

    /**
     * Process multiple contracts
     */
    async processContracts(contracts, referenceFile, originalContent, originalValues, progressCallback) {
        try {
            console.log(`🏭 Processing ${contracts.length} contracts...`);
            
            const finalZip = new JSZip();
            let processedCount = 0;
            
            for (let i = 0; i < contracts.length; i++) {
                const contract = contracts[i];
                
                // Update progress
                const progress = (i / contracts.length) * 90; // Reserve 10% for final ZIP creation
                progressCallback(progress, `پردازش قرارداد ${i + 1} از ${contracts.length}...`);
                
                // Process individual contract
                const result = await this.processSingleContract(
                    contract,
                    referenceFile,
                    originalContent,
                    originalValues
                );
                
                if (result.success) {
                    const fileName = this.generateFileName(contract.newValues);
                    finalZip.file(fileName, result.blob);
                    processedCount++;
                } else {
                    console.error(`Failed to process contract for ${contract.newValues.owner_full_name}:`, result.error);
                }
                
                // Small delay to prevent blocking UI
                await this.sleep(10);
            }
            
            // Generate final ZIP
            progressCallback(95, 'در حال ایجاد فایل ZIP...');
            const zipBlob = await finalZip.generateAsync({ 
                type: "blob",
                compression: "DEFLATE",
                compressionOptions: { level: 6 }
            });
            
            progressCallback(100, 'تکمیل شد');
            
            console.log(`✅ Successfully processed ${processedCount}/${contracts.length} contracts`);
            
            return {
                success: true,
                zipBlob: zipBlob,
                processedCount: processedCount,
                totalCount: contracts.length
            };
            
        } catch (error) {
            console.error('❌ Contract processing failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Process a single contract
     */
    async processSingleContract(contract, referenceFile, originalContent, originalValues) {
        try {
            let processedContent = originalContent;
            
            // Replace values for selected fields only
            for (const fieldKey of contract.selectedFields) {
                const oldValue = originalValues[fieldKey];
                const newValue = contract.newValues[fieldKey];
                
                if (oldValue && newValue && oldValue !== newValue) {
                    // Escape special regex characters
                    const escapedOldValue = oldValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const regex = new RegExp(escapedOldValue, 'g');
                    
                    // Count replacements for verification
                    const matches = (processedContent.match(regex) || []).length;
                    if (matches > 0) {
                        processedContent = processedContent.replace(regex, newValue);
                        console.log(`✓ Replaced ${matches} occurrences of "${oldValue}" with "${newValue}"`);
                    }
                }
            }
            
            // Create new Word document
            const tempZip = await JSZip.loadAsync(await referenceFile.arrayBuffer());
            tempZip.file("word/document.xml", processedContent);
            
            const outputBlob = await tempZip.generateAsync({ 
                type: "blob",
                mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            });
            
            return {
                success: true,
                blob: outputBlob
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Generate filename for contract
     */
    generateFileName(values) {
        const ownerName = values.owner_full_name || 'نامشخص';
        const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        
        // Sanitize filename
        const sanitizedName = ownerName
            .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\u200C\u200D\uFB50-\uFDFF\uFE70-\uFEFF\w\s]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 30);
        
        return `قرارداد_${sanitizedName}_${timestamp}.docx`;
    }

    /**
     * Download ZIP file
     */
    async downloadZipFile(zipBlob) {
        const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const fileName = `قراردادهای_ساخته_شده_${timestamp}.zip`;
        
        if (window.saveAs) {
            // Use FileSaver.js if available
            saveAs(zipBlob, fileName);
        } else {
            // Fallback method
            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }

    /**
     * Validation methods
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

    validatePhoneNumber(phone) {
        if (!phone) return false;
        const cleaned = phone.replace(/\D/g, '');
        return /^(09\d{9}|0\d{10})$/.test(cleaned);
    }

    validateDate(date) {
        if (!date) return false;
        return /^\d{4}\/\d{1,2}\/\d{1,2}$/.test(date.trim());
    }

    validateAmount(amount) {
        if (!amount) return false;
        const cleaned = amount.replace(/[,\s]/g, '');
        return /^\d+$/.test(cleaned) && parseInt(cleaned) > 0;
    }

    /**
     * Formatting methods
     */
    formatNationalId(id) {
        return id.replace(/\D/g, '').substring(0, 10);
    }

    formatPhoneNumber(phone) {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 11 && cleaned.startsWith('09')) {
            return cleaned;
        }
        return phone;
    }

    formatDate(date) {
        return date.trim().replace(/[\-\.]/g, '/');
    }

    formatAmount(amount) {
        const cleaned = amount.replace(/[^\d]/g, '');
        return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    formatName(name) {
        return name.replace(/\s+/g, ' ').trim();
    }

    formatAddress(address) {
        return address.replace(/\s+/g, ' ').trim();
    }

    /**
     * Utility methods
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export default ContractProcessor;