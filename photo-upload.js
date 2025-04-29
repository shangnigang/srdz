/**
 * 照片上传和预览功能
 * 用于订单表中的体型照和款式照片上传功能
 */

/**
 * IndexedDBPhotoStorage类 - 简化版
 * 由于photo-storage.js已删除，这里提供一个简化的实现
 */
class IndexedDBPhotoStorage {
    constructor() {
        this.dbName = 'PhotoStorage';
        this.dbVersion = 1;
        this.db = null;
        this.isInitialized = false;
        console.log('创建简化版IndexedDB照片存储服务');
    }
    
    /**
     * 初始化数据库
     * @returns {Promise<void>}
     */
    async init() {
        if (this.isInitialized) {
            return Promise.resolve();
        }
        
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                const error = new Error('浏览器不支持IndexedDB');
                console.error(error);
                reject(error);
                return;
            }
            
            console.log('正在初始化照片存储数据库...');
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = (event) => {
                const error = new Error('打开IndexedDB失败: ' + event.target.error);
                console.error(error);
                reject(error);
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                this.isInitialized = true;
                console.log('照片存储数据库初始化成功');
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // 创建体型照存储
                if (!db.objectStoreNames.contains('bodyPhotos')) {
                    const bodyPhotosStore = db.createObjectStore('bodyPhotos', { keyPath: 'id', autoIncrement: true });
                    bodyPhotosStore.createIndex('orderId', 'orderId', { unique: false });
                    console.log('创建体型照存储成功');
                }
                
                // 创建款式照片存储
                if (!db.objectStoreNames.contains('stylePhotos')) {
                    const stylePhotosStore = db.createObjectStore('stylePhotos', { keyPath: 'id', autoIncrement: true });
                    stylePhotosStore.createIndex('orderId', 'orderId', { unique: false });
                    console.log('创建款式照片存储成功');
                }
            };
        });
    }
    
    /**
     * 保存照片到IndexedDB
     * @param {Array} photos - 照片数据数组
     * @param {string} orderId - 订单ID
     * @param {string} photoType - 照片类型 (bodyPhotos/stylePhotos)
     * @returns {Promise<boolean>}
     */
    async savePhotos(photos, orderId, photoType) {
        try {
            if (!this.db) {
                throw new Error('数据库未初始化');
            }
            
            const tx = this.db.transaction(photoType, 'readwrite');
            const store = tx.objectStore(photoType);
            
            // 先删除该订单的现有照片
            const index = store.index('orderId');
            const keyRange = IDBKeyRange.only(orderId);
            const request = index.openCursor(keyRange);
            
            const deletePromise = new Promise((resolve, reject) => {
                const keysToDelete = [];
                
                request.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        keysToDelete.push(cursor.primaryKey);
                        cursor.continue();
                    } else {
                        // 删除收集到的所有键
                        let deletionCount = 0;
                        if (keysToDelete.length === 0) {
                            resolve();
                        } else {
                            keysToDelete.forEach(key => {
                                const deleteRequest = store.delete(key);
                                deleteRequest.onsuccess = () => {
                                    deletionCount++;
                                    if (deletionCount === keysToDelete.length) {
                                        resolve();
                                    }
                                };
                                deleteRequest.onerror = reject;
                            });
                        }
                    }
                };
                
                request.onerror = reject;
            });
            
            await deletePromise;
            
            // 添加新照片
            for (const photo of photos) {
                const photoData = {
                    ...photo,
                    orderId: orderId,
                    id: photo.id || Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    updatedAt: new Date().toISOString()
                };
                
                await new Promise((resolve, reject) => {
                    const addRequest = store.add(photoData);
                    addRequest.onsuccess = resolve;
                    addRequest.onerror = reject;
                });
            }
            
            return true;
        } catch (error) {
            console.error(`保存照片到IndexedDB失败:`, error);
            return false;
        }
    }
    
    /**
     * 获取照片
     * @param {string} orderId - 订单ID
     * @param {string} photoType - 照片类型 (bodyPhotos/stylePhotos)
     * @returns {Promise<Array>} - 照片数据数组
     */
    async getPhotos(orderId, photoType) {
        try {
            if (!this.db) {
                throw new Error('数据库未初始化');
            }
            
            const tx = this.db.transaction(photoType, 'readonly');
            const store = tx.objectStore(photoType);
            const index = store.index('orderId');
            const keyRange = IDBKeyRange.only(orderId);
            
            return new Promise((resolve, reject) => {
                const request = index.getAll(keyRange);
                request.onsuccess = () => resolve(request.result || []);
                request.onerror = reject;
            });
        } catch (error) {
            console.error(`从IndexedDB获取照片失败:`, error);
            return [];
        }
    }
}

// 配置选项
const photoUploadConfig = {
    // 最大文件大小（单位：MB）
    maxFileSize: 3,
    // 预览图尺寸（单位：像素）
    previewSize: 450,
    // 最大图片尺寸（压缩后的最大宽度/高度，单位：像素）
    maxImageSize: 1024,
    // 图片压缩质量 (0-1之间的值，仅对JPEG和WebP有效)
    compressQuality: 0.7,
    // 允许的图片类型
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
};

// 全局存储上传的照片数据
window.photoData = {
    bodyPhotos: [],
    stylePhotos: []
};

// 确保页面加载完成后初始化照片上传功能
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成，初始化照片上传功能...');
    
    // 重新确保全局photoData变量已正确初始化
    if (!window.photoData) {
        console.log('全局photoData未定义，重新初始化');
        window.photoData = {
            bodyPhotos: [],
            stylePhotos: []
        };
    } else {
        // 确保数组属性存在
        if (!Array.isArray(window.photoData.bodyPhotos)) {
            console.log('bodyPhotos不是数组，重新初始化');
            window.photoData.bodyPhotos = [];
        }
        if (!Array.isArray(window.photoData.stylePhotos)) {
            console.log('stylePhotos不是数组，重新初始化');
            window.photoData.stylePhotos = [];
        }
    }
    
    // 初始化照片上传功能
    initPhotoUpload();
    
    // 监听模态框显示事件，在表单显示后恢复照片
    const orderFormModal = document.getElementById('newOrderFormModal');
    if (orderFormModal) {
        // 使用shown.bs.modal事件，表单完全显示后尝试恢复照片
        orderFormModal.addEventListener('shown.bs.modal', function() {
            console.log('订单表单模态框已显示，尝试恢复照片...');
            // 延迟一点执行，确保其他表单内容已加载
            setTimeout(restorePhotosFromOrder, 300);
        });
        
        console.log('已注册模态框显示事件监听器，用于恢复照片');
    } else {
        console.warn('未找到订单表单模态框，无法注册显示事件');
    }
});

/**
 * 初始化照片上传功能
 */
function initPhotoUpload() {
    console.log('初始化照片上传...');
    
    // 初始化照片存储服务
    initPhotoStorageService();
    
    // 初始化体型照上传
    initFileUpload('bodyPhotoUpload', 'bodyPhotoPreview', 'bodyPhotos');
    
    // 初始化款式照片上传
    initFileUpload('stylePhotoUpload', 'stylePhotoPreview', 'stylePhotos');
    
    // 初始化拍照按钮
    initCaptureButtons();
    
    console.log('照片上传初始化完成');
}

/**
 * 初始化照片存储服务
 */
function initPhotoStorageService() {
    // 如果已经存在照片存储服务，不再重复创建
    if (window.photoStorage || window.photoStorageService) {
        console.log('照片存储服务已存在，无需创建');
        return;
    }
    
    try {
        // 创建并初始化IndexedDBPhotoStorage实例
        console.log('创建IndexedDBPhotoStorage实例');
        window.photoStorageService = new IndexedDBPhotoStorage();
        window.photoStorageService.init().then(() => {
            console.log('IndexedDBPhotoStorage初始化成功');
        }).catch(error => {
            console.error('IndexedDBPhotoStorage初始化失败:', error);
        });
    } catch (error) {
        console.error('创建IndexedDBPhotoStorage实例失败:', error);
    }
}

/**
 * 初始化文件上传功能
 * @param {string} inputId - 文件输入框的ID
 * @param {string} previewId - 预览区域的ID
 * @param {string} dataKey - 存储在photoData中的键
 */
function initFileUpload(inputId, previewId, dataKey) {
    const fileInput = document.getElementById(inputId);
    const previewArea = document.getElementById(previewId);
    
    if (!fileInput || !previewArea) {
        console.error(`初始化照片上传失败: 未找到元素 ${inputId} 或 ${previewId}`);
        return;
    }
    
    // 文件选择事件
    fileInput.addEventListener('change', function(event) {
        handleFileSelect(event, previewArea, dataKey);
    });
    
    // 拖拽上传功能
    previewArea.addEventListener('dragover', function(event) {
        event.preventDefault();
        event.stopPropagation();
        previewArea.classList.add('drag-over');
    });
    
    previewArea.addEventListener('dragleave', function(event) {
        event.preventDefault();
        event.stopPropagation();
        previewArea.classList.remove('drag-over');
    });
    
    previewArea.addEventListener('drop', function(event) {
        event.preventDefault();
        event.stopPropagation();
        previewArea.classList.remove('drag-over');
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            // 设置文件输入框的值（用于表单提交）
            fileInput.files = files;
            
            // 处理文件
            handleFiles(files, previewArea, dataKey);
        }
    });
}

/**
 * 处理文件选择事件
 * @param {Event} event - 文件选择事件
 * @param {HTMLElement} previewArea - 预览区域元素
 * @param {string} dataKey - 存储在photoData中的键
 */
function handleFileSelect(event, previewArea, dataKey) {
    const files = event.target.files;
    if (files.length > 0) {
        handleFiles(files, previewArea, dataKey);
    }
}

/**
 * 处理文件
 * @param {FileList} files - 文件列表
 * @param {HTMLElement} previewArea - 预览区域元素
 * @param {string} dataKey - 存储在photoData中的键
 */
function handleFiles(files, previewArea, dataKey) {
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // 验证文件类型
        if (!photoUploadConfig.allowedTypes.includes(file.type)) {
            alert(`不支持的文件类型: ${file.type}，请上传JPG、PNG、GIF或WebP格式的图片`);
            continue;
        }
        
        // 验证文件大小
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > photoUploadConfig.maxFileSize) {
            alert(`文件过大: ${file.name} (${fileSizeMB.toFixed(3)}MB)，最大允许${photoUploadConfig.maxFileSize}MB`);
            continue;
        }
        
        // 压缩并预览图片
        compressAndPreviewImage(file, previewArea, dataKey);
    }
}

/**
 * 压缩和预览图片
 * @param {File} file - 文件对象
 * @param {HTMLElement} previewArea - 预览区域元素
 * @param {string} dataKey - 存储在photoData中的键
 */
function compressAndPreviewImage(file, previewArea, dataKey) {
    // 显示压缩进度条
    const progressId = dataKey === 'bodyPhotos' ? 'bodyPhotoCompressProgress' : 'stylePhotoCompressProgress';
    const progressElement = document.getElementById(progressId);
    if (progressElement) {
        progressElement.classList.remove('d-none');
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // 计算压缩后的尺寸
            let width = img.width;
            let height = img.height;
            const maxSize = photoUploadConfig.maxImageSize;
            
            if (width > height && width > maxSize) {
                height = Math.round(height * (maxSize / width));
                width = maxSize;
            } else if (height > maxSize) {
                width = Math.round(width * (maxSize / height));
                height = maxSize;
            }
            
            // 创建Canvas用于压缩
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            // 绘制图像到Canvas以调整大小
            ctx.drawImage(img, 0, 0, width, height);
            
            // 获取压缩后的DataURL
            let compressedDataUrl;
            if (file.type === 'image/jpeg' || file.type === 'image/webp') {
                compressedDataUrl = canvas.toDataURL(file.type, photoUploadConfig.compressQuality);
            } else {
                // PNG和GIF不使用质量参数
                compressedDataUrl = canvas.toDataURL(file.type);
            }
            
            // 计算压缩后的大小
            const compressedSize = Math.round((compressedDataUrl.length * 3) / 4) - (compressedDataUrl.indexOf(',') + 1);
            const compressedSizeMB = (compressedSize / (1024 * 1024)).toFixed(2);
            
            // 显示压缩信息
            console.log(`原始: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)}MB), 压缩后: ${compressedSizeMB}MB, 尺寸: ${width}x${height}`);
            
            // 隐藏压缩进度条
            if (progressElement) {
                progressElement.classList.add('d-none');
            }
            
            // 创建预览容器
            const previewContainer = document.createElement('div');
            previewContainer.className = 'preview-container position-relative';
            previewContainer.style.width = `${photoUploadConfig.previewSize}px`;
            previewContainer.style.height = `${photoUploadConfig.previewSize}px`;
            previewContainer.style.margin = '5px';
            
            // 创建预览图片
            const previewImg = document.createElement('img');
            previewImg.src = compressedDataUrl;
            previewImg.className = 'img-thumbnail';
            previewImg.style.width = '100%';
            previewImg.style.height = '100%';
            previewImg.style.objectFit = 'cover';
            previewImg.title = `${file.name} (原始: ${(file.size / (1024 * 1024)).toFixed(2)}MB, 压缩后: ${compressedSizeMB}MB)`;
            
            // 创建删除按钮
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-sm btn-danger position-absolute top-0 end-0';
            deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
            deleteBtn.style.padding = '2px 5px';
            deleteBtn.style.fontSize = '10px';
            
            // 删除按钮点击事件
            deleteBtn.addEventListener('click', function() {
                // 从DOM中移除预览
                previewContainer.remove();
                
                // 从数据中移除
                const index = window.photoData[dataKey].findIndex(photo => photo.dataUrl === compressedDataUrl);
                if (index > -1) {
                    window.photoData[dataKey].splice(index, 1);
                }
            });
            
            // 添加到预览容器
            previewContainer.appendChild(previewImg);
            previewContainer.appendChild(deleteBtn);
            
            // 添加到预览区域
            previewArea.appendChild(previewContainer);
            
            // 存储照片数据 - 使用压缩后的数据
            window.photoData[dataKey].push({
                name: file.name,
                type: file.type,
                size: compressedSize,
                width: width,
                height: height,
                dataUrl: compressedDataUrl
            });
        };
        
        img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
}

/**
 * 初始化拍照按钮
 */
function initCaptureButtons() {
    const captureButtons = document.querySelectorAll('.capture-photo');
    
    captureButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            if (targetId) {
                const fileInput = document.getElementById(targetId);
                if (fileInput) {
                    fileInput.click(); // 触发文件选择对话框
                }
            }
        });
    });
}

/**
 * 从订单数据恢复照片
 * @param {Object} [forceOrder] - 可选，强制使用的订单对象
 */
async function restorePhotosFromOrder(forceOrder) {
    console.log('尝试从订单数据恢复照片...');
    
    // 如果提供了订单对象，直接使用
    if (forceOrder) {
        console.log('使用提供的订单数据恢复照片');
        
        try {
            // 恢复体型照
            if (forceOrder.bodyPhotos && Array.isArray(forceOrder.bodyPhotos)) {
                await restorePhotos(forceOrder.bodyPhotos, 'bodyPhotoPreview', 'bodyPhotos');
            }
            
            // 恢复款式照片
            if (forceOrder.stylePhotos && Array.isArray(forceOrder.stylePhotos)) {
                await restorePhotos(forceOrder.stylePhotos, 'stylePhotoPreview', 'stylePhotos');
            }
            
            return; // 完成恢复，退出函数
        } catch (error) {
            console.error('使用提供的订单数据恢复照片出错:', error);
        }
    }
    
    // 检查当前是否正在编辑订单
    const orderIdInput = document.getElementById('newOrderId');
    if (!orderIdInput || !orderIdInput.value) {
        console.log('非编辑模式，无需恢复照片');
        return;
    }
    
    const orderId = orderIdInput.value;
    console.log('正在恢复订单照片，订单ID:', orderId);
    
    try {
        // 首先尝试从IndexedDB恢复照片（优先方式）
        let photosRestoredFromDB = false;
        
        // 获取照片存储服务，尝试多种可能的变量名
        const photoStorage = window.photoStorage || window.photoStorageService;
        
        // 检查 photoStorage 是否可用
        if (photoStorage) {
            console.log('照片存储服务可用，尝试从IndexedDB恢复照片');
            try {
                // 获取体型照
                let bodyPhotos = [];
                try {
                    if (typeof photoStorage.getOrderBodyPhotos === 'function') {
                        // 使用新版API
                        bodyPhotos = await photoStorage.getOrderBodyPhotos(orderId);
                    } else if (typeof photoStorage.getPhotos === 'function') {
                        bodyPhotos = await photoStorage.getPhotos(orderId, 'bodyPhotos');
                    }
                } catch (dbError) {
                    console.error('从IndexedDB获取体型照失败:', dbError);
                }
                
                if (bodyPhotos && Array.isArray(bodyPhotos) && bodyPhotos.length > 0) {
                    console.log(`从IndexedDB恢复${bodyPhotos.length}张体型照`);
                    await restorePhotos(bodyPhotos, 'bodyPhotoPreview', 'bodyPhotos');
                    photosRestoredFromDB = true;
                } else {
                    console.log('IndexedDB中未找到体型照');
                }
                
                // 获取款式照片
                let stylePhotos = [];
                try {
                    if (typeof photoStorage.getOrderStylePhotos === 'function') {
                        // 使用新版API
                        stylePhotos = await photoStorage.getOrderStylePhotos(orderId);
                    } else if (typeof photoStorage.getPhotos === 'function') {
                        stylePhotos = await photoStorage.getPhotos(orderId, 'stylePhotos');
                    }
                } catch (dbError) {
                    console.error('从IndexedDB获取款式照片失败:', dbError);
                }
                
                if (stylePhotos && Array.isArray(stylePhotos) && stylePhotos.length > 0) {
                    console.log(`从IndexedDB恢复${stylePhotos.length}张款式照片`);
                    await restorePhotos(stylePhotos, 'stylePhotoPreview', 'stylePhotos');
                    photosRestoredFromDB = true;
                } else {
                    console.log('IndexedDB中未找到款式照片');
                }
            } catch (error) {
                console.error('从IndexedDB恢复照片出错:', error);
            }
        } else {
            console.log('照片存储服务不可用，无法从IndexedDB恢复');
        }
        
        // 如果从IndexedDB恢复了照片，则不再尝试从localStorage恢复
        if (photosRestoredFromDB) {
            console.log('已从IndexedDB成功恢复照片，跳过localStorage恢复');
            return;
        }
        
        // 如果从IndexedDB恢复失败，尝试从localStorage恢复
        console.log('尝试从localStorage恢复照片...');
        
        // 首先尝试恢复多张紧急备份照片
        let restoredFromEmergencyBackup = false;
        try {
            // 恢复体型照紧急备份
            const bodyPhotoCount = parseInt(localStorage.getItem(`emergency_body_photo_count_${orderId}`) || '0');
            if (bodyPhotoCount > 0) {
                const bodyPhotos = [];
                // 尝试恢复每一张备份照片
                for (let i = 0; i < Math.min(bodyPhotoCount, 3); i++) {
                    const photoKey = `emergency_body_photo_${orderId}_${i}`;
                    const photoJson = localStorage.getItem(photoKey);
                    if (photoJson) {
                        try {
                            const photo = JSON.parse(photoJson);
                            if (photo && photo.dataUrl) {
                                bodyPhotos.push(photo);
                            }
                        } catch (parseError) {
                            console.error(`解析体型照紧急备份${i+1}失败:`, parseError);
                        }
                    }
                }
                
                if (bodyPhotos.length > 0) {
                    console.log(`从紧急备份中恢复${bodyPhotos.length}张体型照`);
                    await restorePhotos(bodyPhotos, 'bodyPhotoPreview', 'bodyPhotos');
                    restoredFromEmergencyBackup = true;
                }
            }
            
            // 恢复款式照片紧急备份
            const stylePhotoCount = parseInt(localStorage.getItem(`emergency_style_photo_count_${orderId}`) || '0');
            if (stylePhotoCount > 0) {
                const stylePhotos = [];
                // 尝试恢复每一张备份照片
                for (let i = 0; i < Math.min(stylePhotoCount, 3); i++) {
                    const photoKey = `emergency_style_photo_${orderId}_${i}`;
                    const photoJson = localStorage.getItem(photoKey);
                    if (photoJson) {
                        try {
                            const photo = JSON.parse(photoJson);
                            if (photo && photo.dataUrl) {
                                stylePhotos.push(photo);
                            }
                        } catch (parseError) {
                            console.error(`解析款式照片紧急备份${i+1}失败:`, parseError);
                        }
                    }
                }
                
                if (stylePhotos.length > 0) {
                    console.log(`从紧急备份中恢复${stylePhotos.length}张款式照片`);
                    await restorePhotos(stylePhotos, 'stylePhotoPreview', 'stylePhotos');
                    restoredFromEmergencyBackup = true;
                }
            }
            
            // 如果没有找到多张备份，尝试旧格式的单张备份
            if (!restoredFromEmergencyBackup) {
                // 检查体型照旧格式紧急备份
                const bodyPhotoKey = `emergency_body_photo_${orderId}`;
                const bodyPhotoJson = localStorage.getItem(bodyPhotoKey);
                if (bodyPhotoJson) {
                    try {
                        const bodyPhoto = JSON.parse(bodyPhotoJson);
                        if (bodyPhoto && bodyPhoto.dataUrl) {
                            console.log('从旧格式紧急备份中恢复体型照');
                            await restorePhotos([bodyPhoto], 'bodyPhotoPreview', 'bodyPhotos');
                            restoredFromEmergencyBackup = true;
                        }
                    } catch (parseError) {
                        console.error('解析体型照旧格式紧急备份数据失败:', parseError);
                    }
                }
                
                // 检查款式照片旧格式紧急备份
                const stylePhotoKey = `emergency_style_photo_${orderId}`;
                const stylePhotoJson = localStorage.getItem(stylePhotoKey);
                if (stylePhotoJson) {
                    try {
                        const stylePhoto = JSON.parse(stylePhotoJson);
                        if (stylePhoto && stylePhoto.dataUrl) {
                            console.log('从旧格式紧急备份中恢复款式照片');
                            await restorePhotos([stylePhoto], 'stylePhotoPreview', 'stylePhotos');
                            restoredFromEmergencyBackup = true;
                        }
                    } catch (parseError) {
                        console.error('解析款式照片旧格式紧急备份数据失败:', parseError);
                    }
                }
            }
            
            // 检查极端紧急备份
            if (!restoredFromEmergencyBackup) {
                // 尝试从极端紧急备份恢复
                const extremeBodyPhotoKey = `extreme_emergency_body_photo_${orderId}`;
                const extremeBodyPhotoJson = localStorage.getItem(extremeBodyPhotoKey);
                if (extremeBodyPhotoJson) {
                    try {
                        const bodyPhoto = JSON.parse(extremeBodyPhotoJson);
                        if (bodyPhoto && bodyPhoto.dataUrl) {
                            console.log('从极端紧急备份中恢复体型照');
                            await restorePhotos([bodyPhoto], 'bodyPhotoPreview', 'bodyPhotos');
                            restoredFromEmergencyBackup = true;
                        }
                    } catch (parseError) {
                        console.error('解析体型照极端紧急备份数据失败:', parseError);
                    }
                }
                
                const extremeStylePhotoKey = `extreme_emergency_style_photo_${orderId}`;
                const extremeStylePhotoJson = localStorage.getItem(extremeStylePhotoKey);
                if (extremeStylePhotoJson) {
                    try {
                        const stylePhoto = JSON.parse(extremeStylePhotoJson);
                        if (stylePhoto && stylePhoto.dataUrl) {
                            console.log('从极端紧急备份中恢复款式照片');
                            await restorePhotos([stylePhoto], 'stylePhotoPreview', 'stylePhotos');
                            restoredFromEmergencyBackup = true;
                        }
                    } catch (parseError) {
                        console.error('解析款式照片极端紧急备份数据失败:', parseError);
                    }
                }
            }
        } catch (backupError) {
            console.error('从紧急备份恢复照片失败:', backupError);
        }
        
        // 如果从紧急备份恢复了照片，则不再继续
        if (restoredFromEmergencyBackup) {
            console.log('已从紧急备份恢复照片');
            return;
        }
        
        // 最后尝试从订单对象中恢复（较少可能成功，因为现在照片数据不直接存储在订单对象中）
        if (window.orders && Array.isArray(window.orders)) {
            const order = window.orders.find(o => o.id === orderId);
            
            if (order) {
                console.log('找到订单数据，尝试从localStorage恢复照片');
                
                // 恢复体型照
                if (order.bodyPhotos && Array.isArray(order.bodyPhotos) && order.bodyPhotos.length > 0) {
                    console.log(`从localStorage恢复${order.bodyPhotos.length}张体型照`);
                    await restorePhotos(order.bodyPhotos, 'bodyPhotoPreview', 'bodyPhotos');
                } else {
                    console.log('订单中无体型照数据');
                }
                
                // 恢复款式照片
                if (order.stylePhotos && Array.isArray(order.stylePhotos) && order.stylePhotos.length > 0) {
                    console.log(`从localStorage恢复${order.stylePhotos.length}张款式照片`);
                    await restorePhotos(order.stylePhotos, 'stylePhotoPreview', 'stylePhotos');
                } else {
                    console.log('订单中无款式照片数据');
                }
            } else {
                console.log('未找到订单数据:', orderId);
            }
        } else {
            console.warn('订单数据不存在或不是数组');
        }
    } catch (error) {
        console.error('恢复照片出错:', error);
    }
}

/**
 * 恢复照片
 * @param {Array} photos - 照片数据数组
 * @param {string} previewId - 预览区域的ID
 * @param {string} dataKey - 存储在photoData中的键
 */
async function restorePhotos(photos, previewId, dataKey) {
    const previewArea = document.getElementById(previewId);
    if (!previewArea) {
        console.error(`恢复照片失败: 未找到预览区域 ${previewId}`);
        return;
    }
    
    // 确保photos是有效的数组
    if (!Array.isArray(photos)) {
        console.error(`照片数据不是数组:`, photos);
        return;
    }
    
    console.log(`开始恢复${dataKey}照片，数量: ${photos.length}张`);
    
    // 清空预览区域
    previewArea.innerHTML = '';
    
    // 清空照片数据
    window.photoData[dataKey] = [];
    
    // 恢复成功计数
    let successCount = 0;
    let errorCount = 0;
    
    // 恢复照片，使用for循环确保照片按顺序处理
    for (let index = 0; index < photos.length; index++) {
        const photo = photos[index];
        try {
            // 照片数据格式处理
            let photoData = {
                name: '照片_' + (index + 1),
                size: 0,
                type: 'image/jpeg',
                dataUrl: null,
                width: 0,
                height: 0,
                uploadTime: new Date().toISOString()
            };
            
            // 检查照片数据格式并提取数据URL
            if (typeof photo === 'string') {
                // 如果是字符串，直接当作dataUrl使用
                photoData.dataUrl = photo;
                photoData.size = Math.round((photo.length * 3) / 4) - (photo.indexOf(',') + 1);
                console.log(`照片${index+1}是字符串格式，长度: ${photoData.dataUrl.length}`);
            } else if (photo && typeof photo === 'object') {
                // 合并属性
                if (photo.name) photoData.name = photo.name;
                if (photo.size) photoData.size = photo.size;
                if (photo.type) photoData.type = photo.type;
                if (photo.width) photoData.width = photo.width;
                if (photo.height) photoData.height = photo.height;
                if (photo.uploadTime) photoData.uploadTime = photo.uploadTime;
                
                // 提取dataUrl属性
                if (photo.dataUrl) {
                    photoData.dataUrl = photo.dataUrl;
                } else {
                    // 尝试从其他可能的属性获取dataUrl
                    const possibleUrlProps = ['url', 'src', 'data', 'preview'];
                    for (const prop of possibleUrlProps) {
                        if (photo[prop] && typeof photo[prop] === 'string' && photo[prop].startsWith('data:')) {
                            photoData.dataUrl = photo[prop];
                            console.log(`照片${index+1}从${prop}属性获取了dataUrl，长度: ${photoData.dataUrl.length}`);
                            break;
                        }
                    }
                }
            }
            
            // 最终检查dataUrl是否存在并有效
            if (!photoData.dataUrl || !photoData.dataUrl.startsWith('data:')) {
                console.warn(`照片${index+1}没有有效的dataUrl，跳过:`, photo);
                errorCount++;
                continue; // 跳过这张照片
            }
            
            // 在新线程中加载图片，避免阻塞UI
            const loadComplete = await new Promise(resolve => {
                const img = new Image();
                img.onload = function() {
                    // 如果照片没有宽高信息，从加载的图片获取
                    if (!photoData.width || !photoData.height) {
                        photoData.width = img.width;
                        photoData.height = img.height;
                    }
                    resolve(true);
                };
                img.onerror = function() {
                    console.error(`照片${index+1}加载失败`);
                    resolve(false);
                };
                img.src = photoData.dataUrl;
            });
            
            if (!loadComplete) {
                console.warn(`照片${index+1}无法正确加载，跳过`);
                errorCount++;
                continue;
            }
            
            // 创建预览容器
            const previewContainer = document.createElement('div');
            previewContainer.className = 'preview-container position-relative';
            previewContainer.style.width = `${photoUploadConfig.previewSize}px`;
            previewContainer.style.height = `${photoUploadConfig.previewSize}px`;
            previewContainer.style.margin = '5px';
            
            // 创建预览图片
            const img = document.createElement('img');
            img.src = photoData.dataUrl;
            img.className = 'img-thumbnail';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.title = `${photoData.name} (${(photoData.size / (1024 * 1024)).toFixed(2)}MB)`;
            
            // 创建删除按钮
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-sm btn-danger position-absolute top-0 end-0';
            deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
            deleteBtn.style.padding = '2px 5px';
            deleteBtn.style.fontSize = '10px';
            
            // 删除按钮点击事件
            deleteBtn.addEventListener('click', function() {
                // 从DOM中移除预览
                previewContainer.remove();
                
                // 从数据中移除
                const index = window.photoData[dataKey].findIndex(p => p.dataUrl === photoData.dataUrl);
                if (index > -1) {
                    window.photoData[dataKey].splice(index, 1);
                }
            });
            
            // 添加到预览容器
            previewContainer.appendChild(img);
            previewContainer.appendChild(deleteBtn);
            
            // 添加到预览区域
            previewArea.appendChild(previewContainer);
            
            // 存储照片数据
            window.photoData[dataKey].push(photoData);
            
            successCount++;
        } catch (error) {
            console.error(`恢复照片${index+1}时出错:`, error);
            errorCount++;
        }
    }
    
    console.log(`${dataKey}照片恢复完成: 成功${successCount}张，失败${errorCount}张，总共${photos.length}张`);
}

/**
 * 创建紧急备份，将照片数据存储到localStorage中（当IndexedDB不可用时使用）
 * @param {Array} photos - 照片数据数组
 * @param {string} orderId - 订单ID
 * @param {string} type - 照片类型(body/style)
 */
function createEmergencyBackup(photos, orderId, type) {
    if (!photos || !Array.isArray(photos) || photos.length === 0) return;
    
    try {
        // 最多保存3张照片，防止localStorage超出限制
        const maxPhotos = Math.min(photos.length, 3);
        localStorage.setItem(`emergency_${type}_photo_count_${orderId}`, maxPhotos.toString());
        
        // 保存每一张照片
        for (let i = 0; i < maxPhotos; i++) {
            const photo = photos[i];
            if (photo && photo.dataUrl) {
                localStorage.setItem(`emergency_${type}_photo_${orderId}_${i}`, JSON.stringify(photo));
            }
        }
        
        // 额外创建一个极端紧急备份，保存第一张照片
        if (photos[0] && photos[0].dataUrl) {
            localStorage.setItem(`extreme_emergency_${type}_photo_${orderId}`, JSON.stringify(photos[0]));
        }
        
        console.log(`为${orderId}创建了${maxPhotos}张${type}照片的紧急备份`);
    } catch (error) {
        console.error(`创建紧急备份失败:`, error);
        
        // 尝试最小备份 - 仅保存第一张照片的极简版本
        try {
            if (photos[0] && photos[0].dataUrl) {
                // 创建极简版照片对象，只保留必要数据
                const minimalPhoto = {
                    dataUrl: photos[0].dataUrl,
                    name: photos[0].name || `${type}_photo_1`,
                    type: photos[0].type || 'image/jpeg'
                };
                localStorage.setItem(`extreme_emergency_${type}_photo_${orderId}`, JSON.stringify(minimalPhoto));
                console.log(`为${orderId}创建了1张${type}照片的极简紧急备份`);
            }
        } catch (extremeError) {
            console.error('极简备份也失败了:', extremeError);
        }
    }
}

/**
 * 将照片数据添加到订单数据
 * @param {Object} orderData - 订单数据对象
 * @returns {Object} 包含照片数据的订单数据对象
 */
function addPhotosToOrderData(orderData) {
    if (!orderData) return orderData;
    
    // 创建一个新对象，避免直接修改原对象可能导致的问题
    const newOrderData = {...orderData};
    
    // 获取照片存储服务，尝试多种可能的变量名
    const photoStorage = window.photoStorage || window.photoStorageService;
    
    // 只保存照片元数据到 localStorage，完整数据存储到 IndexedDB
    // 创建照片元数据数组，不包含大型 dataUrl 数据
    if (window.photoData.bodyPhotos && window.photoData.bodyPhotos.length > 0) {
        // 为 localStorage 创建轻量版照片数据（不含 dataUrl）
        newOrderData.bodyPhotos = window.photoData.bodyPhotos.map(photo => ({
            id: photo.id || Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: photo.name,
            type: photo.type,
            width: photo.width,
            height: photo.height,
            size: photo.size,
            uploadTime: photo.uploadTime || new Date().toISOString(),
            // 不包含 dataUrl 数据
            storedInIndexedDB: true
        }));
        
        console.log(`已添加${window.photoData.bodyPhotos.length}张体型照元数据到订单数据，完整数据存储在IndexedDB中`);
        
        // 同时保存完整照片数据到IndexedDB（如果可用）
        try {
            if (photoStorage) {
                // 尝试兼容不同的 API 格式
                if (typeof photoStorage.saveOrderBodyPhotos === 'function') {
                    // 使用新 API
                    photoStorage.saveOrderBodyPhotos(orderData.id, window.photoData.bodyPhotos)
                        .then(() => console.log(`已保存${window.photoData.bodyPhotos.length}张体型照到IndexedDB`))
                        .catch(err => console.error('保存体型照到IndexedDB失败:', err));
                } else if (typeof photoStorage.savePhotos === 'function') {
                    // 使用旧 API
                    photoStorage.savePhotos(window.photoData.bodyPhotos, orderData.id, 'bodyPhotos')
                        .then(() => console.log(`已保存${window.photoData.bodyPhotos.length}张体型照到IndexedDB`))
                        .catch(err => console.error('保存体型照到IndexedDB失败:', err));
                } else {
                    console.warn('照片存储服务API不一致，无法存储照片');
                    createEmergencyBackup(window.photoData.bodyPhotos, orderData.id, 'body');
                }
            } else {
                console.warn('photoStorage 服务不可用，无法存储照片到 IndexedDB');
                // 创建紧急备份，存储所有照片的压缩版本
                createEmergencyBackup(window.photoData.bodyPhotos, orderData.id, 'body');
            }
        } catch (e) {
            console.error('调用照片存储服务失败:', e);
            // 创建紧急备份
            createEmergencyBackup(window.photoData.bodyPhotos, orderData.id, 'body');
        }
    }
    
    // 添加款式照片
    if (window.photoData.stylePhotos && window.photoData.stylePhotos.length > 0) {
        // 为 localStorage 创建轻量版照片数据（不含 dataUrl）
        newOrderData.stylePhotos = window.photoData.stylePhotos.map(photo => ({
            id: photo.id || Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: photo.name,
            type: photo.type,
            width: photo.width,
            height: photo.height,
            size: photo.size,
            uploadTime: photo.uploadTime || new Date().toISOString(),
            // 不包含 dataUrl 数据
            storedInIndexedDB: true
        }));
        
        console.log(`已添加${window.photoData.stylePhotos.length}张款式照片元数据到订单数据，完整数据存储在IndexedDB中`);
        
        // 同时保存完整照片数据到IndexedDB（如果可用）
        try {
            if (photoStorage) {
                // 尝试兼容不同的 API 格式
                if (typeof photoStorage.saveOrderStylePhotos === 'function') {
                    // 使用新 API
                    photoStorage.saveOrderStylePhotos(orderData.id, window.photoData.stylePhotos)
                        .then(() => console.log(`已保存${window.photoData.stylePhotos.length}张款式照片到IndexedDB`))
                        .catch(err => console.error('保存款式照片到IndexedDB失败:', err));
                } else if (typeof photoStorage.savePhotos === 'function') {
                    // 使用旧 API
                    photoStorage.savePhotos(window.photoData.stylePhotos, orderData.id, 'stylePhotos')
                        .then(() => console.log(`已保存${window.photoData.stylePhotos.length}张款式照片到IndexedDB`))
                        .catch(err => console.error('保存款式照片到IndexedDB失败:', err));
                } else {
                    console.warn('照片存储服务API不一致，无法存储照片');
                    createEmergencyBackup(window.photoData.stylePhotos, orderData.id, 'style');
                }
            } else {
                console.warn('photoStorage 服务不可用，无法存储照片到 IndexedDB');
                // 创建紧急备份，存储所有照片的压缩版本
                createEmergencyBackup(window.photoData.stylePhotos, orderData.id, 'style');
            }
        } catch (e) {
            console.error('调用照片存储服务失败:', e);
            // 创建紧急备份
            createEmergencyBackup(window.photoData.stylePhotos, orderData.id, 'style');
        }
    }
    
    return newOrderData;
}

// 导出函数到全局
window.addPhotosToOrderData = addPhotosToOrderData;
