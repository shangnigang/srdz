/**
 * 订单照片预览功能扩展
 * 用于在订单预览中显示体型照和款式照
 */

// 在原有的renderPreviewOtherInfo函数运行后，添加照片显示部分
const originalRenderPreviewOtherInfo = window.renderPreviewOtherInfo || (typeof renderPreviewOtherInfo === 'function' ? renderPreviewOtherInfo : null);

// 如果找到了原始函数，进行扩展
if (originalRenderPreviewOtherInfo) {
    // 保存原始函数引用
    window.renderPreviewOtherInfo = function(order) {
        // 先调用原始函数
        originalRenderPreviewOtherInfo(order);
        
        // 然后添加照片部分
        try {
            addPhotoPreviewSection(order);
        } catch (error) {
            console.error('添加照片预览部分失败:', error);
        }
    };
}

/**
 * 添加照片预览部分到其他信息区域
 * @param {Object} order - 订单对象
 */
function addPhotoPreviewSection(order) {
    const container = document.getElementById('previewOtherInfo');
    if (!container) return;
    
    // 检查是否已经存在照片区域，如果存在则移除
    const existingPhotoRow = container.querySelector('.photo-preview-section');
    if (existingPhotoRow) {
        existingPhotoRow.remove();
    }
    
    // 添加照片预览部分，新的一行
    const photosRow = document.createElement('div');
    photosRow.className = 'row mt-4 photo-preview-section';
    container.appendChild(photosRow);
    
    // 添加照片标题
    const photosSectionTitle = document.createElement('h6');
    photosSectionTitle.className = 'col-12 mb-3 border-bottom pb-2';
    photosSectionTitle.textContent = '订单照片';
    photosSectionTitle.style.fontSize = '1rem';
    photosSectionTitle.style.color = '#333';
    photosRow.appendChild(photosSectionTitle);
    
    // 体型照部分
    const bodyPhotoCol = document.createElement('div');
    bodyPhotoCol.className = 'col-md-6 mb-3';
    photosRow.appendChild(bodyPhotoCol);
    
    const bodyPhotoTitle = document.createElement('div');
    bodyPhotoTitle.className = 'fw-medium mb-2';
    bodyPhotoTitle.textContent = '体型照';
    bodyPhotoCol.appendChild(bodyPhotoTitle);
    
    const bodyPhotoContainer = document.createElement('div');
    bodyPhotoContainer.className = 'd-flex flex-wrap gap-2';
    bodyPhotoContainer.id = 'previewBodyPhotos';
    bodyPhotoCol.appendChild(bodyPhotoContainer);
    
    // 款式照部分
    const stylePhotoCol = document.createElement('div');
    stylePhotoCol.className = 'col-md-6 mb-3';
    photosRow.appendChild(stylePhotoCol);
    
    const stylePhotoTitle = document.createElement('div');
    stylePhotoTitle.className = 'fw-medium mb-2';
    stylePhotoTitle.textContent = '款式照片';
    stylePhotoCol.appendChild(stylePhotoTitle);
    
    const stylePhotoContainer = document.createElement('div');
    stylePhotoContainer.className = 'd-flex flex-wrap gap-2';
    stylePhotoContainer.id = 'previewStylePhotos';
    stylePhotoCol.appendChild(stylePhotoContainer);
    
    // 尝试加载体型照
    loadOrderPhotos(order.id, 'bodyPhotos', 'previewBodyPhotos');
    
    // 尝试加载款式照
    loadOrderPhotos(order.id, 'stylePhotos', 'previewStylePhotos');
}

/**
 * 从IndexedDB加载订单照片并显示在预览区域
 * @param {string} orderId - 订单ID
 * @param {string} photoType - 照片类型 (bodyPhotos/stylePhotos)
 * @param {string} containerId - 容器元素ID
 */
async function loadOrderPhotos(orderId, photoType, containerId) {
    try {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`未找到照片容器: ${containerId}`);
            return;
        }
        
        // 清空容器
        container.innerHTML = '';
        
        // 判断照片存储服务是否可用
        const photoStorage = window.photoStorageService || window.photoStorage;
        if (!photoStorage) {
            console.log('照片存储服务不可用，无法加载照片');
            showNoPhotosMessage(container);
            return;
        }
        
        // 尝试从IndexedDB加载照片
        let photos = [];
        let loadedFromIndexedDB = false;
        try {
            if (typeof photoStorage.getOrderBodyPhotos === 'function' && photoType === 'bodyPhotos') {
                photos = await photoStorage.getOrderBodyPhotos(orderId);
            } else if (typeof photoStorage.getOrderStylePhotos === 'function' && photoType === 'stylePhotos') {
                photos = await photoStorage.getOrderStylePhotos(orderId);
            } else if (typeof photoStorage.getPhotos === 'function') {
                photos = await photoStorage.getPhotos(orderId, photoType);
            }
            
            // 检查是否成功从IndexedDB加载了照片
            if (photos && Array.isArray(photos) && photos.length > 0) {
                loadedFromIndexedDB = true;
                console.log(`成功从IndexedDB加载${photos.length}张${photoType}照片`);
                renderPhotoThumbnails(photos, container);
            }
        } catch (error) {
            console.error(`从IndexedDB加载${photoType}照片失败:`, error);
        }
        
        // 如果从IndexedDB没有加载到照片，则尝试从订单数据直接加载
        if (!loadedFromIndexedDB) {
            const order = window.orders.find(o => o.id === orderId);
            if (order && order[photoType] && Array.isArray(order[photoType]) && order[photoType].length > 0) {
                console.log(`从订单数据加载${order[photoType].length}张${photoType}照片`);
                renderPhotoThumbnails(order[photoType], container);
            } else {
                // 如果照片都没有，显示空消息
                showNoPhotosMessage(container);
            }
        }
    } catch (error) {
        console.error(`加载${photoType}照片时出错:`, error);
        const container = document.getElementById(containerId);
        if (container) {
            showNoPhotosMessage(container);
        }
    }
}

/**
 * 渲染照片缩略图
 * @param {Array} photos - 照片数据数组
 * @param {HTMLElement} container - 容器元素
 */
function renderPhotoThumbnails(photos, container) {
    if (!container) return;
    
    // 确保先清空容器
    container.innerHTML = '';
    
    if (!photos || photos.length === 0) {
        showNoPhotosMessage(container);
        return;
    }
    
    // 创建一个临时数组，用于去重处理
    const uniquePhotos = [];
    const uniqueUrls = new Set();
    
    // 去除重复照片
    photos.forEach(photo => {
        if (!photo) return;
        
        const photoUrl = photo.dataUrl || photo.url || photo.src;
        if (!photoUrl) return;
        
        // 如果该URL尚未添加过，则添加到唯一数组中
        if (!uniqueUrls.has(photoUrl)) {
            uniqueUrls.add(photoUrl);
            uniquePhotos.push(photo);
        }
    });
    
    // 使用处理后的唯一照片数组
    uniquePhotos.forEach((photo, index) => {
        // 获取照片URL
        const photoUrl = photo.dataUrl || photo.url || photo.src;
        
        // 创建缩略图容器
        const thumbContainer = document.createElement('div');
        thumbContainer.className = 'position-relative';
        thumbContainer.style.width = '360px';
        thumbContainer.style.height = '360px';
        
        // 创建缩略图
        const img = document.createElement('img');
        img.src = photoUrl;
        img.className = 'img-thumbnail';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.cursor = 'pointer';
        
        // 添加点击事件，显示大图
        img.setAttribute('data-bs-toggle', 'modal');
        img.setAttribute('data-bs-target', '#imagePreviewModal');
        img.onclick = function() {
            document.getElementById('imagePreviewModalTitle').textContent = `照片 ${index + 1}`;
            document.getElementById('imagePreviewModalImg').src = photoUrl;
        };
        
        // 添加到容器
        thumbContainer.appendChild(img);
        container.appendChild(thumbContainer);
    });
}

/**
 * 显示无照片消息
 * @param {HTMLElement} container - 容器元素
 */
function showNoPhotosMessage(container) {
    container.innerHTML = '<div class="text-center text-muted p-3 border">暂无照片</div>';
}

/**
 * 优化PDF中的照片显示
 * @param {HTMLElement} contentElement - 要优化的内容元素
 */
function optimizePdfPhotos(contentElement) {
    try {
        if (!contentElement) return;
        
        // 调整照片容器的样式
        const photoContainers = contentElement.querySelectorAll('#previewBodyPhotos, #previewStylePhotos');
        photoContainers.forEach(container => {
            if (container) {
                // 照片显示样式调整
                container.style.display = 'flex';
                container.style.flexWrap = 'wrap';
                container.style.gap = '1px';
                container.style.justifyContent = 'flex-start';
                
                // 调整照片缩略图
                const thumbs = container.querySelectorAll('.position-relative');
                thumbs.forEach(thumb => {
                    thumb.style.width = '220px';
                    thumb.style.height = '220px';
                    thumb.style.margin = '1px';
                    
                    // 移除点击相关属性
                    const img = thumb.querySelector('img');
                    if (img) {
                        img.removeAttribute('data-bs-toggle');
                        img.removeAttribute('data-bs-target');
                        img.style.cursor = 'default';
                    }
                });
            }
        });
        
        return true;
    } catch (error) {
        console.error('优化PDF中的照片显示失败:', error);
        return false;
    }
}

// 增强exportOrderToPdf函数，添加照片优化
const originalExportOrderToPdf = window.exportOrderToPdf || (typeof exportOrderToPdf === 'function' ? exportOrderToPdf : null);

if (originalExportOrderToPdf) {
    window.exportOrderToPdf = function(order) {
        try {
            // 首先获取内容并克隆
            const content = document.getElementById('orderPreviewContent');
            if (!content) {
                return originalExportOrderToPdf.call(this, order);
            }
            
            // 在执行原始函数之前，先进行照片优化
            const pdfContent = content.cloneNode(true);
            optimizePdfPhotos(pdfContent);
            
            // 替换原始内容元素以便导出
            const originalContent = content.cloneNode(true);
            content.parentNode.replaceChild(pdfContent, content);
            
            // 使用原始函数进行导出
            originalExportOrderToPdf.call(this, order);
            
            // 导出后恢复原始内容
            setTimeout(() => {
                if (pdfContent.parentNode) {
                    pdfContent.parentNode.replaceChild(originalContent, pdfContent);
                }
            }, 100);
            
        } catch (error) {
            console.error('增强的PDF导出失败:', error);
            // 出错时使用原始函数
            return originalExportOrderToPdf.call(this, order);
        }
    };
}

// 在文档加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('订单照片预览功能已加载');
}); 