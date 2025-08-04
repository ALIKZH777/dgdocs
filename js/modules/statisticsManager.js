// ==================== Statistics Manager Module ====================
// Tracks usage statistics and performance metrics

export class StatisticsManager {
    constructor() {
        this.statistics = {
            sessionStats: {
                filesUploaded: 0,
                contractsCreated: 0,
                contractsProcessed: 0,
                totalProcessingTime: 0,
                sessionsCount: 0,
                startTime: null,
                lastActivity: null
            },
            allTimeStats: {
                totalSessions: 0,
                totalFilesUploaded: 0,
                totalContractsCreated: 0,
                totalContractsProcessed: 0,
                totalProcessingTime: 0,
                firstUsed: null,
                lastUsed: null,
                averageContractsPerSession: 0,
                averageProcessingTime: 0
            },
            performance: {
                averageFileAnalysisTime: 0,
                averageContractProcessingTime: 0,
                peakMemoryUsage: 0,
                errorCount: 0,
                successRate: 100
            },
            usage: {
                mostUsedFields: {},
                preferredTheme: 'light',
                totalFormSubmissions: 0,
                totalValidationErrors: 0,
                featuresUsed: new Set()
            }
        };
        
        this.storageKey = 'contractAssistant_statistics';
        this.performanceMarks = new Map();
        this.startTime = Date.now();
    }

    /**
     * Initialize the statistics manager
     */
    async init() {
        console.log('📊 Statistics Manager initialized');
        
        // Load saved statistics
        this.loadStatistics();
        
        // Start new session
        this.startSession();
        
        // Set up automatic save
        this.setupAutoSave();
        
        // Set up performance monitoring
        this.setupPerformanceMonitoring();
        
        // Update UI with current stats
        this.updateStatsDisplay();
    }

    /**
     * Load statistics from localStorage
     */
    loadStatistics() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const loadedStats = JSON.parse(saved);
                
                // Merge with default structure (in case new fields were added)
                this.statistics = {
                    ...this.statistics,
                    ...loadedStats,
                    allTimeStats: {
                        ...this.statistics.allTimeStats,
                        ...loadedStats.allTimeStats
                    },
                    performance: {
                        ...this.statistics.performance,
                        ...loadedStats.performance
                    },
                    usage: {
                        ...this.statistics.usage,
                        ...loadedStats.usage,
                        featuresUsed: new Set(loadedStats.usage?.featuresUsed || [])
                    }
                };
            }
        } catch (error) {
            console.warn('Could not load statistics:', error);
        }
    }

    /**
     * Save statistics to localStorage
     */
    saveStatistics() {
        try {
            const toSave = {
                ...this.statistics,
                usage: {
                    ...this.statistics.usage,
                    featuresUsed: Array.from(this.statistics.usage.featuresUsed)
                }
            };
            
            localStorage.setItem(this.storageKey, JSON.stringify(toSave));
        } catch (error) {
            console.warn('Could not save statistics:', error);
        }
    }

    /**
     * Start a new session
     */
    startSession() {
        const now = Date.now();
        
        // Update session stats
        this.statistics.sessionStats.startTime = now;
        this.statistics.sessionStats.lastActivity = now;
        this.statistics.sessionStats.sessionsCount++;
        
        // Update all-time stats
        this.statistics.allTimeStats.totalSessions++;
        this.statistics.allTimeStats.lastUsed = now;
        
        if (!this.statistics.allTimeStats.firstUsed) {
            this.statistics.allTimeStats.firstUsed = now;
        }
        
        // Track feature usage
        this.trackFeatureUsage('session_started');
        
        this.saveStatistics();
    }

    /**
     * Update activity timestamp
     */
    updateActivity() {
        this.statistics.sessionStats.lastActivity = Date.now();
    }

    /**
     * Track file upload
     */
    trackFileUpload(fileSize, analysisTime) {
        this.statistics.sessionStats.filesUploaded++;
        this.statistics.allTimeStats.totalFilesUploaded++;
        
        // Update performance metrics
        if (analysisTime) {
            const currentAvg = this.statistics.performance.averageFileAnalysisTime;
            const count = this.statistics.allTimeStats.totalFilesUploaded;
            this.statistics.performance.averageFileAnalysisTime = 
                (currentAvg * (count - 1) + analysisTime) / count;
        }
        
        this.trackFeatureUsage('file_upload');
        this.updateActivity();
        this.saveStatistics();
        this.updateStatsDisplay();
    }

    /**
     * Track contract creation
     */
    trackContractCreation(selectedFields) {
        this.statistics.sessionStats.contractsCreated++;
        this.statistics.allTimeStats.totalContractsCreated++;
        this.statistics.usage.totalFormSubmissions++;
        
        // Track field usage
        selectedFields.forEach(field => {
            if (!this.statistics.usage.mostUsedFields[field]) {
                this.statistics.usage.mostUsedFields[field] = 0;
            }
            this.statistics.usage.mostUsedFields[field]++;
        });
        
        this.trackFeatureUsage('contract_creation');
        this.updateActivity();
        this.saveStatistics();
        this.updateStatsDisplay();
    }

    /**
     * Track contract processing
     */
    trackContractProcessing(contractCount, processingTime) {
        this.statistics.sessionStats.contractsProcessed += contractCount;
        this.statistics.allTimeStats.totalContractsProcessed += contractCount;
        
        // Update processing time
        if (processingTime) {
            this.statistics.sessionStats.totalProcessingTime += processingTime;
            this.statistics.allTimeStats.totalProcessingTime += processingTime;
            
            // Update average processing time
            const avgTime = this.statistics.performance.averageContractProcessingTime;
            const totalProcessed = this.statistics.allTimeStats.totalContractsProcessed;
            this.statistics.performance.averageContractProcessingTime = 
                (avgTime * (totalProcessed - contractCount) + processingTime) / totalProcessed;
        }
        
        this.trackFeatureUsage('contract_processing');
        this.updateActivity();
        this.calculateDerivedStats();
        this.saveStatistics();
        this.updateStatsDisplay();
    }

    /**
     * Track validation errors
     */
    trackValidationError(fieldName, errorType) {
        this.statistics.usage.totalValidationErrors++;
        this.statistics.performance.errorCount++;
        
        // Calculate success rate
        const totalAttempts = this.statistics.usage.totalFormSubmissions + 
                            this.statistics.usage.totalValidationErrors;
        this.statistics.performance.successRate = 
            ((totalAttempts - this.statistics.performance.errorCount) / totalAttempts) * 100;
        
        this.updateActivity();
        this.saveStatistics();
    }

    /**
     * Track feature usage
     */
    trackFeatureUsage(featureName) {
        this.statistics.usage.featuresUsed.add(featureName);
        this.updateActivity();
    }

    /**
     * Track theme change
     */
    trackThemeChange(themeName) {
        this.statistics.usage.preferredTheme = themeName;
        this.trackFeatureUsage(`theme_${themeName}`);
        this.saveStatistics();
    }

    /**
     * Start performance measurement
     */
    startPerformanceMeasure(measureName) {
        if (window.performance && window.performance.mark) {
            const markName = `${measureName}_start`;
            window.performance.mark(markName);
            this.performanceMarks.set(measureName, markName);
        } else {
            // Fallback for browsers without Performance API
            this.performanceMarks.set(measureName, Date.now());
        }
    }

    /**
     * End performance measurement
     */
    endPerformanceMeasure(measureName) {
        if (window.performance && window.performance.mark && window.performance.measure) {
            const startMark = this.performanceMarks.get(measureName);
            if (startMark) {
                const endMark = `${measureName}_end`;
                window.performance.mark(endMark);
                window.performance.measure(measureName, startMark, endMark);
                
                // Get the measurement
                const measures = window.performance.getEntriesByName(measureName);
                if (measures.length > 0) {
                    const duration = measures[measures.length - 1].duration;
                    this.performanceMarks.delete(measureName);
                    return duration;
                }
            }
        } else {
            // Fallback
            const startTime = this.performanceMarks.get(measureName);
            if (startTime) {
                const duration = Date.now() - startTime;
                this.performanceMarks.delete(measureName);
                return duration;
            }
        }
        return 0;
    }

    /**
     * Track memory usage
     */
    trackMemoryUsage() {
        if (window.performance && window.performance.memory) {
            const memoryUsage = window.performance.memory.usedJSHeapSize;
            if (memoryUsage > this.statistics.performance.peakMemoryUsage) {
                this.statistics.performance.peakMemoryUsage = memoryUsage;
                this.saveStatistics();
            }
        }
    }

    /**
     * Calculate derived statistics
     */
    calculateDerivedStats() {
        const allTime = this.statistics.allTimeStats;
        
        // Average contracts per session
        if (allTime.totalSessions > 0) {
            allTime.averageContractsPerSession = 
                allTime.totalContractsCreated / allTime.totalSessions;
        }
        
        // Average processing time per contract
        if (allTime.totalContractsProcessed > 0) {
            allTime.averageProcessingTime = 
                allTime.totalProcessingTime / allTime.totalContractsProcessed;
        }
    }

    /**
     * Get session duration
     */
    getSessionDuration() {
        if (this.statistics.sessionStats.startTime) {
            return Date.now() - this.statistics.sessionStats.startTime;
        }
        return 0;
    }

    /**
     * Get formatted statistics
     */
    getFormattedStats() {
        const session = this.statistics.sessionStats;
        const allTime = this.statistics.allTimeStats;
        const performance = this.statistics.performance;
        
        return {
            session: {
                duration: this.formatDuration(this.getSessionDuration()),
                filesUploaded: session.filesUploaded,
                contractsCreated: session.contractsCreated,
                contractsProcessed: session.contractsProcessed,
                processingTime: this.formatDuration(session.totalProcessingTime)
            },
            allTime: {
                totalSessions: allTime.totalSessions,
                totalFiles: allTime.totalFilesUploaded,
                totalContracts: allTime.totalContractsCreated,
                totalProcessed: allTime.totalContractsProcessed,
                totalTime: this.formatDuration(allTime.totalProcessingTime),
                averagePerSession: Math.round(allTime.averageContractsPerSession * 10) / 10,
                firstUsed: allTime.firstUsed ? new Date(allTime.firstUsed).toLocaleDateString('fa-IR') : 'نامشخص'
            },
            performance: {
                averageAnalysisTime: Math.round(performance.averageFileAnalysisTime),
                averageProcessingTime: Math.round(performance.averageContractProcessingTime),
                successRate: Math.round(performance.successRate * 10) / 10,
                peakMemory: this.formatBytes(performance.peakMemoryUsage)
            }
        };
    }

    /**
     * Update statistics display in UI
     */
    updateStatsDisplay() {
        const stats = this.getFormattedStats();
        
        // Update main stats cards
        this.updateStatElement('fileCount', this.statistics.sessionStats.filesUploaded);
        this.updateStatElement('contractCount', this.statistics.sessionStats.contractsCreated);
        this.updateStatElement('processedCount', this.statistics.sessionStats.contractsProcessed);
        this.updateStatElement('processingTime', 
            Math.round(this.statistics.sessionStats.totalProcessingTime / 1000));
    }

    /**
     * Update individual stat element
     */
    updateStatElement(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            // Animate number change
            this.animateNumber(element, parseInt(element.textContent) || 0, value);
        }
    }

    /**
     * Animate number change
     */
    animateNumber(element, from, to, duration = 1000) {
        const start = Date.now();
        const step = () => {
            const progress = Math.min((Date.now() - start) / duration, 1);
            const current = Math.round(from + (to - from) * progress);
            element.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };
        requestAnimationFrame(step);
    }

    /**
     * Setup automatic save
     */
    setupAutoSave() {
        // Save statistics every 30 seconds
        setInterval(() => {
            this.saveStatistics();
        }, 30000);
        
        // Save on page visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.saveStatistics();
            }
        });
        
        // Save before page unload
        window.addEventListener('beforeunload', () => {
            this.saveStatistics();
        });
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        // Track memory usage periodically
        setInterval(() => {
            this.trackMemoryUsage();
        }, 10000);
        
        // Monitor for performance issues
        if (window.PerformanceObserver) {
            try {
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        if (entry.entryType === 'measure') {
                            console.log(`Performance measure: ${entry.name} - ${entry.duration}ms`);
                        }
                    });
                });
                observer.observe({ entryTypes: ['measure'] });
            } catch (error) {
                console.warn('PerformanceObserver not supported:', error);
            }
        }
    }

    /**
     * Generate usage report
     */
    generateUsageReport() {
        const stats = this.statistics;
        const formatted = this.getFormattedStats();
        
        let report = `گزارش آمار استفاده:\n\n`;
        
        // Session information
        report += `جلسه فعلی:\n`;
        report += `- مدت جلسه: ${formatted.session.duration}\n`;
        report += `- فایل‌های آپلود شده: ${formatted.session.filesUploaded}\n`;
        report += `- قراردادهای ایجاد شده: ${formatted.session.contractsCreated}\n`;
        report += `- قراردادهای پردازش شده: ${formatted.session.contractsProcessed}\n\n`;
        
        // All-time statistics
        report += `آمار کلی:\n`;
        report += `- تعداد جلسات: ${formatted.allTime.totalSessions}\n`;
        report += `- کل فایل‌ها: ${formatted.allTime.totalFiles}\n`;
        report += `- کل قراردادها: ${formatted.allTime.totalContracts}\n`;
        report += `- میانگین در هر جلسه: ${formatted.allTime.averagePerSession}\n`;
        report += `- اولین استفاده: ${formatted.allTime.firstUsed}\n\n`;
        
        // Performance metrics
        report += `عملکرد:\n`;
        report += `- میانگین زمان تحلیل: ${formatted.performance.averageAnalysisTime} میلی‌ثانیه\n`;
        report += `- میانگین زمان پردازش: ${formatted.performance.averageProcessingTime} میلی‌ثانیه\n`;
        report += `- نرخ موفقیت: ${formatted.performance.successRate}%\n`;
        report += `- حداکثر مصرف حافظه: ${formatted.performance.peakMemory}\n\n`;
        
        // Field usage
        if (Object.keys(stats.usage.mostUsedFields).length > 0) {
            report += `پرکاربردترین فیلدها:\n`;
            const sortedFields = Object.entries(stats.usage.mostUsedFields)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5);
            
            sortedFields.forEach(([field, count]) => {
                const fieldName = this.getFieldDisplayName(field);
                report += `- ${fieldName}: ${count} بار\n`;
            });
            report += '\n';
        }
        
        // Features used
        if (stats.usage.featuresUsed.size > 0) {
            report += `ویژگی‌های استفاده شده:\n`;
            Array.from(stats.usage.featuresUsed).forEach(feature => {
                report += `- ${this.getFeatureDisplayName(feature)}\n`;
            });
        }
        
        return report;
    }

    /**
     * Get field display name
     */
    getFieldDisplayName(fieldKey) {
        const names = {
            owner_full_name: 'نام و نام خانوادگی',
            owner_father_name: 'نام پدر',
            owner_national_id: 'کد ملی',
            owner_mobile: 'شماره موبایل',
            owner_address: 'آدرس',
            contract_start_date: 'تاریخ شروع',
            contract_end_date: 'تاریخ پایان',
            guarantee_amount: 'مبلغ سفته'
        };
        return names[fieldKey] || fieldKey;
    }

    /**
     * Get feature display name
     */
    getFeatureDisplayName(featureKey) {
        const names = {
            session_started: 'شروع جلسه',
            file_upload: 'آپلود فایل',
            contract_creation: 'ایجاد قرارداد',
            contract_processing: 'پردازش قراردادها',
            theme_light: 'تم روز',
            theme_dark: 'تم شب',
            theme_auto: 'تم خودکار'
        };
        return names[featureKey] || featureKey;
    }

    /**
     * Export statistics
     */
    exportStatistics() {
        return {
            statistics: this.statistics,
            exported: new Date().toISOString(),
            version: '1.0'
        };
    }

    /**
     * Import statistics
     */
    importStatistics(data) {
        try {
            if (data.statistics) {
                this.statistics = {
                    ...this.statistics,
                    ...data.statistics,
                    usage: {
                        ...this.statistics.usage,
                        ...data.statistics.usage,
                        featuresUsed: new Set(data.statistics.usage?.featuresUsed || [])
                    }
                };
                this.saveStatistics();
                this.updateStatsDisplay();
                return true;
            }
        } catch (error) {
            console.error('Failed to import statistics:', error);
        }
        return false;
    }

    /**
     * Reset statistics
     */
    resetStatistics(keepAllTime = false) {
        if (keepAllTime) {
            // Only reset session stats
            this.statistics.sessionStats = {
                filesUploaded: 0,
                contractsCreated: 0,
                contractsProcessed: 0,
                totalProcessingTime: 0,
                sessionsCount: 0,
                startTime: null,
                lastActivity: null
            };
        } else {
            // Reset all statistics
            this.statistics = {
                sessionStats: {
                    filesUploaded: 0,
                    contractsCreated: 0,
                    contractsProcessed: 0,
                    totalProcessingTime: 0,
                    sessionsCount: 0,
                    startTime: null,
                    lastActivity: null
                },
                allTimeStats: {
                    totalSessions: 0,
                    totalFilesUploaded: 0,
                    totalContractsCreated: 0,
                    totalContractsProcessed: 0,
                    totalProcessingTime: 0,
                    firstUsed: null,
                    lastUsed: null,
                    averageContractsPerSession: 0,
                    averageProcessingTime: 0
                },
                performance: {
                    averageFileAnalysisTime: 0,
                    averageContractProcessingTime: 0,
                    peakMemoryUsage: 0,
                    errorCount: 0,
                    successRate: 100
                },
                usage: {
                    mostUsedFields: {},
                    preferredTheme: 'light',
                    totalFormSubmissions: 0,
                    totalValidationErrors: 0,
                    featuresUsed: new Set()
                }
            };
        }
        
        this.saveStatistics();
        this.updateStatsDisplay();
    }

    /**
     * Utility methods
     */
    formatDuration(milliseconds) {
        if (!milliseconds) return '0 ثانیه';
        
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours} ساعت و ${minutes % 60} دقیقه`;
        } else if (minutes > 0) {
            return `${minutes} دقیقه و ${seconds % 60} ثانیه`;
        } else {
            return `${seconds} ثانیه`;
        }
    }

    formatBytes(bytes) {
        if (!bytes) return '0 بایت';
        
        const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${Math.round(bytes / Math.pow(1024, i) * 10) / 10} ${sizes[i]}`;
    }

    /**
     * Get current statistics
     */
    getStats() {
        return this.statistics;
    }

    /**
     * Load external statistics
     */
    loadStats(stats) {
        this.statistics = stats;
        this.updateStatsDisplay();
    }

    /**
     * Add processed contracts count
     */
    addProcessedContracts(count) {
        this.statistics.sessionStats.contractsProcessed += count;
        this.statistics.allTimeStats.totalContractsProcessed += count;
        this.calculateDerivedStats();
        this.updateStatsDisplay();
    }

    /**
     * Add processing time
     */
    addProcessingTime(timeInSeconds) {
        const timeInMs = timeInSeconds * 1000;
        this.statistics.sessionStats.totalProcessingTime += timeInMs;
        this.statistics.allTimeStats.totalProcessingTime += timeInMs;
        
        // Update average
        const totalProcessed = this.statistics.allTimeStats.totalContractsProcessed;
        if (totalProcessed > 0) {
            this.statistics.performance.averageContractProcessingTime = 
                this.statistics.allTimeStats.totalProcessingTime / totalProcessed;
        }
        
        this.updateStatsDisplay();
    }

    /**
     * Update stats with provided data
     */
    updateStats(updates) {
        Object.entries(updates).forEach(([key, value]) => {
            switch (key) {
                case 'fileCount':
                    this.statistics.sessionStats.filesUploaded = value;
                    break;
                case 'contractCount':
                    this.statistics.sessionStats.contractsCreated = value;
                    break;
                case 'detectedFields':
                    // This is informational, could track field detection accuracy
                    break;
            }
        });
        
        this.updateStatsDisplay();
    }
}

export default StatisticsManager;