/**
 * SRT字幕时间调整器 - 苹果风格版本
 * 主要功能：消除相邻字幕之间的时间空隙
 * 设计理念：简洁、优雅、高效
 */
class SRTProcessor {
    constructor() {
        this.initElements();
        this.initEventListeners();
        this.processedContent = '';
        this.originalFileName = '';
        this.isProcessing = false;
        this.updateStatsDebounced = this.debounce(this.updateStats.bind(this), 100);
    }

    /**
     * 防抖函数
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * 初始化DOM元素
     */
    initElements() {
        this.fileInput = document.getElementById('fileInput');
        this.processButton = document.getElementById('processButton');
        this.downloadButton = document.getElementById('downloadButton');
        this.clearButton = document.getElementById('clearButton');
        this.originalText = document.getElementById('originalText');
        this.processedText = document.getElementById('processedText');
        this.uploadArea = document.getElementById('uploadArea');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.notification = document.getElementById('notification');
        this.copyOriginal = document.getElementById('copyOriginal');
        this.copyProcessed = document.getElementById('copyProcessed');
        this.originalStats = document.getElementById('originalStats');
        this.processedStats = document.getElementById('processedStats');
    }

    /**
     * 初始化事件监听器
     */
    initEventListeners() {
        // 文件选择
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // 按钮事件
        this.processButton.addEventListener('click', () => this.processSRT());
        this.downloadButton.addEventListener('click', () => this.downloadFile());
        this.clearButton.addEventListener('click', () => this.clearContent());
        
        // 文本区域事件
        this.originalText.addEventListener('input', () => this.handleTextChange());
        this.originalText.addEventListener('paste', () => {
            setTimeout(() => this.handleTextChange(), 10);
        });
        
        // 拖拽上传
        this.setupDragAndDrop();
        
        // 复制按钮
        this.copyOriginal.addEventListener('click', () => this.copyToClipboard(this.originalText.value, '原始内容'));
        this.copyProcessed.addEventListener('click', () => this.copyToClipboard(this.processedText.value, '处理后内容'));
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // 通知关闭事件
        this.notification.addEventListener('click', (e) => {
            if (e.target === this.notification || e.target.textContent === '×') {
                this.hideNotification();
            }
        });
    }

    /**
     * 设置拖拽上传功能
     */
    setupDragAndDrop() {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, this.preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, () => {
                this.uploadArea.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, () => {
                this.uploadArea.classList.remove('dragover');
            }, false);
        });

        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e), false);
    }

    /**
     * 阻止默认拖拽行为
     */
    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    /**
     * 处理文件拖拽
     */
    handleDrop(e) {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    /**
     * 处理文件选择
     */
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    /**
     * 处理文件
     */
    processFile(file) {
        if (!file.name.toLowerCase().endsWith('.srt')) {
            this.showNotification('请选择SRT格式的字幕文件', 'error');
            return;
        }

        this.originalFileName = file.name;

        // 使用requestAnimationFrame来避免闪烁
        requestAnimationFrame(() => {
            this.showLoading(true);
        });

        const reader = new FileReader();
        reader.onload = (e) => {
            // 批量更新DOM以减少重排
            requestAnimationFrame(() => {
                // 暂时隐藏文本区域以避免闪烁
                this.originalText.style.opacity = '0';
                this.originalText.value = e.target.result;

                // 使用setTimeout确保DOM更新完成
                setTimeout(() => {
                    this.handleTextChange();
                    this.originalText.style.opacity = '1';
                    this.showLoading(false);
                    this.showNotification('文件加载成功', 'success');
                }, 50);
            });
        };

        reader.onerror = () => {
            this.showLoading(false);
            this.showNotification('文件读取失败', 'error');
        };

        reader.readAsText(file, 'UTF-8');
    }

    /**
     * 处理文本变化
     */
    handleTextChange() {
        const content = this.originalText.value.trim();
        const hasContent = content.length > 0;

        // 批量更新DOM以减少重排
        requestAnimationFrame(() => {
            this.processButton.disabled = !hasContent;

            if (!hasContent) {
                this.processedText.value = '';
                this.downloadButton.disabled = true;
                this.processedContent = '';
            }

            this.updateStatsDebounced();
        });
    }

    /**
     * 更新统计信息
     */
    updateStats() {
        const originalContent = this.originalText.value;
        const processedContent = this.processedText.value;
        
        this.originalStats.textContent = `字符数: ${originalContent.length} | 行数: ${originalContent.split('\n').length}`;
        this.processedStats.textContent = `字符数: ${processedContent.length} | 行数: ${processedContent.split('\n').length}`;
    }

    /**
     * 解析SRT内容
     */
    parseSRT(content) {
        const subtitles = [];
        const blocks = content.trim().split(/\n\s*\n/);
        
        for (const block of blocks) {
            const lines = block.trim().split('\n');
            if (lines.length >= 3) {
                const index = parseInt(lines[0]);
                const timeLine = lines[1];
                const text = lines.slice(2).join('\n');
                
                // 使用更严格的时间格式匹配
                const timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
                if (timeMatch && !isNaN(index)) {
                    subtitles.push({
                        index: index,
                        startTime: timeMatch[1],
                        endTime: timeMatch[2],
                        text: text.trim()
                    });
                }
            }
        }
        
        return subtitles;
    }

    /**
     * 处理SRT字幕
     */
    async processSRT() {
        if (this.isProcessing) return;
        
        const content = this.originalText.value.trim();
        if (!content) return;

        this.isProcessing = true;
        this.showLoading(true);

        try {
            // 添加延迟以显示加载动画
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const subtitles = this.parseSRT(content);
            
            if (subtitles.length === 0) {
                throw new Error('未找到有效的字幕条目，请检查SRT格式是否正确');
            }
            
            // 调整时间：将每条字幕的结束时间设为下一条的开始时间
            for (let i = 0; i < subtitles.length - 1; i++) {
                subtitles[i].endTime = subtitles[i + 1].startTime;
            }
            
            // 生成新的SRT内容
            const processedSRT = subtitles.map(subtitle => {
                return `${subtitle.index}\n${subtitle.startTime} --> ${subtitle.endTime}\n${subtitle.text}`;
            }).join('\n\n');
            
            this.processedText.value = processedSRT;
            this.processedContent = processedSRT;
            this.downloadButton.disabled = false;
            
            this.updateStats();
            this.showLoading(false);
            this.showNotification(`成功处理 ${subtitles.length} 条字幕`, 'success');
            
        } catch (error) {
            this.showLoading(false);
            this.showNotification(`处理失败: ${error.message}`, 'error');
            console.error('SRT处理错误:', error);
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * 下载处理后的文件
     */
    downloadFile() {
        if (!this.processedContent) return;
        
        const fileName = this.originalFileName 
            ? this.originalFileName.replace('.srt', '_processed.srt')
            : 'processed_subtitles.srt';
        
        const blob = new Blob([this.processedContent], { 
            type: 'text/plain;charset=utf-8' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('文件下载成功', 'success');
    }

    /**
     * 清空内容
     */
    clearContent() {
        this.originalText.value = '';
        this.processedText.value = '';
        this.processedContent = '';
        this.originalFileName = '';
        this.fileInput.value = '';
        
        this.processButton.disabled = true;
        this.downloadButton.disabled = true;
        
        this.updateStats();
        this.showNotification('内容已清空', 'info');
    }

    /**
     * 复制到剪贴板
     */
    async copyToClipboard(text, label) {
        if (!text) {
            this.showNotification('没有内容可复制', 'error');
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            this.showNotification(`${label}已复制到剪贴板`, 'success');
        } catch (err) {
            // 降级方案
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
                document.execCommand('copy');
                this.showNotification(`${label}已复制到剪贴板`, 'success');
            } catch (fallbackErr) {
                this.showNotification('复制失败，请手动选择复制', 'error');
            }
            
            document.body.removeChild(textArea);
        }
    }

    /**
     * 处理键盘快捷键
     */
    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'Enter':
                    e.preventDefault();
                    if (!this.processButton.disabled) {
                        this.processSRT();
                    }
                    break;
                case 's':
                    e.preventDefault();
                    if (!this.downloadButton.disabled) {
                        this.downloadFile();
                    }
                    break;
                case 'Delete':
                case 'Backspace':
                    if (e.shiftKey) {
                        e.preventDefault();
                        this.clearContent();
                    }
                    break;
            }
        }
    }

    /**
     * 显示/隐藏加载动画
     */
    showLoading(show) {
        if (show) {
            this.loadingOverlay.style.display = 'flex';
            // 使用requestAnimationFrame确保display设置后再添加show类
            requestAnimationFrame(() => {
                this.loadingOverlay.classList.add('show');
            });
        } else {
            this.loadingOverlay.classList.remove('show');
            // 等待过渡动画完成后隐藏元素
            setTimeout(() => {
                if (!this.loadingOverlay.classList.contains('show')) {
                    this.loadingOverlay.style.display = 'none';
                }
            }, 200); // 与CSS过渡时间匹配
        }
    }

    /**
     * 显示通知消息
     */
    showNotification(message, type = 'info', duration = 3000) {
        const iconMap = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle'
        };

        this.notification.className = `notification ${type}`;
        this.notification.querySelector('.notification-icon').className = `notification-icon ${iconMap[type]}`;
        this.notification.querySelector('.notification-message').textContent = message;
        
        this.notification.classList.add('show');
        
        // 自动隐藏
        if (this.notificationTimeout) {
            clearTimeout(this.notificationTimeout);
        }
        
        this.notificationTimeout = setTimeout(() => {
            this.hideNotification();
        }, duration);
    }

    /**
     * 隐藏通知
     */
    hideNotification() {
        this.notification.classList.remove('show');
        if (this.notificationTimeout) {
            clearTimeout(this.notificationTimeout);
        }
    }
}

// 初始化应用 - 苹果风格版本
document.addEventListener('DOMContentLoaded', () => {
    new SRTProcessor();
    
    // 添加版权信息
    console.log('%c🎬 SRT字幕时间调整器 - 苹果风格版本', 'color: #007AFF; font-size: 16px; font-weight: 600;');
    console.log('%c✨ 简洁优雅，让字幕播放更流畅', 'color: #8E8E93; font-size: 14px;');
});
