// 公共功能文件 - 包含三个模块共用的函数和变量
console.log('开始加载common.js...');

// 添加测试函数以立即验证common.js是否正确加载
window.testCommonModuleLoaded = function() {
    console.log('common.js模块已成功加载');
    return true;
};

// 全局变量
let orders = []; // 订单数据
let costs = []; // 成本数据
let productionCosts = []; // 生产成本数据
let orderSequence = 1; // 订单序列号
let currentSubModule = sessionStorage.getItem('currentCostSubModule') || 'operation'; // 当前成本子模块

// 立即将变量暴露到全局作用域
window.orders = orders;
window.costs = costs;
window.productionCosts = productionCosts;
window.orderSequence = orderSequence;
window.currentSubModule = currentSubModule;

// 格式化日期为YYYY-MM-DD
window.formatDate = function(date) {
    if (!date) return '';
    
    if (typeof date === 'string') {
        date = new Date(date);
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
};

// 初始化函数 - 在每个页面加载时调用
function initSystem() {
    console.log('初始化系统...');
    
    // 添加诊断信息，记录全局变量状态
    console.log('[诊断] 全局变量状态：');
    console.log('[诊断] ORDER_TYPES存在：', typeof window.ORDER_TYPES !== 'undefined');
    if (typeof window.ORDER_TYPES !== 'undefined') {
        console.log('[诊断] ORDER_TYPES内容：', JSON.stringify(window.ORDER_TYPES));
    }
    console.log('[诊断] orders存在：', typeof window.orders !== 'undefined');
    console.log('[诊断] costs存在：', typeof window.costs !== 'undefined');
    console.log('[诊断] orderSequence存在：', typeof window.orderSequence !== 'undefined');
    
    // 使用Promise和setTimeout优化加载过程，避免长时间阻塞UI渲染
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                // 加载数据
                loadData();
                
                // 检查localStorage中是否已有数据
                const hasExistingData = localStorage.getItem('orders') || localStorage.getItem('costs');
                
                if (!hasExistingData) {
                    console.log('未找到已存在的数据，初始化测试数据...');
                    // 只在没有数据时初始化测试数据
                    initTestData();
                } else {
                    console.log('检测到已存在的数据，使用已保存的数据');
                }
                
                // 确保数据在全局范围可用
                window.orders = orders;
                window.costs = costs;
                window.productionCosts = productionCosts;
                window.orderSequence = orderSequence;
                
                if (typeof window.fastLoad === 'function') {
                    window.fastLoad();
                }
                
                console.log('系统初始化完成');
                resolve();
            } catch (error) {
                console.error('系统初始化出错:', error);
                reject(error);
            }
        }, 0); // 使用0延迟让浏览器有机会先渲染UI
    });
}

// 加载数据函数
function loadData() {
    console.log('开始加载数据...');
    
    try {
        // 先设置禁用自动生成标志
        localStorage.setItem('disableAutoCostGeneration', 'true');
        console.log('已设置禁用自动生成标志，确保不会重置生产成本数据');
        
        // 从localStorage加载订单数据
        const ordersData = localStorage.getItem('orders');
        if (ordersData) {
            orders = JSON.parse(ordersData);
            window.orders = orders; // 确保全局变量同步更新
            console.log('已加载订单数据:', orders.length, '条');
        } else {
            orders = [];
            window.orders = [];
            console.log('未找到订单数据，设置为空数组');
        }
        
        // 加载成本数据（运营成本）
        const costsData = localStorage.getItem('costs');
        if (costsData) {
            costs = JSON.parse(costsData);
            window.costs = costs; // 确保全局变量同步更新
            console.log('已加载成本数据:', costs.length, '条');
        } else {
            costs = [];
            window.costs = [];
            console.log('未找到成本数据，设置为空数组');
        }
        
        // 加载广告成本数据
        const adCostsData = localStorage.getItem('adCosts');
        if (adCostsData) {
            window.adCosts = JSON.parse(adCostsData);
            console.log('已加载广告成本数据:', window.adCosts.length, '条');
        } else {
            window.adCosts = [];
            console.log('未找到广告成本数据，设置为空数组');
        }
        
        // 加载运营成本数据
        const operatingCostsData = localStorage.getItem('operatingCosts');
        if (operatingCostsData) {
            window.operatingCosts = JSON.parse(operatingCostsData);
            console.log('已加载运营成本数据:', window.operatingCosts.length, '条');
        } else {
            window.operatingCosts = [];
            console.log('未找到运营成本数据，设置为空数组');
        }
        
        // 加载生产成本数据
        const productionCostsData = localStorage.getItem('productionCosts');
        if (productionCostsData) {
            productionCosts = JSON.parse(productionCostsData);
            window.productionCosts = productionCosts; // 确保全局变量同步更新
            console.log('已加载生产成本数据:', productionCosts.length, '条');
            
            // 设置生产成本数据已加载标记
            window.productionCostsLoaded = true;
            console.log('已设置生产成本数据加载标记');
        } else {
            productionCosts = [];
            window.productionCosts = [];
            window.productionCostsLoaded = true;
            console.log('未找到生产成本数据，设置为空数组');
        }
        
        // 加载订单序列号
        const sequenceData = localStorage.getItem('orderSequence');
        if (sequenceData) {
            orderSequence = parseInt(sequenceData);
            window.orderSequence = orderSequence; // 确保全局变量同步更新
            console.log('已加载订单序列号:', orderSequence);
        } else {
            orderSequence = 1;
            window.orderSequence = 1;
            console.log('未找到订单序列号，设置为默认值1');
        }
        
        console.log('数据加载完成，禁用自动生成标志已设置');
        return true;
    } catch (error) {
        console.error('数据加载失败:', error);
        return false;
    }
}

// 初始化测试数据
function initTestData() {
    console.log('初始化测试数据...');
    if (typeof window.generateTestOrders === 'function' && typeof window.generateTestCosts === 'function') {
        // 只在localStorage中没有数据时生成测试数据
        if (!localStorage.getItem('orders')) {
            window.testOrders = window.generateTestOrders();
            orders = window.testOrders || [];
            localStorage.setItem('orders', JSON.stringify(orders));
            console.log('已生成并保存测试订单数据:', orders.length, '条');
        }
        
        if (!localStorage.getItem('costs')) {
            window.testCosts = window.generateTestCosts();
            costs = window.testCosts || [];
            localStorage.setItem('costs', JSON.stringify(costs));
            console.log('已生成并保存测试成本数据:', costs.length, '条');
        }
        
        console.log('测试数据初始化完成');
    } else {
        console.error('无法生成测试数据：generateTestOrders或generateTestCosts函数未定义');
    }
}

// 渲染分页控件
function renderPagination(containerId, totalPages, currentPage, totalItems, onPageChange) {
    console.log(`渲染分页控件: 容器=${containerId}, 总页数=${totalPages}, 当前页=${currentPage}, 总记录数=${totalItems}`);
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('未找到分页容器:', containerId);
        return;
    }
    
    // 清空分页容器
    container.innerHTML = '';
    
    // 获取记录总数
    const totalRecords = totalItems || 0;
    
    // 如果总页数小于等于1，仅显示记录总数
    if (totalPages <= 1) {
        const totalInfoContainer = document.createElement('div');
        totalInfoContainer.className = 'd-flex justify-content-center';
        totalInfoContainer.innerHTML = `共 <span class="fw-bold mx-1">${totalRecords}</span> 条记录`;
        container.appendChild(totalInfoContainer);
        return;
    }
    
    // 创建分页容器的布局
    container.className = 'pagination-container d-flex justify-content-center mt-3';
    
    // 创建外层容器，用于放置分页按钮和总数统计
    const outerContainer = document.createElement('div');
    outerContainer.className = 'd-flex align-items-center';
    
    // 创建分页ul元素
    const pagination = document.createElement('ul');
    pagination.className = 'pagination mb-0';
    
    // 添加首页按钮
    const firstPageItem = document.createElement('li');
    firstPageItem.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    const firstPageLink = document.createElement('a');
    firstPageLink.className = 'page-link';
    firstPageLink.href = '#';
    firstPageLink.innerHTML = '<i class="fas fa-angle-double-left"></i>';
    firstPageLink.title = '首页';
    firstPageLink.addEventListener('click', function(e) {
        e.preventDefault();
        if (currentPage !== 1) {
            onPageChange(1);
        }
    });
    firstPageItem.appendChild(firstPageLink);
    pagination.appendChild(firstPageItem);
    
    // 添加上一页按钮
    const prevPageItem = document.createElement('li');
    prevPageItem.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    const prevPageLink = document.createElement('a');
    prevPageLink.className = 'page-link';
    prevPageLink.href = '#';
    prevPageLink.innerHTML = '<i class="fas fa-angle-left"></i>';
    prevPageLink.title = '上一页';
    prevPageLink.addEventListener('click', function(e) {
        e.preventDefault();
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    });
    prevPageItem.appendChild(prevPageLink);
    pagination.appendChild(prevPageItem);
    
    // 添加页码按钮
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    
    // 确保始终显示5个页码按钮（如果有足够的页数）
    if (endPage - startPage < 4 && totalPages > 5) {
        if (currentPage < 3) {
            endPage = Math.min(5, totalPages);
        } else if (currentPage > totalPages - 2) {
            startPage = Math.max(1, totalPages - 4);
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageItem = document.createElement('li');
        pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
        const pageLink = document.createElement('a');
        pageLink.className = 'page-link';
        pageLink.href = '#';
        pageLink.textContent = i;
        pageLink.addEventListener('click', function(e) {
            e.preventDefault();
            onPageChange(i);
        });
        pageItem.appendChild(pageLink);
        pagination.appendChild(pageItem);
    }
    
    // 添加下一页按钮
    const nextPageItem = document.createElement('li');
    nextPageItem.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    const nextPageLink = document.createElement('a');
    nextPageLink.className = 'page-link';
    nextPageLink.href = '#';
    nextPageLink.innerHTML = '<i class="fas fa-angle-right"></i>';
    nextPageLink.title = '下一页';
    nextPageLink.addEventListener('click', function(e) {
        e.preventDefault();
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    });
    nextPageItem.appendChild(nextPageLink);
    pagination.appendChild(nextPageItem);
    
    // 添加末页按钮
    const lastPageItem = document.createElement('li');
    lastPageItem.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    const lastPageLink = document.createElement('a');
    lastPageLink.className = 'page-link';
    lastPageLink.href = '#';
    lastPageLink.innerHTML = '<i class="fas fa-angle-double-right"></i>';
    lastPageLink.title = '末页';
    lastPageLink.addEventListener('click', function(e) {
        e.preventDefault();
        if (currentPage !== totalPages) {
            onPageChange(totalPages);
        }
    });
    lastPageItem.appendChild(lastPageLink);
    pagination.appendChild(lastPageItem);
    
    // 创建总数信息显示，放在分页按钮的右边
    const totalInfoContainer = document.createElement('div');
    totalInfoContainer.className = 'ms-3 d-flex align-items-center';
    totalInfoContainer.style.height = '38px'; // 设置与分页按钮相同的高度
    totalInfoContainer.innerHTML = `共 <span class="fw-bold mx-1">${totalRecords}</span> 条记录`;
    
    // 将分页控件和总数信息添加到外层容器
    outerContainer.appendChild(pagination);
    outerContainer.appendChild(totalInfoContainer);
    
    // 将外层容器添加到分页容器
    container.appendChild(outerContainer);
}

// 尚荣定制管理系统通用函数库

// 生成UUID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// 格式化日期时间为YYYY-MM-DD HH:MM:SS
function formatDateTime(date) {
    if (!date) return '';
    
    if (typeof date === 'string') {
        date = new Date(date);
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 格式化金额为人民币格式
function formatCurrency(amount) {
    if (amount === null || amount === undefined || amount === '') {
        return '¥0.00';
    }
    
    const num = parseFloat(amount);
    if (isNaN(num)) {
        return '¥0.00';
    }
    
    return '¥' + num.toFixed(2);
}

// 获取当前日期的字符串形式
function getCurrentDate() {
    return formatDate(new Date());
}

// 获取当前日期时间的字符串形式
function getCurrentDateTime() {
    return formatDateTime(new Date());
}

// 获取一个月前的日期
function getOneMonthAgo() {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return formatDate(date);
}

// 获取一年前的日期
function getOneYearAgo() {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    return formatDate(date);
}

// 检查日期是否在指定范围内
function isDateInRange(date, startDate, endDate) {
    if (!date) return false;
    
    const dateObj = new Date(date);
    const startObj = startDate ? new Date(startDate) : null;
    const endObj = endDate ? new Date(endDate) : null;
    
    if (startObj && dateObj < startObj) return false;
    if (endObj && dateObj > endObj) return false;
    
    return true;
}

// 计算两个日期之间的天数
function daysBetween(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    // 确保日期部分的比较，忽略时间
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(d2 - d1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
}

// 渲染分页控件
function renderPagination(containerId, currentPage, pageCount, onPageChange) {
    try {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // 清空容器
        container.innerHTML = '';
        
        if (pageCount <= 1) {
            return;
        }
        
        // 创建分页导航
        const nav = document.createElement('nav');
        nav.setAttribute('aria-label', '分页导航');
        
        const ul = document.createElement('ul');
        ul.className = 'pagination pagination-sm justify-content-end mb-0';
        
        // 上一页按钮
        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
        
        const prevLink = document.createElement('a');
        prevLink.className = 'page-link';
        prevLink.href = '#';
        prevLink.textContent = '上一页';
        
        if (currentPage > 1) {
            prevLink.addEventListener('click', function(e) {
                e.preventDefault();
                onPageChange(currentPage - 1);
            });
        }
        
        prevLi.appendChild(prevLink);
        ul.appendChild(prevLi);
        
        // 页码按钮
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(pageCount, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageLi = document.createElement('li');
            pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
            
            const pageLink = document.createElement('a');
            pageLink.className = 'page-link';
            pageLink.href = '#';
            pageLink.textContent = i;
            
            if (i !== currentPage) {
                pageLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    onPageChange(i);
                });
            }
            
            pageLi.appendChild(pageLink);
            ul.appendChild(pageLi);
        }
        
        // 下一页按钮
        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${currentPage === pageCount ? 'disabled' : ''}`;
        
        const nextLink = document.createElement('a');
        nextLink.className = 'page-link';
        nextLink.href = '#';
        nextLink.textContent = '下一页';
        
        if (currentPage < pageCount) {
            nextLink.addEventListener('click', function(e) {
                e.preventDefault();
                onPageChange(currentPage + 1);
            });
        }
        
        nextLi.appendChild(nextLink);
        ul.appendChild(nextLi);
        
        nav.appendChild(ul);
        container.appendChild(nav);
        
    } catch (error) {
        console.error('渲染分页控件出错:', error);
    }
}

// 将中文字符串转为拼音首字母，用于排序
function getFirstLetter(str) {
    if (!str) return '';
    
    // 简单实现，实际项目中可能需要更复杂的拼音转换库
    const firstChar = str.charAt(0);
    return firstChar;
}

// 对象数组排序函数
function sortObjectArray(array, key, order = 'asc') {
    return [...array].sort((a, b) => {
        let valueA = a[key];
        let valueB = b[key];
        
        // 处理日期
        if (valueA && valueB && (key.includes('date') || key.includes('Date'))) {
            valueA = new Date(valueA);
            valueB = new Date(valueB);
            return order === 'asc' ? valueA - valueB : valueB - valueA;
        }
        
        // 处理数字
        if (!isNaN(valueA) && !isNaN(valueB)) {
            return order === 'asc' ? valueA - valueB : valueB - valueA;
        }
        
        // 处理字符串
        valueA = String(valueA || '').toLowerCase();
        valueB = String(valueB || '').toLowerCase();
        
        return order === 'asc' 
            ? valueA.localeCompare(valueB, 'zh-CN') 
            : valueB.localeCompare(valueA, 'zh-CN');
    });
}

// 导出对象数组到Excel
function exportArrayToExcel(data, fileName, sheetName) {
    try {
        if (!data || data.length === 0) {
            alert('没有数据可供导出');
            return;
        }
        
        // 默认文件名和表名
        fileName = fileName || '导出数据.xlsx';
        sheetName = sheetName || '数据';
        
        // 创建工作簿
        const wb = XLSX.utils.book_new();
        
        // 使用对象数组直接转换为工作表
        const ws = XLSX.utils.json_to_sheet(data);
        
        // 添加到工作簿
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
        
        // 导出文件
        XLSX.writeFile(wb, fileName);
        
        console.log('数据导出成功:', fileName);
        
    } catch (error) {
        console.error('导出Excel出错:', error);
        alert('导出失败: ' + error.message);
    }
}

// 获取URL参数
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// 将函数暴露给全局作用域
window.initSystem = initSystem;
window.loadData = loadData;
window.renderPagination = renderPagination;
window.generateUUID = generateUUID;
window.formatDateTime = formatDateTime;
window.formatCurrency = formatCurrency;
window.getCurrentDate = getCurrentDate;
window.getCurrentDateTime = getCurrentDateTime;
window.getOneMonthAgo = getOneMonthAgo;
window.getOneYearAgo = getOneYearAgo;
window.isDateInRange = isDateInRange;
window.daysBetween = daysBetween;
window.getFirstLetter = getFirstLetter;
window.sortObjectArray = sortObjectArray;
window.exportArrayToExcel = exportArrayToExcel;
window.getUrlParameter = getUrlParameter;
window.syncProductionCostsWithOrders = syncProductionCostsWithOrders;
window.saveOrders = saveOrders;
window.loadOrders = loadOrders;
window.loadProductionCosts = loadProductionCosts;
window.saveProductionCosts = saveProductionCosts;

console.log('common.js 加载完成，所有函数已暴露到全局作用域');

// 公共JavaScript函数库
// 用于整个定制管理系统的通用功能

// 加载所有数据
function loadAllData() {
    try {
        console.log('开始加载所有数据...');
        
        // 加载订单数据
        loadOrders();
        
        // 加载成本数据
        loadCosts();
        
        // 加载生产成本数据
        loadProductionCosts();
        
        console.log('所有数据加载完成');
        return true;
    } catch (error) {
        console.error('加载数据出错:', error);
        alert('数据加载失败: ' + error.message);
        return false;
    }
}

// 加载订单数据
function loadOrders() {
    try {
        console.log('加载订单数据...');
        
        // 从本地存储获取订单数据
        const savedOrders = localStorage.getItem('orders');
        
        if (savedOrders) {
            window.orders = JSON.parse(savedOrders); // 直接使用全局变量
            console.log(`成功加载 ${window.orders.length} 条订单数据`);
        } else {
            // 初始化示例数据
            window.orders = generateSampleOrders();
            saveOrders();
            console.log('未找到订单数据，已生成示例数据');
        }
    } catch (error) {
        console.error('加载订单数据出错:', error);
        throw error;
    }
}

// 加载成本数据
function loadCosts() {
    try {
        console.log('加载运营成本数据...');
        
        // 从本地存储获取成本数据
        const savedCosts = localStorage.getItem('costs');
        
        if (savedCosts) {
            costs = JSON.parse(savedCosts);
            console.log(`成功加载 ${costs.length} 条运营成本数据`);
        } else {
            // 不再自动生成示例数据，而是初始化为空数组
            costs = [];
            saveCosts();
            console.log('未找到运营成本数据，已初始化为空数组');
        }
    } catch (error) {
        console.error('加载运营成本数据出错:', error);
        throw error;
    }
}

// 加载生产成本数据
function loadProductionCosts() {
    try {
        console.log('加载生产成本数据...');
        
        // 从本地存储获取生产成本数据
        const savedProductionCosts = localStorage.getItem('productionCosts');
        
        if (savedProductionCosts) {
            productionCosts = JSON.parse(savedProductionCosts);
            console.log(`成功加载 ${productionCosts.length} 条生产成本数据`);
        } else {
            // 初始化示例数据
            productionCosts = generateSampleProductionCosts();
            saveProductionCosts();
            console.log('未找到生产成本数据，已生成示例数据');
        }
    } catch (error) {
        console.error('加载生产成本数据出错:', error);
        throw error;
    }
}

// 保存订单数据到localStorage
function saveOrders() {
    try {
        console.log('开始保存订单数据到localStorage...');
        console.log('当前window.orders数组类型:', typeof window.orders);
        console.log('当前window.orders长度:', window.orders ? window.orders.length : 'undefined');
        
        // 确保orders存在并且是一个数组
        if (!window.orders || !Array.isArray(window.orders)) {
            console.error('错误: window.orders不是一个有效数组!');
            
            // 尝试恢复
            if (typeof orders !== 'undefined' && Array.isArray(orders)) {
                console.log('尝试使用局部变量orders修复...');
                window.orders = [...orders];
                console.log('修复后的window.orders长度:', window.orders.length);
            } else {
                console.error('无法修复! 局部变量orders也无效');
                // 初始化为空数组，防止后续错误
                window.orders = [];
            }
        }
        
        // 使用JSON序列化进行深拷贝，防止引用问题
        const ordersToSave = JSON.parse(JSON.stringify(window.orders));
        console.log('准备保存的订单数据数量:', ordersToSave.length);
        
        // 检查第一条订单数据完整性
        if (ordersToSave.length > 0) {
            console.log('第一条订单数据示例:', JSON.stringify(ordersToSave[0]).substring(0, 100) + '...');
        }
        
        // 将订单数据序列化为字符串
        const ordersString = JSON.stringify(ordersToSave);
        console.log('序列化后的数据长度:', ordersString.length, '字符');
        
        // 实际保存到localStorage
        localStorage.setItem('orders', ordersString);
        
        // 验证保存结果
        const savedString = localStorage.getItem('orders');
        if (!savedString) {
            throw new Error('保存后无法读取数据!');
        }
        
        const savedOrders = JSON.parse(savedString);
        console.log('验证: 从localStorage读取的订单数据数量:', savedOrders.length);
        
        // 只有当确认保存成功时才同步更新生产成本
        if (typeof window.syncProductionCostsWithOrders === 'function') {
            try {
                // 启用强制同步确保数据一致性
                window.syncProductionCostsWithOrders(true);
                console.log('已同步生产成本数据');
            } catch (syncError) {
                console.error('同步生产成本时出错:', syncError);
                // 不阻止函数返回true
            }
        }
        
        console.log('订单数据已成功保存到localStorage');
        return true;
    } catch (error) {
        console.error('保存订单数据到localStorage失败:', error);
        
        // 尝试最后的挽救措施 - 使用备用名称保存
        try {
            console.log('尝试使用备用名称保存数据...');
            localStorage.setItem('orders_backup_' + new Date().getTime(), JSON.stringify(window.orders));
            console.log('已使用备用名称保存数据');
        } catch (backupError) {
            console.error('备用保存也失败了:', backupError);
        }
        
        return false;
    }
}

// 保存成本数据到本地存储
function saveCosts() {
    try {
        // 确保使用window.costs来保存数据
        if (!window.costs || !Array.isArray(window.costs)) {
            console.error('错误: window.costs不是一个有效数组!');
            
            // 尝试恢复
            if (typeof costs !== 'undefined' && Array.isArray(costs)) {
                console.log('尝试使用局部变量costs修复...');
                window.costs = [...costs];
                console.log('修复后的window.costs长度:', window.costs.length);
            } else {
                console.error('无法修复! 局部变量costs也无效');
                // 初始化为空数组，防止后续错误
                window.costs = [];
            }
        }
        
        // 同步costs和operatingCosts
        if (window.operatingCosts && Array.isArray(window.operatingCosts)) {
            window.costs = window.operatingCosts.filter(cost => cost.costType === '运营成本');
            console.log('已同步operatingCosts到costs，长度:', window.costs.length);
        }
        
        // 保存到localStorage
        localStorage.setItem('costs', JSON.stringify(window.costs));
        localStorage.setItem('operatingCosts', JSON.stringify(window.operatingCosts));
        
        console.log('运营成本数据已保存到本地存储');
    } catch (error) {
        console.error('保存运营成本数据出错:', error);
        alert('保存运营成本数据失败: ' + error.message);
    }
}

// 保存生产成本数据到本地存储
function saveProductionCosts() {
    try {
        localStorage.setItem('productionCosts', JSON.stringify(productionCosts));
        console.log('生产成本数据已保存到本地存储');
        
        // 确保全局变量同步更新
        window.productionCosts = productionCosts;
        
        // 设置生产成本数据已加载标记
        if (typeof window.productionCostsLoaded !== 'undefined') {
            window.productionCostsLoaded = true;
            console.log('已设置生产成本数据加载标记（保存时）');
        }
    } catch (error) {
        console.error('保存生产成本数据出错:', error);
        alert('保存生产成本数据失败: ' + error.message);
    }
}

// 同步生产成本与订单数据
function syncProductionCostsWithOrders(forceSync = false) {
    console.log('开始同步生产成本数据和订单数据...');
    
    // 检查禁用标志 - 如果设置了禁用标志，且不是强制同步模式，则直接返回，不进行任何操作
    const disableAutoGeneration = localStorage.getItem('disableAutoCostGeneration');
    if (disableAutoGeneration === 'true' && !forceSync) {
        console.log('已设置禁用自动生成标志，跳过同步生产成本数据的操作');
        return;
    }
    
    try {
        // 加载订单数据
        let orders = [];
        const ordersData = localStorage.getItem('orders');
        if (ordersData) {
            orders = JSON.parse(ordersData);
        }
        
        if (!orders || !Array.isArray(orders) || orders.length === 0) {
            console.log('没有找到订单数据，无法同步生产成本');
            return;
        }
        
        // 加载生产成本数据
        let productionCosts = [];
        const productionCostsData = localStorage.getItem('productionCosts');
        if (productionCostsData) {
            productionCosts = JSON.parse(productionCostsData);
        }
        
        if (!productionCosts || !Array.isArray(productionCosts)) {
            productionCosts = [];
        }
        
        // 更新全局变量
        window.productionCosts = productionCosts;
        
        // 如果是强制同步模式，则确保每个订单都有对应的生产成本记录
        if (forceSync) {
            console.log('强制同步模式：确保每个订单都有对应的生产成本记录');
            
            // 检查每个订单是否有对应的生产成本记录
            orders.forEach(order => {
                // 查找该订单的生产成本记录
                const existingCost = productionCosts.find(cost => String(cost.orderId) === String(order.id));
                
                if (!existingCost) {
                    // 没有找到对应的生产成本记录，创建一个新的
                    console.log(`为订单 ${order.id} 创建新的生产成本记录`);
                    const newCost = {
                        id: window.generateUUID ? window.generateUUID() : ('pc_' + Date.now() + '_' + Math.floor(Math.random() * 10000)),
                        orderId: order.id,
                        fabricBrand: order.fabricBrand || '',
                        fabricCode: order.fabricCode || '',
                        fabricAmount: order.fabricAmount || '0',
                        configuration: order.configuration || '',
                        manufacturer: order.manufacturer || '',
                        fabricCost: 0,
                        processingCost: 0,
                        expressCost: 0,
                        modificationCost: 0,
                        salesCommission: 0,
                        totalCost: 0,
                        notes: ''
                    };
                    
                    // 添加到生产成本数组
                    productionCosts.push(newCost);
                } else {
                    // 已经存在生产成本记录，更新订单相关字段
                    console.log(`更新订单 ${order.id} 的生产成本记录`);
                    existingCost.fabricBrand = order.fabricBrand || existingCost.fabricBrand;
                    existingCost.fabricCode = order.fabricCode || existingCost.fabricCode;
                    existingCost.fabricAmount = order.fabricAmount || existingCost.fabricAmount;
                    existingCost.configuration = order.configuration || existingCost.configuration;
                    existingCost.manufacturer = order.manufacturer || existingCost.manufacturer;
                }
            });
            
            // 保存更新后的生产成本数据
            localStorage.setItem('productionCosts', JSON.stringify(productionCosts));
            console.log('强制同步完成，已更新生产成本数据');
        } else {
            console.log('已读取生产成本数据，不自动创建或修改任何记录');
        }
        
        // 重新设置禁用自动生成标志，防止后续操作重新覆盖
        localStorage.setItem('disableAutoCostGeneration', 'true');
        console.log('已重新设置禁用自动生成标志，确保手动修改的数据不被覆盖');
    } catch (error) {
        console.error('同步生产成本数据时出错:', error);
    }
}

// 生成随机ID
function generateId() {
    return 'id_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
}

// 格式化金额为两位小数
function formatMoney(amount) {
    return parseFloat(amount).toFixed(2);
}

// 获取URL参数
function getUrlParam(name) {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get(name);
}

// 设置活动的导航标签
function setActiveTab(tabId) {
    try {
        document.querySelectorAll('.nav-link').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const activeTab = document.getElementById(tabId);
        if (activeTab) {
            activeTab.classList.add('active');
        }
    } catch (error) {
        console.error('设置活动标签出错:', error);
    }
}

// ====== 示例数据生成函数 ======

// 生成示例订单数据
function generateSampleOrders() {
    // 面料品牌列表
    const fabricBrands = ['卡尔丹顿', '威可多', '雷蒙德', '波司登', '金利来', '罗蒙', '杉杉', '才子', '九牧王', '柒牌'];
    
    // 面料编号列表
    const fabricCodes = ['FC-1001', 'FC-1002', 'FC-1003', 'FC-2001', 'FC-2002', 'FC-3001', 'FC-3002', 'FC-4001', 'FC-5001', 'FC-6001'];
    
    // 客户来源列表（与下拉菜单保持一致）
    const customerSources = ['小红书', '抖音', '视频号', '快手', '美团', '地图', '老客户推荐', '老客户', '其他'];
    
    // 颜色列表 - 增加更多颜色选择
    const fabricColors = [
        '黑色', '深蓝', '灰色', '卡其色', '藏青', '酒红', '咖啡色', '墨绿色', '米白色', 
        '军绿色', '浅蓝色', '紫色', '深棕色', '深灰色', '湖蓝色', '香槟色', '暗红色', 
        '青灰色', '浅灰蓝', '驼色', '炭黑', '雾蓝', '珊瑚红', '薄荷绿', '象牙白',
        '深紫', '铁锈红', '橄榄绿', '宝蓝', '绛紫', '银灰', '栗棕', '乳白', '靛蓝',
        '赭石', '玛瑙红', '孔雀蓝', '海军蓝', '金棕', '杏色'
    ];
    
    // 配置项列表 - 仅使用衣、裤、衬衣、马甲、皮鞋
    const configItems = [
        {name: '衣', weight: 0.24}, // 衣、裤、衬衣共占70%
        {name: '裤', weight: 0.23},
        {name: '衬衣', weight: 0.23},
        {name: '马甲', weight: 0.20}, // 马甲占20%
        {name: '皮鞋', weight: 0.10}  // 皮鞋占10%
    ];
    
    // 厂家列表
    const manufacturers = ['广州制衣厂', '杭州服饰', '深圳成衣', '苏州工厂', '东莞制衣', '温州服装厂'];
    
    // 年份数据分布：2024年60条，2023年56条，2025年28条
    const yearDistribution = [
        { year: 2023, count: 56 },
        { year: 2024, count: 60 },
        { year: 2025, count: 28 }
    ];
    
    // 生成随机订单数据
    const sampleOrders = [];
    
    // 生成每年的数据
    let orderIndex = 0;
    yearDistribution.forEach(yearData => {
        const year = yearData.year;
        const count = yearData.count;
        
        for (let i = 0; i < count; i++) {
            orderIndex++;
            
            // 随机生成该年份内的月份和日期
            const month = Math.floor(Math.random() * 12);
            const day = Math.floor(Math.random() * 28) + 1; // 避免月底日期问题
            
            // 订单日期
            const orderDate = new Date(year, month, day);
            
            // 生成下料日期（订单日期后1-5天）
            const cuttingDate = new Date(orderDate);
            cuttingDate.setDate(cuttingDate.getDate() + Math.floor(Math.random() * 5) + 1);
            
            // 生成半成品日期（下料日期后3-10天）
            const semifinishedDate = new Date(cuttingDate);
            semifinishedDate.setDate(semifinishedDate.getDate() + Math.floor(Math.random() * 7) + 3);
            
            // 生成交货日期（半成品日期后5-15天）
            const deliveryDate = new Date(semifinishedDate);
            deliveryDate.setDate(deliveryDate.getDate() + Math.floor(Math.random() * 10) + 5);
            
            // 随机金额 800-3000，保留1位小数
            const totalPrice = (800 + Math.random() * 2200).toFixed(1);
            
            // 随机选择颜色
            const color = fabricColors[Math.floor(Math.random() * fabricColors.length)];
            
            // 生成配置（例如：1衣1裤1衬衣）- 按照权重分布生成
            // 1. 决定包含几个配置项
            const configCount = Math.floor(Math.random() * 3) + 1; // 1-3个配置项
            
            // 2. 使用加权随机选择配置项
            let selectedItems = [];
            for (let j = 0; j < configCount; j++) {
                // 每次选择后，重新计算剩余项的权重总和
                const remainingItems = configItems.filter(item => !selectedItems.includes(item.name));
                if (remainingItems.length === 0) break;
                
                const totalWeight = remainingItems.reduce((sum, item) => sum + item.weight, 0);
                let random = Math.random() * totalWeight;
                
                for (const item of remainingItems) {
                    random -= item.weight;
                    if (random <= 0) {
                        selectedItems.push(item.name);
                        break;
                    }
                }
            }
            
            // 确保至少有一个配置项
            if (selectedItems.length === 0) {
                // 随机选择一项配置
                const randomIndex = Math.floor(Math.random() * configItems.length);
                selectedItems.push(configItems[randomIndex].name);
            }
            
            // 将选中的配置项转换为指定格式
            const configuration = selectedItems.map(item => `1${item}`).join('');
            
            // 成交日期在订单日期后的7天内
            const dealDate = new Date(orderDate);
            dealDate.setDate(dealDate.getDate() + Math.floor(Math.random() * 7));
            
            const order = {
                id: generateId(),
                customerName: `客户${orderIndex}`,
                gender: Math.random() > 0.5 ? '男' : '女',
                customerSource: customerSources[Math.floor(Math.random() * customerSources.length)],
                dealDate: formatDate(dealDate),
                fabricBrand: fabricBrands[Math.floor(Math.random() * fabricBrands.length)],
                fabricCode: fabricCodes[Math.floor(Math.random() * fabricCodes.length)],
                color: color,
                fabricAmount: (1 + Math.random() * 2).toFixed(1),
                configuration: configuration,
                manufacturer: manufacturers[Math.floor(Math.random() * manufacturers.length)],
                orderDate: formatDate(orderDate),
                cuttingDate: formatDate(cuttingDate),
                semifinishedDate: formatDate(semifinishedDate),
                deliveryDate: formatDate(deliveryDate),
                totalPrice: totalPrice,
                deposit: (totalPrice * 0.3).toFixed(1),
                remark: `备注信息${orderIndex}`
            };
            
            sampleOrders.push(order);
        }
    });
    
    return sampleOrders;
}

// 生成示例运营成本数据
function generateSampleCosts() {
    // 成本类型列表
    const costTypes = ['店铺租金', '水电费', '员工工资', '推广费', '装修维护', '办公用品', '交通费', '其他'];
    
    // 支付方式列表
    const paymentMethods = ['现金', '银行转账', '微信支付', '支付宝'];
    
    // 生成随机成本数据
    const sampleCosts = [];
    const startDate = new Date(2022, 0, 1); // 2022年1月1日
    const endDate = new Date(); // 今天
    
    // 生成30条示例成本
    for (let i = 0; i < 30; i++) {
        // 随机生成成本日期
        const costDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
        
        // 随机选择成本类型
        const costType = costTypes[Math.floor(Math.random() * costTypes.length)];
        
        // 根据成本类型设置金额范围
        let costAmount;
        switch (costType) {
            case '店铺租金':
                costAmount = 5000 + Math.random() * 3000;
                break;
            case '水电费':
                costAmount = 500 + Math.random() * 500;
                break;
            case '员工工资':
                costAmount = 3000 + Math.random() * 2000;
                break;
            case '推广费':
                costAmount = 1000 + Math.random() * 2000;
                break;
            default:
                costAmount = 200 + Math.random() * 800;
        }
        
        const cost = {
            id: generateId(),
            costDate: formatDate(costDate),
            costType: costType,
            costAmount: costAmount.toFixed(2),
            paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
            remarks: `${costType}支出`
        };
        
        sampleCosts.push(cost);
    }
    
    return sampleCosts;
}

// 生成示例生产成本数据
function generateSampleProductionCosts() {
    // 生成随机生产成本数据
    const sampleProductionCosts = [];
    
    // 关联到示例订单
    for (let i = 0; i < 40 && i < orders.length; i++) {
        const productionCost = {
            id: generateId(),
            orderId: orders[i].id,
            fabricCost: "",
            processingCost: "",
            expressCost: "",
            modificationCost: "",
            salesCommission: "",
            totalCost: "0.00",
            fabricBrand: orders[i].fabricBrand || '未指定',
            fabricCode: orders[i].fabricCode || '未指定',
            fabricAmount: orders[i].fabricAmount || '0',
            configuration: orders[i].configuration || '标准配置',
            manufacturer: orders[i].manufacturer || '未指定',
            remarks: `订单 ${orders[i].customerName} 的生产成本`
        };
        
        sampleProductionCosts.push(productionCost);
    }
    
    return sampleProductionCosts;
}

// 导出全局函数
window.loadAllData = loadAllData;
window.saveOrders = saveOrders;
window.saveCosts = saveCosts;
window.saveProductionCosts = saveProductionCosts;
window.syncProductionCostsWithOrders = syncProductionCostsWithOrders;
window.generateId = generateId;
window.formatDate = formatDate;
window.formatMoney = formatMoney;
window.getUrlParam = getUrlParam;
window.setActiveTab = setActiveTab;

// 数据加载和初始化功能 (从data-loader.js合并)
function initializeData() {
    console.log('初始化数据...');
    
    try {
        // 测试localStorage是否可用
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        console.log('localStorage可用');
        
        // 初始化成本项目映射
        window.costItemsMap = {
            "运营成本": ["房租", "物业", "水费", "电费", "工资", "停车费", "杂费"],
            "广告成本": ["小红书", "抖音", "地图", "其他广告"],
            "生产成本": ["面料费", "加工费", "快递费", "修改费", "销售提成", "其他"],
            "其他": ["其他支出"]
        };
        
        // 生成测试数据 (如果需要)
        if (typeof generateTestData === 'function' && (!window.testOrders || !window.testCosts)) {
            console.log('生成测试数据');
            generateTestData();
        }
        
        // 首先尝试从localStorage读取数据
        let savedOrders = localStorage.getItem('orders');
        let savedCosts = localStorage.getItem('costs');
        let savedProductionCosts = localStorage.getItem('productionCosts');
        let savedOrderSequence = localStorage.getItem('orderSequence');
        
        console.log('从localStorage读取数据：', 
            savedOrders ? '找到订单数据' : '未找到订单数据', 
            savedCosts ? '找到成本数据' : '未找到成本数据',
            savedProductionCosts ? '找到生产成本数据' : '未找到生产成本数据',
            savedOrderSequence ? '找到订单序列号' : '未找到订单序列号'
        );
        
        // 初始化订单数据
        if (savedOrders) {
            try {
                window.orders = JSON.parse(savedOrders);
                console.log(`成功加载${window.orders.length}条订单数据`);
                
                // 如果订单数据为空，使用测试数据
                if (!window.orders || window.orders.length === 0) {
                    console.log('订单数据为空，使用测试数据');
                    window.orders = window.testOrders ? [...window.testOrders] : [];
                    // 保存测试数据到localStorage
                    localStorage.setItem('orders', JSON.stringify(window.orders));
                }
            } catch (e) {
                console.error('解析订单数据出错，使用测试数据', e);
                window.orders = window.testOrders ? [...window.testOrders] : [];
                // 保存测试数据到localStorage
                localStorage.setItem('orders', JSON.stringify(window.orders));
            }
        } else {
            console.log('未找到保存的订单数据，使用测试数据');
            window.orders = window.testOrders ? [...window.testOrders] : [];
            // 保存测试数据到localStorage
            localStorage.setItem('orders', JSON.stringify(window.orders));
        }
        
        // 初始化成本数据
        if (savedCosts) {
            try {
                window.costs = JSON.parse(savedCosts);
                console.log(`成功加载${window.costs.length}条成本数据`);
                
                // 检查成本数据是否为空数组或长度为0
                if (!window.costs || window.costs.length === 0) {
                    console.log('成本数据为空，使用空数组');
                    window.costs = [];
                    // 保存空数组到localStorage
                    localStorage.setItem('costs', JSON.stringify(window.costs));
                }
                
                // 确保成本数据类型正确
                validateAndFixCostTypes();
            } catch (e) {
                console.error('解析成本数据出错，使用空数组', e);
                window.costs = [];
                // 保存空数组到localStorage
                localStorage.setItem('costs', JSON.stringify(window.costs));
            }
        } else {
            console.log('未找到保存的成本数据，使用空数组');
            window.costs = [];
            // 保存空数组到localStorage
            localStorage.setItem('costs', JSON.stringify(window.costs));
        }
        
        // 初始化生产成本数据
        if (savedProductionCosts) {
            try {
                window.productionCosts = JSON.parse(savedProductionCosts);
                console.log(`成功加载${window.productionCosts.length}条生产成本数据`);
            } catch (e) {
                console.error('解析生产成本数据出错，使用空数组', e);
                window.productionCosts = [];
            }
        } else {
            console.log('未找到保存的生产成本数据，使用空数组');
            window.productionCosts = [];
        }
        
        // 确保订单序列号正确初始化
        if (savedOrderSequence && !isNaN(savedOrderSequence)) {
            // 使用保存的序列号
            window.orderSequence = parseInt(savedOrderSequence);
            console.log('从localStorage加载订单序列号:', window.orderSequence);
        } else if (window.orders && window.orders.length > 0) {
            // 从订单ID中计算序列号
            window.orderSequence = Math.max(...window.orders.map(order => {
                // 从订单ID中提取序列号部分
                const match = String(order.id).match(/SR\d{8}(\d+)/);
                return match ? parseInt(match[1]) : 0;
            }), 0) + 1;
            console.log('计算得到订单序列号:', window.orderSequence);
        } else {
            window.orderSequence = 1;
            console.log('设置默认订单序列号:', window.orderSequence);
        }
        
        // 初始化生产成本数据（确保与订单关联）
        if (typeof initProductionCosts === 'function') {
            initProductionCosts();
        }
        
        return true;
    } catch (error) {
        console.error('初始化数据时出错', error);
        return false;
    }
}

// 验证并修复成本数据类型
function validateAndFixCostTypes() {
    console.log('验证并修复成本数据类型');
    
    // 检查成本数据是否存在
    if (!window.costs || !Array.isArray(window.costs)) {
        console.error('成本数据不存在或不是数组');
        return;
    }
    
    // 成本类型映射
    const validCostTypes = ["运营成本", "广告成本", "生产成本"];
    
    // 成本项目映射
    const costItemsMap = window.costItemsMap || {
        "运营成本": ["房租", "物业", "水费", "电费", "工资", "停车费", "杂费"],
        "广告成本": ["小红书", "抖音", "地图", "其他广告"],
        "生产成本": ["面料费", "加工费", "快递费", "修改费", "销售提成", "其他"],
        "其他": ["其他支出"]
    };
    
    // 修复计数器
    let fixedCount = 0;
    
    // 遍历成本数据，检查并修复类型
    window.costs.forEach(cost => {
        // 检查成本类型是否有效
        if (!cost.costType || !validCostTypes.includes(cost.costType)) {
            // 根据成本项目推断类型
            if (cost.costItem) {
                for (const [type, items] of Object.entries(costItemsMap)) {
                    if (items.includes(cost.costItem)) {
                        cost.costType = type;
                        fixedCount++;
                        break;
                    }
                }
            }
            
            // 如果仍然无法确定类型，设置为默认类型
            if (!cost.costType || !validCostTypes.includes(cost.costType)) {
                cost.costType = "运营成本";
                fixedCount++;
            }
        }
    });
    
    // 如果有修复，保存更新后的成本数据
    if (fixedCount > 0) {
        console.log(`修复了${fixedCount}条成本数据的类型或项目`);
        localStorage.setItem('costs', JSON.stringify(window.costs));
    }
}

// 在页面加载完成后检查是否需要初始化数据
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否已经初始化过
    if (!window.dataInitialized) {
        // 初始化数据
        window.dataInitialized = initializeData();
    }
});

// 快速加载数据功能 (从fast-loader.js合并)
function fastLoad() {
    console.time('数据加载');
    
    try {
        // 并行加载所有数据
        const [orders, costs, productionCosts, sequence] = [
            localStorage.getItem('orders'),
            localStorage.getItem('costs'),
            localStorage.getItem('productionCosts'),
            localStorage.getItem('orderSequence')
        ];

        console.log('从localStorage读取数据：', 
            orders ? `找到订单数据(${orders.length}字节)` : '未找到订单数据', 
            costs ? `找到成本数据(${costs.length}字节)` : '未找到成本数据',
            productionCosts ? `找到生产成本数据(${productionCosts.length}字节)` : '未找到生产成本数据',
            sequence ? `找到订单序列号(${sequence})` : '未找到订单序列号'
        );

        // 处理订单数据
        if (orders) {
            try {
                let loadedOrders = JSON.parse(orders);
                console.log(`解析订单数据成功，包含${loadedOrders.length}条记录`);
                
                // 直接加载所有订单数据，不再过滤日期
                window.orders = loadedOrders;
                console.log(`成功加载${loadedOrders.length}条订单数据`);
            } catch (e) {
                console.error('解析订单数据出错，使用测试数据', e);
                window.orders = window.testOrders ? [...window.testOrders] : [];
                localStorage.setItem('orders', JSON.stringify(window.orders));
            }
        } else {
            console.log('未找到保存的订单数据，使用测试数据');
            window.orders = window.testOrders ? [...window.testOrders] : [];
            localStorage.setItem('orders', JSON.stringify(window.orders));
        }

        // 处理成本数据
        if (costs) {
            try {
                window.costs = JSON.parse(costs);
                console.log(`成功加载${window.costs.length}条成本数据`);
            } catch (e) {
                console.error('解析成本数据出错，使用空数组', e);
                window.costs = [];
                localStorage.setItem('costs', JSON.stringify(window.costs));
            }
        } else {
            console.log('未找到保存的成本数据，使用空数组');
            window.costs = [];
            localStorage.setItem('costs', JSON.stringify(window.costs));
        }
        
        // 处理生产成本数据
        if (productionCosts) {
            try {
                window.productionCosts = JSON.parse(productionCosts);
                console.log(`成功加载${window.productionCosts.length}条生产成本数据`);
            } catch (e) {
                console.error('解析生产成本数据出错', e);
                window.productionCosts = [];
                // 不自动生成生产成本数据，避免覆盖
            }
        } else {
            console.log('未找到保存的生产成本数据');
            window.productionCosts = [];
            // 不自动保存空数组，后续会根据需要生成
        }

        // 处理订单序列号
        if (sequence) {
            window.orderSequence = parseInt(sequence);
            console.log(`成功加载订单序列号: ${window.orderSequence}`);
        } else {
            window.orderSequence = 1;
            localStorage.setItem('orderSequence', '1');
            console.log('未找到订单序列号，设置为初始值1');
        }

        console.timeEnd('数据加载');
        console.log('数据加载完成：', {
            orders: window.orders.length,
            costs: window.costs.length,
            productionCosts: window.productionCosts ? window.productionCosts.length : 0,
            sequence: window.orderSequence
        });

        return true;
    } catch (error) {
        console.error('数据加载出错，使用默认数据：', error);
        // 使用默认数据
        window.orders = window.testOrders || [];
        window.costs = window.testCosts || [];
        window.productionCosts = [];
        window.orderSequence = 1;
        return false;
    }
}

// 保存所有数据到localStorage
window.saveAllData = function() {
    console.log('开始保存所有数据...');
    let saveResults = {
        orders: false,
        costs: false,
        productionCosts: false
    };
    
    try {
        // 1. 保存订单数据
        console.log('保存订单数据...');
        try {
            // 确保订单数据存在且为数组
            if (!window.orders || !Array.isArray(window.orders)) {
                console.error('错误: window.orders不是有效数组，尝试修复');
                
                // 尝试从局部变量恢复
                if (typeof orders !== 'undefined' && Array.isArray(orders)) {
                    window.orders = [...orders];
                    console.log('使用局部变量恢复window.orders，长度:', window.orders.length);
                } else {
                    console.warn('未找到可用的orders数组，创建空数组');
                    window.orders = [];
                }
            }
            
            // 保存订单数据
            const ordersToSave = JSON.parse(JSON.stringify(window.orders)); // 深拷贝防止引用问题
            localStorage.setItem('orders', JSON.stringify(ordersToSave));
            
            // 创建备份
            localStorage.setItem('orders_backup', JSON.stringify(ordersToSave));
            
            // 验证保存
            const savedOrdersStr = localStorage.getItem('orders');
            if (savedOrdersStr) {
                const savedOrders = JSON.parse(savedOrdersStr);
                if (Array.isArray(savedOrders) && savedOrders.length === window.orders.length) {
                    console.log('订单数据保存成功，数量:', savedOrders.length);
                    saveResults.orders = true;
                } else {
                    console.error('订单数据验证失败，长度不匹配');
                }
            } else {
                console.error('订单数据验证失败，无法从localStorage读取');
            }
        } catch (orderError) {
            console.error('保存订单数据时出错:', orderError);
        }
        
        // 2. 保存成本数据
        console.log('保存成本数据...');
        try {
            // 确保成本数据存在且为数组
            if (!window.costs || !Array.isArray(window.costs)) {
                console.error('错误: window.costs不是有效数组，尝试修复');
                
                // 尝试从局部变量恢复
                if (typeof costs !== 'undefined' && Array.isArray(costs)) {
                    window.costs = [...costs];
                    console.log('使用局部变量恢复window.costs，长度:', window.costs.length);
                } else {
                    console.warn('未找到可用的costs数组，创建空数组');
                    window.costs = [];
                }
            }
            
            // 保存成本数据
            localStorage.setItem('costs', JSON.stringify(window.costs));
            
            // 创建备份
            localStorage.setItem('costs_backup', JSON.stringify(window.costs));
            console.log('成本数据保存成功，数量:', window.costs.length);
            saveResults.costs = true;
        } catch (costError) {
            console.error('保存成本数据时出错:', costError);
        }
        
        // 3. 保存生产成本数据
        console.log('保存生产成本数据...');
        try {
            // 确保生产成本数据存在且为数组
            if (!window.productionCosts || !Array.isArray(window.productionCosts)) {
                console.error('错误: window.productionCosts不是有效数组，尝试修复');
                
                // 尝试从局部变量恢复
                if (typeof productionCosts !== 'undefined' && Array.isArray(productionCosts)) {
                    window.productionCosts = [...productionCosts];
                    console.log('使用局部变量恢复window.productionCosts，长度:', window.productionCosts.length);
                } else {
                    console.warn('未找到可用的productionCosts数组，创建空数组');
                    window.productionCosts = [];
                }
            }
            
            // 先尝试同步生产成本与订单的关系
            if (typeof window.syncProductionCostsWithOrders === 'function' && saveResults.orders) {
                try {
                    window.syncProductionCostsWithOrders();
                    console.log('已同步生产成本与订单的关系');
                } catch (syncError) {
                    console.error('同步生产成本与订单关系时出错:', syncError);
                }
            }
            
            // 保存生产成本数据
            localStorage.setItem('productionCosts', JSON.stringify(window.productionCosts));
            
            // 创建备份
            localStorage.setItem('productionCosts_backup', JSON.stringify(window.productionCosts));
            console.log('生产成本数据保存成功，数量:', window.productionCosts.length);
            saveResults.productionCosts = true;
        } catch (productionCostError) {
            console.error('保存生产成本数据时出错:', productionCostError);
        }
        
        // 4. 保存订单序列号
        console.log('保存订单序列号...');
        try {
            if (typeof window.orderSequence === 'number') {
                localStorage.setItem('orderSequence', window.orderSequence.toString());
                console.log('订单序列号保存成功:', window.orderSequence);
            } else {
                console.error('订单序列号无效:', window.orderSequence);
            }
        } catch (sequenceError) {
            console.error('保存订单序列号时出错:', sequenceError);
        }
        
        // 综合判断保存结果
        const overallSuccess = saveResults.orders || saveResults.costs || saveResults.productionCosts;
        console.log('所有数据保存完成，结果:', saveResults);
        
        return overallSuccess;
    } catch (error) {
        console.error('保存所有数据时发生严重错误:', error);
        
        // 尝试最后的挽救措施 - 使用时间戳备份
        try {
            const timestamp = new Date().getTime();
            
            if (window.orders && Array.isArray(window.orders)) {
                localStorage.setItem(`orders_emergency_${timestamp}`, JSON.stringify(window.orders));
            }
            
            if (window.costs && Array.isArray(window.costs)) {
                localStorage.setItem(`costs_emergency_${timestamp}`, JSON.stringify(window.costs));
            }
            
            if (window.productionCosts && Array.isArray(window.productionCosts)) {
                localStorage.setItem(`productionCosts_emergency_${timestamp}`, JSON.stringify(window.productionCosts));
            }
            
            console.log('已创建数据紧急备份');
        } catch (backupError) {
            console.error('创建紧急备份也失败了:', backupError);
        }
        
        return false;
    }
};

// 测试localStorage的可用性
function testLocalStorageAvailability() {
    try {
        const testKey = '_test_ls_' + Date.now();
        localStorage.setItem(testKey, 'test');
        const testValue = localStorage.getItem(testKey);
        localStorage.removeItem(testKey);
        
        if (testValue === 'test') {
            console.log('localStorage工作正常，数据持久化可用');
            return true;
        } else {
            console.warn('localStorage可能有问题：写入的测试数据无法正确读取');
            return false;
        }
    } catch (e) {
        console.error('localStorage测试失败，可能无法保存数据', e);
        alert('警告：您的浏览器可能不支持本地存储，系统数据将无法保存！');
        return false;
    }
}

// 确保数据被保存到localStorage的函数
function ensureDataSaved() {
    return saveAllData();
}

// 导出全局函数
window.fastLoad = fastLoad;
window.saveAllData = saveAllData;
window.ensureDataSaved = ensureDataSaved;
window.testLocalStorageAvailability = testLocalStorageAvailability;

// 恢复生产成本数据（确保每个订单都有生产成本记录）
function restoreProductionCosts() {
    console.log('开始恢复生产成本数据...');
    
    try {
        // 首先检查订单数据是否存在
        if (!window.orders || !Array.isArray(window.orders) || window.orders.length === 0) {
            // 尝试从localStorage加载订单数据
            const savedOrders = localStorage.getItem('orders');
            if (savedOrders) {
                try {
                    window.orders = JSON.parse(savedOrders);
                    console.log(`从localStorage加载了${window.orders.length}条订单数据`);
                } catch (error) {
                    console.error('解析订单数据失败:', error);
                    return false;
                }
            } else {
                console.error('无法找到订单数据，无法恢复生产成本');
                return false;
            }
        }
        
        // 如果订单数据为空，无法继续
        if (!window.orders || window.orders.length === 0) {
            console.error('订单数据为空，无法恢复生产成本');
            return false;
        }
        
        console.log(`找到${window.orders.length}条订单数据，开始匹配生产成本`);
        
        // 检查生产成本数据
        let storedProductionCosts = [];
        try {
            const savedCosts = localStorage.getItem('productionCosts');
            if (savedCosts) {
                storedProductionCosts = JSON.parse(savedCosts);
                console.log(`从localStorage加载了${storedProductionCosts.length}条生产成本数据`);
            } else {
                console.log('localStorage中未找到生产成本数据，将创建新数据');
                storedProductionCosts = [];
            }
        } catch (error) {
            console.error('解析生产成本数据失败:', error);
            storedProductionCosts = [];
        }
        
        // 重新创建生产成本数据（保留已存在的记录）
        const newProductionCosts = [];
        let newCount = 0;
        let existingCount = 0;
        
        // 获取所有订单ID
        const orderIds = window.orders.map(order => order.id);
        
        // 删除没有对应订单的生产成本记录
        const validStoredCosts = storedProductionCosts.filter(cost => {
            return orderIds.includes(cost.orderId);
        });
        
        const removedCount = storedProductionCosts.length - validStoredCosts.length;
        if (removedCount > 0) {
            console.log(`移除了${removedCount}条没有对应订单的生产成本记录`);
        }
        
        // 为每个订单创建或保留生产成本记录
        window.orders.forEach(order => {
            // 查找该订单的现有生产成本记录
            const existingCost = validStoredCosts.find(cost => String(cost.orderId) === String(order.id));
            
            if (existingCost) {
                // 保留现有记录，但确保包含最新订单的面料品牌、面料编号、配置、厂家信息
                if (order.fabricBrand && (!existingCost.fabricBrand || existingCost.fabricBrand === '未指定')) {
                    existingCost.fabricBrand = order.fabricBrand;
                }
                if (order.fabricCode && (!existingCost.fabricCode || existingCost.fabricCode === '未指定')) {
                    existingCost.fabricCode = order.fabricCode;
                }
                if (order.configuration && (!existingCost.configuration || existingCost.configuration === '标准配置')) {
                    existingCost.configuration = order.configuration;
                }
                if (order.manufacturer && (!existingCost.manufacturer || existingCost.manufacturer === '未指定')) {
                    existingCost.manufacturer = order.manufacturer;
                }
                if (order.fabricAmount && (!existingCost.fabricAmount || existingCost.fabricAmount === '0' || existingCost.fabricAmount === '未指定')) {
                    existingCost.fabricAmount = order.fabricAmount;
                }
                newProductionCosts.push(existingCost);
                existingCount++;
            } else {
                // 创建新的生产成本记录，初始值设为空字符串，不再计算比例
                const newCost = {
                    id: generateUUID(),
                    orderId: order.id,
                    fabricCost: "",
                    processingCost: "",
                    expressCost: "",
                    modificationCost: "",
                    salesCommission: "",
                    otherCost: "",
                    totalCost: "0.00", // 总成本初始为0
                    fabricBrand: order.fabricBrand || '未指定',
                    fabricCode: order.fabricCode || '未指定',
                    fabricAmount: order.fabricAmount || '0',
                    configuration: order.configuration || '标准配置',
                    manufacturer: order.manufacturer || '未指定',
                    remarks: `订单 ${order.customerName || ''} 的生产成本`
                };
                
                newProductionCosts.push(newCost);
                newCount++;
            }
        });
        
        console.log(`生产成本数据恢复完成: 保留${existingCount}条现有记录，创建${newCount}条新记录`);
        
        // 更新全局变量和localStorage
        window.productionCosts = newProductionCosts;
        localStorage.setItem('productionCosts', JSON.stringify(newProductionCosts));
        
        // 设置生产成本数据已加载标记
        window.productionCostsLoaded = true;
        
        // 如果当前页面是成本管理页面，刷新生产成本表格
        if (document.getElementById('productionCostTableBody')) {
            console.log('正在刷新生产成本表格显示...');
            if (typeof window.renderProductionCostsTable === 'function') {
                window.renderProductionCostsTable();
            } else if (typeof renderProductionCostsTable === 'function') {
                renderProductionCostsTable();
            }
        }
        
        return true;
    } catch (error) {
        console.error('恢复生产成本数据失败:', error);
        return false;
    }
}

// 导出全局函数
window.restoreProductionCosts = restoreProductionCosts;

// 静默加载数据（不显示成功消息）
function loadDataSilent() {
    console.log('静默加载数据...');
    
    try {
        // 设置禁用自动生成标志，确保不会自动创建生产成本数据
        localStorage.setItem('disableAutoCostGeneration', 'true');
        
        // 加载订单数据
        const ordersData = localStorage.getItem('orders');
        if (ordersData) {
            window.orders = JSON.parse(ordersData);
            console.log(`加载了 ${window.orders.length} 条订单数据`);
        } else {
            window.orders = [];
            console.log('未找到订单数据，初始化为空数组');
        }
        
        // 加载生产成本数据
        const productionCostsData = localStorage.getItem('productionCosts');
        if (productionCostsData) {
            window.productionCosts = JSON.parse(productionCostsData);
            console.log(`加载了 ${window.productionCosts.length} 条生产成本数据`);
        } else {
            window.productionCosts = [];
            console.log('未找到生产成本数据，初始化为空数组');
        }
        
        // 标记生产成本数据已加载
        window.productionCostsLoaded = true;
        
        // 加载广告成本数据
        const adCostsData = localStorage.getItem('adCosts');
        if (adCostsData) {
            window.adCosts = JSON.parse(adCostsData);
            console.log(`加载了 ${window.adCosts.length} 条广告成本数据`);
        } else {
            window.adCosts = [];
            console.log('未找到广告成本数据，初始化为空数组');
        }
        
        // 加载运营成本数据（兼容旧版数据结构）
        const operatingCostsData = localStorage.getItem('operatingCosts');
        if (operatingCostsData) {
            window.operatingCosts = JSON.parse(operatingCostsData);
            console.log(`加载了 ${window.operatingCosts.length} 条运营成本数据`);
            
            // 同时更新costs变量（兼容旧代码）
            window.costs = window.operatingCosts;
        } else {
            // 尝试从旧的costs字段加载
            const costsData = localStorage.getItem('costs');
            if (costsData) {
                window.costs = JSON.parse(costsData);
                window.operatingCosts = window.costs;
                console.log(`从旧数据结构加载了 ${window.costs.length} 条运营成本数据`);
            } else {
                window.costs = [];
                window.operatingCosts = [];
                console.log('未找到运营成本数据，初始化为空数组');
            }
        }
        
        console.log('数据加载完成，不执行任何成本同步操作');
        return true;
    } catch (error) {
        console.error('数据加载失败:', error);
        return false;
    }
} 

// 在页面即将刷新前，确保数据已保存
window.addEventListener('beforeunload', function() {
    if (typeof window.saveOrders === 'function') {
        window.saveOrders();
    }
});

// 整合所有修复功能的函数
function initSystemFixes() {
    console.log('初始化系统修复...');
    
    // 权限修复 (原 permission-fix.js)
    function fixPermissions() {
        // 获取当前用户信息
        const userInfoStr = localStorage.getItem('user_info');
        if (!userInfoStr) {
            console.warn('未找到用户信息，无法修复权限');
            return;
        }
        
        let userInfo;
        try {
            userInfo = JSON.parse(userInfoStr);
        } catch (e) {
            console.error('解析用户信息失败:', e);
            return;
        }
        
        // 如果是管理员，强制启用所有权限
        if (userInfo.role === 'admin') {
            console.log('当前用户是管理员，强制启用所有权限');
            // 设置全局管理员权限标志
            window.adminPermissionsEnabled = true;
            
            // 移除所有禁用状态
            document.querySelectorAll('button, input, textarea, select, a').forEach(el => {
                if (el.disabled) {
                    el.disabled = false;
                }
                if (el.classList.contains('disabled')) {
                    el.classList.remove('disabled');
                }
                if (el.style.pointerEvents === 'none') {
                    el.style.pointerEvents = '';
                }
                if (el.style.opacity && el.style.opacity !== '1') {
                    el.style.opacity = '';
                }
            });
            
            // 针对特定页面添加额外处理
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            
            if (currentPage === 'data-management.html') {
                // 确保数据管理页面的按钮可用
                document.querySelectorAll('[onclick^="viewPermissions"], [onclick^="deleteUser"]').forEach(el => {
                    el.style.pointerEvents = '';
                    el.style.opacity = '';
                });
            }
            
            console.log('管理员权限已强制启用');
        }
    }
    
    // 模态框修复 (原 fix_modal.js)
    function fixModals() {
        // 清除模态框背景的函数
        function clearModalBackdrop() {
            // 移除模态背景
            const modalBackdrops = document.querySelectorAll('.modal-backdrop');
            modalBackdrops.forEach(backdrop => {
                backdrop.classList.remove('show');
                backdrop.classList.remove('fade');
                backdrop.remove();
            });
            
            // 确保body不再有模态相关样式
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }
        
        // 查找所有模态框元素
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            // 给所有模态框添加inert属性，当显示时移除此属性
            if (!modal.hasAttribute('inert')) {
                modal.setAttribute('inert', '');
            }
            
            // 移除所有aria-hidden属性，改用inert属性
            if (modal.hasAttribute('aria-hidden')) {
                modal.removeAttribute('aria-hidden');
            }
            
            // 当模态框开始显示时，记录当前获得焦点的元素
            modal.addEventListener('show.bs.modal', function() {
                // 保存当前聚焦元素
                modal._lastFocusedElement = document.activeElement;
                
                // 移除inert属性使模态框可以接收焦点
                modal.removeAttribute('inert');
            });
            
            // 当模态框完全隐藏后，将焦点返回到之前的元素或一个安全元素
            modal.addEventListener('hidden.bs.modal', function() {
                // 添加inert属性使模态框无法接收焦点
                modal.setAttribute('inert', '');
                
                // 获取之前聚焦的元素或一个安全元素
                const safeElement = modal._lastFocusedElement || 
                                   document.getElementById('addOrderBtn') || 
                                   document.querySelector('.navbar-brand') || 
                                   document.body;
                
                // 短暂延迟，确保DOM完全更新
                setTimeout(() => {
                    // 确保要聚焦的元素存在且可聚焦
                    if (safeElement && typeof safeElement.focus === 'function') {
                        try {
                            safeElement.focus();
                        } catch (error) {
                            // 尝试聚焦到body
                            document.body.focus();
                        }
                    } else {
                        document.body.focus();
                    }
                    
                    // 额外调用一次清除背景函数
                    clearModalBackdrop();
                }, 50);
            });
        });
        
        // 监听所有模态框的隐藏事件
        document.addEventListener('hidden.bs.modal', function(event) {
            // 模态框隐藏后，延迟一点时间清除背景
            setTimeout(clearModalBackdrop, 300);
        });
    }
    
    // 仪表盘数据修复 (原 dashboard-fix.js)
    // 只有在首页才需要执行的修复
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '') {
        window.initDashboard = function() {
            console.log('初始化仪表盘数据（修复版）...');
            
            // 从本地存储加载订单数据
            let orders = [];
            const ordersData = localStorage.getItem('orders');
            if (ordersData) {
                try {
                    orders = JSON.parse(ordersData);
                    console.log('已加载订单数据:', orders.length, '条');
                } catch (e) {
                    console.error('解析订单数据失败:', e);
                }
            }
        
            // 获取当前日期和本月第一天
            const now = new Date();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            
            // 计算订单统计数据
            const totalOrders = orders.length;
            
            // 计算待处理订单数量
            const pendingOrders = orders.filter(order => 
                order.status === '待处理' || order.status === 'pending'
            ).length;
            
            // 计算本月收入
            const monthlyRevenue = orders
                .filter(order => new Date(order.orderDate) >= firstDayOfMonth)
                .reduce((sum, order) => sum + (parseFloat(order.totalPrice) || 0), 0);
            
            // 计算唯一客户数
            const customerSet = new Set(orders.map(order => order.customerName || order.customer));
            const totalCustomers = customerSet.size;
            
            setTimeout(() => {
                const totalOrdersEl = document.getElementById('totalOrders');
                const pendingOrdersEl = document.getElementById('pendingOrders');
                const monthlyRevenueEl = document.getElementById('monthlyRevenue');
                const totalCustomersEl = document.getElementById('totalCustomers');
                
                if (totalOrdersEl) totalOrdersEl.textContent = totalOrders;
                if (pendingOrdersEl) pendingOrdersEl.textContent = pendingOrders;
                if (monthlyRevenueEl) monthlyRevenueEl.textContent = formatCurrency(monthlyRevenue);
                if (totalCustomersEl) totalCustomersEl.textContent = totalCustomers;
                
                // 更新最近订单列表
                updateRecentOrders(orders);
            }, 800);
        };
        
        // 格式化货币数字
        function formatCurrency(amount) {
            return new Intl.NumberFormat('zh-CN', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount);
        }
        
        // 更新最近订单列表
        function updateRecentOrders(allOrders) {
            // 获取最近5个订单
            const recentOrders = [...allOrders]
                .sort((a, b) => new Date(b.orderDate || b.date) - new Date(a.orderDate || a.date))
                .slice(0, 5);
            
            if (recentOrders.length === 0) {
                // 如果没有订单数据，显示默认的示例订单
                const defaultOrders = [
                    { id: 'SR2023112001', customer: '张先生', date: '2023-11-20', amount: '¥1,200', status: '待处理' },
                    { id: 'SR2023111905', customer: '李女士', date: '2023-11-19', amount: '¥2,450', status: '生产中' }
                ];
                displayOrdersInTable(defaultOrders);
                return;
            }
            
            // 转换订单数据格式以适应表格显示
            const formattedOrders = recentOrders.map(order => {
                return {
                    id: order.orderId || order.id,
                    customer: order.customerName || order.customer,
                    date: formatDate(order.orderDate || order.date),
                    amount: '¥' + formatCurrency(order.totalPrice || order.amount || 0),
                    status: order.status || '待处理'
                };
            });
            
            displayOrdersInTable(formattedOrders);
        }
        
        // 格式化日期
        function formatDate(dateString) {
            if (!dateString) return '';
            
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            
            return `${year}-${month}-${day}`;
        }
        
        // 在表格中显示订单
        function displayOrdersInTable(orders) {
            const tableBody = document.querySelector('#recentOrdersTable tbody');
            if (!tableBody) return;
            
            tableBody.innerHTML = '';
            
            orders.forEach(order => {
                let statusClass = '';
                switch(order.status) {
                    case '待处理': statusClass = 'warning'; break;
                    case '生产中': statusClass = 'info'; break;
                    case '已完成': statusClass = 'success'; break;
                    case '已交付': statusClass = 'primary'; break;
                    default: statusClass = 'secondary';
                }
                
                tableBody.innerHTML += `
                    <tr>
                        <td>${order.id}</td>
                        <td>${order.customer}</td>
                        <td>${order.date}</td>
                        <td>${order.amount}</td>
                        <td><span class="badge bg-${statusClass}">${order.status}</span></td>
                        <td>
                            <a href="order-detail.html?id=${order.id}" class="btn btn-sm btn-outline-primary">
                                <i class="fas fa-eye"></i>
                            </a>
                        </td>
                    </tr>
                `;
            });
        }
    }
    
    // 数据管理页面权限修复 (原 data-permissions-fix.js)
    if (window.location.pathname.endsWith('data-management.html')) {
        // 重写viewPermissions函数
        window.viewPermissions = function(username) {
            // 打开权限设置模态框
            const modal = new bootstrap.Modal(document.getElementById('permissionsModal'));
            
            // 设置模态框标题
            document.getElementById('permissionsModalLabel').textContent = '用户权限: ' + username;
            
            // 根据用户名预设不同权限
            let userPermissions = {
                // 默认权限（普通用户）
                orderManagement: {
                    view: true,
                    add: false,
                    edit: false,
                    delete: false
                },
                salaryEntry: {
                    view: true,
                    add: false,
                    edit: false
                },
                costManagement: {
                    view: true,
                    edit: false
                },
                analysis: {
                    view: true
                },
                dataManagement: {
                    backup: false,
                    restore: false,
                    check: true
                }
            };
            
            // 从本地存储加载该用户现有的权限设置（如果有）
            const savedPermissions = localStorage.getItem(`user_permissions_${username}`);
            if (savedPermissions) {
                try {
                    const parsedPermissions = JSON.parse(savedPermissions);
                    userPermissions = parsedPermissions;
                    console.log(`已加载用户 ${username} 的权限设置`);
                } catch (e) {
                    console.error(`解析用户 ${username} 的权限设置失败:`, e);
                }
            } else {
                // 根据不同用户设置不同权限
                if (username === 'admin') {
                    // 管理员拥有所有权限
                    Object.keys(userPermissions).forEach(function(module) {
                        Object.keys(userPermissions[module]).forEach(function(permission) {
                            userPermissions[module][permission] = true;
                        });
                    });
                } else if (username === 'sales1') {
                    // 销售人员权限
                    userPermissions.orderManagement.add = true;
                    userPermissions.orderManagement.edit = true;
                    userPermissions.salaryEntry.add = true;
                }
                
                // 将默认权限保存到本地存储
                localStorage.setItem(`user_permissions_${username}`, JSON.stringify(userPermissions));
            }
            
            // 填充权限复选框
            if (typeof fillPermissionCheckboxes === 'function') {
                fillPermissionCheckboxes(userPermissions);
            }
            
            // 设置保存按钮的点击事件
            document.getElementById('savePermissionsBtn').onclick = function() {
                // 收集权限设置
                const newPermissions = typeof collectPermissionSettings === 'function' ? 
                    collectPermissionSettings() : userPermissions;
                
                // 保存权限到本地存储
                localStorage.setItem(`user_permissions_${username}`, JSON.stringify(newPermissions));
                
                alert('用户 ' + username + ' 的权限已更新');
                
                // 关闭模态框
                modal.hide();
            };
            
            modal.show();
        };
        
        // 重写deleteUser函数
        window.deleteUser = function(username) {
            if (username === 'admin') {
                alert('管理员账户不可删除');
                return;
            }
            
            if (confirm('确定要删除用户 ' + username + ' 吗？此操作不可逆。')) {
                // 实际删除用户相关的本地存储数据
                try {
                    // 1. 删除用户的权限设置
                    localStorage.removeItem(`user_permissions_${username}`);
                    
                    // 2. 删除其他可能的用户相关数据
                    localStorage.removeItem(`user_settings_${username}`);
                    
                    // 3. 从用户列表中删除该用户（如果有用户列表的话）
                    const userListStr = localStorage.getItem('user_list');
                    if (userListStr) {
                        try {
                            let userList = JSON.parse(userListStr);
                            userList = userList.filter(user => user.username !== username);
                            localStorage.setItem('user_list', JSON.stringify(userList));
                        } catch (e) {
                            console.error('解析用户列表失败:', e);
                        }
                    }
                    
                    // 删除成功提示
                    alert('用户 ' + username + ' 已删除');
                    
                    // 刷新页面以更新用户列表
                    window.location.reload();
                } catch (e) {
                    console.error('删除用户失败:', e);
                    alert('删除用户失败：' + e.message);
                }
            }
        };
    }
    
    // 立即执行权限修复
    fixPermissions();
    
    // 立即执行模态框修复
    fixModals();
    
    // 监听文档点击事件，处理可能的权限问题
    document.addEventListener('click', function(e) {
        // 获取当前用户信息
        const userInfoStr = localStorage.getItem('user_info');
        if (userInfoStr) {
            try {
                const userInfo = JSON.parse(userInfoStr);
                // 如果是管理员，检查点击的元素是否被禁用
                if (userInfo.role === 'admin') {
                    const target = e.target.closest('button, a, input[type="button"], input[type="submit"]');
                    if (target && (target.disabled || target.classList.contains('disabled'))) {
                        console.log('检测到管理员点击被禁用的元素，自动启用');
                        target.disabled = false;
                        target.classList.remove('disabled');
                        target.style.pointerEvents = '';
                        target.style.opacity = '';
                    }
                }
            } catch (e) {
                console.error('点击事件处理中解析用户信息失败:', e);
            }
        }
    });
    
    // 再次检查权限，处理动态加载的元素
    setTimeout(fixPermissions, 1000);
}

// 在DOM加载完毕后执行系统修复
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSystemFixes);
} else {
    // DOM已经加载完毕
    initSystemFixes();
}