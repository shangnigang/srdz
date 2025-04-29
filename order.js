// 订单管理模块脚本
console.log('开始加载order.js...');

// 声明对common.js的依赖
(function() {
    // 检查common.js模块是否已正确初始化
    if (typeof window.orders === 'undefined' || 
        typeof window.formatDate !== 'function' || 
        typeof window.saveOrders !== 'function') {
        console.error('order.js依赖的common.js模块未正确初始化');
        return false;
    }
    
    console.log('common.js依赖检查通过，继续初始化order.js');
})();

// 确保formatDate函数可用（如果common.js未正确加载）
if (typeof window.formatDate !== 'function') {
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
    console.warn('在order.js中创建了备用formatDate函数');
}

// 订单模块共用变量初始化
if (!window.filteredOrdersData) {
    window.filteredOrdersData = []; // 筛选后的订单数据
}
console.log('当前订单序列号：', window.orderSequence);

// 本地变量（保持兼容性）
// 删除重复声明的本地变量，统一使用全局变量
// 以下代码被注释掉，避免变量重复声明的问题
// let filteredOrdersData = window.filteredOrdersData; 
// let orderSequence = window.orderSequence; // 使用已存在的window.orderSequence

// 订单类型常量定义
// 避免重复声明，先检查是否已存在
if (typeof window.ORDER_TYPES === 'undefined') {
    const ORDER_TYPES = {
        SUIT_PANTS: '西服西裤',
        SUIT_PANTS_VEST: '西服西裤马甲',
        SINGLE_SUIT: '单西',
        SINGLE_PANTS: '单裤',
        SHIRT: '衬衣',
        VEST: '马甲',
        COAT: '大衣',
        SHOES: '皮鞋',
        STOCK_SHIRT: '现货衬衣',
        TIE: '领带',
        OTHER: '其他'
    };
    // 将ORDER_TYPES常量暴露到全局作用域
    window.ORDER_TYPES = ORDER_TYPES;
}

// 当前选中的订单类型
let currentOrderType = '';

// 立即定义并暴露关键函数到全局作用域
window.initOrderTableEvents = function() {
    console.log('初始化订单表格事件');
    
    try {
        // 设置当前日期为默认的筛选结束日期
        const today = new Date();
        const endDateElement = document.getElementById('orderEndDate');
        if (endDateElement) {
            endDateElement.value = window.formatDate(today);
        } else {
            console.warn('未找到orderEndDate元素');
        }
        
        // 设置30天前日期为默认的筛选开始日期
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const startDateElement = document.getElementById('orderStartDate');
        if (startDateElement) {
            startDateElement.value = window.formatDate(thirtyDaysAgo);
        } else {
            console.warn('未找到orderStartDate元素');
        }
        
        console.log('订单表格事件初始化完成');
        return true;
    } catch (error) {
        console.error('初始化订单表格事件出错：', error);
        return false;
    }
};

// 添加测试函数，用于检查订单模块是否正确加载
window.testOrderModuleLoaded = function() {
    console.log('执行testOrderModuleLoaded测试...');
    
    try {
        // 检查核心函数是否已定义
        if (typeof window.initOrderTableEvents !== 'function') {
            console.error('订单模块测试失败: initOrderTableEvents未定义');
            return false;
        }
        
        if (typeof window.renderOrders !== 'function') {
            console.error('订单模块测试失败: renderOrders未定义');
            return false;
        }
        
        if (typeof window.saveOrder !== 'function') {
            console.error('订单模块测试失败: saveOrder未定义');
            return false;
        }
        
        if (typeof window.showNewOrderForm !== 'function') {
            console.error('订单模块测试失败: showNewOrderForm未定义');
            return false;
        }
        
        // 检查基础数据访问
        if (typeof window.orders === 'undefined') {
            console.error('订单模块测试失败: 全局orders变量未定义');
            return false;
        }
        
        console.log('订单管理模块已正确加载');
        return true;
    } catch (error) {
        console.error('订单模块加载测试出错:', error);
        return false;
    }
};

console.log('订单管理核心函数已暴露到全局作用域');

// 初始化订单表格事件（本地函数版本，保持兼容性）
function initOrderTableEvents() {
    // 使用全局函数的实现
    // window.initOrderTableEvents(); // 不要调用自己，会导致无限递归
    
    // 初始化新增订单下拉菜单事件
    initNewOrderDropdownEvents();
}

// 初始化新增订单下拉菜单事件
function initNewOrderDropdownEvents() {
    console.log('初始化新增订单下拉菜单事件...');
    
    try {
        // 获取下拉菜单所有选项
        const orderTypeItems = document.querySelectorAll('.dropdown-menu .dropdown-item');
        console.log('找到的下拉菜单项数量：', orderTypeItems.length);
        
        // 为每个选项添加点击事件
        orderTypeItems.forEach((item, index) => {
            console.log(`为第${index + 1}个菜单项添加点击事件：${item.getAttribute('data-order-type')}`);
            item.addEventListener('click', function(e) {
                e.preventDefault();
                try {
                    const orderType = this.getAttribute('data-order-type');
                    console.log(`选择了订单类型: ${orderType}`);
                    
                    // 保存当前选择的订单类型
                    window.currentOrderType = orderType;
                    
                    // 显示新订单表单
                    showNewOrderFormByType(orderType);
                } catch (err) {
                    console.error('处理订单类型选择事件时出错：', err);
                    alert('选择订单类型失败: ' + err.message);
                }
            });
        });
        
        console.log('新增订单下拉菜单事件初始化完成');
        return true;
    } catch (error) {
        console.error('初始化新增订单下拉菜单事件出错：', error);
        return false;
    }
}

// 初始化尺寸字段默认值
function initializeSizeFields() {
    console.log('初始化尺寸字段默认值...');
    
    // 添加事件监听器，将净尺寸自动复制到成衣尺寸
    document.querySelectorAll('[id^="jacketNet"], [id^="pantsNet"], [id^="vestNet"]').forEach(netInput => {
        const fieldName = netInput.id.replace('Net', '');
        const finishedInput = document.getElementById('jacketFinished' + fieldName) || 
                              document.getElementById('pantsFinished' + fieldName) ||
                              document.getElementById('vestFinished' + fieldName);
        
        if (finishedInput) {
            netInput.addEventListener('change', function() {
                // 如果成衣尺寸字段为空，则将净尺寸复制到成衣尺寸
                if (!finishedInput.value && this.value) {
                    finishedInput.value = this.value;
                }
            });
        }
    });
}

// 将initializeSizeFields函数暴露到全局作用域
window.initializeSizeFields = initializeSizeFields;

// 根据订单类型显示相应的订单表单
function showNewOrderFormByType(orderType) {
    console.log(`显示${orderType}订单表单`);
    
    try {
        // 订单类型映射表 - 支持新的字母代码和传统类型名
        const orderTypeMap = {
            'coat': '单西',     // 大衣/西服上衣
            'suit': '西服西裤',  // 套装
            'suit_vest': '西服西裤马甲', // 西服+西裤+马甲套装
            'pants': '单裤',    // 西裤
            'shirt': '衬衣',    // 衬衣
            'vest': '马甲',     // 马甲
            'overcoat': '大衣', // 大衣
            'shoes': '皮鞋',    // 皮鞋
            'stock_shirt': '现货衬衣', // 现货衬衣
            'tie': '领带',      // 领带
            'other': '其他'     // 其他
        };
        
        // 确定实际的订单类型
        let actualType = orderType;
        if (orderTypeMap[orderType]) {
            actualType = orderTypeMap[orderType];
            console.log(`订单类型从${orderType}映射为${actualType}`);
        }
        
        // 更新全局当前订单类型
        window.currentOrderType = actualType;
        
        // 更新表单中的隐藏字段
        const orderTypeField = document.getElementById('newOrderType');
        if (orderTypeField) {
            orderTypeField.value = actualType;
            console.log(`设置订单类型隐藏字段为"${actualType}"`);
        } else {
            console.warn('未找到订单类型隐藏字段');
        }
        
        // 更新弹窗标题
        const titleElement = document.getElementById('newOrderFormTitle');
        if (titleElement) {
            titleElement.textContent = `新增${actualType}订单`;
            console.log(`更新弹窗标题为"新增${actualType}订单"`);
        }
        
        // 更新下拉按钮文本
        const dropdownButton = document.querySelector('.add-order-dropdown .btn');
        if (dropdownButton) {
            dropdownButton.innerHTML = `${actualType} <i class="fas fa-caret-down"></i>`;
        }
        
        // 显示新订单表单模态框
        const newOrderFormModal = new bootstrap.Modal(document.getElementById('newOrderFormModal'));
        newOrderFormModal.show();
        
        // 切换款式表单显示
        toggleStyleFormsByOrderType(actualType);
        
        // 初始化尺寸字段默认值
        initializeSizeFields();
        
        return true;
    } catch (error) {
        console.error('显示订单表单时出错：', error);
        return false;
    }
}

// 渲染订单数据到表格
function renderOrders(ordersData, page = 1) {
    console.log('渲染订单数据，共' + ordersData.length + '条');
    const tableBody = document.getElementById('orderTableBody');
    if (!tableBody) {
        console.error('未找到订单表格主体元素');
        return;
    }
    
    // 清空表格
    tableBody.innerHTML = '';
    
    // 如果没有数据，显示提示信息
    if (!ordersData || ordersData.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 20; // 更新为与表格实际列数相匹配
        cell.textContent = '暂无订单数据';
        cell.style.textAlign = 'center';
        cell.style.padding = '20px';
        row.appendChild(cell);
        tableBody.appendChild(row);
        return;
    }

    // 按照成交时间从新到旧排序（使用dealDate字段）
    const sortedData = [...ordersData].sort((a, b) => {
        // 获取日期字符串，如果不存在则使用最早的日期
        const dateA = a.dealDate || '1970-01-01';
        const dateB = b.dealDate || '1970-01-01';
        // 比较日期，降序排列（从新到旧）
        return new Date(dateB) - new Date(dateA);
    });
    
    // 分页处理
    const pageSize = 10; // 每页显示10条数据
    const totalPages = Math.ceil(sortedData.length / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, sortedData.length);
    const currentPageData = sortedData.slice(startIndex, endIndex);
    
    // 添加订单数据
    currentPageData.forEach(order => {
        const row = document.createElement('tr');
        row.setAttribute('data-id', order.id);
        row.setAttribute('data-order', JSON.stringify(order));
        
        // 添加复选框列
        const checkboxCell = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = order.id;
        checkboxCell.appendChild(checkbox);
        row.appendChild(checkboxCell);
        
        // 添加数据列
        const dateCell = document.createElement('td');
        dateCell.textContent = order.dealDate || '';
        dateCell.classList.add('editable');
        dateCell.setAttribute('data-field', 'dealDate');
        dateCell.addEventListener('dblclick', function(e) {
            editCell(this, order, 'dealDate', 'date');
            e.stopPropagation(); // 阻止事件冒泡
        });
        row.appendChild(dateCell);
        
        const customerCell = document.createElement('td');
        customerCell.textContent = order.customerName || '';
        customerCell.classList.add('editable');
        customerCell.setAttribute('data-field', 'customerName');
        customerCell.addEventListener('dblclick', function(e) {
            editCell(this, order, 'customerName', 'text');
            e.stopPropagation(); // 阻止事件冒泡
        });
        row.appendChild(customerCell);
        
        const genderCell = document.createElement('td');
        genderCell.textContent = order.gender || '';
        genderCell.classList.add('editable');
        genderCell.setAttribute('data-field', 'gender');
        genderCell.addEventListener('dblclick', function(e) {
            editCell(this, order, 'gender', 'select', ['男', '女']);
            e.stopPropagation(); // 阻止事件冒泡
        });
        row.appendChild(genderCell);
        
        const sourceCell = document.createElement('td');
        sourceCell.textContent = order.customerSource || '';
        sourceCell.classList.add('editable');
        sourceCell.setAttribute('data-field', 'customerSource');
        sourceCell.addEventListener('dblclick', function(e) {
            editCell(this, order, 'customerSource', 'select', ["小红书", "抖音", "视频号", "快手", "美团", "地图", "老客户推荐", "老客户", "其他"]);
            e.stopPropagation(); // 阻止事件冒泡
        });
        row.appendChild(sourceCell);
        
        const brandCell = document.createElement('td');
        brandCell.textContent = order.fabricBrand || '';
        brandCell.classList.add('editable');
        brandCell.setAttribute('data-field', 'fabricBrand');
        brandCell.addEventListener('dblclick', function(e) {
            editCell(this, order, 'fabricBrand', 'text');
            e.stopPropagation(); // 阻止事件冒泡
        });
        row.appendChild(brandCell);
        
        const codeCell = document.createElement('td');
        codeCell.textContent = order.fabricCode || '';
        codeCell.classList.add('editable');
        codeCell.setAttribute('data-field', 'fabricCode');
        codeCell.addEventListener('dblclick', function(e) {
            editCell(this, order, 'fabricCode', 'text');
            e.stopPropagation(); // 阻止事件冒泡
        });
        row.appendChild(codeCell);
        
        const colorCell = document.createElement('td');
        colorCell.textContent = order.color || '';
        colorCell.classList.add('editable');
        colorCell.setAttribute('data-field', 'color');
        colorCell.addEventListener('dblclick', function(e) {
            editCell(this, order, 'color', 'text');
            e.stopPropagation(); // 阻止事件冒泡
        });
        row.appendChild(colorCell);
        
        const amountCell = document.createElement('td');
        amountCell.textContent = order.fabricAmount ? order.fabricAmount + ' 米' : '';
        amountCell.classList.add('editable');
        amountCell.setAttribute('data-field', 'fabricAmount');
        amountCell.addEventListener('dblclick', function(e) {
            editCell(this, order, 'fabricAmount', 'number');
            e.stopPropagation(); // 阻止事件冒泡
        });
        row.appendChild(amountCell);
        
        // 添加尺码列
        const sizeCell = document.createElement('td');
        sizeCell.textContent = order.size ? order.size + '码' : '';
        sizeCell.classList.add('editable');
        sizeCell.setAttribute('data-field', 'size');
        sizeCell.addEventListener('dblclick', function(e) {
            editCell(this, order, 'size', 'select', ['34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46']);
            e.stopPropagation(); // 阻止事件冒泡
        });
        row.appendChild(sizeCell);
        
        const configCell = document.createElement('td');
        configCell.textContent = order.configuration || '';
        configCell.classList.add('editable');
        configCell.setAttribute('data-field', 'configuration');
        configCell.addEventListener('dblclick', function(e) {
            editCell(this, order, 'configuration', 'text');
            e.stopPropagation(); // 阻止事件冒泡
        });
        row.appendChild(configCell);
        
        const manufacturerCell = document.createElement('td');
        manufacturerCell.textContent = order.manufacturer || '';
        manufacturerCell.classList.add('editable');
        manufacturerCell.setAttribute('data-field', 'manufacturer');
        manufacturerCell.addEventListener('dblclick', function(e) {
            editCell(this, order, 'manufacturer', 'text');
            e.stopPropagation(); // 阻止事件冒泡
        });
        row.appendChild(manufacturerCell);
        
        const semifinishedDateCell = document.createElement('td');
        semifinishedDateCell.textContent = order.semifinishedDate || '';
        semifinishedDateCell.classList.add('editable');
        semifinishedDateCell.setAttribute('data-field', 'semifinishedDate');
        semifinishedDateCell.addEventListener('dblclick', function(e) {
            editCell(this, order, 'semifinishedDate', 'date');
            e.stopPropagation(); // 阻止事件冒泡
        });
        row.appendChild(semifinishedDateCell);
        
        const cuttingDateCell = document.createElement('td');
        cuttingDateCell.textContent = order.cuttingDate || '';
        cuttingDateCell.classList.add('editable');
        cuttingDateCell.setAttribute('data-field', 'cuttingDate');
        cuttingDateCell.addEventListener('dblclick', function(e) {
            editCell(this, order, 'cuttingDate', 'date');
            e.stopPropagation(); // 阻止事件冒泡
        });
        row.appendChild(cuttingDateCell);
        
        const orderDateCell = document.createElement('td');
        orderDateCell.textContent = order.orderDate || '';
        orderDateCell.classList.add('editable');
        orderDateCell.setAttribute('data-field', 'orderDate');
        orderDateCell.addEventListener('dblclick', function(e) {
            editCell(this, order, 'orderDate', 'date');
            e.stopPropagation(); // 阻止事件冒泡
        });
        row.appendChild(orderDateCell);
        
        const deliveryDateCell = document.createElement('td');
        deliveryDateCell.textContent = order.deliveryDate || '';
        deliveryDateCell.classList.add('editable');
        deliveryDateCell.setAttribute('data-field', 'deliveryDate');
        deliveryDateCell.addEventListener('dblclick', function(e) {
            editCell(this, order, 'deliveryDate', 'date');
            e.stopPropagation(); // 阻止事件冒泡
        });
        row.appendChild(deliveryDateCell);
        
        const priceCell = document.createElement('td');
        // 优先使用totalPrice，如果没有则使用price
        const displayPrice = order.totalPrice || order.price;
        priceCell.textContent = displayPrice ? '¥' + formatMoney(displayPrice) : '';
        priceCell.classList.add('editable');
        priceCell.setAttribute('data-field', 'totalPrice');
        priceCell.addEventListener('dblclick', function(e) {
            editCell(this, order, 'totalPrice', 'number');
            e.stopPropagation(); // 阻止事件冒泡
        });
        row.appendChild(priceCell);
        
        // 添加预付款列
        const prepaidCell = document.createElement('td');
        prepaidCell.textContent = order.prepaidAmount ? '¥' + formatMoney(order.prepaidAmount) : '';
        prepaidCell.classList.add('editable');
        prepaidCell.setAttribute('data-field', 'prepaidAmount');
        prepaidCell.addEventListener('dblclick', function(e) {
            editCell(this, order, 'prepaidAmount', 'number');
            e.stopPropagation(); // 阻止事件冒泡
        });
        row.appendChild(prepaidCell);
        
        const depositCell = document.createElement('td');
        depositCell.textContent = order.deposit ? '¥' + formatMoney(order.deposit) : '';
        depositCell.classList.add('editable');
        depositCell.setAttribute('data-field', 'deposit');
        depositCell.style.display = 'none'; // 直接在单元格上添加隐藏样式
        depositCell.addEventListener('dblclick', function(e) {
            editCell(this, order, 'deposit', 'number');
            e.stopPropagation(); // 阻止事件冒泡
        });
        row.appendChild(depositCell);
        
        // 添加备注列
        const remarkCell = document.createElement('td');
        remarkCell.textContent = order.remark || '';
        remarkCell.classList.add('editable');
        remarkCell.setAttribute('data-field', 'remark');
        remarkCell.addEventListener('dblclick', function(e) {
            editCell(this, order, 'remark', 'text');
            e.stopPropagation(); // 阻止事件冒泡
        });
        row.appendChild(remarkCell);
        
        // 添加操作列
        const operationCell = document.createElement('td');
        operationCell.classList.add('text-center');
        
        // 添加编辑按钮
        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.className = 'btn btn-sm btn-outline-primary me-1';
        editButton.innerHTML = '<i class="fas fa-edit"></i>';
        editButton.title = '编辑';
        editButton.addEventListener('click', function() {
            showNewEditOrderForm(order.id);
        });
        operationCell.appendChild(editButton);
        
        // 添加预览按钮
        const previewButton = document.createElement('button');
        previewButton.type = 'button';
        previewButton.className = 'btn btn-sm btn-outline-info me-1';
        previewButton.innerHTML = '<i class="fas fa-eye"></i>';
        previewButton.title = '查看订单详情';
        previewButton.addEventListener('click', function() {
            showOrderPreview(order.id);
        });
        operationCell.appendChild(previewButton);
        
        row.appendChild(operationCell);
        
        tableBody.appendChild(row);
    });
    
    // 修复：直接创建分页控件，不依赖window.renderPagination
    createPagination('orderPagination', totalPages, page, ordersData.length, changePage);
    
    // 隐藏筛选结果计数器，因为现在在分页组件中显示了总数
    const countDisplay = document.getElementById('filterResultCount');
    if (countDisplay) {
        countDisplay.style.display = 'none';
    }
}

// 添加一个自包含的分页控件创建函数，不依赖common.js
function createPagination(containerId, totalPages, currentPage, totalItems, onPageChange) {
    console.log(`创建分页控件: 容器=${containerId}, 总页数=${totalPages}, 当前页=${currentPage}, 总记录数=${totalItems}`);
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('未找到分页容器:', containerId);
        return;
    }
    
    // 清空分页容器
    container.innerHTML = '';
    
    // 如果总页数小于等于1，仅显示记录总数
    if (totalPages <= 1) {
        const totalInfoContainer = document.createElement('div');
        totalInfoContainer.className = 'd-flex justify-content-center';
        totalInfoContainer.innerHTML = `共 <span class="fw-bold mx-1">${totalItems}</span> 条记录`;
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
    totalInfoContainer.innerHTML = `共 <span class="fw-bold mx-1">${totalItems}</span> 条记录`;
    
    // 将分页控件和总数信息添加到外层容器
    outerContainer.appendChild(pagination);
    outerContainer.appendChild(totalInfoContainer);
    
    // 将外层容器添加到分页容器
    container.appendChild(outerContainer);
}

// 保留切换页码的函数
function changePage(page) {
    console.log('切换到第', page, '页');
    
    // 确定要展示的数据
    let dataToShow = window.filteredOrdersData.length > 0 ? window.filteredOrdersData : window.orders;
    
    // 渲染对应页的数据
    renderOrders(dataToShow, page);
}

// 编辑单元格内的内容
function editCell(cell, order, fieldName, type, options) {
    console.log('编辑单元格：', fieldName);
    
    // 如果单元格已经处于编辑状态，则不重复处理
    if (cell.classList.contains('editing-cell')) {
        return;
    }
    
    // 特殊处理remark字段，确保使用text类型
    if (fieldName === 'remark') {
        console.log('备注字段特殊处理，强制使用text类型');
        type = 'text';
    }
    
    // 保存原始值
    const originalValue = order[fieldName];
    let displayValue = cell.textContent;
    
    // 清空单元格内容
    cell.textContent = '';
    cell.classList.add('editing-cell');
    
    let input;
    
    // 根据字段类型创建不同的编辑控件
    switch (type) {
        case 'text':
            input = document.createElement('input');
            input.type = 'text';
            input.value = originalValue || '';
            break;
            
        case 'number':
            input = document.createElement('input');
            input.type = 'number';
            input.step = '0.01';
            input.value = originalValue || '';
            break;
            
        case 'date':
            input = document.createElement('input');
            input.type = 'date';
            input.value = originalValue || '';
            break;
            
        case 'select':
            input = document.createElement('select');
            
            // 添加选项
            if (options && options.length > 0) {
                options.forEach(option => {
                    const optionElement = document.createElement('option');
                    optionElement.value = option;
                    optionElement.textContent = option;
                    optionElement.selected = option === originalValue;
                    input.appendChild(optionElement);
                });
            }
            
            // 添加空选项
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = '(空)';
            
            if (!originalValue) {
                emptyOption.selected = true;
            }
            
            input.insertBefore(emptyOption, input.firstChild);
            break;
            
        default:
            input = document.createElement('input');
            input.type = 'text';
            input.value = originalValue || '';
    }
    
    // 添加样式
    input.className = 'inline-editor';
    
    // 添加键盘事件处理
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            saveEdit();
            e.preventDefault();
        } else if (e.key === 'Escape') {
            cancelEdit();
            e.preventDefault();
        }
    });
    
    // 添加失焦事件处理
    input.addEventListener('blur', function() {
        saveEdit();
    });
    
    // 添加到单元格
    cell.appendChild(input);
    
    // 聚焦到编辑控件
    input.focus();
    
    // 如果是select，选择所有文本
    if (type !== 'select') {
        input.select();
    }
    
    // 保存编辑
    function saveEdit() {
        // 获取新值
        let newValue;
        if (type === 'select') {
            newValue = input.value;
        } else if (type === 'date') {
            newValue = input.value;
        } else if (type === 'number') {
            newValue = parseFloat(input.value) || 0;
        } else if (fieldName === 'remark') {
            // 特殊处理备注字段，确保是字符串
            newValue = input.value || '';
        } else {
            newValue = input.value;
        }
        
        // 如果值没有变化，直接返回
        if (order[fieldName] === newValue) {
            cancelEdit();
            return;
        }
        
        // 备份原始数据
        const originalOrder = JSON.parse(JSON.stringify(order));
        
        // 更新局部订单数据
        order[fieldName] = newValue;
        console.log('已更新局部订单对象数据：', fieldName, newValue);
        
        // ===== 核心修复：直接更新全局orders数组中的订单对象 =====
        const globalOrderIndex = window.orders.findIndex(o => o.id === order.id);
        if (globalOrderIndex !== -1) {
            console.log('找到全局orders数组中对应的订单，索引:', globalOrderIndex);
            
            // 同步更新相关字段
            if (fieldName === 'totalPrice') {
                window.orders[globalOrderIndex].totalPrice = newValue;
                window.orders[globalOrderIndex].price = newValue;
                order.price = newValue; // 同步更新局部对象
                console.log('更新价格字段到全局数组：', newValue);
            } else if (fieldName === 'prepaidAmount') {
                window.orders[globalOrderIndex].prepaidAmount = newValue;
                window.orders[globalOrderIndex].deposit = newValue;
                order.deposit = newValue; // 同步更新局部对象
                console.log('更新预付款字段到全局数组：', newValue);
            } else if (fieldName === 'deposit') {
                window.orders[globalOrderIndex].deposit = newValue;
                window.orders[globalOrderIndex].prepaidAmount = newValue;
                order.prepaidAmount = newValue; // 同步更新局部对象
                console.log('更新定金字段到全局数组：', newValue);
            } else {
                window.orders[globalOrderIndex][fieldName] = newValue;
                console.log('更新', fieldName, '字段到全局数组:', newValue);
            }
            
            // ===== 直接保存全局数组到localStorage =====
            localStorage.setItem('orders', JSON.stringify(window.orders));
            console.log('已直接保存全局orders数组到localStorage');
        } else {
            console.warn('在全局orders数组中未找到ID为', order.id, '的订单，无法直接更新');
        }
        
        // 保存数据到localStorage并确保所有视图同步
        try {
            // 使用全局保存函数（作为备用方案）
            if (typeof window.saveOrders === 'function') {
                console.log('使用全局saveOrders函数作为备份保存方法');
                window.saveOrders();
            } 
            
            // 创建备份以便恢复
            localStorage.setItem(`order_cell_edit_${order.id}_${fieldName}`, JSON.stringify(originalOrder));
            
            // 同步生产成本与订单数据，对重要字段进行优先处理
            const isImportantField = ['fabricBrand', 'fabricCode', 'fabricAmount', 'configuration', 'manufacturer'].includes(fieldName);
            if (typeof window.syncProductionCostsWithOrders === 'function') {
                console.log(`订单字段 ${fieldName} 已更新，${isImportantField ? '这是重要字段，强制' : ''}同步到生产成本数据`);
                // 如果是重要字段，强制同步，否则使用默认行为
                window.syncProductionCostsWithOrders(isImportantField);
            }
        } catch (error) {
            console.error('保存单元格编辑数据失败:', error);
            alert('数据保存失败，请刷新页面重试');
        }
        
        // 更新单元格显示
        if (type === 'date') {
            cell.textContent = newValue;
        } else if (type === 'number') {
            if (fieldName === 'totalPrice' || fieldName === 'deposit' || fieldName === 'prepaidAmount') {
                cell.textContent = '¥' + formatMoney(newValue);
            } else if (fieldName === 'fabricAmount') {
                cell.textContent = newValue + ' 米';
            } else {
                cell.textContent = newValue;
            }
        } else if (fieldName === 'size') {
            // 尺码字段特殊处理，添加"码"后缀
            cell.textContent = newValue ? newValue + '码' : '';
        } else {
            cell.textContent = newValue;
        }
        
        // 重新添加事件监听器
        cell.className = 'editable';
        cell.setAttribute('data-field', fieldName);
        cell.addEventListener('dblclick', function(e) {
            editCell(this, order, fieldName, type, options);
            e.stopPropagation();
        });
    }
    
    // 取消编辑
    function cancelEdit() {
        cell.classList.remove('editing-cell');
        cell.textContent = displayValue;
    }
}

// 显示新增订单表单
function showNewOrderForm() {
    try {
        console.log('显示新订单表单');
        
        // 设置表单标题
        document.getElementById('orderFormTitle').textContent = '新增订单';
        
        // 重置表单
        document.getElementById('orderForm').reset();
        document.getElementById('orderId').value = '';
        
        // 设置默认日期为今天
        const today = new Date();
        document.getElementById('dealDate').value = window.formatDate(today);
        
        // 设置订单配置提示
        document.getElementById('configuration').placeholder = '格式示例：1衣1裤1衬衣1马甲';
        
        // 显示模态框
        const modal = new bootstrap.Modal(document.getElementById('orderFormModal'));
        modal.show();
    } catch (error) {
        console.error('显示新订单表单出错:', error);
        alert('显示新订单表单失败: ' + error.message);
    }
}

// 显示编辑订单表单
function showEditOrderForm(orderId) {
    try {
        console.log('显示编辑订单表单(旧函数，已重定向):', orderId);
        
        // 重定向到新表单的显示函数
        return showNewEditOrderForm(orderId);
    } catch (error) {
        console.error('显示编辑订单表单出错:', error);
        alert('显示编辑订单表单失败: ' + error.message);
        return false;
    }
}

// 隐藏订单表单
function hideOrderForm() {
    try {
        console.log('隐藏订单表单');
        
        // 获取模态框元素
        const modal = document.getElementById('orderFormModal');
        if (modal) {
            // 在隐藏前，先将焦点设置到页面主体元素或安全的可聚焦元素
            document.getElementById('addOrderBtn')?.focus(); // 将焦点设置到添加订单按钮
            
            // 获取Bootstrap模态框实例并隐藏
            const modalInstance = bootstrap.Modal.getInstance(modal);
            if (modalInstance) {
                modalInstance.hide();
            }
        }
        
        // 同样处理新订单表单模态框
        const newOrderModal = document.getElementById('newOrderFormModal');
        if (newOrderModal) {
            // 在隐藏前，先将焦点设置到页面主体元素或安全的可聚焦元素
            document.getElementById('addOrderBtn')?.focus(); // 将焦点设置到添加订单按钮
            
            // 获取Bootstrap模态框实例并隐藏
            const modalInstance = bootstrap.Modal.getInstance(newOrderModal);
            if (modalInstance) {
                modalInstance.hide();
            }
        }
    } catch (error) {
        console.error('隐藏订单表单出错:', error);
    }
}

// 保存订单（新增或编辑）
function saveOrder(event) {
    if (event) event.preventDefault();
    
    try {
        console.log('保存订单(旧函数，已重定向)');
        console.log('当前时间:', new Date().toISOString());
        
        // 调用新表单的保存函数
        return saveNewOrder();
    } catch (error) {
        console.error('保存订单时发生错误:', error);
        alert('保存订单失败: ' + error.message);
        return false;
    }
}

// 删除选中的订单
function deleteSelectedOrders() {
    try {
        // 防止重复调用
        if (window.isDeleteOperationInProgress) {
            console.log('删除操作正在进行中，忽略重复调用');
            return;
        }
        
        window.isDeleteOperationInProgress = true;
        console.log('执行删除选中的订单操作...');
        
        // 获取所有选中的订单复选框
        const checkboxes = document.querySelectorAll('#orderTableBody input[type="checkbox"]:checked');
        console.log('选中的复选框数量:', checkboxes.length);
        
        if (checkboxes.length === 0) {
            alert('请先选择要删除的订单');
            window.isDeleteOperationInProgress = false;
            return;
        }
        
        // 确认是否删除
        if (!confirm(`确定要删除选中的 ${checkboxes.length} 条订单吗？`)) {
            console.log('用户取消了删除操作');
            window.isDeleteOperationInProgress = false;
            return;
        }
        
        // 获取选中的订单ID
        const selectedIds = Array.from(checkboxes).map(checkbox => checkbox.value);
        console.log('待删除的订单ID列表:', selectedIds);
        
        // 当前订单总数
        console.log('删除前订单总数:', window.orders.length);
        
        // 从orders数组中删除选中的订单（确保使用严格相等检查）
        const originalLength = window.orders.length;
        const tempOrders = [];
        
        // 手动进行过滤，明确比较类型
        for (let i = 0; i < window.orders.length; i++) {
            const order = window.orders[i];
            let shouldKeep = true;
            
            // 检查当前订单ID是否在要删除的ID列表中
            for (let j = 0; j < selectedIds.length; j++) {
                if (String(order.id) === String(selectedIds[j])) {
                    shouldKeep = false;
                    console.log('将删除订单:', order.id);
                    break;
                }
            }
            
            if (shouldKeep) {
                tempOrders.push(order);
            }
        }
        
        // 更新全局orders数组
        window.orders = tempOrders;
        
        console.log('删除后订单总数:', window.orders.length);
        console.log(`成功删除了${originalLength - window.orders.length}条订单`);
        
        // 保存到localStorage
        localStorage.setItem('orders', JSON.stringify(window.orders));
        console.log('已将更新后的订单数据保存到localStorage');
        
        // 同步删除对应的生产成本记录
        if (window.productionCosts && Array.isArray(window.productionCosts)) {
            console.log('开始同步删除关联的生产成本记录...');
            const originalCostCount = window.productionCosts.length;
            
            // 使用相同的手动过滤方法确保类型一致性
            const tempCosts = [];
            for (let i = 0; i < window.productionCosts.length; i++) {
                const cost = window.productionCosts[i];
                let shouldKeep = true;
                
                // 检查当前成本记录的订单ID是否在要删除的ID列表中
                for (let j = 0; j < selectedIds.length; j++) {
                    if (String(cost.orderId) === String(selectedIds[j])) {
                        shouldKeep = false;
                        console.log('将删除生产成本记录，对应订单ID:', cost.orderId);
                        break;
                    }
                }
                
                if (shouldKeep) {
                    tempCosts.push(cost);
                }
            }
            
            // 更新全局productionCosts数组
            window.productionCosts = tempCosts;
            
            const removedCostCount = originalCostCount - window.productionCosts.length;
            console.log(`成功删除了${removedCostCount}条关联的生产成本记录，剩余${window.productionCosts.length}条`);
            
            // 保存更新后的生产成本数据
            localStorage.setItem('productionCosts', JSON.stringify(window.productionCosts));
            console.log('已将更新后的生产成本数据保存到localStorage');
        }
        
        // 额外调用同步函数，确保数据一致性
        if (typeof window.syncProductionCostsWithOrders === 'function') {
            console.log('调用syncProductionCostsWithOrders函数确保数据一致性');
            window.syncProductionCostsWithOrders();
        }
        
        // 重新筛选和渲染订单表格
        console.log('开始重新渲染订单表格...');
        window.filteredOrdersData = [...window.orders]; // 重置筛选的数据
        renderOrders(window.filteredOrdersData, 1);
        console.log('订单表格重新渲染完成');
        
        // 提示用户删除成功
        alert(`已删除 ${checkboxes.length} 条订单记录及其关联的生产成本数据`);
        console.log('删除操作完成');
        
        // 重置删除操作状态
        window.isDeleteOperationInProgress = false;
        
        // 当删除订单成功时，同步更新生产成本表
        handleOrderDeleted();
        
        // 当订单更新后，更新与之关联的生产成本记录
        updateProductionCostsForOrder(selectedIds[0]);
        
    } catch (error) {
        console.error('删除订单出错:', error);
        alert('删除订单失败: ' + error.message);
        window.isDeleteOperationInProgress = false;
    }
}

// 复制选中的订单
function copySelectedOrder() {
    try {
        console.log('复制选中的订单...');
        
        // 获取所有选中的订单复选框
        const checkboxes = document.querySelectorAll('#orderTableBody input[type="checkbox"]:checked');
        
        if (checkboxes.length === 0) {
            alert('请先选择要复制的订单');
            return;
        }
        
        if (checkboxes.length > 1) {
            alert('一次只能复制一条订单记录');
            return;
        }
        
        // 获取选中的订单ID
        const selectedOrderId = checkboxes[0].value;
        console.log('选中的订单ID:', selectedOrderId);
        
        // 在orders数组中查找对应的订单
        const selectedOrder = window.orders.find(order => String(order.id) === String(selectedOrderId));
        
        // 如果找不到订单，提示用户
        if (!selectedOrder) {
            throw new Error('未找到选中的订单');
        }
        
        // 创建新订单对象，复制选中订单的属性
        const newOrder = { ...selectedOrder };
        
        // 生成新的订单ID
        newOrder.id = generateId();
        console.log('为复制的订单生成新ID:', newOrder.id);
        
        // 更新订单日期为当前日期
        const today = new Date();
        newOrder.orderDate = window.formatDate(today);
        
        // 将新订单添加到数组
        window.orders.unshift(newOrder);
        
        // 保存订单数据到localStorage
        localStorage.setItem('orders', JSON.stringify(window.orders));
        
        // 查找是否存在与被复制订单关联的生产成本记录 - 这里需要确保ID比较正确
        if (window.productionCosts && Array.isArray(window.productionCosts)) {
            console.log('查找与原订单关联的生产成本记录，原订单ID:', selectedOrderId);
            
            // 确保使用字符串比较
            const originalCost = window.productionCosts.find(cost => String(cost.orderId) === String(selectedOrderId));
            
            if (originalCost) {
                console.log('找到原订单的生产成本记录，正在为新订单创建生产成本记录...');
                console.log('原生产成本记录:', originalCost);
                
                // 创建新的生产成本记录，复制原始记录的属性
                const newCost = JSON.parse(JSON.stringify(originalCost)); // 使用深拷贝确保完全复制
                
                // 更新ID和关联的订单ID
                newCost.id = window.generateUUID();
                newCost.orderId = newOrder.id;
                
                console.log('新生成的生产成本记录:', newCost);
                
                // 添加到生产成本数组
                window.productionCosts.push(newCost);
                
                // 手动更新本地存储中的生产成本数据
                localStorage.setItem('productionCosts', JSON.stringify(window.productionCosts));
                console.log('新的生产成本记录已创建并保存到localStorage');
            } else {
                console.log('未找到原订单的生产成本记录，将创建新记录');
                
                // 创建一个新的生产成本记录
                const newCost = {
                    id: window.generateUUID(),
                    orderId: newOrder.id,
                    fabricCost: 0,
                    processingCost: 0,
                    shippingCost: 0,
                    revisionCost: 0,
                    salesCommission: 0,
                    totalCost: 0,
                    notes: ''
                };
                
                // 添加到生产成本数组
                window.productionCosts.push(newCost);
                
                // 保存更新后的生产成本数据
                localStorage.setItem('productionCosts', JSON.stringify(window.productionCosts));
                console.log('为订单创建了新的空生产成本记录');
            }
        }
        
        // 确保全局变量同步更新
        window.productionCostsLoaded = true;
        
        // 同步生产成本与订单数据
        if (typeof window.syncProductionCostsWithOrders === 'function') {
            console.log('调用同步函数确保数据一致性');
            window.syncProductionCostsWithOrders();
        }
        
        // 重新渲染订单表格
        renderOrders(window.orders);
        
        // 提示用户复制成功
        alert('订单复制成功');
    } catch (error) {
        console.error('复制订单出错:', error);
        alert('复制订单失败: ' + error.message);
    }
}

// 导出选中的订单到Excel
function exportSelectedOrdersToExcel() {
    try {
        console.log('导出订单到Excel...');
        
        // 获取选中的订单
        const checkboxes = document.querySelectorAll('#orderTableBody input[type="checkbox"]:checked');
        
        if (checkboxes.length === 0) {
            alert('请至少选择一个订单进行导出');
            return;
        }
        
        // 准备导出数据
        const exportData = [];
        
        checkboxes.forEach(checkbox => {
            const row = checkbox.closest('tr');
            const orderJson = row.getAttribute('data-order');
            if (orderJson) {
                const order = JSON.parse(orderJson);
                
                // 转换为更适合Excel的格式 - 调整列顺序与页面表格一致
                exportData.push({
                    '成交日期': order.dealDate || '',
                    '客户姓名': order.customerName || '',
                    '性别': order.gender || '',
                    '客户来源': order.customerSource || '',
                    '面料品牌': order.fabricBrand || '',
                    '面料编号': order.fabricCode || '',
                    '颜色': order.color || '',
                    '用料(米)': order.fabricAmount || '',
                    '尺码': order.size || '',
                    '配置': order.configuration || '',
                    '厂家': order.manufacturer || '',
                    '半成品日期': order.semifinishedDate || '',
                    '下料日期': order.cuttingDate || '',
                    '下单日期': order.orderDate || '',
                    '交货日期': order.deliveryDate || '',
                    '总价格(元)': order.totalPrice || '',
                    '预付款(元)': order.prepaidAmount || '',
                    '备注': order.remark || ''
                    // 已移除定金列
                });
            }
        });
        
        // 创建工作簿和工作表
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportData);
        XLSX.utils.book_append_sheet(wb, ws, '订单数据');
        
        // 生成二进制数据
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
        
        // 转换字符串为ArrayBuffer
        function s2ab(s) {
            const buf = new ArrayBuffer(s.length);
            const view = new Uint8Array(buf);
            for (let i = 0; i < s.length; i++) {
                view[i] = s.charCodeAt(i) & 0xFF;
            }
            return buf;
        }
        
        // 创建Blob对象并使用a标签下载
        const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = '订单数据.xlsx';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        
        // 清理
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
        
        console.log('订单数据导出成功，共', exportData.length, '条');
    } catch (error) {
        console.error('导出订单数据出错:', error);
        alert('导出订单数据失败: ' + error.message);
    }
}

// 切换所有订单复选框状态
function toggleAllOrderCheckboxes(checkbox) {
    const checkboxes = document.querySelectorAll('#orderTableBody input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.checked = checkbox.checked;
    });
}

// 筛选订单
function filterOrders() {
    console.log('执行订单筛选...');
    
    try {
        // 获取筛选条件
        const searchField = document.getElementById('orderSearchField').value;
        const searchValue = document.getElementById('orderSearchValue').value.toLowerCase();
        const startDateStr = document.getElementById('orderStartDate').value;
        const endDateStr = document.getElementById('orderEndDate').value;
        
        console.log(`筛选条件: 字段=${searchField}, 值=${searchValue}, 开始日期=${startDateStr}, 结束日期=${endDateStr}`);
        
        // 检查是否有订单数据
        if (!window.orders || !Array.isArray(window.orders)) {
            console.error('未找到订单数据或订单数据不是数组');
            if (typeof window.loadOrders === 'function') {
                window.loadOrders().then(() => {
                    if (window.orders && Array.isArray(window.orders)) {
                        console.log('重新加载订单数据成功，继续筛选');
                        continueFilterOrders(searchField, searchValue, startDateStr, endDateStr);
                    } else {
                        console.error('重新加载订单数据失败');
                        alert('无法加载订单数据，请刷新页面重试');
                    }
                });
                return;
            } else {
                alert('未找到订单数据，请刷新页面重试');
                return;
            }
        }
        
        continueFilterOrders(searchField, searchValue, startDateStr, endDateStr);
    } catch (error) {
        console.error('筛选订单数据失败:', error);
        alert('筛选订单数据失败: ' + error.message);
    }
}

// 继续筛选订单（确保数据已加载）
function continueFilterOrders(searchField, searchValue, startDateStr, endDateStr) {
    try {
        // 构建日期对象（如果有日期筛选）
        let startDate = null;
        let endDate = null;
        
        if (startDateStr) {
            startDate = new Date(startDateStr);
            startDate.setHours(0, 0, 0, 0);
        }
        
        if (endDateStr) {
            endDate = new Date(endDateStr);
            endDate.setHours(23, 59, 59, 999);
        }
        
        // 筛选订单
        const filteredOrders = window.orders.filter(order => {
            let matchesSearch = true;
            let matchesDateRange = true;
            
            // 检查搜索条件
            if (searchField && searchValue) {
                const fieldValue = String(order[searchField] || '').toLowerCase();
                matchesSearch = fieldValue.includes(searchValue);
            }
            
            // 检查日期范围
            if (startDate || endDate) {
                const dealDateStr = order.dealDate;
                
                if (dealDateStr) {
                    const dealDate = new Date(dealDateStr);
                    
                    if (startDate && dealDate < startDate) {
                        matchesDateRange = false;
                    }
                    
                    if (endDate && dealDate > endDate) {
                        matchesDateRange = false;
                    }
                } else {
                    matchesDateRange = false;
                }
            }
            
            return matchesSearch && matchesDateRange;
        });
        
        console.log(`筛选结果: 共找到 ${filteredOrders.length} 条订单`);
        
        // 设置全局筛选结果
        window.filteredOrdersData = filteredOrders;
        
        // 显示筛选结果计数
        const resultCountElement = document.getElementById('orderFilterResultCount');
        if (resultCountElement) {
            resultCountElement.textContent = `筛选结果: 共找到 ${filteredOrders.length} 条订单`;
            resultCountElement.style.display = 'block';
            resultCountElement.style.margin = '10px 0';
            resultCountElement.style.fontWeight = 'bold';
        }
        
        // 渲染筛选后的订单
        renderOrders(filteredOrders);
    } catch (error) {
        console.error('完成订单筛选失败:', error);
        alert('完成订单筛选失败: ' + error.message);
    }
}

// 重置筛选条件
function resetOrderFilter() {
    console.log('重置订单筛选条件...');
    
    try {
        // 重置筛选表单
        document.getElementById('orderSearchField').value = 'customerName';
        document.getElementById('orderSearchValue').value = '';
        document.getElementById('orderStartDate').value = '';
        document.getElementById('orderEndDate').value = '';
        
        // 清除筛选结果
        window.filteredOrdersData = null;
        
        // 隐藏筛选结果计数
        const resultCountElement = document.getElementById('orderFilterResultCount');
        if (resultCountElement) {
            resultCountElement.style.display = 'none';
        }
        
        // 重新渲染所有订单
        renderOrders(window.orders);
        
        console.log('订单筛选条件已重置');
    } catch (error) {
        console.error('重置订单筛选条件失败:', error);
        alert('重置订单筛选条件失败: ' + error.message);
    }
}

// 清空所有订单备注
function clearAllOrderRemarks() {
    console.log('正在清空所有订单备注...');
    
    try {
        // 获取当前所有订单数据
        let orders = JSON.parse(localStorage.getItem('orders')) || [];
        if (orders.length === 0) {
            console.log('没有订单数据，无需清空备注');
            return {
                success: true,
                message: '没有订单数据，无需清空备注',
                clearedCount: 0
            };
        }
        
        // 记录原始有备注的订单数量
        const ordersWithRemarks = orders.filter(order => order.remark && order.remark.trim() !== '').length;
        
        // 清空所有订单的备注
        orders.forEach(order => {
            order.remark = '';
        });
        
        // 保存更新后的订单数据
        localStorage.setItem('orders', JSON.stringify(orders));
        
        console.log(`已清空${ordersWithRemarks}条订单的备注`);
        
        // 如果有备注被清空，刷新页面显示更新后的数据
        if (ordersWithRemarks > 0) {
            alert(`已清空${ordersWithRemarks}条订单的备注，页面将重新加载。`);
            // 延迟刷新页面，让用户看到提示
            setTimeout(() => {
                window.location.reload();
            }, 100);
        }
        
        return {
            success: true,
            message: `已清空${ordersWithRemarks}条订单的备注`,
            clearedCount: ordersWithRemarks
        };
    } catch (error) {
        console.error('清空订单备注时出错：', error);
        return {
            success: false,
            message: '清空订单备注失败：' + error.message
        };
    }
}

// 注意：以下是页面加载时的自动操作（已禁用）
// document.addEventListener('DOMContentLoaded', function() {
//     // 延迟执行，确保页面已完全加载
//     setTimeout(() => {
//         clearAllOrderRemarks();
//     }, 1000);
// });

// 格式化货币金额
function formatMoney(amount) {
    return parseFloat(amount).toFixed(1);
}

// 生成唯一ID
function generateId() {
    const today = new Date();
    const dateStr = today.getFullYear().toString() +
        (today.getMonth() + 1).toString().padStart(2, '0') +
        today.getDate().toString().padStart(2, '0');
    
    // 使用全局序列号变量
    const sequence = window.orderSequence || 1;
    const id = 'SR' + dateStr + sequence.toString().padStart(4, '0');
    
    // 递增序列号并保存到全局变量和localStorage
    window.orderSequence = sequence + 1;
    localStorage.setItem('orderSequence', window.orderSequence.toString());
    console.log('生成订单ID:', id, '，更新序列号为:', window.orderSequence);
    
    return id;
}

// 将函数暴露给全局作用域
window.renderOrders = renderOrders;
window.changePage = changePage;
window.showNewOrderForm = showNewOrderForm;
window.showEditOrderForm = showEditOrderForm;
window.hideOrderForm = hideOrderForm;
window.saveOrder = saveOrder;
window.saveNewOrder = saveNewOrder;
window.showNewOrderFormByType = showNewOrderFormByType;
window.showNewEditOrderForm = showNewEditOrderForm;
window.initNewOrderDropdownEvents = initNewOrderDropdownEvents;
window.toggleStyleFormsByOrderType = toggleStyleFormsByOrderType;
window.deleteSelectedOrders = deleteSelectedOrders;
window.copySelectedOrder = copySelectedOrder;
window.exportSelectedOrdersToExcel = exportSelectedOrdersToExcel;
window.toggleAllOrderCheckboxes = toggleAllOrderCheckboxes;
window.filterOrders = filterOrders;
window.resetOrderFilter = resetOrderFilter;
window.editCell = editCell;
window.formatMoney = formatMoney;
window.generateId = generateId;
window.initOrderTableEvents = initOrderTableEvents;
window.initSizeTabsEvents = initSizeTabsEvents;

// 初始化导航栏事件
function initNavEvents() {
    try {
        console.log('初始化导航事件...');
        
        // 为返回首页链接添加点击事件监听
        const homeLink = document.querySelector('.nav-link[href="index.html"]');
        if (homeLink) {
            homeLink.addEventListener('click', function() {
                console.log('返回首页');
            });
        }
        
        // 模块切换按钮
        const orderListBtn = document.getElementById('orderListBtn');
        const orderStatsBtn = document.getElementById('orderStatsBtn');
        
        if (orderListBtn) {
            orderListBtn.addEventListener('click', function() {
                document.getElementById('orderModule').style.display = 'block';
                document.getElementById('orderStatistics').style.display = 'none';
                orderListBtn.classList.add('active');
                orderStatsBtn.classList.remove('active');
                sessionStorage.setItem('currentOrderSubModule', 'list');
            });
        }
        
        if (orderStatsBtn) {
            orderStatsBtn.addEventListener('click', function() {
                document.getElementById('orderModule').style.display = 'none';
                document.getElementById('orderStatistics').style.display = 'block';
                orderStatsBtn.classList.add('active');
                orderListBtn.classList.remove('active');
                sessionStorage.setItem('currentOrderSubModule', 'stats');
                
                // 加载统计图表
                initOrderStatistics();
            });
        }
        
        // 保存订单按钮
        const saveOrderBtn = document.getElementById('saveOrderBtn');
        if (saveOrderBtn) {
            saveOrderBtn.addEventListener('click', saveOrder);
        }
        
        // 注意：移除了对saveNewOrderBtn的事件绑定，避免重复绑定
        // 保存新订单按钮的事件绑定已在DOMContentLoaded中完成
        
        // 导出订单按钮
        const exportOrderBtn = document.getElementById('exportOrderBtn');
        if (exportOrderBtn) {
            exportOrderBtn.addEventListener('click', exportSelectedOrdersToExcel);
        }
        
        // 全选订单复选框
        const selectAllOrders = document.getElementById('selectAllOrders');
        if (selectAllOrders) {
            selectAllOrders.addEventListener('change', function() {
                toggleAllOrderCheckboxes(this);
            });
        }
        
        // 订单筛选按钮
        const filterOrderBtn = document.getElementById('filterOrderBtn');
        if (filterOrderBtn) {
            filterOrderBtn.addEventListener('click', filterOrders);
        }
        
        // 重置筛选按钮
        const resetOrderFilterBtn = document.getElementById('resetOrderFilterBtn');
        if (resetOrderFilterBtn) {
            resetOrderFilterBtn.addEventListener('click', resetOrderFilter);
        }
        
        // 复制订单按钮
        const copyOrderBtn = document.getElementById('copyOrderBtn');
        if (copyOrderBtn) {
            copyOrderBtn.addEventListener('click', copySelectedOrder);
        }
        
        // 成衣尺寸开关事件
        const showFinishedSize = document.getElementById('showFinishedSize');
        if (showFinishedSize) {
            showFinishedSize.addEventListener('change', function() {
                const finishedSizeSection = document.querySelector('.finished-size-section');
                if (finishedSizeSection) {
                    finishedSizeSection.style.display = this.checked ? 'block' : 'none';
                }
            });
        }
        
        // 裤子成衣尺寸开关事件
        const showPantsFinishedSize = document.getElementById('showPantsFinishedSize');
        if (showPantsFinishedSize) {
            showPantsFinishedSize.addEventListener('change', function() {
                const pantsFinishedSizeSection = document.querySelector('.pants-finished-size-section');
                if (pantsFinishedSizeSection) {
                    pantsFinishedSizeSection.style.display = this.checked ? 'block' : 'none';
                }
            });
        }
        
        console.log('导航事件初始化完成');
        return true;
    } catch (error) {
        console.error('初始化导航事件出错:', error);
        return false;
    }
}

// 添加初始化订单模块的函数
window.initOrderModule = function() {
    try {
        console.log('开始初始化订单管理模块...');
        
        // 1. 初始化订单表格事件
        if (typeof initOrderTableEvents === 'function') {
            initOrderTableEvents();
        } else {
            console.error('initOrderTableEvents函数未定义');
        }
        
        // 2. 渲染订单数据
        if (typeof renderOrders === 'function' && window.orders) {
            renderOrders(window.orders);
            console.log('订单数据渲染成功');
        } else {
            console.warn('renderOrders函数未定义或orders数据不存在');
        }
        
        // 3. 初始化尺寸体型表单事件
        if (typeof initSizeTabsEvents === 'function') {
            initSizeTabsEvents();
            console.log('尺寸体型表单事件初始化成功');
        } else {
            console.warn('initSizeTabsEvents函数未定义');
        }
        
        // 4. 初始化模块切换
        if (typeof initModuleSwitch === 'function') {
            initModuleSwitch();
        } else {
            console.warn('initModuleSwitch函数未定义');
        }
        
        // 5. 初始化模态框事件
        initModalEvents();
        
        console.log('订单管理模块初始化完成');
        
        // 隐藏定金列 - 根据用户需求添加
        setTimeout(function() {
            // 隐藏表头中的定金列
            const depositHeader = document.querySelector('th.col-deposit');
            if (depositHeader) {
                depositHeader.style.display = 'none';
            }
            
            // 隐藏表格数据中的定金列（第17列）
            const rows = document.querySelectorAll('#orderTableBody tr');
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 17) {
                    cells[16].style.display = 'none'; // 第17列是定金列（从0开始计数）
                }
            });
            
            console.log('定金列已隐藏');
        }, 1000); // 延迟1秒执行，确保表格已渲染
        
        return true;
    } catch (error) {
        console.error('订单管理模块初始化失败:', error);
        alert('订单管理模块初始化失败: ' + error.message);
        return false;
    }
};

// 初始化模态框事件
function initModalEvents() {
    try {
        console.log('初始化模态框事件处理...');
        
        // 获取所有模态框元素
        const modalElements = [
            document.getElementById('orderFormModal'),
            document.getElementById('newOrderFormModal')
        ];
        
        // 为每个模态框添加hidden.bs.modal事件监听
        modalElements.forEach(modal => {
            if (modal) {
                // 当模态框完全隐藏后触发
                modal.addEventListener('hidden.bs.modal', function () {
                    console.log('模态框隐藏事件触发');
                    
                    // 强制将焦点设置到订单添加按钮或其他安全元素
                    const safeElement = document.getElementById('addOrderBtn') || 
                                       document.querySelector('nav a') || 
                                       document.body;
                    
                    if (safeElement) {
                        // 短暂延迟，确保DOM完全更新
                        setTimeout(() => {
                            safeElement.focus();
                            console.log('焦点已重置到安全元素');
                        }, 10);
                    }
                    
                    // 确保任何可能的模态背景被正确移除
                    const modalBackdrops = document.querySelectorAll('.modal-backdrop');
                    if (modalBackdrops.length > 0) {
                        console.log('清理残留的模态背景元素:', modalBackdrops.length);
                        modalBackdrops.forEach(backdrop => {
                            backdrop.classList.remove('show');
                            backdrop.classList.remove('fade');
                            backdrop.remove();
                        });
                    }
                    
                    // 确保body状态正确
                    if (document.querySelectorAll('.modal.show').length === 0) {
                        document.body.classList.remove('modal-open');
                        document.body.style.overflow = '';
                        document.body.style.paddingRight = '';
                    }
                });
                
                console.log(`已为模态框 ${modal.id} 添加hidden事件监听`);
            }
        });
        
        console.log('模态框事件初始化完成');
    } catch (error) {
        console.error('初始化模态框事件失败:', error);
    }
}

// 页面加载时执行初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('订单管理页面DOMContentLoaded事件触发');
    
    // 注册导出完整订单内容功能
    if (typeof exportCompleteOrderContentToExcel === 'function') {
        window.exportCompleteOrderContentToExcel = exportCompleteOrderContentToExcel;
        console.log('导出完整订单内容功能已注册');
    } else {
        console.warn('导出完整订单内容功能未找到');
    }
    
    // 初始化订单模块
    if (typeof window.initOrderModule === 'function') {
        window.initOrderModule();
    }
    
    // 初始化导航和模块切换事件
    if (typeof initNavEvents === 'function') {
        initNavEvents();
    }
    
    if (typeof initModuleSwitch === 'function') {
        initModuleSwitch();
    }
    
    // 监听成衣尺寸显示切换
    const showFinishedSizeCheckbox = document.getElementById('showFinishedSize');
    if (showFinishedSizeCheckbox) {
        showFinishedSizeCheckbox.addEventListener('change', function() {
            const finishedSizeFields = document.querySelectorAll('.finished-size-field');
            finishedSizeFields.forEach(field => {
                if (this.checked) {
                    field.style.display = 'block';
                } else {
                    field.style.display = 'none';
                }
            });
        });
        
        // 初始化时触发一次
        showFinishedSizeCheckbox.dispatchEvent(new Event('change'));
    }
});

// 初始化模块切换
function initModuleSwitch() {
    try {
        console.log('初始化模块切换事件...');
        
        const navLinks = document.querySelectorAll('.nav-link[data-module]');
        const moduleContents = document.querySelectorAll('.module-content');
        
        if (navLinks.length === 0) {
            console.error('找不到导航链接元素');
            return;
        }
        
        if (moduleContents.length === 0) {
            console.error('找不到模块内容元素');
            return;
        }
        
        console.log(`找到 ${navLinks.length} 个导航链接和 ${moduleContents.length} 个模块内容`);
        
        navLinks.forEach(link => {
            link.addEventListener('click', function(event) {
                try {
                    event.preventDefault();
                    const targetModule = this.getAttribute('data-module');
                    console.log(`切换到模块: ${targetModule}`);
                    
                    // 更新导航栏激活状态
                    navLinks.forEach(navLink => navLink.classList.remove('active'));
                    this.classList.add('active');
                    
                    // 显示对应的模块内容
                    moduleContents.forEach(content => {
                        if (content.id === targetModule) {
                            content.style.display = 'block';
                            console.log(`模块 ${targetModule} 显示成功`);
                        } else {
                            content.style.display = 'none';
                        }
                    });
                    
                    // 如果切换到统计模块，初始化统计数据
                    if (targetModule === 'orderStatistics') {
                        console.log('切换到订单统计模块，调用初始化函数');
                        if (typeof initOrderStatistics === 'function') {
                            setTimeout(initOrderStatistics, 100); // 短暂延迟，确保DOM已更新
                        } else {
                            console.error('initOrderStatistics函数未定义');
                        }
                    } else if (targetModule === 'orderModule') {
                        console.log('切换到订单管理模块');
                        // 可以在这里添加对订单列表的刷新逻辑
                    }
                } catch (error) {
                    console.error('模块切换过程中发生错误:', error);
                }
            });
        });
        
        console.log('模块切换事件初始化完成');
    } catch (error) {
        console.error('初始化模块切换事件失败:', error);
    }
}

// 初始化订单统计
function initOrderStatistics() {
    try {
        console.log('初始化订单统计...');
        
        // 显示订单统计模块
        const orderStatisticsModule = document.getElementById('orderStatistics');
        if (orderStatisticsModule) {
            orderStatisticsModule.style.display = 'block';
            console.log('订单统计模块显示成功');
        } else {
            console.error('找不到订单统计模块元素');
            return;
        }
        
        // 检查订单数据是否已加载
        if (!window.orders) {
            console.log('订单数据未加载，尝试加载订单数据...');
            loadOrders().then(() => {
                console.log('订单数据加载成功，继续初始化统计模块');
                continueInitOrderStatistics();
            }).catch(error => {
                console.error('加载订单数据失败:', error);
                alert('无法加载订单数据，请刷新页面重试');
            });
        } else {
            console.log(`订单数据已加载，共 ${window.orders.length} 条记录`);
            continueInitOrderStatistics();
        }
    } catch (error) {
        console.error('初始化订单统计失败:', error);
        alert('订单统计模块加载失败，请查看控制台日志');
    }
}

// 继续初始化订单统计（在确保数据已加载后）
function continueInitOrderStatistics() {
    try {
        // 检查图表容器是否存在
        const chartContainers = [
            'orderTrendChart', 
            'customerSourceChart', 
            'fabricBrandChart', 
            'orderAmountChart'
        ];
        
        let missingContainers = [];
        chartContainers.forEach(id => {
            if (!document.getElementById(id)) {
                missingContainers.push(id);
                console.error(`找不到图表容器: ${id}`);
            }
        });
        
        if (missingContainers.length > 0) {
            console.error(`缺少图表容器: ${missingContainers.join(', ')}`);
            return;
        }
        
        // 初始化Chart.js库
        loadChartJsIfNeeded().then(() => {
            // 设置默认日期范围（近3个月）
            const endDate = new Date();
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 3);
            
            const statsStartDate = document.getElementById('statsStartDate');
            const statsEndDate = document.getElementById('statsEndDate');
            
            if (!statsStartDate || !statsEndDate) {
                console.error('找不到日期选择器元素');
                return;
            }
            
            statsStartDate.value = formatDate(startDate);
            statsEndDate.value = formatDate(endDate);
            
            // 生成统计数据
            generateOrderStatistics();
            
            // 添加筛选按钮事件
            const applyStatsFilter = document.getElementById('applyStatsFilter');
            if (applyStatsFilter) {
                applyStatsFilter.removeEventListener('click', generateOrderStatistics); // 避免重复绑定
                applyStatsFilter.addEventListener('click', generateOrderStatistics);
                console.log('统计筛选按钮事件绑定成功');
            } else {
                console.error('找不到统计筛选按钮');
            }
            
            console.log('订单统计初始化完成');
        }).catch(error => {
            console.error('加载Chart.js失败:', error);
        });
    } catch (error) {
        console.error('继续初始化订单统计失败:', error);
    }
}

// 生成订单统计数据
function generateOrderStatistics() {
    try {
        console.log('开始生成订单统计数据...');
        
        const statsStartDate = document.getElementById('statsStartDate');
        const statsEndDate = document.getElementById('statsEndDate');
        
        if (!statsStartDate || !statsEndDate) {
            console.error('找不到日期选择器元素');
            return;
        }
        
        const startDate = statsStartDate.value;
        const endDate = statsEndDate.value;
        
        if (!startDate || !endDate) {
            console.warn('日期范围未设置，使用默认值');
            return;
        }
        
        console.log(`统计日期范围: ${startDate} 至 ${endDate}`);
        
        // 检查订单数据是否存在
        if (!window.orders || !Array.isArray(window.orders)) {
            console.error('订单数据不存在或不是数组');
            return;
        }
        
        // 筛选订单
        const filteredOrders = window.orders.filter(order => {
            return order.dealDate >= startDate && order.dealDate <= endDate;
        });
        
        console.log(`筛选出 ${filteredOrders.length} 条订单记录`);
        
        // 更新关键指标卡片
        updateOrderStatisticsCards(filteredOrders);
        
        // 更新图表
        updateOrderTrendChart(filteredOrders, startDate, endDate);
        updateCustomerSourceChart(filteredOrders);
        updateFabricBrandChart(filteredOrders);
        updateOrderAmountChart(filteredOrders);
        
        console.log('订单统计数据生成完成');
    } catch (error) {
        console.error('生成订单统计数据出错:', error);
    }
}

// 按需加载Chart.js
function loadChartJsIfNeeded() {
    return new Promise((resolve, reject) => {
        try {
            console.log('检查Chart.js是否已加载...');
            
            // 如果已加载，直接返回
            if (window.Chart) {
                console.log('Chart.js已加载，无需重新加载');
                resolve();
                return;
            }
            
            console.log('开始加载Chart.js...');
            
            // CDN列表，按优先级排序
            const cdnUrls = [
                'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js',
                'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js',
                'https://unpkg.com/chart.js@3.9.1/dist/chart.min.js',
                'https://cdn.bootcdn.net/ajax/libs/Chart.js/3.9.1/chart.min.js',
                'libs/chart.min.js' // 本地备份
            ];
            
            // 尝试加载不同的CDN
            function tryLoadScript(index) {
                if (index >= cdnUrls.length) {
                    const error = new Error('所有Chart.js CDN源都加载失败');
                    console.error(error);
                    reject(error);
                    return;
                }
                
                const url = cdnUrls[index];
                console.log(`尝试从 ${url} 加载Chart.js...`);
                
                const script = document.createElement('script');
                script.src = url;
                
                script.onload = () => {
                    console.log(`Chart.js从 ${url} 加载成功`);
                    if (window.Chart) {
                        resolve();
                    } else {
                        console.warn(`Chart.js已加载但全局Chart对象不可用，尝试下一个源`);
                        tryLoadScript(index + 1);
                    }
                };
                
                script.onerror = () => {
                    console.warn(`Chart.js从 ${url} 加载失败，尝试下一个源`);
                    tryLoadScript(index + 1);
                };
                
                document.head.appendChild(script);
            }
            
            // 开始尝试第一个CDN
            tryLoadScript(0);
            
        } catch (error) {
            console.error('加载Chart.js过程中发生错误:', error);
            reject(error);
        }
    });
}

// 更新统计卡片指标
function updateOrderStatisticsCards(orders) {
    // 订单总数
    document.getElementById('totalOrdersCount').textContent = orders.length;
    
    // 销售总额
    const totalSales = orders.reduce((sum, order) => sum + (parseFloat(order.totalPrice) || 0), 0);
    document.getElementById('totalSalesAmount').textContent = '¥' + totalSales.toFixed(2);
    
    // 平均订单金额
    const avgOrderAmount = orders.length > 0 ? totalSales / orders.length : 0;
    document.getElementById('avgOrderAmount').textContent = '¥' + avgOrderAmount.toFixed(2);
    
    // 客户数量（去重）
    const uniqueCustomers = new Set(orders.map(order => order.customerName));
    document.getElementById('customerCount').textContent = uniqueCustomers.size;
}

// 更新订单趋势图
function updateOrderTrendChart(orders, startDate, endDate) {
    try {
        console.log('开始更新订单趋势图...');
        
        // 获取图表容器
        const canvas = document.getElementById('orderTrendChart');
        if (!canvas) {
            console.error('找不到图表容器: orderTrendChart');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('无法获取图表上下文');
            return;
        }
        
        console.log('获取图表上下文成功');
        
        // 清除旧图表
        if (window.orderTrendChartInstance) {
            console.log('发现旧图表实例，正在销毁...');
            window.orderTrendChartInstance.destroy();
            console.log('旧图表实例已销毁');
        }
        
        // 检查Chart对象是否可用
        if (!window.Chart) {
            console.error('Chart.js未加载，无法创建图表');
            return;
        }
        
        console.log('检查Chart.js加载状态: OK');
        
        // 按月份对订单进行分组
        console.log('开始处理订单数据...');
        console.log(`订单数量: ${orders.length}`);
        console.log(`日期范围: ${startDate} 至 ${endDate}`);
        
        const monthData = {};
        const salesData = {};
        
        // 生成连续的月份列表
        const start = new Date(startDate);
        const end = new Date(endDate);
        const months = [];
        let currentDate = new Date(start);
        
        while (currentDate <= end) {
            const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
            months.push(monthKey);
            monthData[monthKey] = 0;
            salesData[monthKey] = 0;
            
            currentDate.setMonth(currentDate.getMonth() + 1);
        }
        
        console.log(`生成了 ${months.length} 个月份`);
        
        // 统计每月的订单数和销售额
        let validOrderCount = 0;
        orders.forEach(order => {
            if (!order.dealDate) return;
            
            const orderDate = new Date(order.dealDate);
            const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
            
            if (monthData[monthKey] !== undefined) {
                monthData[monthKey]++;
                salesData[monthKey] += parseFloat(order.totalPrice) || 0;
                validOrderCount++;
            }
        });
        
        console.log(`处理了 ${validOrderCount} 个有效订单`);
        
        // 创建图表数据
        const chartData = {
            labels: months.map(month => {
                const [year, monthNum] = month.split('-');
                return `${year}年${monthNum}月`;
            }),
            datasets: [
                {
                    label: '订单数量',
                    data: months.map(month => monthData[month]),
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: '销售金额',
                    data: months.map(month => salesData[month]),
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    type: 'line',
                    yAxisID: 'y1'
                }
            ]
        };
        
        console.log('图表数据已准备就绪');
        
        // 创建图表配置
        const config = {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: '订单数量'
                        }
                    },
                    y1: {
                        beginAtZero: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: '销售金额(元)'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        };
        
        console.log('图表配置已创建');
        
        // 创建图表实例
        try {
            console.log('尝试创建图表实例...');
            window.orderTrendChartInstance = new Chart(ctx, config);
            console.log('订单趋势图表创建成功');
        } catch (chartError) {
            console.error('创建图表实例失败:', chartError);
        }
    } catch (error) {
        console.error('更新订单趋势图表时发生错误:', error);
    }
}
// 更新客户来源分布图
function updateCustomerSourceChart(orders) {
    const ctx = document.getElementById('customerSourceChart').getContext('2d');
    
    // 清除旧图表
    if (window.customerSourceChartInstance) {
        window.customerSourceChartInstance.destroy();
    }
    
    // 统计客户来源分布
    const sourceData = {};
    orders.forEach(order => {
        const source = order.customerSource || '未知';
        sourceData[source] = (sourceData[source] || 0) + 1;
    });
    
    // 准备图表数据
    const sources = Object.keys(sourceData);
    const counts = sources.map(source => sourceData[source]);
    
    // 定义图表颜色
    const colors = [
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 99, 132, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)',
        'rgba(199, 199, 199, 0.7)',
        'rgba(83, 102, 255, 0.7)',
        'rgba(40, 159, 64, 0.7)'
    ];
    
    // 创建图表数据
    const chartData = {
        labels: sources,
        datasets: [{
            label: '客户数量',
            data: counts,
            backgroundColor: colors.slice(0, sources.length),
            borderWidth: 1
        }]
    };
    
    // 创建图表配置
    const config = {
        type: 'pie',
        data: chartData,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    };
    
    // 创建图表实例
    window.customerSourceChartInstance = new Chart(ctx, config);
}

// 更新面料品牌分布图
function updateFabricBrandChart(orders) {
    const ctx = document.getElementById('fabricBrandChart').getContext('2d');
    
    // 清除旧图表
    if (window.fabricBrandChartInstance) {
        window.fabricBrandChartInstance.destroy();
    }
    
    // 统计面料品牌分布
    const brandData = {};
    orders.forEach(order => {
        const brand = order.fabricBrand || '未知';
        brandData[brand] = (brandData[brand] || 0) + 1;
    });
    
    // 提取前10个品牌，其余归为"其他"
    let sortedBrands = Object.entries(brandData).sort((a, b) => b[1] - a[1]);
    let topBrands, otherBrands;
    
    if (sortedBrands.length > 10) {
        topBrands = sortedBrands.slice(0, 9);
        otherBrands = sortedBrands.slice(9);
        
        const otherCount = otherBrands.reduce((sum, brand) => sum + brand[1], 0);
        topBrands.push(['其他', otherCount]);
        
        sortedBrands = topBrands;
    }
    
    // 准备图表数据
    const brands = sortedBrands.map(item => item[0]);
    const counts = sortedBrands.map(item => item[1]);
    
    // 定义图表颜色
    const colors = [
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 99, 132, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)',
        'rgba(199, 199, 199, 0.7)',
        'rgba(83, 102, 255, 0.7)',
        'rgba(40, 159, 64, 0.7)',
        'rgba(200, 200, 200, 0.7)'
    ];
    
    // 创建图表数据
    const chartData = {
        labels: brands,
        datasets: [{
            label: '使用次数',
            data: counts,
            backgroundColor: colors.slice(0, brands.length),
            borderWidth: 1
        }]
    };
    
    // 创建图表配置
    const config = {
        type: 'doughnut',
        data: chartData,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    };
    
    // 创建图表实例
    window.fabricBrandChartInstance = new Chart(ctx, config);
}

// 更新订单金额分布图
function updateOrderAmountChart(orders) {
    const ctx = document.getElementById('orderAmountChart').getContext('2d');
    
    // 清除旧图表
    if (window.orderAmountChartInstance) {
        window.orderAmountChartInstance.destroy();
    }
    
    // 设置金额区间
    const priceRanges = [
        { label: '0-1000元', min: 0, max: 1000 },
        { label: '1000-2000元', min: 1000, max: 2000 },
        { label: '2000-3000元', min: 2000, max: 3000 },
        { label: '3000-4000元', min: 3000, max: 4000 },
        { label: '4000-5000元', min: 4000, max: 5000 },
        { label: '5000-8000元', min: 5000, max: 8000 },
        { label: '8000元以上', min: 8000, max: Infinity }
    ];
    
    // 统计每个价格区间的订单数量
    const rangeCounts = new Array(priceRanges.length).fill(0);
    orders.forEach(order => {
        const price = parseFloat(order.totalPrice) || 0;
        for (let i = 0; i < priceRanges.length; i++) {
            if (price >= priceRanges[i].min && price < priceRanges[i].max) {
                rangeCounts[i]++;
                break;
            }
        }
    });
    
    // 创建图表数据
    const chartData = {
        labels: priceRanges.map(range => range.label),
        datasets: [{
            label: '订单数量',
            data: rangeCounts,
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    };
    
    // 创建图表配置
    const config = {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '订单数量'
                    }
                }
            }
        }
    };
    
    // 创建图表实例
    window.orderAmountChartInstance = new Chart(ctx, config);
}

// 删除2025年3月24日以后的订单数据
function removeOrdersAfter2025April() {
    console.log('正在删除2025年3月24日以后的订单数据...');
    
    try {
        // 检查是否已经删除过
        const hasRemovedFlag = localStorage.getItem('hasRemovedOrdersAfter2025April');
        if (hasRemovedFlag === 'true') {
            console.log('已经删除过2025年3月24日以后的订单数据，不再重复执行');
            return {
                success: true,
                message: '已经删除过2025年3月24日以后的订单数据',
                removedCount: 0
            };
        }
        
        // 获取当前所有订单数据
        let orders = JSON.parse(localStorage.getItem('orders')) || [];
        const originalCount = orders.length;
        
        // 设置截止日期：2025年3月24日
        const cutoffDate = '2025-03-24';
        
        // 过滤掉2025年3月24日之后的订单
        orders = orders.filter(order => {
            // 使用dealDate（成交日期）作为判断依据
            const dealDate = order.dealDate || '';
            return dealDate <= cutoffDate;
        });
        
        // 保存更新后的订单数据
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // 计算删除的订单数量
        const removedCount = originalCount - orders.length;
        
        console.log(`删除完成：共删除了${removedCount}条2025年3月24日以后的订单数据`);
        console.log(`原有订单数量：${originalCount}，现有订单数量：${orders.length}`);
        
        // 清除删除标记，以便下次仍能删除
        localStorage.removeItem('hasRemovedOrdersAfter2025April');
        
        // 如果有数据被删除，刷新页面显示更新后的数据
        if (removedCount > 0) {
            alert(`已删除${removedCount}条2025年3月24日以后的订单数据，页面将重新加载。`);
            window.location.reload();
        }
        
        return {
            success: true,
            message: `已删除${removedCount}条2025年3月24日以后的订单数据`,
            removedCount: removedCount
        };
    } catch (error) {
        console.error('删除订单数据时出错：', error);
        return {
            success: false,
            message: '删除订单数据失败：' + error.message
        };
    }
}

// 修改为以下内容:
// 订单数据处理函数（已禁用日期限制）
function removeOrdersAfter2025April() {
    console.log('订单数据处理函数被调用（日期限制已禁用）');
    
    try {
        // 获取当前所有订单数据
        let orders = JSON.parse(localStorage.getItem('orders')) || [];
        
        // 日期限制已禁用，不再过滤任何订单数据
        console.log(`订单数据处理：系统不再根据日期限制过滤订单`);
        console.log(`当前订单数量：${orders.length}条`);
        
        // 返回成功状态，无订单被删除
        return {
            success: true,
            message: '日期限制已禁用，所有订单数据均被保留',
            removedCount: 0
        };
    } catch (error) {
        console.error('订单数据处理时出错：', error);
        return {
            success: false,
            message: '订单数据处理失败：' + error.message
        };
    }
}

// 添加订单数据完整性检查函数
function checkOrderDataIntegrity() {
    console.log('正在检查订单数据完整性...');
    
    try {
        // 获取当前所有订单数据
        let orders = JSON.parse(localStorage.getItem('orders')) || [];
        const originalCount = orders.length;
        
        // 过滤掉无效的订单数据（缺少必要字段的数据）
        orders = orders.filter(order => {
            // 确保订单至少有ID和客户名称
            return order && order.id && order.customerName;
        });
        
        // 保存更新后的订单数据
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // 计算清理的订单数量
        const removedCount = originalCount - orders.length;
        
        console.log(`数据检查完成：共清理了${removedCount}条无效的订单数据`);
        console.log(`原有订单数量：${originalCount}，现有订单数量：${orders.length}`);
        
        // 如果有数据被清理，刷新页面显示更新后的数据
        if (removedCount > 0) {
            alert(`已清理${removedCount}条无效的订单数据，页面将重新加载。`);
            window.location.reload();
        }
        
        return {
            success: true,
            message: `已清理${removedCount}条无效的订单数据`,
            removedCount: removedCount
        };
    } catch (error) {
        console.error('检查订单数据完整性时出错：', error);
        return {
            success: false,
            message: '检查订单数据失败：' + error.message
        };
    }
}

// 页面加载时立即初始化订单模块核心功能和保存系统
(function() {
    console.log('初始化订单核心保存系统...');
    
    // 创建备用的保存函数，即使在各种异常情况下也尝试保存订单
    window.emergencySaveOrder = function(orderData) {
        console.log('--- 紧急保存订单 ---');
        
        try {
            // 1. 验证orderData
            if (!orderData || typeof orderData !== 'object') {
                console.error('紧急保存: 无效的订单数据');
                return false;
            }
            
            console.log('紧急保存: 订单ID =', orderData.id);
            
            // 2. 从多个来源尝试获取当前订单列表
            let currentOrders = [];
            let ordersSource = ''; // 记录数据来源
            
            // 尝试从window.orders获取
            if (window.orders && Array.isArray(window.orders)) {
                currentOrders = [...window.orders];
                ordersSource = 'window.orders';
            } 
            // 尝试从localStorage获取
            else {
                try {
                    const ordersStr = localStorage.getItem('orders');
                    if (ordersStr) {
                        const parsed = JSON.parse(ordersStr);
                        if (Array.isArray(parsed)) {
                            currentOrders = parsed;
                            ordersSource = 'localStorage';
                        }
                    }
                } catch (e) {
                    console.error('紧急保存: localStorage解析失败', e);
                }
                
                // 尝试从备份获取
                if (currentOrders.length === 0) {
                    try {
                        const backupStr = localStorage.getItem('orders_backup');
                        if (backupStr) {
                            const parsed = JSON.parse(backupStr);
                            if (Array.isArray(parsed)) {
                                currentOrders = parsed;
                                ordersSource = 'localStorage备份';
                            }
                        }
                    } catch (e) {
                        console.error('紧急保存: 备份解析失败', e);
                    }
                }
                
                // 如果仍然没有，初始化空数组
                if (currentOrders.length === 0) {
                    currentOrders = [];
                    ordersSource = '新创建的空数组';
                }
            }
            
            console.log(`紧急保存: 获取到${currentOrders.length}条订单数据，来源: ${ordersSource}`);
            
            // 3. 添加或更新订单
            let updated = false;
            if (orderData.id) {
                // 尝试更新现有订单
                const index = currentOrders.findIndex(order => order.id === orderData.id);
                if (index !== -1) {
                    currentOrders[index] = {...orderData};
                    console.log('紧急保存: 更新了现有订单');
                    updated = true;
            } else {
                    // 未找到现有订单，添加为新订单
                    currentOrders.push({...orderData});
                    console.log('紧急保存: 添加为新订单（ID已存在但未找到匹配项）');
                    updated = true;
                }
            } else {
                // 生成新ID并添加
                const today = new Date();
                const dateStr = today.getFullYear().toString() +
                    (today.getMonth() + 1).toString().padStart(2, '0') +
                    today.getDate().toString().padStart(2, '0');
                
                // 使用时间戳作为序列号的备份方案
                let sequence = window.orderSequence;
                if (typeof sequence !== 'number' || isNaN(sequence)) {
                    sequence = Math.floor(Math.random() * 9000) + 1000;
                    console.log('紧急保存: 使用随机序列号', sequence);
                }
                
                orderData.id = 'SR' + dateStr + sequence.toString().padStart(4, '0');
                currentOrders.push({...orderData});
                console.log('紧急保存: 添加为新订单并生成ID:', orderData.id);
                
                // 更新序列号
                window.orderSequence = sequence + 1;
                try {
                    localStorage.setItem('orderSequence', window.orderSequence.toString());
                } catch (e) {
                    console.error('紧急保存: 无法更新序列号', e);
                }
                
                updated = true;
            }
            
            if (!updated) {
                console.error('紧急保存: 无法添加或更新订单');
                return false;
            }
            
            // 4. 保存订单到多个位置，使用多种尝试方法
            let saveSuccessCount = 0;
            
            // 4.1 直接保存到localStorage
            try {
                localStorage.setItem('orders', JSON.stringify(currentOrders));
                saveSuccessCount++;
                console.log('紧急保存: localStorage保存成功');
            } catch (e) {
                console.error('紧急保存: localStorage保存失败', e);
                
                // 尝试分段保存
                try {
                    const chunks = Math.ceil(currentOrders.length / 5);
                    for (let i = 0; i < 5; i++) {
                        const start = i * chunks;
                        const end = Math.min(start + chunks, currentOrders.length);
                        const chunk = currentOrders.slice(start, end);
                        localStorage.setItem(`orders_part_${i}`, JSON.stringify(chunk));
                    }
                    localStorage.setItem('orders_chunks', '5');
                    console.log('紧急保存: 分段保存成功');
                    saveSuccessCount++;
                } catch (chunkError) {
                    console.error('紧急保存: 分段保存也失败了', chunkError);
                }
            }
            
            // 4.2 保存到备份存储
            try {
                localStorage.setItem('orders_backup_' + Date.now(), JSON.stringify(currentOrders));
                saveSuccessCount++;
                console.log('紧急保存: 备份存储保存成功');
            } catch (e) {
                console.error('紧急保存: 备份存储保存失败', e);
            }
            
            // 4.3 单独保存新订单/更新的订单
            try {
                localStorage.setItem('last_order_' + Date.now(), JSON.stringify(orderData));
                saveSuccessCount++;
                console.log('紧急保存: 单独保存订单成功');
            } catch (e) {
                console.error('紧急保存: 单独保存订单失败', e);
            }
            
            // 5. 更新内存中的订单列表
            window.orders = currentOrders;
            
            return saveSuccessCount > 0;
        } catch (error) {
            console.error('紧急保存过程中发生错误:', error);
            return false;
        }
    };
    
    // 创建一个守护函数，监视订单保存过程
    window.orderSaveGuard = function(callback) {
        console.log('订单保存守护程序已启动');
        let executed = false;
        let originalOrdersCount = window.orders ? window.orders.length : 0;
        console.log('当前订单数:', originalOrdersCount);
        
        // 设置超时监视
        setTimeout(() => {
            if (!executed) {
                console.log('订单保存守护程序检测到可能的保存失败，执行恢复...');
                const currentOrdersCount = window.orders ? window.orders.length : 0;
                console.log('当前订单数:', currentOrdersCount, '原始订单数:', originalOrdersCount);
                
                if (currentOrdersCount < originalOrdersCount + 1) {
                    console.warn('疑似订单未成功保存，尝试恢复');
                    
                    // 尝试恢复数据
                    try {
                        const lastNewOrderStr = localStorage.getItem('last_new_order');
                        if (lastNewOrderStr) {
                            const lastNewOrder = JSON.parse(lastNewOrderStr);
                            console.log('守护程序找到上次新订单:', lastNewOrder.id);
                            
                            // 检查是否已存在
                            if (window.orders && Array.isArray(window.orders)) {
                                const exists = window.orders.some(order => order.id === lastNewOrder.id);
                                if (!exists) {
                                    window.orders.push(lastNewOrder);
                                    localStorage.setItem('orders', JSON.stringify(window.orders));
                                    console.log('守护程序恢复了丢失的订单');
                                    
                                    if (typeof callback === 'function') {
                                        callback(true);
                                    }
                                }
                            }
                        }
                    } catch (e) {
                        console.error('守护程序恢复失败:', e);
                    }
                }
            }
        }, 5000); // 5秒后检查
        
        return function(result) {
            executed = true;
            if (typeof callback === 'function') {
                callback(result);
            }
        };
    };
    
    // 安全版保存函数，当原始保存函数失败时使用
    window.safeOrderSave = function(event) {
        if (event && event.preventDefault) {
            event.preventDefault();
        }
        
        try {
            console.log('执行安全保存流程...');
            
            // 获取表单数据
            const form = document.getElementById('orderForm');
            if (!form) {
                throw new Error('找不到订单表单');
            }
            
            const formData = new FormData(form);
            const orderData = {};
            
            // 转换为对象
            for (const [key, value] of formData.entries()) {
                orderData[key] = value;
            }
            
            // 验证必填字段
            if (!orderData.customerName) {
                alert('请填写客户姓名');
                return;
            }
            
            if (!orderData.dealDate) {
                alert('请填写成交日期');
                return;
            }
            
            // 必须确保orders是数组
            if (!window.orders || !Array.isArray(window.orders)) {
                console.error('window.orders不是数组，正在初始化...');
                try {
                    const savedOrders = localStorage.getItem('orders');
                    if (savedOrders) {
                        window.orders = JSON.parse(savedOrders);
                        if (!Array.isArray(window.orders)) {
                            window.orders = [];
                        }
                    } else {
                        window.orders = [];
                    }
                } catch (e) {
                    window.orders = [];
                    console.error('恢复orders失败，已创建空数组:', e);
                }
            }
            
            // 备份当前订单
            const ordersBackup = JSON.stringify(window.orders);
            localStorage.setItem('orders_before_save', ordersBackup);
            
            // 处理新订单或更新订单
            if (!orderData.id) {
                // 新订单
                const today = new Date();
                const dateStr = today.getFullYear().toString() +
                    (today.getMonth() + 1).toString().padStart(2, '0') +
                    today.getDate().toString().padStart(2, '0');
                
                // 验证序列号
                if (typeof window.orderSequence !== 'number' || isNaN(window.orderSequence)) {
                    window.orderSequence = 1;
                }
                
                orderData.id = 'SR' + dateStr + window.orderSequence.toString().padStart(4, '0');
                window.orderSequence++;
                localStorage.setItem('orderSequence', window.orderSequence.toString());
                
                // 备份新订单
                localStorage.setItem('last_new_order', JSON.stringify(orderData));
                
                // 添加到数组
                window.orders.push(orderData);
            } else {
                // 更新订单
                const index = window.orders.findIndex(order => order.id === orderData.id);
                if (index !== -1) {
                    // 备份旧数据
                    localStorage.setItem('last_edited_order', JSON.stringify(window.orders[index]));
                    window.orders[index] = orderData;
                } else {
                    window.orders.push(orderData);
                }
            }
            
            // 保存到localStorage
            localStorage.setItem('orders', JSON.stringify(window.orders));
            
            // 验证保存是否成功
            let saveVerified = false;
            try {
                const savedOrdersStr = localStorage.getItem('orders');
                if (savedOrdersStr) {
                    const savedOrders = JSON.parse(savedOrdersStr);
                    if (Array.isArray(savedOrders)) {
                        saveVerified = savedOrders.some(order => order.id === orderData.id);
                    }
                }
            } catch (e) {
                console.error('验证保存失败:', e);
            }
            
            if (!saveVerified) {
                console.error('验证保存失败，尝试使用紧急保存');
                window.emergencySaveOrder(orderData);
            }
            
            // 如果有同步功能，尝试同步
            if (typeof window.syncProductionCostsWithOrders === 'function') {
                try {
                    window.syncProductionCostsWithOrders();
                } catch (e) {
                    console.error('同步生产成本失败:', e);
                }
            }
            
            // 渲染订单表格
            if (typeof renderOrders === 'function') {
                renderOrders(window.orders);
            }
            
            // 隐藏表单
            if (typeof hideOrderForm === 'function') {
                hideOrderForm();
            }
            
            // 提示保存成功
            alert('订单已保存');
            
            return true;
        } catch (error) {
            console.error('安全保存过程中发生错误:', error);
            alert('保存失败: ' + error.message);
            
            // 尝试紧急恢复
            try {
                // 获取表单数据
                const form = document.getElementById('orderForm');
                if (form) {
                    const formData = new FormData(form);
                    const orderData = {};
                    for (const [key, value] of formData.entries()) {
                        orderData[key] = value;
                    }
                    
                    window.emergencySaveOrder(orderData);
                }
            } catch (e) {
                console.error('紧急恢复失败:', e);
            }
            
            return false;
        }
    };
    
    // 检查localStorage是否可用，如果不可用，使用内存模式
    try {
        localStorage.setItem('test', 'test');
        const testValue = localStorage.getItem('test');
        if (testValue !== 'test') {
            throw new Error('localStorage功能异常');
        }
        localStorage.removeItem('test');
        console.log('localStorage可用');
    } catch (e) {
        console.error('localStorage不可用，切换到内存模式:', e);
        
        // 创建内存存储替代品
        const memoryStorage = {};
        
        // 重写localStorage方法
        window.originalLocalStorage = window.localStorage;
        window.localStorage = {
            getItem: function(key) {
                return memoryStorage[key] || null;
            },
            setItem: function(key, value) {
                memoryStorage[key] = value;
                return true;
            },
            removeItem: function(key) {
                delete memoryStorage[key];
                return true;
            },
            clear: function() {
                Object.keys(memoryStorage).forEach(key => delete memoryStorage[key]);
                return true;
            }
        };
        
        console.log('内存存储模式已启用');
    }
    
    // 创建核心的订单功能，例如loadOrders等
    window.loadOrders = function() {
        return new Promise((resolve, reject) => {
            try {
                console.log('开始从localStorage加载订单数据...');
                
                // 直接从localStorage获取订单数据
                const ordersData = localStorage.getItem('orders');
                
                if (ordersData) {
                    try {
                        // 尝试解析订单数据
                        const parsedOrders = JSON.parse(ordersData);
                        
                        // 确保解析后的结果是数组
                        if (Array.isArray(parsedOrders)) {
                            // 更新全局订单数组
                            window.orders = parsedOrders;
                            console.log(`成功加载${window.orders.length}条订单数据`);
                        } else {
                            console.error('从localStorage加载的订单数据不是数组，重置为空数组');
                            window.orders = [];
                        }
                    } catch (parseError) {
                        console.error('解析订单数据出错:', parseError);
                        window.orders = [];
                    }
                } else {
                    console.warn('localStorage中没有订单数据，设置为空数组');
                    window.orders = [];
                }
                
                // 加载订单序列号
                const sequenceData = localStorage.getItem('orderSequence');
                if (sequenceData) {
                    try {
                        window.orderSequence = parseInt(sequenceData);
                        console.log('已加载订单序列号:', window.orderSequence);
                    } catch (numError) {
                        console.error('解析订单序列号出错，设置为默认值1:', numError);
                        window.orderSequence = 1;
                    }
                } else {
                    console.warn('未找到订单序列号，设置为默认值1');
                    window.orderSequence = 1;
                }
                
                // 确保全局变量存在
                window.filteredOrdersData = window.filteredOrdersData || [];
                
                resolve(window.orders);
            } catch (error) {
                console.error('加载订单数据失败:', error);
                // 确保默认值存在
                window.orders = window.orders || [];
                window.orderSequence = window.orderSequence || 1;
                window.filteredOrdersData = window.filteredOrdersData || [];
                
                // 即使出错也返回resolve，确保程序可以继续运行
                resolve(window.orders);
            }
        });
    };
    
    // 添加一个直接强制重新加载订单数据的函数
    window.forceReloadOrders = function() {
        console.log('强制重新加载订单数据...');
        
        // 先清空当前的订单数组
        window.orders = [];
        window.filteredOrdersData = [];
        
        // 重新从localStorage加载
        const ordersData = localStorage.getItem('orders');
        if (ordersData) {
            try {
                window.orders = JSON.parse(ordersData);
                console.log(`强制重新加载成功，共${window.orders.length}条订单数据`);
                return window.orders;
            } catch (error) {
                console.error('强制重新加载订单数据时解析失败:', error);
                window.orders = [];
                return [];
            }
        } else {
            console.warn('localStorage中不存在订单数据，无法强制重新加载');
            return [];
        }
    };
    
    // 重写初始化订单模块的函数
    window.initOrderModule = function() {
        try {
            console.log('开始初始化订单管理模块...');
            
            // 强制重新加载订单数据
            window.forceReloadOrders();
            
            console.log('初始化前检查：当前orders数组长度:', window.orders ? window.orders.length : 0);
            
            // 1. 初始化订单表格事件
            if (typeof initOrderTableEvents === 'function') {
                initOrderTableEvents();
            } else {
                console.error('initOrderTableEvents函数未定义');
            }
            
            // 2. 渲染订单数据
            if (typeof renderOrders === 'function') {
                if (window.orders && window.orders.length > 0) {
                    console.log(`准备渲染${window.orders.length}条订单数据...`);
                    renderOrders(window.orders);
                    console.log('订单数据渲染成功');
                } else {
                    console.warn('没有订单数据可供渲染，尝试读取localStorage');
                    // 最后一次尝试
                    const rawOrdersData = localStorage.getItem('orders');
                    if (rawOrdersData) {
                        try {
                            const parsedOrders = JSON.parse(rawOrdersData);
                            if (Array.isArray(parsedOrders) && parsedOrders.length > 0) {
                                window.orders = parsedOrders;
                                renderOrders(parsedOrders);
                                console.log(`最后尝试成功，渲染了${parsedOrders.length}条订单`);
                            } else {
                                // 创建一个空表格
                                renderOrders([]);
                                console.warn('localStorage中的订单数据为空或非数组');
                            }
                        } catch (e) {
                            // 创建一个空表格
                            renderOrders([]);
                            console.error('解析localStorage中的订单数据失败:', e);
                        }
                    } else {
                        // 创建一个空表格
                        renderOrders([]);
                        console.warn('localStorage中不存在订单数据');
                    }
                }
            } else {
                console.error('renderOrders函数未定义');
            }
            
            // 3. 初始化尺寸体型表单事件
            if (typeof initSizeTabsEvents === 'function') {
                initSizeTabsEvents();
                console.log('尺寸体型表单事件初始化成功');
            } else {
                console.warn('initSizeTabsEvents函数未定义');
            }
            
            // 4. 初始化模块切换
            if (typeof initModuleSwitch === 'function') {
                initModuleSwitch();
            } else {
                console.warn('initModuleSwitch函数未定义');
            }
            
            console.log('订单管理模块初始化完成');
            return true;
        } catch (error) {
            console.error('订单管理模块初始化失败:', error);
            alert('订单管理模块初始化失败: ' + error.message);
            return false;
        }
    };
    
    // 添加全局的saveAllOrders函数
    window.saveAllOrders = function() {
        try {
            console.log('保存所有订单数据...');
            
            if (!window.orders) {
                console.error('window.orders未定义');
                return false;
            }
            
            if (!Array.isArray(window.orders)) {
                console.error('window.orders不是数组');
                return false;
            }
            
            // 直接保存到localStorage
            localStorage.setItem('orders', JSON.stringify(window.orders));
            
            // 创建备份
            const timestamp = Date.now();
            localStorage.setItem(`orders_backup_${timestamp}`, JSON.stringify(window.orders));
            
            console.log(`成功保存${window.orders.length}条订单数据`);
            return true;
        } catch (error) {
            console.error('保存所有订单数据失败:', error);
            
            // 尝试分段保存
            try {
                const chunks = Math.ceil(window.orders.length / 5);
                for (let i = 0; i < 5; i++) {
                    const start = i * chunks;
                    const end = Math.min(start + chunks, window.orders.length);
                    const chunk = window.orders.slice(start, end);
                    localStorage.setItem(`orders_part_${i}`, JSON.stringify(chunk));
                }
                localStorage.setItem('orders_chunks', '5');
                console.log('分段保存成功');
                return true;
            } catch (e) {
                console.error('分段保存也失败了:', e);
                return false;
            }
        }
    };
    
    // 尝试加载已有的订单数据
    window.loadOrders();
    
    console.log('订单核心保存系统初始化完成');
})();

// 在window对象上定义一个变量，表示保存系统已初始化
window.orderSaveSystemInitialized = true;

// 当删除订单成功时，同步更新生产成本表
function handleOrderDeleted() {
    // 注释掉同步生产成本数据的自动调用，避免自动生成成本记录
    /*
    if (typeof window.syncProductionCostsWithOrders === 'function') {
        window.syncProductionCostsWithOrders();
    }
    */
    console.log('订单已删除，如需更新生产成本数据，请手动在成本管理页面进行维护');
}

// 当订单更新后，更新与之关联的生产成本记录
function updateProductionCostsForOrder(orderId) {
    // 注释掉自动同步生产成本的代码，避免自动生成
    /*
    if (typeof window.syncProductionCostsWithOrders === 'function') {
        console.log('调用syncProductionCostsWithOrders函数确保数据一致性');
        window.syncProductionCostsWithOrders();
    }
    */
    console.log(`订单 ${orderId} 已更新，如有需要请手动在成本管理页面维护对应的生产成本记录`);
}

// 在订单保存或更新成功后添加同步生产成本的代码
// 搜索保存订单的函数，并在保存成功后添加同步代码

// ... existing code ...
function saveEditedOrder(orderId) {
    // 防止函数被重复调用
    if (window._isSavingOrder) {
        console.log('订单正在保存中，忽略重复调用');
        return;
    }
    
    // 设置保存中标志
    window._isSavingOrder = true;
    
    try {
        console.log('开始保存编辑的订单:', orderId);
        
        // 在处理前先将焦点移至安全元素，防止模态框关闭时焦点问题
        document.getElementById('addOrderBtn')?.focus();
        
        // 获取表单数据
        const formData = new FormData(document.getElementById('newOrderForm'));
        const editedOrder = {};
        
        // 将表单数据转换为对象
        for (const [key, value] of formData.entries()) {
            const fieldName = key.startsWith('new') ? key.substring(3, 4).toLowerCase() + key.substring(4) : key;
            editedOrder[fieldName] = value;
        }
        
        // 确保ID字段正确
        editedOrder.id = orderId;
        
        // 同步价格字段
        if (editedOrder.totalPrice) {
            editedOrder.price = editedOrder.totalPrice;
        }
        
        // 保存到全局订单数组
        const index = window.orders.findIndex(o => o.id === orderId);
        if (index !== -1) {
            // 保留原订单的创建日期等信息
            if (window.orders[index].createDate) {
                editedOrder.createDate = window.orders[index].createDate;
            }
            
            // 添加西服款式字段映射，确保表单字段与预览字段一致
            if (editedOrder.orderType === '西服西裤' || 
                editedOrder.orderType === '西服西裤马甲' || 
                editedOrder.orderType === '单西') {
                
                console.log('编辑订单时进行西服款式字段映射...');
                
                // 领型映射
                if (editedOrder.suitLapelStyle) {
                    editedOrder.suitCollar = editedOrder.suitLapelStyle;
                }
                
                // 前片止口映射
                if (editedOrder.suitButtonCount) {
                    editedOrder.frontHem = editedOrder.suitButtonCount;
                }
                
                // 背后开衩映射
                if (editedOrder.suitVent) {
                    editedOrder.backVent = editedOrder.suitVent;
                }
                
                // 袖口开衩映射
                if (editedOrder.suitSleeveButtons) {
                    editedOrder.sleeveVent = editedOrder.suitSleeveButtons;
                }
                
                // 袖口眼颜色映射
                if (editedOrder.suitSleeveButtonholes) {
                    editedOrder.sleeveButtonColor = editedOrder.suitSleeveButtonholes;
                }
                
                // 下摆映射
                if (editedOrder.suitHemStyle) {
                    editedOrder.hemStyle = editedOrder.suitHemStyle;
                }
                
                // 笔袋映射
                if (editedOrder.suitPenPocket) {
                    editedOrder.penPocket = editedOrder.suitPenPocket;
                }
                
                // 驳头眼映射
                if (editedOrder.suitLapelHole) {
                    editedOrder.lapelHole = editedOrder.suitLapelHole;
                }
                
                // 珠边颜色映射
                if (editedOrder.suitPearlEdgeColor) {
                    editedOrder.pearlEdgeColor = editedOrder.suitPearlEdgeColor;
                }
                
                // 驳头宽度映射
                if (editedOrder.suitLapelWidth) {
                    editedOrder.lapelWidth = editedOrder.suitLapelWidth;
                }
                
                // 驳头眼颜色映射
                if (editedOrder.suitLapelHoleColor) {
                    editedOrder.lapelHoleColor = editedOrder.suitLapelHoleColor;
                }
                
                // 纽扣编号映射
                if (editedOrder.suitButtonNumber) {
                    editedOrder.buttonNumber = editedOrder.suitButtonNumber;
                }
                
                // 领底绒映射
                if (editedOrder.suitCollarFelt) {
                    editedOrder.collarFelt = editedOrder.suitCollarFelt;
                }
                
                // 里布编号映射
                if (editedOrder.suitLiningNumber) {
                    editedOrder.liningNumber = editedOrder.suitLiningNumber;
                }
                
                // 胸兜映射
                if (editedOrder.suitChestPocket) {
                    editedOrder.chestPocket = editedOrder.suitChestPocket;
                }
                
                // 腰兜映射
                if (editedOrder.suitPocket) {
                    editedOrder.waistPocket = editedOrder.suitPocket;
                }
                
                // 票袋映射
                if (editedOrder.suitTicketPocket) {
                    editedOrder.ticketPocket = editedOrder.suitTicketPocket;
                }
                
                // 刺绣相关字段映射
                if (editedOrder.suitEmbroideryContent) {
                    editedOrder.embroideryContent = editedOrder.suitEmbroideryContent;
                }
                
                if (editedOrder.suitEmbroideryFont) {
                    editedOrder.embroideryFont = editedOrder.suitEmbroideryFont;
                }
                
                if (editedOrder.suitEmbroideryPattern) {
                    editedOrder.embroideryPattern = editedOrder.suitEmbroideryPattern;
                }
                
                if (editedOrder.suitEmbroideryColor) {
                    editedOrder.embroideryColor = editedOrder.suitEmbroideryColor;
                }
                
                console.log('西服款式字段映射完成');
            }
            
            // 添加马甲款式字段映射，确保表单字段与预览字段一致
            if (editedOrder.orderType === '马甲' || 
                editedOrder.orderType === '西服西裤马甲') {
                
                console.log('编辑订单时进行马甲款式字段映射...');
                
                // 马甲字段映射
                if (editedOrder.vestFit) {
                    editedOrder.vestFit = editedOrder.vestFit;
                }
                
                if (editedOrder.vestCollar) {
                    editedOrder.vestCollar = editedOrder.vestCollar;
                }
                
                if (editedOrder.vestFront) {
                    editedOrder.vestFront = editedOrder.vestFront;
                }
                if (editedOrder.vestChestPocket) {
                    editedOrder.vestChestPocket = editedOrder.vestChestPocket;
                }
                if (editedOrder.vestPocket) {
                    editedOrder.vestWaistPocket = editedOrder.vestPocket;
                }
                if (editedOrder.vestHem) {
                    editedOrder.vestHem = editedOrder.vestHem;
                }
                if (editedOrder.vestBack) {
                    editedOrder.vestBack = editedOrder.vestBack;
                }
                if (editedOrder.vestLining) {
                    editedOrder.vestLining = editedOrder.vestLining;
                }           
                if (editedOrder.vestRemark) {
                    editedOrder.vestRemark = editedOrder.vestRemark;
                }

                console.log('马甲款式字段映射完成');
            }
            
            // 添加衬衣款式字段映射，确保表单字段与预览字段一致
            if (editedOrder.orderType === '衬衣') {
                
                console.log('编辑订单时进行衬衣款式字段映射...');
                
                // 衬衣基本款式映射
                if (editedOrder.shirtStyle) {
                    editedOrder.shirtStyleType = editedOrder.shirtStyle;
                }
                
                if (editedOrder.shirtFit) {
                    editedOrder.shirtFitType = editedOrder.shirtFit;
                }
                
                if (editedOrder.shirtCollar) {
                    editedOrder.shirtCollarType = editedOrder.shirtCollar;
                }
                
                if (editedOrder.shirtFront) {
                    editedOrder.shirtPlacketType = editedOrder.shirtFront;
                }
                
                if (editedOrder.shirtPocket) {
                    editedOrder.shirtPocketType = editedOrder.shirtPocket;
                }
                
                if (editedOrder.shirtCuff) {
                    editedOrder.shirtCuffType = editedOrder.shirtCuff;
                }
                
                if (editedOrder.shirtSleevePleat) {
                    editedOrder.shirtSleevePleatType = editedOrder.shirtSleevePleat;
                }
                
                if (editedOrder.shirtBack) {
                    editedOrder.shirtBackType = editedOrder.shirtBack;
                }
                
                if (editedOrder.shirtHem) {
                    editedOrder.shirtHemType = editedOrder.shirtHem;
                }
                
                if (editedOrder.shirtButtonhole) {
                    editedOrder.shirtButtonholeType = editedOrder.shirtButtonhole;
                }
                
                if (editedOrder.shirtHemTape) {
                    editedOrder.shirtHemTapeType = editedOrder.shirtHemTape;
                }
                
                if (editedOrder.shirtButtons) {
                    editedOrder.shirtButtonsType = editedOrder.shirtButtons;
                }
                
                if (editedOrder.shirtButtonStitch) {
                    editedOrder.shirtButtonStitchType = editedOrder.shirtButtonStitch;
                }
                
                // 刺绣字段映射
                if (editedOrder.shirtEmbroideryPosition) {
                    editedOrder.shirtEmbPosition = editedOrder.shirtEmbroideryPosition;
                }
                
                if (editedOrder.shirtEmbroideryColor) {
                    editedOrder.shirtEmbColor = editedOrder.shirtEmbroideryColor;
                }
                
                if (editedOrder.shirtEmbroideryFont) {
                    editedOrder.shirtEmbFont = editedOrder.shirtEmbroideryFont;
                }
                
                if (editedOrder.shirtEmbroideryContent) {
                    editedOrder.shirtEmbContent = editedOrder.shirtEmbroideryContent;
                }
                
                if (editedOrder.shirtEmbroideryHeight) {
                    editedOrder.shirtEmbHeight = editedOrder.shirtEmbroideryHeight;
                }
                
                if (editedOrder.shirtEmbroideryPattern) {
                    editedOrder.shirtEmbPattern = editedOrder.shirtEmbroideryPattern;
                }
                
                console.log('衬衣款式字段映射完成');
            }
            
            // 更新订单数据，保留原有未在表单中的字段
            window.orders[index] = { ...window.orders[index], ...editedOrder };
            console.log('订单已更新', editedOrder);
            
            // 保存到localStorage
            try {
                if (typeof window.saveOrders === 'function') {
                    window.saveOrders();
                } else {
                    localStorage.setItem('orders', JSON.stringify(window.orders));
                }
                console.log('订单数据已保存到localStorage');
                
                // 确保与生产成本数据同步
                if (typeof window.syncProductionCostsWithOrders === 'function') {
                    console.log('同步更新后的订单数据到生产成本');
                    window.syncProductionCostsWithOrders();
                }
                
                // 刷新表格显示
                if (typeof renderOrders === 'function') {
                    renderOrders(window.orders);
                } else if (typeof renderOrdersTable === 'function') {
                    renderOrdersTable();
                }
                
                // 在隐藏模态框前再次确保焦点转移到安全元素
                document.getElementById('addOrderBtn')?.focus();
                
                // 先显示订单更新成功的提示，等用户确认后再关闭模态框
                // 标记当前正在处理订单更新成功的确认
                window._pendingOrderUpdateConfirm = true;
                alert('订单修改成功！');
                
                // 重置保存中标志
                window._isSavingOrder = false;
                
                return true;
            } catch (error) {
                console.error('保存订单数据失败:', error);
                alert('保存订单失败: ' + error.message);
                window._isSavingOrder = false;
                return false;
            }
        } else {
            console.error('未找到要更新的订单:', orderId);
            alert('更新订单失败：未找到该订单');
            window._isSavingOrder = false;
            return false;
        }
    } catch (error) {
        console.error('更新订单时发生错误:', error);
        alert('更新订单失败: ' + error.message);
        
        // 出错时也需要重置保存中标志
        window._isSavingOrder = false;
        
        return false;
    }
}
// ... existing code ...

// 保存新订单表单
function saveNewOrder(event) {
    if (event) event.preventDefault();
    
    // 防止函数被重复调用
    if (window._isSavingOrder) {
        console.log('订单正在保存中，忽略重复调用');
        return;
    }
    
    // 设置保存中标志
    window._isSavingOrder = true;
    
    // 在开始处理前先将焦点移至安全元素
    document.getElementById('addOrderBtn')?.focus();
    
    try {
        console.log('开始保存新订单...');
        
        // 获取表单数据
        const formData = new FormData(document.getElementById('newOrderForm'));
        let orderData = {}; // 改为let声明，允许后续修改
        
        // 将表单数据转换为对象，并确保价格字段正确处理
        for (const [key, value] of formData.entries()) {
            // 处理特殊字段
            if (key === 'newTotalPrice') {
                orderData.totalPrice = value;
                orderData.price = value;
                console.log('设置价格字段：', value);
            } else {
                // 移除字段名前缀'new'
                const fieldName = key.startsWith('new') ? key.substring(3, 4).toLowerCase() + key.substring(4) : key;
                orderData[fieldName] = value;
            }
            console.log(`处理表单字段: ${key} = ${value}`);
        }
        
        // 添加照片数据到订单中（如果有）
        if (typeof window.addPhotosToOrderData === 'function') {
            console.log('添加照片数据到订单...');
            orderData = window.addPhotosToOrderData(orderData);
            
            // 添加调试代码，查看照片数据是否正确添加
            if (orderData.bodyPhotos && orderData.bodyPhotos.length > 0) {
                console.log(`已添加${orderData.bodyPhotos.length}张体型照到订单`);
            }
            
            if (orderData.stylePhotos && orderData.stylePhotos.length > 0) {
                console.log(`已添加${orderData.stylePhotos.length}张款式照片到订单`);
            }
        } else {
            console.warn('照片上传功能未初始化');
        }
        
        // 验证必填字段 - 使用name属性而非id
        const requiredFields = ['customerName', 'dealDate'];
        for (const field of requiredFields) {
            if (!orderData[field]) {
                let fieldName = field;
                switch (field) {
                    case 'customerName': fieldName = '客户姓名'; break;
                    case 'dealDate': fieldName = '成交日期'; break;
                }
                alert(`请填写${fieldName}`);
                console.log(`缺少必填字段: ${field}`, orderData); // 输出调试信息
                return;
            }
        }
        
        // 调试输出当前订单数据长度
        console.log('保存前订单数据数量:', window.orders ? window.orders.length : '未定义');
        
        // 确保window.orders是数组
        if (!window.orders || !Array.isArray(window.orders)) {
            console.error('错误: window.orders不是数组，正在尝试修复...');
            
            // 尝试从localStorage恢复
            try {
                const savedOrders = localStorage.getItem('orders');
                if (savedOrders) {
                    window.orders = JSON.parse(savedOrders);
                    if (!Array.isArray(window.orders)) {
                        window.orders = [];
                        console.warn('从localStorage恢复的orders不是数组，已创建空数组');
                    } else {
                        console.log('从localStorage成功恢复订单数据，数量:', window.orders.length);
                    }
                } else {
                    window.orders = [];
                    console.warn('localStorage中没有订单数据，已创建空数组');
                }
            } catch (error) {
                console.error('从localStorage恢复订单数据失败:', error);
                window.orders = [];
            }
        }
        
        // 检查是新增还是编辑
        const isEdit = orderData.id && orderData.id.trim() !== '';
        console.log('是否为编辑操作:', isEdit, '订单ID:', orderData.id);
        
        if (!isEdit) {
            // 生成新订单ID
            const today = new Date();
            const dateStr = today.getFullYear().toString() +
                (today.getMonth() + 1).toString().padStart(2, '0') +
                today.getDate().toString().padStart(2, '0');
            
            // 确保使用全局的orderSequence变量并提供默认值
            if (typeof window.orderSequence !== 'number' || isNaN(window.orderSequence)) {
                console.warn('订单序列号异常，重置为1');
                window.orderSequence = 1;
            }
            
            orderData.id = 'SR' + dateStr + window.orderSequence.toString().padStart(4, '0');
            
            // 递增序列号并更新全局变量
            window.orderSequence++;
            localStorage.setItem('orderSequence', window.orderSequence.toString());
            console.log('生成新订单ID:', orderData.id, '更新序列号为:', window.orderSequence);
            
            // 确保订单类型被正确设置
            if (!orderData.orderType && window.currentOrderType) {
                orderData.orderType = window.currentOrderType;
                console.log('使用全局当前订单类型：', orderData.orderType);
            }
        }
        
        // 标准化字段名称 - 因为表单使用name属性，不需要特殊处理
        const standardizedOrderData = {};
        for (const [key, value] of Object.entries(orderData)) {
            // 处理特殊字段映射
            if (key === 'totalPrice') {
                standardizedOrderData.totalPrice = value;
                standardizedOrderData.price = value; // 同时保存到price字段
            } else if (key === 'deposit') {
                // 如果表单中提交了deposit字段（旧名称），同时保存到prepaidAmount字段（新名称）
                standardizedOrderData.deposit = value;
                standardizedOrderData.prepaidAmount = value;
            } else if (key === 'pantsPleats') {
                // 处理pantsPleats和pantsPleat的兼容性问题
                standardizedOrderData.pantsPleats = value;
                standardizedOrderData.pantsPleat = value; // 兼容旧代码
            } else {
                standardizedOrderData[key] = value;
            }
        }
        
        // 确保订单类型被正确设置
        if (!standardizedOrderData.orderType && window.currentOrderType) {
            standardizedOrderData.orderType = window.currentOrderType;
            console.log('使用全局当前订单类型：', standardizedOrderData.orderType);
        }
        
        // 如果是新增订单，直接添加到数组
        if (!isEdit) {
            window.orders.push(standardizedOrderData);
            console.log('已添加新订单到内存中:', standardizedOrderData.id);
        } else {
            // 如果是编辑订单，查找并更新现有订单
            const index = window.orders.findIndex(o => o.id === standardizedOrderData.id);
            if (index !== -1) {
                // 合并对象，保留原有字段
                window.orders[index] = { ...window.orders[index], ...standardizedOrderData };
                // 确保价格字段同步
                window.orders[index].totalPrice = standardizedOrderData.totalPrice;
                window.orders[index].price = standardizedOrderData.totalPrice;
                console.log('已更新订单:', standardizedOrderData.id);
            } else {
                console.error('未找到要更新的订单:', standardizedOrderData.id);
                alert('更新订单失败：未找到该订单');
                return;
            }
        }
        
        // 保存订单数据
        try {
            // 查看订单数据是否包含照片数据
            const orderWithPhotos = window.orders.find(o => o.id === standardizedOrderData.id);
            if (orderWithPhotos) {
                if (orderWithPhotos.bodyPhotos && orderWithPhotos.bodyPhotos.length > 0) {
                    console.log(`保存前订单包含${orderWithPhotos.bodyPhotos.length}张体型照`);
                }
                if (orderWithPhotos.stylePhotos && orderWithPhotos.stylePhotos.length > 0) {
                    console.log(`保存前订单包含${orderWithPhotos.stylePhotos.length}张款式照片`);
                }
            }
            
            // 使用新的压缩存储函数保存订单
            try {
                saveOrdersWithCompression();
                console.log('订单数据已压缩保存到localStorage，共', window.orders.length, '条');
            } catch (storageError) {
                if (storageError.name === 'QuotaExceededError') {
                    console.warn('存储空间不足，尝试清理数据后再保存...');
                    // 清理数据
                    cleanupOrderData();
                    // 再次尝试保存
                    saveOrdersWithCompression();
                    console.log('清理后成功保存订单数据');
                } else {
                    throw storageError; // 其他错误则继续抛出
                }
            }
            
            // 保存后检查是否成功保存了照片数据
            try {
                // 检查是否使用分块存储
                const isChunked = localStorage.getItem('orders_chunked') === 'true';
                let savedOrder;
                
                if (isChunked) {
                    // 从分块中查找当前订单
                    const chunkCount = parseInt(localStorage.getItem('orders_chunk_count') || '4');
                    for (let i = 0; i < chunkCount; i++) {
                        const chunkData = localStorage.getItem(`orders_chunk_${i}`);
                        if (chunkData) {
                            try {
                                const chunk = JSON.parse(chunkData);
                                if (Array.isArray(chunk)) {
                                    savedOrder = chunk.find(o => o.id === standardizedOrderData.id);
                                    if (savedOrder) break;
                                }
                            } catch (e) {
                                console.error(`解析分块${i}数据失败:`, e);
                            }
                        }
                    }
                } else {
                    // 常规方式查找订单
                    const savedOrdersStr = localStorage.getItem('orders');
                    if (savedOrdersStr) {
                        const savedOrders = JSON.parse(savedOrdersStr);
                        savedOrder = savedOrders.find(o => o.id === standardizedOrderData.id);
                    }
                }
                
                // 检查照片数据
                if (savedOrder) {
                    if (savedOrder.bodyPhotos && savedOrder.bodyPhotos.length > 0) {
                        console.log(`localStorage中保存了${savedOrder.bodyPhotos.length}张体型照`);
                    }
                    if (savedOrder.stylePhotos && savedOrder.stylePhotos.length > 0) {
                        console.log(`localStorage中保存了${savedOrder.stylePhotos.length}张款式照片`);
                    }
                }
            } catch (e) {
                console.error('检查照片数据保存状态出错:', e);
            }
            
            // 同步生产成本数据
            if (typeof window.syncProductionCostsWithOrders === 'function') {
                console.log('开始同步生产成本数据...');
                
                // 确保productionCosts数组存在
                if (!window.productionCosts) {
                    window.productionCosts = [];
                    try {
                        const savedCosts = localStorage.getItem('productionCosts');
                        if (savedCosts) {
                            window.productionCosts = JSON.parse(savedCosts);
                        }
                    } catch (e) {
                        console.error('加载生产成本数据失败:', e);
                    }
                }
                
                // 检查是否已存在该订单的生产成本记录
                const existingCostIndex = window.productionCosts.findIndex(cost => cost.orderId === orderData.id);
                
                if (existingCostIndex === -1) {
                    // 创建新的生产成本记录
                    const newCost = {
                        id: window.generateUUID(),
                        orderId: orderData.id,
                        fabricCost: 0,
                        processingCost: 0,
                        shippingCost: 0,
                        revisionCost: 0,
                        salesCommission: 0,
                        totalCost: 0,
                        notes: ''
                    };
                    
                    // 添加新的生产成本记录
                    window.productionCosts.push(newCost);
                    console.log('已创建新的生产成本记录:', newCost);
                }
                
                // 保存生产成本数据
                localStorage.setItem('productionCosts', JSON.stringify(window.productionCosts));
                
                // 调用同步函数，强制同步确保数据一致性
                window.syncProductionCostsWithOrders(true);
                console.log('生产成本数据同步完成');
            }
            
            // 重新渲染订单表格
            renderOrders(window.orders);
            
            // 在隐藏模态框前确保焦点转移到安全元素上
            document.getElementById('addOrderBtn')?.focus();
            
            // 先显示订单更新成功的提示，等用户确认后再关闭模态框
            alert(isEdit ? '订单更新成功' : '订单保存成功');
            
            // 重置保存中标志
            window._isSavingOrder = false;
            
            // 隐藏表单
            const modal = bootstrap.Modal.getInstance(document.getElementById('newOrderFormModal'));
            if (modal) {
                // 在隐藏之前确保没有子元素保留焦点
                const activeElement = document.activeElement;
                if (activeElement && modal._element.contains(activeElement)) {
                    // 如果当前焦点元素在模态框内，先将焦点转移走
                    document.body.focus();
                }
                
                // 移除aria-hidden属性
                modal._element.removeAttribute('aria-hidden');
                
                // 隐藏模态框
                modal.hide();
            }
            
            return true;
        } catch (error) {
            console.error('保存订单失败:', error);
            alert('保存订单失败: ' + error.message);
            window._isSavingOrder = false;
            return false;
        }
    } catch (error) {
        console.error('保存订单时发生错误:', error);
        alert('保存订单失败: ' + error.message);
        
        // 出错时也需要重置保存中标志
        window._isSavingOrder = false;
        
        return false;
    }
}

// 初始化尺寸选项卡事件
function initSizeTabsEvents() {
    try {
        console.log('初始化尺寸选项卡事件...');
        
        // 获取当前订单类型
        const orderTypeField = document.getElementById('orderType');
        const currentOrderType = orderTypeField ? orderTypeField.value : '';
        console.log('当前订单类型:', currentOrderType);
        
        // 检查是否需要显示成衣尺寸部分（针对不同的订单类型有不同的处理）
        const shouldShowFinishedSize = !(currentOrderType === '皮鞋' || 
                                      currentOrderType === '现货衬衣' || 
                                      currentOrderType === '领带' || 
                                      currentOrderType === '其他');
        
        // 获取成衣尺寸字段和复选框
        const finishedSizeFields = document.querySelectorAll('.finished-size-field');
        const showFinishedSize = document.getElementById('showFinishedSize');
        
        // 根据订单类型决定是否显示成衣尺寸复选框和字段
        if (!shouldShowFinishedSize) {
            // 对于皮鞋、现货衬衣、领带等类型，隐藏成衣尺寸选项
            if (showFinishedSize) {
                showFinishedSize.parentElement.style.display = 'none';
                showFinishedSize.checked = false;
            }
            // 隐藏所有成衣尺寸字段
            finishedSizeFields.forEach(field => {
                field.style.display = 'none';
            });
        } else {
            // 对于需要显示成衣尺寸的类型，显示复选框并根据其状态显示/隐藏字段
            if (showFinishedSize) {
                showFinishedSize.parentElement.style.display = 'block';
                // 根据复选框状态决定是否显示成衣尺寸字段
                const showFields = showFinishedSize.checked;
                finishedSizeFields.forEach(field => {
                    field.style.display = showFields ? 'block' : 'none';
                });
            }
        }
        
        // 监听上衣成衣尺寸显示切换
        const showFinishedSizeCheck = document.getElementById('showFinishedSize');
        if (showFinishedSizeCheck) {
            showFinishedSizeCheck.addEventListener('change', function() {
                const finishedSizeFields = document.querySelectorAll('.finished-size-field');
                finishedSizeFields.forEach(field => {
                    field.style.display = this.checked ? 'block' : 'none';
                });
            });
        }
        
        // 监听裤子成衣尺寸显示切换
        const showPantsFinishedSize = document.getElementById('showPantsFinishedSize');
        if (showPantsFinishedSize) {
            showPantsFinishedSize.addEventListener('change', function() {
                const pantsFinishedSizeSection = document.querySelector('.pants-finished-size-section');
                if (pantsFinishedSizeSection) {
                    pantsFinishedSizeSection.style.display = this.checked ? 'block' : 'none';
                }
            });
        }
        
        // 尺寸选项卡切换事件
        const sizeTabs = document.querySelectorAll('a[data-bs-toggle="tab"][href^="#jacket-size"], a[data-bs-toggle="tab"][href^="#pants-size"], a[data-bs-toggle="tab"][href^="#body-features"]');
        sizeTabs.forEach(tab => {
            tab.addEventListener('shown.bs.tab', function(event) {
                console.log('尺寸选项卡切换到：', event.target.getAttribute('href'));
            });
        });
        
        console.log('尺寸选项卡事件初始化完成');
        return true;
    } catch (error) {
        console.error('初始化尺寸选项卡事件失败：', error);
        return false;
    }
}

// 初始化订单模块
function initOrderModule() {
    console.log('初始化订单模块...');
    try {
        // 初始化订单数据
        window.ORDER_DATA = [];
        window.CURRENT_PAGE = 1;
        window.PAGE_SIZE = 10;
        window.FILTERED_DATA = [];
        window.CURRENT_FILTER = {};
        
        // ===== 添加页面刷新/离开前数据保存功能 =====
        window.addEventListener('beforeunload', function() {
            console.log('页面即将刷新或关闭，确保数据已保存...');
            
            // 直接保存当前内存中的订单数据到localStorage
            if (window.orders && Array.isArray(window.orders) && window.orders.length > 0) {
                try {
                    // 直接保存到localStorage
            localStorage.setItem('orders', JSON.stringify(window.orders));
                    console.log('页面离开前，已保存', window.orders.length, '条订单数据到localStorage');
                } catch (error) {
                    console.error('页面离开前保存数据失败:', error);
                }
            }
        });
        
        // ===== 添加自动定时保存功能 =====
        const autoSaveInterval = setInterval(function() {
            if (window.orders && Array.isArray(window.orders) && window.orders.length > 0) {
                try {
                    localStorage.setItem('orders', JSON.stringify(window.orders));
                    console.log('定时自动保存：已保存', window.orders.length, '条订单数据');
                } catch (error) {
                    console.error('定时保存失败:', error);
                }
            }
        }, 30000); // 30秒自动保存一次
        
        // 将定时器添加到window对象，以便在需要时可以清除
        window.orderAutoSaveInterval = autoSaveInterval;
        
        console.log('正在加载订单数据...');
        // 加载初始数据
        loadOrderData();
        
        // 初始化事件
        console.log('正在初始化订单表格事件...');
        
        // 确保Bootstrap正确加载且下拉菜单初始化
        setTimeout(function() {
            try {
                console.log('正在延迟初始化订单表格事件和下拉菜单...');
                
                // 检查Bootstrap是否已加载
                if (typeof bootstrap === 'undefined') {
                    console.error('Bootstrap未正确加载，尝试使用其他方式初始化下拉菜单...');
                    
                    // 手动添加点击事件
                    const addOrderBtn = document.getElementById('addOrderBtn');
                    if (addOrderBtn) {
                        addOrderBtn.addEventListener('click', function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            const dropdown = addOrderBtn.parentElement;
                            const menu = dropdown.querySelector('.dropdown-menu');
                            
                            if (dropdown && menu) {
                                dropdown.classList.toggle('show');
                                menu.classList.toggle('show');
                            }
                        });
                        
                        // 点击外部区域关闭下拉菜单
                        document.addEventListener('click', function(e) {
                            if (!e.target.closest('.dropdown')) {
                                const dropdowns = document.querySelectorAll('.dropdown.show');
                                dropdowns.forEach(dropdown => {
                                    dropdown.classList.remove('show');
                                    const menu = dropdown.querySelector('.dropdown-menu');
                                    if (menu) menu.classList.remove('show');
                                });
                            }
                        });
                    }
                } else {
                    console.log('Bootstrap已加载，正在初始化下拉菜单...');
                    
                    // 使用Bootstrap API初始化所有下拉菜单
                    const dropdowns = document.querySelectorAll('.dropdown-toggle');
                    dropdowns.forEach(dropdownToggle => {
                        try {
                            const dropdown = new bootstrap.Dropdown(dropdownToggle);
                            console.log('已初始化下拉菜单:', dropdownToggle.id);
                        } catch (err) {
                            console.error('初始化下拉菜单失败:', err);
                        }
                    });
                }
                
                // 初始化表格事件
                initOrderTableEvents();
                
                // 初始化过滤事件
                initOrderFilterEvents();
                
                // 初始化分页
                updateOrderPagination();
                
                console.log('订单模块初始化完成');
            } catch (err) {
                console.error('延迟初始化订单表格事件出错:', err);
            }
        }, 500); // 延迟500毫秒执行，确保DOM已完全加载
        
    } catch (error) {
        console.error('初始化订单模块出错:', error);
    }
}

// 在文件末尾添加jQuery后备方案
// jQuery后备方案，确保下拉菜单可以正常工作
$(document).ready(function() {
    console.log('jQuery文档加载完成，准备初始化下拉菜单...');
    
    // 检查原生初始化是否已经完成
    const isDropdownsInitialized = $('.dropdown-toggle').data('bs.dropdown');
    if (!isDropdownsInitialized) {
        console.log('检测到下拉菜单尚未初始化，使用jQuery进行初始化...');
        
        // 使用jQuery处理下拉菜单点击事件
        $('#addOrderBtn').on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // 切换下拉菜单显示状态
            const $dropdown = $(this).parent('.dropdown');
            const $menu = $dropdown.find('.dropdown-menu');
            
            $dropdown.toggleClass('show');
            $menu.toggleClass('show');
            
            // 点击外部区域关闭下拉菜单
            $(document).one('click', function(e) {
                if (!$(e.target).closest('.dropdown').length) {
                    $dropdown.removeClass('show');
                    $menu.removeClass('show');
                }
            });
        });
        
        // 使用jQuery处理下拉菜单项点击事件
        $('.dropdown-item').on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const orderType = $(this).data('order-type') || $(this).attr('data-order-type');
            console.log('jQuery - 选择了订单类型:', orderType);
            
            // 关闭下拉菜单
            $(this).closest('.dropdown').removeClass('show');
            $(this).closest('.dropdown-menu').removeClass('show');
            
            // 调用显示订单表单的函数
            if (typeof window.showNewOrderFormByType === 'function') {
                window.showNewOrderFormByType(orderType);
            } else {
                console.error('jQuery - showNewOrderFormByType函数未定义');
            }
        });
        
        console.log('jQuery下拉菜单初始化完成');
    } else {
        console.log('下拉菜单已经通过原生方式初始化，跳过jQuery初始化');
    }
});

// 尺寸体型表格切换功能
document.addEventListener('DOMContentLoaded', function() {
    // 监听成衣尺寸显示切换
    const showFinishedSizeCheckbox = document.getElementById('showFinishedSize');
    if (showFinishedSizeCheckbox) {
        showFinishedSizeCheckbox.addEventListener('change', function() {
            const finishedSizeFields = document.querySelectorAll('.finished-size-field');
            finishedSizeFields.forEach(field => {
                if (this.checked) {
                    field.style.display = 'block';
                } else {
                    field.style.display = 'none';
                }
            });
        });
        
        // 初始化时触发一次
        showFinishedSizeCheckbox.dispatchEvent(new Event('change'));
    }
});

// 显示带选项卡的编辑订单表单
function showNewEditOrderForm(orderId) {
    try {
        console.log('显示新编辑订单表单:', orderId);
        
        // 查找订单数据
        const order = window.orders.find(o => o.id === orderId);
        
        if (!order) {
            console.error('未找到订单:', orderId);
            alert('未找到订单');
            return;
        }
        
        console.log('找到订单数据:', order);
        
        // 设置表单标题
        const titleElement = document.getElementById('newOrderFormTitle');
        if (titleElement) {
            const orderType = order.orderType || '订单';
            const customerName = order.customerName || '';
            titleElement.textContent = `编辑${orderType}订单 ${customerName}`;
            console.log(`设置编辑订单弹窗标题为：编辑${orderType}订单 ${customerName}`);
        }
        
        // 设置订单类型
        const orderType = order.orderType || '西服西裤';
        const orderTypeElement = document.getElementById('orderType');
        if (orderTypeElement) {
            orderTypeElement.value = orderType;
            console.log(`设置订单类型字段为：${orderType}`);
        }
        
        // 重置表单
        const formElement = document.getElementById('newOrderForm');
        if (formElement) formElement.reset();
        
        // 安全设置函数 - 避免"Cannot set properties of null"错误
        function safeSetFieldValue(fieldId, value) {
                    const element = document.getElementById(fieldId);
            if (element) element.value = value || '';
        }
        
        // 填充表单字段 - 基本信息
        safeSetFieldValue('newOrderId', order.id);
        safeSetFieldValue('newCustomerName', order.customerName);
        safeSetFieldValue('newGender', order.gender || '男');
        safeSetFieldValue('newHeight', order.height);
        safeSetFieldValue('newWeight', order.weight);
        safeSetFieldValue('newBirthDate', order.birthDate);
        safeSetFieldValue('newUsageScenario', order.usageScenario);
        safeSetFieldValue('newCustomerOccupation', order.customerOccupation);
        safeSetFieldValue('newCustomerSource', order.customerSource);
        safeSetFieldValue('newFabricBrand', order.fabricBrand);
        safeSetFieldValue('newFabricCode', order.fabricCode);
        safeSetFieldValue('newColor', order.color);
        safeSetFieldValue('newFabricAmount', order.fabricAmount);
        safeSetFieldValue('newSize', order.size);
        safeSetFieldValue('newConfiguration', order.configuration);
        safeSetFieldValue('newManufacturer', order.manufacturer);
        safeSetFieldValue('newOrderDate', order.orderDate);
        safeSetFieldValue('newCuttingDate', order.cuttingDate);
        safeSetFieldValue('newSemifinishedDate', order.semifinishedDate);
        safeSetFieldValue('newDeliveryDate', order.deliveryDate);
        safeSetFieldValue('newDealDate', order.dealDate);
        safeSetFieldValue('newTotalPrice', order.totalPrice);
        safeSetFieldValue('newDeposit', order.prepaidAmount || order.deposit || '');
        safeSetFieldValue('newPrepaidAmount', order.prepaidAmount);
        safeSetFieldValue('newRemark', order.remark);
        
        // 根据订单类型切换显示相应的款式表单
        toggleStyleFormsByOrderType(orderType);
        
        // 根据不同的衣服类型，填充不同的款式表单
        switch (orderType) {
            case '大衣':
                // 填充大衣款式表单数据
                safeSetFieldValue('coatFit', order.coatFit || '修身版');
                safeSetFieldValue('coatCollar', order.coatCollar || '戗驳领');
                safeSetFieldValue('coatFrontHem', order.coatFrontHem || '单排2粒扣');
                safeSetFieldValue('coatBackVent', order.coatBackVent || '单叉');
                safeSetFieldValue('coatChestPocket', order.coatChestPocket || '无');
                safeSetFieldValue('coatWaistPocket', order.coatWaistPocket || '平-翻盖袋');
                safeSetFieldValue('coatSleeveVent', order.coatSleeveVent || '真袖叉4粒扣');
                safeSetFieldValue('coatSleeveButtonColor', order.coatSleeveButtonColor || '顺色');
                safeSetFieldValue('coatLapelHole', order.coatLapelHole || '机器真眼');
                safeSetFieldValue('coatLapelHoleColor', order.coatLapelHoleColor);
                safeSetFieldValue('coatLapelWidth', order.coatLapelWidth || '10cm');
                safeSetFieldValue('coatButtonNumber', order.coatButtonNumber);
                safeSetFieldValue('coatLiningNumber', order.coatLiningNumber);
                safeSetFieldValue('coatEmbroideryContent', order.coatEmbroideryContent);
                safeSetFieldValue('coatEmbroideryFont', order.coatEmbroideryFont);
                safeSetFieldValue('coatEmbroideryPattern', order.coatEmbroideryPattern);
                safeSetFieldValue('coatEmbroideryColor', order.coatEmbroideryColor);
                safeSetFieldValue('coatRemark', order.coatRemark);
                break;
                
            case '西服西裤':
            case '西服西裤马甲':
            case '单西':
                // 填充西服款式表单数据
                safeSetFieldValue('suitFit', order.suitFit || '修身版');
                safeSetFieldValue('suitLapelStyle', order.suitLapelStyle || '戗驳领');
                safeSetFieldValue('suitVent', order.suitVent || '双开衩');
                safeSetFieldValue('suitPocket', order.suitPocket || '平袋');
                safeSetFieldValue('suitChestPocket', order.suitChestPocket || '明袋');
                safeSetFieldValue('suitButtonCount', order.suitButtonCount || '单排一粒扣');
                safeSetFieldValue('suitTicketPocket', order.suitTicketPocket || '无');
                safeSetFieldValue('suitSleeveButtons', order.suitSleeveButtons || '4粒扣');
                safeSetFieldValue('suitSleeveButtonholes', order.suitSleeveButtonholes || '装饰眼');
                safeSetFieldValue('suitInnerPockets', order.suitInnerPockets || '左右各一个');
                safeSetFieldValue('suitBreastPad', order.suitBreastPad || '厚');
                safeSetFieldValue('suitShouldPad', order.suitShouldPad || '厚');
                
                // 添加其他西服款式字段的加载逻辑
                safeSetFieldValue('suitHemStyle', order.suitHemStyle || '圆摆');
                safeSetFieldValue('suitPenPocket', order.suitPenPocket || '无');
                safeSetFieldValue('suitLapelHole', order.suitLapelHole || '机器真眼');
                safeSetFieldValue('suitPearlEdgeColor', order.suitPearlEdgeColor || '顺色');
                safeSetFieldValue('suitLapelWidth', order.suitLapelWidth || '10cm');
                safeSetFieldValue('suitLapelHoleColor', order.suitLapelHoleColor || '');
                safeSetFieldValue('suitButtonNumber', order.suitButtonNumber || '');
                safeSetFieldValue('suitCollarFelt', order.suitCollarFelt || '');
                safeSetFieldValue('suitLiningNumber', order.suitLiningNumber || '');
                safeSetFieldValue('suitEmbroideryContent', order.suitEmbroideryContent || '');
                safeSetFieldValue('suitEmbroideryFont', order.suitEmbroideryFont || '');
                safeSetFieldValue('suitEmbroideryPattern', order.suitEmbroideryPattern || '');
                safeSetFieldValue('suitEmbroideryColor', order.suitEmbroideryColor || '');
                safeSetFieldValue('suitRemark', order.suitRemark || '');
                
                // 如果是西服西裤类型，还需要设置裤子款式数据
                if (orderType === '西服西裤') {
                    // 填充裤子款式表单数据
                    safeSetFieldValue('pantsFit', order.pantsFit || '修身版');
                    safeSetFieldValue('pantsPocket', order.pantsPocket || '斜插袋');
                    safeSetFieldValue('pantsBackPocket', order.pantsBackPocket || '双口袋');
                    safeSetFieldValue('pantsClosure', order.pantsClosure || '拉链');
                    safeSetFieldValue('pantsWaistband', order.pantsWaistband || '常规');
                    safeSetFieldValue('pantsCuff', order.pantsCuff || '无翻边');
                    safeSetFieldValue('pantsCuffWidth', order.pantsCuffWidth);
                    safeSetFieldValue('pantsBeltLoop', order.pantsBeltLoop || '常规');
                    
                    // 添加其他裤子款式字段的加载逻辑
                    safeSetFieldValue('pantsWaist', order.pantsWaist || '纽扣搭嘴');
                    safeSetFieldValue('pantsPleats', order.pantsPleats || '无褶');
                    safeSetFieldValue('pantsSidePocket', order.pantsSidePocket || '斜插袋');
                    safeSetFieldValue('pantsHem', order.pantsHem || '标准（带防磨贴）');
                    safeSetFieldValue('pantsLining', order.pantsLining || '前半裤里');
                    safeSetFieldValue('pantsStyle', order.pantsStyle || '直筒');
                    safeSetFieldValue('pantsEmbroideryContent', order.pantsEmbroideryContent || '');
                    safeSetFieldValue('pantsEmbroideryFont', order.pantsEmbroideryFont || '');
                    safeSetFieldValue('pantsEmbroideryColor', order.pantsEmbroideryColor || '');
                    safeSetFieldValue('pantsRemark', order.pantsRemark || '');
                }
                // 如果是西服西裤马甲类型，还需要设置裤子马甲款式数据
                if (orderType === '西服西裤马甲') {
                    // 填充裤子款式表单数据
                    safeSetFieldValue('pantsFit', order.pantsFit || '修身版');
                    safeSetFieldValue('pantsPocket', order.pantsPocket || '斜插袋');
                    safeSetFieldValue('pantsBackPocket', order.pantsBackPocket || '双口袋');
                    safeSetFieldValue('pantsClosure', order.pantsClosure || '拉链');
                    safeSetFieldValue('pantsWaistband', order.pantsWaistband || '常规');
                    safeSetFieldValue('pantsCuff', order.pantsCuff || '无翻边');
                    safeSetFieldValue('pantsCuffWidth', order.pantsCuffWidth);
                    safeSetFieldValue('pantsBeltLoop', order.pantsBeltLoop || '常规');
                    
                    // 添加其他裤子款式字段的加载逻辑
                    safeSetFieldValue('pantsWaist', order.pantsWaist || '纽扣搭嘴');
                    safeSetFieldValue('pantsPleats', order.pantsPleats || '无褶');
                    safeSetFieldValue('pantsSidePocket', order.pantsSidePocket || '斜插袋');
                    safeSetFieldValue('pantsHem', order.pantsHem || '标准（带防磨贴）');
                    safeSetFieldValue('pantsLining', order.pantsLining || '前半裤里');
                    safeSetFieldValue('pantsStyle', order.pantsStyle || '直筒');
                    safeSetFieldValue('pantsEmbroideryContent', order.pantsEmbroideryContent || '');
                    safeSetFieldValue('pantsEmbroideryFont', order.pantsEmbroideryFont || '');
                    safeSetFieldValue('pantsEmbroideryColor', order.pantsEmbroideryColor || '');
                    safeSetFieldValue('pantsRemark', order.pantsRemark || '');

                    // 填充马甲款式表单数据
                    safeSetFieldValue('vestFit', order.vestFit || '修身版');
                    safeSetFieldValue('vestCollar', order.vestCollar || '无领');
                    safeSetFieldValue('vestPocket', order.vestPocket || '双开袋');
                    safeSetFieldValue('vestChestPocket', order.vestChestPocket || '无');
                    safeSetFieldValue('vestFront', order.vestFront || '单排五粒扣');
                    safeSetFieldValue('vestHem', order.vestHem || '尖下摆');
                    safeSetFieldValue('vestBack', order.vestBack || '同面料');
                    safeSetFieldValue('vestLining', order.vestLining || '');
                    safeSetFieldValue('vestRemark', order.vestRemark || '');
                  
                }
                break;
                
            case '单裤':
                // 填充裤子款式表单数据
                safeSetFieldValue('pantsFit', order.pantsFit || '修身版');
                // safeSetFieldValue('pantsPleat', order.pantsPleat || '无褶'); // 移除错误的字段名称
                safeSetFieldValue('pantsPocket', order.pantsPocket || '斜插袋');
                safeSetFieldValue('pantsBackPocket', order.pantsBackPocket || '双口袋');
                safeSetFieldValue('pantsClosure', order.pantsClosure || '拉链');
                safeSetFieldValue('pantsWaistband', order.pantsWaistband || '常规');
                safeSetFieldValue('pantsCuff', order.pantsCuff || '无翻边');
                safeSetFieldValue('pantsCuffWidth', order.pantsCuffWidth);
                safeSetFieldValue('pantsBeltLoop', order.pantsBeltLoop || '常规');
                
                // 添加其他裤子款式字段的加载逻辑
                safeSetFieldValue('pantsWaist', order.pantsWaist || '纽扣搭嘴');
                safeSetFieldValue('pantsPleats', order.pantsPleats || '无褶');
                safeSetFieldValue('pantsSidePocket', order.pantsSidePocket || '斜插袋');
                safeSetFieldValue('pantsHem', order.pantsHem || '标准（带防磨贴）');
                safeSetFieldValue('pantsLining', order.pantsLining || '前半裤里');
                safeSetFieldValue('pantsStyle', order.pantsStyle || '直筒');
                safeSetFieldValue('pantsEmbroideryContent', order.pantsEmbroideryContent || '');
                safeSetFieldValue('pantsEmbroideryFont', order.pantsEmbroideryFont || '');
                safeSetFieldValue('pantsEmbroideryColor', order.pantsEmbroideryColor || '');
                safeSetFieldValue('pantsRemark', order.pantsRemark || '');
                break;
                
            case '衬衣':
                // 填充衬衫款式表单数据
                safeSetFieldValue('shirtStyle', order.shirtStyle || '长袖');
                safeSetFieldValue('shirtFit', order.shirtFit || '修身版');
                safeSetFieldValue('shirtCollar', order.shirtCollar || '温莎领');
                safeSetFieldValue('shirtCuff', order.shirtCuff || '单扣门襟');
                safeSetFieldValue('shirtPlacket', order.shirtPlacket || '法式');
                safeSetFieldValue('shirtFrontPocket', order.shirtFrontPocket || '无');
                safeSetFieldValue('shirtBackPleat', order.shirtBackPleat || '无');
                safeSetFieldValue('shirtButtonThread', order.shirtButtonThread || '同色');
                safeSetFieldValue('shirtButtonholeThread', order.shirtButtonholeThread || '同色');
                
                // 添加其他衬衣款式字段的加载逻辑
                safeSetFieldValue('shirtCollarHeight', order.shirtCollarHeight || '中');
                safeSetFieldValue('shirtFront', order.shirtFront || '明门襟');
                safeSetFieldValue('shirtHem', order.shirtHem || '小圆摆-弧高4.5');
                safeSetFieldValue('shirtButtonhole', order.shirtButtonhole || '竖锁眼（默认）');
                safeSetFieldValue('shirtHemTape', order.shirtHemTape || '无');
                safeSetFieldValue('shirtButtons', order.shirtButtons || '');
                safeSetFieldValue('shirtButtonStitch', order.shirtButtonStitch || '十字扣');
                safeSetFieldValue('shirtEmbroideryPosition', order.shirtEmbroideryPosition || '左袖中');
                safeSetFieldValue('shirtEmbroideryColor', order.shirtEmbroideryColor || '');
                safeSetFieldValue('shirtEmbroideryFont', order.shirtEmbroideryFont || '');
                safeSetFieldValue('shirtEmbroideryContent', order.shirtEmbroideryContent || '');
                safeSetFieldValue('shirtEmbroideryHeight', order.shirtEmbroideryHeight || '');
                safeSetFieldValue('shirtEmbroideryPattern', order.shirtEmbroideryPattern || '');
                safeSetFieldValue('shirtRemark', order.shirtRemark || '');
                break;
                
            case '马甲':
                // 填充马甲款式表单数据
                safeSetFieldValue('vestFit', order.vestFit || '修身版');
                safeSetFieldValue('vestCollar', order.vestCollar || '无领');
                safeSetFieldValue('vestPocket', order.vestPocket || '双开袋');
                safeSetFieldValue('vestChestPocket', order.vestChestPocket || '无');
                safeSetFieldValue('vestFront', order.vestFront || '单排五粒扣');
                safeSetFieldValue('vestHem', order.vestHem || '尖下摆');
                safeSetFieldValue('vestBack', order.vestBack || '同面料');
                safeSetFieldValue('vestLining', order.vestLining || '');
                safeSetFieldValue('vestRemark', order.vestRemark || '');
                break;
        }
        
        // 填充尺寸体型数据
        // 上衣/衬衣/马甲尺寸
        safeSetFieldValue('jacketNetCollar', order.jacketNetCollar);            // 设置领口净尺寸
        safeSetFieldValue('jacketFinishedCollar', order.jacketFinishedCollar);  // 设置领口成衣尺寸
        safeSetFieldValue('jacketNetChest', order.jacketNetChest);              // 设置胸围净尺寸
        safeSetFieldValue('jacketFinishedChest', order.jacketFinishedChest);    // 设置胸围成衣尺寸
        safeSetFieldValue('jacketNetChestHeight', order.jacketNetChestHeight);  // 设置胸高净尺寸
        safeSetFieldValue('jacketFinishedChestHeight', order.jacketFinishedChestHeight); // 设置胸高成衣尺寸
        safeSetFieldValue('jacketNetWaist', order.jacketNetWaist);              // 设置中腰净尺寸
        safeSetFieldValue('jacketFinishedWaist', order.jacketFinishedWaist);    // 设置中腰成衣尺寸
        safeSetFieldValue('jacketNetHip', order.jacketNetHip);                  // 设置臀围净尺寸
        safeSetFieldValue('jacketFinishedHip', order.jacketFinishedHip);        // 设置臀围成衣尺寸
        safeSetFieldValue('jacketNetBelly', order.jacketNetBelly);              // 设置肚围净尺寸
        safeSetFieldValue('jacketFinishedBelly', order.jacketFinishedBelly);    // 设置肚围成衣尺寸
        safeSetFieldValue('jacketNetShoulder', order.jacketNetShoulder);        // 设置肩宽净尺寸
        safeSetFieldValue('jacketFinishedShoulder', order.jacketFinishedShoulder); // 设置肩宽成衣尺寸
        safeSetFieldValue('jacketNetSleeveLength', order.jacketNetSleeveLength);   // 设置袖长净尺寸
        safeSetFieldValue('jacketFinishedSleeveLength', order.jacketFinishedSleeveLength); // 设置袖长成衣尺寸
        safeSetFieldValue('jacketNetSleeveWidth', order.jacketNetSleeveWidth); // 设置袖肥净尺寸
        safeSetFieldValue('jacketFinishedSleeveWidth', order.jacketFinishedSleeveWidth); // 设置袖肥成衣尺寸
        safeSetFieldValue('jacketNetCuff', order.jacketNetCuff); // 设置袖口净尺寸
        safeSetFieldValue('jacketFinishedCuff', order.jacketFinishedCuff); // 设置袖口成衣尺寸
        safeSetFieldValue('jacketNetFrontLength', order.jacketNetFrontLength);       // 设置前衣长净尺寸
        safeSetFieldValue('jacketFinishedFrontLength', order.jacketFinishedFrontLength); // 设置前衣长成衣尺寸
        safeSetFieldValue('jacketNetBackLength', order.jacketNetBackLength);         // 设置后衣长净尺寸
        safeSetFieldValue('jacketFinishedBackLength', order.jacketFinishedBackLength); // 设置后衣长成衣尺寸
        safeSetFieldValue('jacketNetHem', order.jacketNetHem);       // 设置下摆净尺寸
        safeSetFieldValue('jacketFinishedHem', order.jacketFinishedHem); // 设置下摆成衣尺寸

        
        // 裤子尺寸
        safeSetFieldValue('pantsNetWaist', order.pantsNetWaist);                // 设置裤腰净尺寸
        safeSetFieldValue('pantsFinishedWaist', order.pantsFinishedWaist);      // 设置裤腰成衣尺寸
        safeSetFieldValue('pantsNetHip', order.pantsNetHip);                    // 设置裤子臀围净尺寸
        safeSetFieldValue('pantsFinishedHip', order.pantsFinishedHip);          // 设置裤子臀围成衣尺寸
        safeSetFieldValue('pantsNetThigh', order.pantsNetThigh);                // 设置大腿围净尺寸
        safeSetFieldValue('pantsFinishedThigh', order.pantsFinishedThigh);      // 设置大腿围成衣尺寸
        safeSetFieldValue('pantsNetKnee', order.pantsNetKnee);                  // 设置膝围净尺寸
        safeSetFieldValue('pantsFinishedKnee', order.pantsFinishedKnee);        // 设置膝围成衣尺寸
        safeSetFieldValue('pantsNetLeg', order.pantsNetLeg);                    // 设置腿围净尺寸
        safeSetFieldValue('pantsFinishedLeg', order.pantsFinishedLeg);          // 设置腿围成衣尺寸
        safeSetFieldValue('pantsNetBottomWidth', order.pantsNetBottomWidth);    // 设置脚口净尺寸
        safeSetFieldValue('pantsFinishedBottomWidth', order.pantsFinishedBottomWidth); // 设置脚口成衣尺寸
        safeSetFieldValue('pantsNetOutseam', order.pantsNetOutseam);            // 设置外缝长净尺寸
        safeSetFieldValue('pantsFinishedOutseam', order.pantsFinishedOutseam);  // 设置外缝长成衣尺寸
        safeSetFieldValue('pantsNetInseam', order.pantsNetInseam);              // 设置内缝长净尺寸
        safeSetFieldValue('pantsFinishedInseam', order.pantsFinishedInseam);    // 设置内缝长成衣尺寸
        safeSetFieldValue('pantsNetFrontRise', order.pantsNetFrontRise);        // 设置前档净尺寸
        safeSetFieldValue('pantsFinishedFrontRise', order.pantsFinishedFrontRise); // 设置前档成衣尺寸
        safeSetFieldValue('pantsNetBackRise', order.pantsNetBackRise);          // 设置后档净尺寸
        safeSetFieldValue('pantsFinishedBackRise', order.pantsFinishedBackRise); // 设置后档成衣尺寸
        safeSetFieldValue('pantsNetTotalCrotch', order.pantsNetTotalCrotch);    // 设置总裆净尺寸
        safeSetFieldValue('pantsFinishedTotalCrotch', order.pantsFinishedTotalCrotch); // 设置总裆成衣尺寸
        
        // 添加裤长字段的加载逻辑
        safeSetFieldValue('pantsNetLength', order.pantsNetLength);
        safeSetFieldValue('pantsFinishedLength', order.pantsFinishedLength);
        
        // 添加裙长字段的加载逻辑
        safeSetFieldValue('pantsNetOutLength', order.pantsNetOutLength);
        safeSetFieldValue('pantsFinishedOutLength', order.pantsFinishedOutLength);
        
        // 马甲尺寸
        safeSetFieldValue('vestNetChest', order.vestNetChest);                // 设置胸围净尺寸
        safeSetFieldValue('vestFinishedChest', order.vestFinishedChest);      // 设置胸围成衣尺寸
        safeSetFieldValue('vestNetWaist', order.vestNetWaist);                    // 设置裤腰净尺寸
        safeSetFieldValue('vestFinishedWaist', order.vestFinishedWaist);          // 设置裤腰成衣尺寸
        safeSetFieldValue('vestNetCollar', order.vestNetCollar);                // 设置领口净尺寸
        safeSetFieldValue('vestFinishedCollar', order.vestFinishedCollar);          // 设置领口成衣尺寸
        safeSetFieldValue('vestNetShoulder', order.vestNetShoulder);                // 设置肩宽净尺寸
        safeSetFieldValue('vestFinishedShoulder', order.vestFinishedShoulder);          // 设置肩宽成衣尺寸
        safeSetFieldValue('vestNetFrontLength', order.vestNetFrontLength);                // 设置前衣长净尺寸
        safeSetFieldValue('vestFinishedFrontLength', order.vestFinishedFrontLength);          // 设置前衣长成衣尺寸
        safeSetFieldValue('vestNetBackLength', order.vestNetBackLength);                // 设置后衣长净尺寸
        safeSetFieldValue('vestFinishedBackLength', order.vestFinishedBackLength);          // 设置后衣长成衣尺寸
        safeSetFieldValue('vestNetHem', order.vestNetHem);                // 设置下摆净尺寸
        safeSetFieldValue('vestFinishedHem', order.vestFinishedHem);          // 设置下摆成衣尺寸

        // 添加加载体型特征表字段的逻辑
        safeSetFieldValue('bodyType', order.bodyType || '正常');
        safeSetFieldValue('bodyBelly', order.bodyBelly || '正常');
        safeSetFieldValue('bodyConcaveBelly', order.bodyConcaveBelly || '无');
        safeSetFieldValue('bodyChest', order.bodyChest || '正常');
        safeSetFieldValue('bodyBack', order.bodyBack || '正常');
        safeSetFieldValue('bodyShoulder', order.bodyShoulder || '正常');
        safeSetFieldValue('bodyHighLowShoulder', order.bodyHighLowShoulder || '正常');
        safeSetFieldValue('bodyShoulderProtrude', order.bodyShoulderProtrude || '正常');
        safeSetFieldValue('bodyLeanBack', order.bodyLeanBack || '正常');
        safeSetFieldValue('bodySleeve', order.bodySleeve || '正常');
        safeSetFieldValue('bodyNote', order.bodyNote || '');

        // 添加其他项字段的加载逻辑
        safeSetFieldValue('designer', order.designer || '');
        safeSetFieldValue('measurer', order.measurer || '');
        safeSetFieldValue('fabricCheck', order.fabricCheck || '');
        safeSetFieldValue('reminderForComment', order.reminderForComment || '');
        safeSetFieldValue('otherNotes', order.otherNotes || '');
        
        
        // 处理缺失的裤子横裆、小腿围字段
        safeSetFieldValue('pantsNetCrotch', order.pantsNetCrotch);
        safeSetFieldValue('pantsFinishedCrotch', order.pantsFinishedCrotch);
        safeSetFieldValue('pantsNetCalf', order.pantsNetCalf);
        safeSetFieldValue('pantsFinishedCalf', order.pantsFinishedCalf);
        
        // 处理裤子脚口字段
        safeSetFieldValue('pantsNetHem', order.pantsNetHem);
        safeSetFieldValue('pantsFinishedHem', order.pantsFinishedHem);
        
        // 清空照片预览区域，避免之前上传的照片残留
        const bodyPhotoPreview = document.getElementById('bodyPhotoPreview');
        const stylePhotoPreview = document.getElementById('stylePhotoPreview');
        
        if (bodyPhotoPreview) bodyPhotoPreview.innerHTML = '';
        if (stylePhotoPreview) stylePhotoPreview.innerHTML = '';
        
        // 重置全局照片数据，确保不会显示之前的照片
        if (window.photoData) {
            window.photoData.bodyPhotos = [];
            window.photoData.stylePhotos = [];
        }
        
        // 初始化尺寸体型表单事件
        if (typeof initSizeTabsEvents === 'function') {
            try {
                initSizeTabsEvents();
            } catch (sizeError) {
                console.error('初始化尺寸表单事件时出错:', sizeError);
            }
        }
        
        // 显示模态框
        const modalElement = document.getElementById('newOrderFormModal');
        if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        } else {
            console.error('未找到模态框元素: newOrderFormModal');
            alert('打开编辑表单失败: 未找到模态框元素');
        }
    } catch (error) {
        console.error('显示新编辑订单表单出错:', error);
        alert('显示编辑订单表单失败: ' + error.message);
    }
}

// ... existing code ...

// 在文件开头添加一个重写alert的函数，支持回调功能
(function() {
    // 保存原始的alert函数
    const originalAlert = window.alert;
    
    // 添加一个自定义函数用于在alert关闭后执行回调
    window.customAlert = function(message, callback) {
        // 调用原始alert
        originalAlert(message);
        
        // alert执行完毕后立即调用回调
        if (typeof callback === 'function') {
            callback();
        }
    };
})();
// ... existing code ...

// 压缩订单数据并保存到localStorage
function saveOrdersWithCompression() {
    // 确保订单数组存在
    if (!window.orders || !Array.isArray(window.orders)) {
        console.error('保存失败：订单数据不是数组');
        throw new Error('订单数据格式错误');
    }
    
    try {
        console.log('开始压缩和优化订单数据...');
        
        // 清理每个订单对象中的冗余数据，特别是完全移除照片数据
        const cleanedOrders = window.orders.map(order => {
            // 使用已有的清理函数彻底清理照片数据
            return cleanOrderObject(order);
        });
        
        // 将清理后的订单数组序列化为JSON字符串
        const ordersJSON = JSON.stringify(cleanedOrders);
        console.log(`优化后的订单数据大小: ${(ordersJSON.length / 1024 / 1024).toFixed(2)}MB`);
        
        // 检查如果数据量仍然较大，尝试分块保存
        if (ordersJSON.length > 1000000) { // 如果超过1MB，使用分块存储
            console.log('订单数据较大，尝试分块保存...');
            
            // 分块保存大型数据
            const chunkSize = Math.floor(cleanedOrders.length / 4); 
            if (chunkSize > 0) {
                // 清除老数据
                localStorage.removeItem('orders');
                
                // 分块保存
                for (let i = 0; i < 4; i++) {
                    const startIdx = i * chunkSize;
                    const endIdx = (i === 3) ? cleanedOrders.length : (i + 1) * chunkSize;
                    const chunk = cleanedOrders.slice(startIdx, endIdx);
                    
                    // 分块数据再次确保没有照片数据
                    const safeChunk = chunk.map(cleanOrderObject);
                    
                    // 保存分块
                    console.log(`保存分块 ${i+1}/4: ${startIdx} 到 ${endIdx-1}, 共 ${safeChunk.length} 条订单`);
                    localStorage.setItem(`orders_chunk_${i}`, JSON.stringify(safeChunk));
                }
                
                // 保存分块标记
                localStorage.setItem('orders_chunked', 'true');
                localStorage.setItem('orders_chunk_count', '4');
                console.log('订单数据已分块保存');
                return true;
            } else {
                // 数据量少，直接保存
                console.log('尝试直接保存订单数据');
                localStorage.setItem('orders', ordersJSON);
                // 清除可能存在的分块标记
                localStorage.removeItem('orders_chunked');
                return true;
            }
        } else {
            // 数据量不大，直接保存
            console.log('数据量适中，直接保存订单数据');
            localStorage.setItem('orders', ordersJSON);
            // 清除可能存在的分块标记
            localStorage.removeItem('orders_chunked');
            return true;
        }
    } catch (error) {
        console.error('压缩保存订单失败:', error);
        
        // 如果是存储空间不足，尝试更激进的方法
        if (error.name === 'QuotaExceededError') {
            console.warn('存储空间不足，尝试更激进的优化措施...');
            
            try {
                // 只保留最近50条订单
                const recentOrders = [...window.orders]
                    .sort((a, b) => {
                        // 排序：首先按照交易日期降序，然后按照ID降序
                        const dateA = a.dealDate ? new Date(a.dealDate) : new Date(0);
                        const dateB = b.dealDate ? new Date(b.dealDate) : new Date(0);
                        const dateDiff = dateB - dateA;
                        if (dateDiff !== 0) return dateDiff;
                        return (b.id || '').localeCompare(a.id || '');
                    })
                    .slice(0, 50);
                
                console.log(`只保留最近50条订单，从${window.orders.length}条减少到${recentOrders.length}条`);
                
                // 极端清理每条订单数据，只保留最基本字段
                const minimalOrders = recentOrders.map(order => {
                    // 创建极简版订单，只保留关键字段
                    return {
                        id: order.id,
                        customerName: order.customerName,
                        dealDate: order.dealDate,
                        orderType: order.orderType,
                        fabricBrand: order.fabricBrand,
                        fabricCode: order.fabricCode,
                        totalPrice: order.totalPrice,
                        _bodyPhotoCount: order.bodyPhotos ? order.bodyPhotos.length : 0,
                        _stylePhotoCount: order.stylePhotos ? order.stylePhotos.length : 0
                    };
                });
                
                // 保存极简版订单数据
                localStorage.setItem('orders', JSON.stringify(minimalOrders));
                console.log('已保存极简版订单数据');
                
                // 保存原始订单数量，用于提示用户
                localStorage.setItem('original_order_count', window.orders.length.toString());
                
                // 更新内存中的订单数组，避免后续操作不一致
                window.orders = recentOrders;
                
                return true;
            } catch (emergencyError) {
                console.error('极端优化失败:', emergencyError);
                
                // 最后的挽救措施：只保存订单ID
                try {
                    const orderIds = window.orders.map(o => ({id: o.id}));
                    localStorage.setItem('order_ids_backup', JSON.stringify(orderIds));
                    console.log('紧急情况：只保存了订单ID列表');
                    return true;
                } catch (lastError) {
                    console.error('所有保存方法均失败，无法保存订单数据');
                    throw lastError;
                }
            }
        } else {
            throw error; // 继续向上抛出异常
        }
    }
}

// 清理订单对象中的冗余数据
function cleanOrderObject(order) {
    if (!order) return order;
    
    // 创建一个干净的对象副本
    const cleanOrder = {...order};
    
    // 完全清理照片数据，仅保留数量信息
    if (cleanOrder.bodyPhotos && Array.isArray(cleanOrder.bodyPhotos)) {
        // 记录照片数量，但不保存任何照片数据
        cleanOrder._bodyPhotoCount = cleanOrder.bodyPhotos.length;
        // 将照片数组替换为空数组
        cleanOrder.bodyPhotos = [];
    }
    
    if (cleanOrder.stylePhotos && Array.isArray(cleanOrder.stylePhotos)) {
        // 记录照片数量，但不保存任何照片数据
        cleanOrder._stylePhotoCount = cleanOrder.stylePhotos.length;
        // 将照片数组替换为空数组
        cleanOrder.stylePhotos = [];
    }
    
    // 删除其他可能包含大型数据的字段
    const fieldsToRemove = [
        'rawBodyPhotos', 
        'rawStylePhotos', 
        'photoData', 
        'temporaryPhotos', 
        'previewImages',
        'originalPhotos',
        'photoCache'
    ];
    
    // 删除需要移除的字段
    fieldsToRemove.forEach(field => {
        if (field in cleanOrder) {
            delete cleanOrder[field];
        }
    });
    
    // 删除null和undefined值
    Object.keys(cleanOrder).forEach(key => {
        if (cleanOrder[key] === null || cleanOrder[key] === undefined) {
            delete cleanOrder[key];
        }
    });
    
    return cleanOrder;
}

// 清理订单数据
function cleanupOrderData() {
    console.log('正在清理订单数据...');
    
    // 确认订单数组存在
    if (!window.orders || !Array.isArray(window.orders)) {
        console.error('清理失败：订单数据不是数组');
        throw new Error('订单数据格式错误');
    }
    
    // 按照日期排序，先保留最新的订单
    window.orders.sort((a, b) => {
        // 尝试解析日期
        const dateA = a.dealDate ? new Date(a.dealDate) : new Date(0);
        const dateB = b.dealDate ? new Date(b.dealDate) : new Date(0);
        return dateB - dateA; // 降序，最新的在前面
    });
    
    // 如果订单太多，只保留最近的200条
    if (window.orders.length > 200) {
        window.orders = window.orders.slice(0, 200);
        console.log('订单过多，只保留最近的200条');
    }
    
    // 清理所有订单对象
    window.orders = window.orders.map(order => cleanOrderObject(order));
    
    // 检查localStorage是否有其他可以清理的数据
    try {
        // 清理过期的临时数据
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('temp_') || key.startsWith('cache_'))) {
                localStorage.removeItem(key);
                console.log('已清理临时数据:', key);
            }
        }
    } catch (e) {
        console.error('清理临时数据失败:', e);
    }
    
    console.log('订单数据清理完成');
}

// 加载订单数据时也需要处理分块存储的情况
window.loadOrders = function() {
    try {
        // 检查是否使用了分块存储
        const isChunked = localStorage.getItem('orders_chunked') === 'true';
        
        if (isChunked) {
            // 从分块中加载数据
            const chunkCount = parseInt(localStorage.getItem('orders_chunk_count') || '4');
            let orders = [];
            
            for (let i = 0; i < chunkCount; i++) {
                const chunkData = localStorage.getItem(`orders_chunk_${i}`);
                if (chunkData) {
                    const chunk = JSON.parse(chunkData);
                    if (Array.isArray(chunk)) {
                        orders = orders.concat(chunk);
                    }
                }
            }
            
            if (orders.length > 0) {
                window.orders = orders;
                console.log(`从${chunkCount}个数据块中成功加载了${orders.length}条订单`);
                return true;
            }
        } else {
            // 正常加载
            const savedOrdersStr = localStorage.getItem('orders');
            if (savedOrdersStr) {
                const savedOrders = JSON.parse(savedOrdersStr);
                if (Array.isArray(savedOrders)) {
                    window.orders = savedOrders;
                    console.log(`成功加载了${savedOrders.length}条订单`);
                    return true;
                }
            }
        }
        
        // 如果没有找到有效数据，初始化为空数组
        window.orders = [];
        console.log('未找到保存的订单，初始化为空数组');
        return false;
    } catch (error) {
        console.error('加载订单数据失败:', error);
        window.orders = [];
        return false;
    }
};
// ... existing code ...

// 全局保存订单函数，使用压缩存储
window.saveOrders = function() {
    console.log('执行全局saveOrders函数...');
    
    // 使用新的压缩存储函数保存订单
    try {
        saveOrdersWithCompression();
        console.log('订单数据已压缩保存到localStorage');
        return true;
    } catch (storageError) {
        if (storageError.name === 'QuotaExceededError') {
            console.warn('存储空间不足，尝试清理数据后再保存...');
            // 清理数据
            cleanupOrderData();
            // 再次尝试保存
            saveOrdersWithCompression();
            console.log('清理后成功保存订单数据');
            return true;
        } else {
            console.error('保存订单失败:', storageError);
            throw storageError; // 继续向上抛出异常
        }
    }
};
// ... existing code ...

// 显示订单预览模态窗口
function showOrderPreview(orderId) {
    try {
        console.log('显示订单预览:', orderId);
        
        // 查找订单数据
        const order = window.orders.find(o => o.id === orderId);
        
        if (!order) {
            console.error('未找到订单:', orderId);
            alert('未找到订单');
            return;
        }
        
        // 设置模态窗口标题
        const titleElement = document.getElementById('orderPreviewModalTitle');
        if (titleElement) {
            const orderType = order.orderType || '订单';
            const customerName = order.customerName || '';
            titleElement.textContent = `${customerName}   ${orderType}`;
        }
        
        // 直接渲染各部分内容，不加载照片
        renderPreviewBasicInfo(order);
        renderPreviewStyleInfo(order);
        renderPreviewSizeInfo(order);
        renderPreviewOtherInfo(order);
        
        // 设置导出PDF按钮事件
        const exportPdfBtn = document.getElementById('exportOrderToPdf');
        if (exportPdfBtn) {
            // 移除旧事件监听器
            const newBtn = exportPdfBtn.cloneNode(true);
            exportPdfBtn.parentNode.replaceChild(newBtn, exportPdfBtn);
            
            // 添加新事件监听器
            newBtn.addEventListener('click', function() {
                exportOrderToPdf(order);
            });
        }
        
        // 显示模态窗口
        const previewModal = new bootstrap.Modal(document.getElementById('orderPreviewModal'));
        previewModal.show();
    } catch (error) {
        console.error('显示订单预览时出错:', error);
        alert('显示订单预览失败: ' + error.message);
    }
}

// ... 其他函数将在下面添加

// 渲染预览的基本信息部分
function renderPreviewBasicInfo(order) {
    const container = document.getElementById('previewBasicInfo');
    if (!container) return;
    
    container.innerHTML = '';
    
    // 基本信息字段（按顺序）
    const basicFields = [
        { id: 'dealDate', label: '成交日期' },
        { id: 'customerName', label: '客户姓名' },
        { id: 'gender', label: '性别' },
        { id: 'height', label: '身高(CM)' },
        
        { id: 'weight', label: '体重(KG)' },
        { id: 'birthDate', label: '出生日期' },
        { id: 'usageScenario', label: '使用场景' },
        { id: 'customerOccupation', label: '客户职业' },
        
        { id: 'customerSource', label: '客户来源' },
        { id: 'fabricBrand', label: '面料品牌' },
        { id: 'fabricCode', label: '面料编号' },
        { id: 'color', label: '颜色' },
        
        { id: 'fabricAmount', label: '用料(米)' },
        { id: 'size', label: '尺码' },
        { id: 'configuration', label: '配置' },
        { id: 'manufacturer', label: '厂家' },
        
        { id: 'semifinishedDate', label: '半成品日期' },
        { id: 'cuttingDate', label: '下料日期' },
        { id: 'orderDate', label: '下单日期' },
        { id: 'deliveryDate', label: '交货日期' },
        
        { id: 'totalPrice', label: '总价格(元)' },
        { id: 'prepaidAmount', label: '预付款(元)' },
        { id: 'remark', label: '备注' }
    ];
    
    // 每行4个字段
    let currentRow;
    basicFields.forEach((field, index) => {
        // 每行开始创建新的行容器
        if (index % 4 === 0) {
            currentRow = document.createElement('div');
            currentRow.className = 'row mb-2';
            container.appendChild(currentRow);
        }
        
        // 创建列容器
        const col = document.createElement('div');
        col.className = 'col-md-3';
        
        // 创建字段容器
        const fieldContainer = document.createElement('div');
        fieldContainer.className = 'd-flex align-items-center';
        
        // 创建标签
        const label = document.createElement('span');
        label.className = 'text-muted me-2';
        label.style.minWidth = '70px';
        label.textContent = field.label + '：';
        
        // 创建值
        const value = document.createElement('span');
        value.className = 'fw-medium';
        
        // 根据字段类型设置值
        let displayValue = order[field.id] || '--';
        
        // 对特殊字段进行格式化
        if (field.id === 'fabricAmount' && order[field.id]) {
            displayValue = order[field.id] + ' 米';
        } else if (field.id === 'size' && order[field.id]) {
            displayValue = order[field.id] + ' 码';
        } else if (field.id === 'totalPrice' && order[field.id]) {
            displayValue = order[field.id] + ' 元';
        } else if (field.id === 'prepaidAmount' && order[field.id]) {
            displayValue = order[field.id] + ' 元';
        } else if (field.id === 'height' && order[field.id]) {
            displayValue = order[field.id] + ' CM';
        } else if (field.id === 'weight' && order[field.id]) {
            displayValue = order[field.id] + ' KG';
        }
        
        value.textContent = displayValue;
        
        // 组装字段容器
        fieldContainer.appendChild(label);
        fieldContainer.appendChild(value);
        
        // 将字段容器添加到列
        col.appendChild(fieldContainer);
        
        // 将列添加到当前行
        currentRow.appendChild(col);
    });
}

// 渲染预览的款式信息部分
function renderPreviewStyleInfo(order) {
    const container = document.getElementById('previewStyleInfo');
    if (!container) return;
    
    container.innerHTML = '';
    
    // 判断订单类型，显示对应的款式信息
        const orderType = order.orderType || '西服西裤';
    
    // 西服款式（如适用）
    if (orderType.includes('西服') || orderType === '单西') {
        const suitSection = document.createElement('div');
        suitSection.className = 'mb-4';
        
        // 添加西服款式标题
        const suitTitle = document.createElement('h6');
        suitTitle.className = 'mb-3 border-bottom pb-2';
        suitTitle.textContent = '西服款式';
        suitSection.appendChild(suitTitle);
        
        // 西服款式字段
        const suitFields = [
            { id: 'suitFit', label: '版型' },
            { id: 'suitLapelStyle', label: '领型' },
            { id: 'suitButtonCount', label: '前片止口' },
            { id: 'suitVent', label: '背后开衩' },
            
            { id: 'suitSleeveButtons', label: '袖口开衩' },
            { id: 'suitSleeveButtonholes', label: '袖口眼颜色' },
            { id: 'suitHemStyle', label: '下摆' },
            { id: 'suitPenPocket', label: '笔袋' },
            
            { id: 'suitLapelHole', label: '驳头眼' },
            { id: 'suitPearlEdgeColor', label: '珠边颜色' },
            { id: 'suitLapelWidth', label: '驳头宽度' },
            { id: 'suitLapelHoleColor', label: '驳头眼颜色' },
            
            { id: 'suitButtonNumber', label: '纽扣编号' },
            { id: 'suitCollarFelt', label: '领底绒' },
            { id: 'suitLiningNumber', label: '里布编号' },
            { id: 'suitChestPocket', label: '胸兜' },
            
            { id: 'suitPocket', label: '腰兜' },
            { id: 'suitTicketPocket', label: '票袋' },
            { id: 'suitEmbroideryContent', label: '刺绣内容' },
            { id: 'suitEmbroideryFont', label: '刺绣字体' },
            
            { id: 'suitEmbroideryPattern', label: '刺绣图案' },
            { id: 'suitEmbroideryColor', label: '刺绣颜色' },
            { id: 'suitRemark', label: '备注' }
        ];
        
        // 渲染西服款式字段
        renderStyleFields(suitSection, suitFields, order);
        container.appendChild(suitSection);
    }
    
    // 裤子款式（如适用）
    if (orderType.includes('西裤') || orderType === '单裤') {
        const pantsSection = document.createElement('div');
        pantsSection.className = 'mb-4';
        
        // 添加裤子款式标题
        const pantsTitle = document.createElement('h6');
        pantsTitle.className = 'mb-3 border-bottom pb-2';
        pantsTitle.textContent = '裤子款式';
        pantsSection.appendChild(pantsTitle);
        
        // 裤子款式字段
        const pantsFields = [
            { id: 'pantsFit', label: '版型' },
            { id: 'pantsWaist', label: '裤腰' },
            { id: 'pantsPleats', label: '裤褶' },
            { id: 'pantsSidePocket', label: '裤侧袋' },
            
            { id: 'pantsBackPocket', label: '后袋' },
            { id: 'pantsHem', label: '裤脚口' },
            { id: 'pantsLining', label: '内里' },
            { id: 'pantsStyle', label: '款式' },
            
            { id: 'pantsEmbroideryContent', label: '刺绣内容' },
            { id: 'pantsEmbroideryFont', label: '刺绣字体' },
            { id: 'pantsEmbroideryColor', label: '刺绣颜色' },
            { id: 'pantsRemark', label: '备注' }
        ];
        
        // 渲染裤子款式字段
        renderStyleFields(pantsSection, pantsFields, order);
        container.appendChild(pantsSection);
    }
    
    // 马甲款式（如适用）
    if (orderType.includes('马甲')) {
        const vestSection = document.createElement('div');
        vestSection.className = 'mb-4';
        
        // 添加马甲款式标题
        const vestTitle = document.createElement('h6');
        vestTitle.className = 'mb-3 border-bottom pb-2';
        vestTitle.textContent = '马甲款式';
        vestSection.appendChild(vestTitle);
        
        // 马甲款式字段
        const vestFields = [
            { id: 'vestFit', label: '版型' },
            { id: 'vestCollar', label: '领型' },
            { id: 'vestFront', label: '门襟' },
            { id: 'vestChestPocket', label: '胸口袋' },
            
            { id: 'vestPocket', label: '下口袋' },
            { id: 'vestHem', label: '下摆型' },
            { id: 'vestBack', label: '后背' },
            { id: 'vestLining', label: '里布' },
            
            { id: 'vestRemark', label: '备注' }
        ];
        
        // 渲染马甲款式字段
        renderStyleFields(vestSection, vestFields, order);
        container.appendChild(vestSection);
    }
    
    // 如果没有款式信息，显示提示
    if (container.children.length === 0) {
        const noDataMsg = document.createElement('p');
        noDataMsg.className = 'text-center text-muted';
        noDataMsg.textContent = '暂无款式信息';
        container.appendChild(noDataMsg);
    }
}

// 辅助函数：渲染款式字段
function renderStyleFields(container, fields, order) {
    let currentRow;
    fields.forEach((field, index) => {
        // 每行开始创建新的行容器
        if (index % 4 === 0) {
            currentRow = document.createElement('div');
            currentRow.className = 'row mb-2';
            container.appendChild(currentRow);
        }
        
        // 创建列容器
        const col = document.createElement('div');
        col.className = 'col-md-3';
        
        // 创建字段容器
        const fieldContainer = document.createElement('div');
        fieldContainer.className = 'd-flex align-items-center';
        
        // 创建标签
        const label = document.createElement('span');
        label.className = 'text-muted me-2';
        label.style.minWidth = '70px';
        label.textContent = field.label + '：';
        
        // 创建值
        const value = document.createElement('span');
        value.className = 'fw-medium';
        value.textContent = order[field.id] || '--';
        
        // 组装字段容器
        fieldContainer.appendChild(label);
        fieldContainer.appendChild(value);
        
        // 将字段容器添加到列
        col.appendChild(fieldContainer);
        
        // 将列添加到当前行
        currentRow.appendChild(col);
    });
}

// 渲染预览的尺寸体型部分
function renderPreviewSizeInfo(order) {
    const container = document.getElementById('previewSizeInfo');
    if (!container) return;
    
    container.innerHTML = '';
    
    // 创建左右布局的容器
    const rowContainer = document.createElement('div');
    rowContainer.className = 'row';
    container.appendChild(rowContainer);
    
    // 检查是否为西服西裤马甲类型
    const orderType = order.orderType || '';
    const isSuitPantsVest = orderType === '西服西裤马甲';
    
    // 根据订单类型调整列宽
    const colWidth = isSuitPantsVest ? 'col-md-4' : 'col-md-6';
    
    // 上衣尺寸部分 - 左侧
    if (isJacketOrder(order)) {
        const jacketSection = document.createElement('div');
        jacketSection.className = colWidth + ' mb-4';
        
        // 添加上衣尺寸标题
        const jacketTitle = document.createElement('h6');
        jacketTitle.className = 'mb-3 border-bottom pb-2';
        // 如果是西服西裤马甲类型，修改标题
        jacketTitle.textContent = isSuitPantsVest ? '西服尺寸' : '上衣/衬衣/马甲/大衣尺寸';
        jacketTitle.style.fontSize = '1rem'; // 设置较小的字体大小
        jacketTitle.style.color = '#333';    // 设置字体颜色
        jacketTitle.style.fontWeight = 'normal'; // 设置加粗
        jacketSection.appendChild(jacketTitle);

        
        // 创建表格显示净尺寸和成衣尺寸
        const table = document.createElement('table');
        table.className = 'table table-sm table-bordered';
        table.style.fontSize = '1rem'; // 设置较小的字体大小
        
        // 创建表头
        const thead = document.createElement('thead');
        thead.className = 'table-light';
        const headerRow = document.createElement('tr');
        ['部位', '净尺寸 cm', '成衣尺寸 cm'].forEach(text => {
            const th = document.createElement('th');
            th.className = 'text-center';
            th.textContent = text;
            th.style.fontSize = '1rem';           // 设置字体大小
            th.style.color = '#333';                // 设置字体颜色
            th.style.fontWeight = 'normal';           // 设置加粗
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // 创建表体
        const tbody = document.createElement('tbody');
        
        // 上衣尺寸字段
        const jacketSizeFields = [
            { netId: 'jacketNetCollar', finishedId: 'jacketFinishedCollar', label: '领口' },
            { netId: 'jacketNetChest', finishedId: 'jacketFinishedChest', label: '胸围' },
            { netId: 'jacketNetWaist', finishedId: 'jacketFinishedWaist', label: '中腰' },
            { netId: 'jacketNetChestHeight', finishedId: 'jacketFinishedChestHeight', label: '胸高' },
            { netId: 'jacketNetBelly', finishedId: 'jacketFinishedBelly', label: '肚围' },
            { netId: 'jacketNetShoulder', finishedId: 'jacketFinishedShoulder', label: '肩宽' },
            { netId: 'jacketNetSleeveLength', finishedId: 'jacketFinishedSleeveLength', label: '袖长' },
            { netId: 'jacketNetSleeveWidth', finishedId: 'jacketFinishedSleeveWidth', label: '袖肥' },
            { netId: 'jacketNetCuff', finishedId: 'jacketFinishedCuff', label: '袖口' },
            { netId: 'jacketNetFrontLength', finishedId: 'jacketFinishedFrontLength', label: '前衣长' },
            { netId: 'jacketNetBackLength', finishedId: 'jacketFinishedBackLength', label: '后衣长' },
            { netId: 'jacketNetHem', finishedId: 'jacketFinishedHem', label: '下摆' }
        ];
        
        // 添加尺寸行
        jacketSizeFields.forEach(field => {
            const row = document.createElement('tr');
            
            // 添加部位名称
            const labelCell = document.createElement('td');
            labelCell.className = 'fw-medium text-center';
            labelCell.textContent = field.label;
            labelCell.style.fontSize = '1rem';           // 设置字体大小
            labelCell.style.color = '#333';                // 设置字体颜色
            labelCell.style.fontWeight = 'bold';           // 设置加粗
            row.appendChild(labelCell);
            
            // 添加净尺寸
            const netCell = document.createElement('td');
            netCell.className = 'text-center';
            netCell.textContent = order[field.netId] ? order[field.netId] : '--';
            netCell.style.fontSize = '1rem';           // 设置字体大小
            netCell.style.color = '#333';                // 设置字体颜色
            netCell.style.fontWeight = 'bold';           // 设置加粗
            row.appendChild(netCell);
            
            // 添加成衣尺寸
            const finishedCell = document.createElement('td');
            finishedCell.className = 'text-center';
            finishedCell.textContent = order[field.finishedId] ? order[field.finishedId] : '--';
            finishedCell.style.fontSize = '1rem';           // 设置字体大小
            finishedCell.style.color = '#333';                // 设置字体颜色
            finishedCell.style.fontWeight = 'bold';           // 设置加粗
            row.appendChild(finishedCell);
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        jacketSection.appendChild(table);
        rowContainer.appendChild(jacketSection);
    }
    
    // 裤子尺寸部分 - 中间
    if (isPantsOrder(order)) {
        const pantsSection = document.createElement('div');
        pantsSection.className = colWidth + ' mb-4';
        
        // 添加裤子尺寸标题
        const pantsTitle = document.createElement('h6');
        pantsTitle.className = 'mb-3 border-bottom pb-2';
        pantsTitle.textContent = '裤子尺寸';
        pantsSection.appendChild(pantsTitle);
        pantsTitle.style.fontSize = '1rem'; // 设置较小的字体大小
        pantsTitle.style.color = '#333';    // 设置字体颜色
        pantsTitle.style.fontWeight = 'normal'; // 设置加粗
        
        // 创建表格显示净尺寸和成衣尺寸
        const table = document.createElement('table');
        table.className = 'table table-sm table-bordered';
        table.style.fontSize = '1rem'; // 设置较小的字体大小
        
        // 创建表头
        const thead = document.createElement('thead');
        thead.className = 'table-light';
        const headerRow = document.createElement('tr');
        ['部位', '净尺寸 cm', '成衣尺寸 cm'].forEach(text => {
            const th = document.createElement('th');
            th.className = 'text-center';
            th.textContent = text;
            th.style.fontSize = '1rem';           // 设置字体大小
            th.style.color = '#333';                // 设置字体颜色
            th.style.fontWeight = 'normal';           // 设置加粗
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // 创建表体
        const tbody = document.createElement('tbody');
        
        // 裤子尺寸字段
        const pantsSizeFields = [
            { netId: 'pantsNetWaist', finishedId: 'pantsFinishedWaist', label: '裤腰' },
            { netId: 'pantsNetHip', finishedId: 'pantsFinishedHip', label: '臀围' },
            { netId: 'pantsNetCrotch', finishedId: 'pantsFinishedCrotch', label: '横裆' },
            { netId: 'pantsNetKnee', finishedId: 'pantsFinishedKnee', label: '膝围' },
            { netId: 'pantsNetCalf', finishedId: 'pantsFinishedCalf', label: '小腿围' },
            { netId: 'pantsNetHem', finishedId: 'pantsFinishedHem', label: '脚口' },
            { netId: 'pantsNetLength', finishedId: 'pantsFinishedLength', label: '裤长' },
            { netId: 'pantsNetOutLength', finishedId: 'pantsFinishedOutLength', label: '裙长' },
            { netId: 'pantsNetTotalCrotch', finishedId: 'pantsFinishedTotalCrotch', label: '总裆' }
        ];
        
        // 添加尺寸行
        pantsSizeFields.forEach(field => {
            const row = document.createElement('tr');
            
            // 添加部位名称
            const labelCell = document.createElement('td');
            labelCell.className = 'fw-medium text-center';
            labelCell.textContent = field.label;
            labelCell.style.fontSize = '1rem';           // 设置字体大小
            labelCell.style.color = '#333';                // 设置字体颜色
            labelCell.style.fontWeight = 'bold';           // 设置加粗
            row.appendChild(labelCell);
            
            // 添加净尺寸
            const netCell = document.createElement('td');
            netCell.className = 'text-center';
            netCell.textContent = order[field.netId] ? order[field.netId] : '--';
            netCell.style.fontSize = '1rem';           // 设置字体大小
            netCell.style.color = '#333';                // 设置字体颜色
            netCell.style.fontWeight = 'bold';           // 设置加粗
            row.appendChild(netCell);
            
            // 添加成衣尺寸
            const finishedCell = document.createElement('td');
            finishedCell.className = 'text-center';
            finishedCell.textContent = order[field.finishedId] ? order[field.finishedId] : '--';
            finishedCell.style.fontSize = '1rem';           // 设置字体大小
            finishedCell.style.color = '#333';                // 设置字体颜色
            finishedCell.style.fontWeight = 'bold';           // 设置加粗
            row.appendChild(finishedCell);
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        pantsSection.appendChild(table);
        rowContainer.appendChild(pantsSection);
    }
    
    // 马甲尺寸部分 - 右侧（仅当订单类型为西服西裤马甲时显示）
    if (isSuitPantsVest) {
        const vestSection = document.createElement('div');
        vestSection.className = colWidth + ' mb-4';
        
        // 添加马甲尺寸标题
        const vestTitle = document.createElement('h6');
        vestTitle.className = 'mb-3 border-bottom pb-2';
        vestTitle.textContent = '马甲尺寸';
        vestTitle.style.fontSize = '1rem';
        vestTitle.style.color = '#333';
        vestTitle.style.fontWeight = 'normal';
        vestSection.appendChild(vestTitle);
        
        // 创建表格显示净尺寸和成衣尺寸
        const table = document.createElement('table');
        table.className = 'table table-sm table-bordered';
        table.style.fontSize = '1rem';
        
        // 创建表头
        const thead = document.createElement('thead');
        thead.className = 'table-light';
        const headerRow = document.createElement('tr');
        ['部位', '净尺寸 cm', '成衣尺寸 cm'].forEach(text => {
            const th = document.createElement('th');
            th.className = 'text-center';
            th.textContent = text;
            th.style.fontSize = '1rem';
            th.style.color = '#333';
            th.style.fontWeight = 'normal';
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // 创建表体
        const tbody = document.createElement('tbody');
        
        // 马甲尺寸字段
        const vestSizeFields = [
            { netId: 'vestNetCollar', finishedId: 'vestFinishedCollar', label: '领口' },
            { netId: 'vestNetChest', finishedId: 'vestFinishedChest', label: '胸围' },
            { netId: 'vestNetWaist', finishedId: 'vestFinishedWaist', label: '中腰' },
            { netId: 'vestNetShoulder', finishedId: 'vestFinishedShoulder', label: '肩宽' },
            { netId: 'vestNetFrontLength', finishedId: 'vestFinishedFrontLength', label: '前衣长' },
            { netId: 'vestNetBackLength', finishedId: 'vestFinishedBackLength', label: '后衣长' },
            { netId: 'vestNetHem', finishedId: 'vestFinishedHem', label: '下摆' }
        ];
        
        // 添加尺寸行
        vestSizeFields.forEach(field => {
            const row = document.createElement('tr');
            
            // 添加部位名称
            const labelCell = document.createElement('td');
            labelCell.className = 'fw-medium text-center';
            labelCell.textContent = field.label;
            labelCell.style.fontSize = '1rem';
            labelCell.style.color = '#333';
            labelCell.style.fontWeight = 'bold';
            row.appendChild(labelCell);
            
            // 添加净尺寸
            const netCell = document.createElement('td');
            netCell.className = 'text-center';
            netCell.textContent = order[field.netId] ? order[field.netId] : '--';
            netCell.style.fontSize = '1rem';
            netCell.style.color = '#333';
            netCell.style.fontWeight = 'bold';
            row.appendChild(netCell);
            
            // 添加成衣尺寸
            const finishedCell = document.createElement('td');
            finishedCell.className = 'text-center';
            finishedCell.textContent = order[field.finishedId] ? order[field.finishedId] : '--';
            finishedCell.style.fontSize = '1rem';
            finishedCell.style.color = '#333';
            finishedCell.style.fontWeight = 'bold';
            row.appendChild(finishedCell);
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        vestSection.appendChild(table);
        rowContainer.appendChild(vestSection);
    }
            
            // 体型特征部分
            const bodyTypeSection = document.createElement('div');
            bodyTypeSection.className = 'mb-4';
            
            // 添加体型特征标题
            const bodyTypeTitle = document.createElement('h6');
            bodyTypeTitle.className = 'mb-3 border-bottom pb-2';
            bodyTypeTitle.textContent = '体型特征';
            bodyTypeSection.appendChild(bodyTypeTitle);
            
            // 体型特征字段
            const bodyTypeFields = [
                { id: 'bodyBelly', label: '腹部' },
                { id: 'bodyConcaveBelly', label: '凹腰挺肚' },
                { id: 'bodyChest', label: '胸型' },
                { id: 'bodyBack', label: '背型' },
                
                { id: 'bodyShoulder', label: '溜肩型' },
                { id: 'bodyHighLowShoulder', label: '高低肩' },
                { id: 'bodyShoulderProtrude', label: '冲肩型' },
                { id: 'bodyLeanBack', label: '后仰' },
                
                { id: 'bodySleeve', label: '手袖位移' },
                { id: 'bodyNote', label: '备注' }
            ];
    
    // 渲染体型特征字段
    let currentRow;
    bodyTypeFields.forEach((field, index) => {
        // 每行开始创建新的行容器
        if (index % 4 === 0) {
            currentRow = document.createElement('div');
            currentRow.className = 'row mb-2';
            bodyTypeSection.appendChild(currentRow);
        }
        
        // 创建列容器
        const col = document.createElement('div');
        col.className = 'col-md-3';
        
        // 创建字段容器
        const fieldContainer = document.createElement('div');
        fieldContainer.className = 'd-flex align-items-center';
        
        // 创建标签
        const label = document.createElement('span');
        label.className = 'text-muted me-2';
        label.style.minWidth = '70px';
        label.textContent = field.label + '：';
        
        // 创建值
        const value = document.createElement('span');
        value.className = 'fw-medium';
        value.textContent = order[field.id] || '--';
        
        // 组装字段容器
        fieldContainer.appendChild(label);
        fieldContainer.appendChild(value);
        
        // 将字段容器添加到列
        col.appendChild(fieldContainer);
        
        // 将列添加到当前行
        currentRow.appendChild(col);
    });
    
    container.appendChild(bodyTypeSection);
    
    // 如果没有尺寸信息，显示提示
    if (container.children.length === 0) {
        const noDataMsg = document.createElement('p');
        noDataMsg.className = 'text-center text-muted';
        noDataMsg.textContent = '暂无尺寸体型信息';
        container.appendChild(noDataMsg);
    }
}

// 渲染预览的其他信息部分
function renderPreviewOtherInfo(order) {
    const container = document.getElementById('previewOtherInfo');
    if (!container) return;
    
    container.innerHTML = '';
    
    // 其他信息字段 - 修正字段名与表单一致
    const otherFields = [
        // 已删除体型照和款式照字段
        { id: 'designer', label: '设计师' },
        { id: 'measurer', label: '量体师' },
        
        { id: 'fabricCheck', label: '面料库存' },
        { id: 'reminderForComment', label: '客户写评价' },
        { id: 'otherNotes', label: '备注' }
    ];
    
    // 每行4个字段
    let currentRow;
    otherFields.forEach((field, index) => {
        // 每行开始创建新的行容器
        if (index % 4 === 0) {
            currentRow = document.createElement('div');
            currentRow.className = 'row mb-2';
            container.appendChild(currentRow);
        }
        
        // 创建列容器
        const col = document.createElement('div');
        col.className = (field.type === 'image') ? 'col-md-6' : 'col-md-3';
        
        // 创建字段容器
        const fieldContainer = document.createElement('div');
        
        // 图片类型使用上下排列，其他类型使用左右排列
        if (field.type === 'image') {
            fieldContainer.className = 'd-flex flex-column';
            
            // 创建标签
            const label = document.createElement('small');
            label.className = 'text-muted mb-1';
            label.textContent = field.label;
            fieldContainer.appendChild(label);
            
            if (field.type === 'image' && order[field.id]) {
                // 单张照片
                const img = document.createElement('img');
                img.src = order[field.id];
                img.className = 'img-thumbnail';
                img.style.maxHeight = '150px';
                img.style.cursor = 'pointer';
                img.setAttribute('data-bs-toggle', 'modal');
                img.setAttribute('data-bs-target', '#imagePreviewModal');
                img.onclick = function() {
                    document.getElementById('imagePreviewModalTitle').textContent = field.label;
                    document.getElementById('imagePreviewModalImg').src = order[field.id];
                };
                fieldContainer.appendChild(img);
            } else {
                const noImage = document.createElement('div');
                noImage.className = 'border text-center p-3 text-muted';
                noImage.textContent = '暂无图片';
                fieldContainer.appendChild(noImage);
            }
        } else {
            fieldContainer.className = 'd-flex align-items-center';
            
            // 创建标签
            const label = document.createElement('span');
            label.className = 'text-muted me-2';
            label.style.minWidth = '90px'; // 增加宽度，因为"核实面料库存"等文字较长
            label.textContent = field.label + '：';
            fieldContainer.appendChild(label);
            
            // 创建值
            const value = document.createElement('span');
            value.className = 'fw-medium';
            value.textContent = order[field.id] || '--';
            fieldContainer.appendChild(value);
        }
        
        // 将字段容器添加到列
        col.appendChild(fieldContainer);
        
        // 将列添加到当前行
        currentRow.appendChild(col);
        
        // 如果是图片类型，调整索引以确保下一个元素在新行开始
        if (field.type === 'image') {
            index++;
        }
    });
    
}
        
        // 辅助函数：判断是否为上衣订单
        function isJacketOrder(order) {
            const type = order.orderType || '';
            return type.includes('西服') || type.includes('单西') || type.includes('马甲') || type.includes('衬衣') || type.includes('大衣');
        }

        // 辅助函数：判断是否为裤子订单
        function isPantsOrder(order) {
            const type = order.orderType || '';
            return type.includes('西裤') || type === '单裤';
        }

// 从IndexedDB加载订单照片并显示在预览区域
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
        try {
            if (typeof photoStorage.getOrderBodyPhotos === 'function' && photoType === 'bodyPhotos') {
                photos = await photoStorage.getOrderBodyPhotos(orderId);
            } else if (typeof photoStorage.getOrderStylePhotos === 'function' && photoType === 'stylePhotos') {
                photos = await photoStorage.getOrderStylePhotos(orderId);
            } else if (typeof photoStorage.getPhotos === 'function') {
                photos = await photoStorage.getPhotos(orderId, photoType);
            }
        } catch (error) {
            console.error(`从IndexedDB加载${photoType}照片失败:`, error);
        }
        
        // 如果成功加载照片，显示照片
        if (photos && Array.isArray(photos) && photos.length > 0) {
            console.log(`成功从IndexedDB加载${photos.length}张${photoType}照片`);
            renderPhotoThumbnails(photos, container);
        } else {
            // 尝试从订单数据直接加载照片
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

// 渲染照片缩略图
function renderPhotoThumbnails(photos, container) {
    if (!photos || photos.length === 0) {
        showNoPhotosMessage(container);
        return;
    }
    
    photos.forEach((photo, index) => {
        if (!photo || (!photo.dataUrl && !photo.url && !photo.src)) {
            return; // 跳过无效照片
        }
        
        // 获取照片URL
        const photoUrl = photo.dataUrl || photo.url || photo.src;
        if (!photoUrl) return;
        
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

// 显示无照片消息
function showNoPhotosMessage(container) {
    container.innerHTML = '<div class="text-center text-muted p-3 border">暂无照片</div>';
}

// 导出订单预览为PDF
function exportOrderToPdf(order) {
    try {
        // 获取预览内容元素
        const content = document.getElementById('orderPreviewContent');
        if (!content) {
            console.error('未找到预览内容元素');
            alert('导出失败：未找到预览内容');
            return;
        }

        // 创建一个深拷贝，避免修改原始DOM
        const contentClone = content.cloneNode(true);
        
        // PDF文件名
        let filename = '订单明细';
        if (order && order.customerName) {
            filename = order.dealDate + '_' + order.customerName + '_' + (order.orderType || '订单明细');
        }
        
        // 添加页眉
        const header = document.createElement('div');
        header.style.textAlign = 'center';
        header.style.marginBottom = '10px';
        
        const title = document.createElement('h2');
        title.textContent = '尚荣定制 - ' + filename;
        title.style.marginBottom = '5px';
        
        const subtitle = document.createElement('p');
        subtitle.textContent = '订单日期: ' + (order.dealDate || new Date().toLocaleDateString());
        subtitle.style.fontSize = '14px';
        subtitle.style.color = '#666';
        
        header.appendChild(title);
        header.appendChild(subtitle);
        
        // 在克隆内容前插入页眉
        contentClone.insertBefore(header, contentClone.firstChild);
        
        // 调整PDF内容宽度，避免数据换行
        contentClone.style.width = '1000px'; // 增加PDF内容宽度
        
        // 调整表格宽度，让数据不用换行显示
        const tables = contentClone.querySelectorAll('table');
        tables.forEach(table => {
            table.style.width = '100%';
            table.style.tableLayout = 'fixed';
            
            // 调整表格中的单元格，防止内容换行
            const cells = table.querySelectorAll('td');
            cells.forEach(cell => {
                cell.style.whiteSpace = 'nowrap';
                cell.style.overflow = 'visible';
                cell.style.width = 'auto';
            });

            // 为每个表格添加保持表格完整性的样式
            table.style.pageBreakInside = 'avoid'; // 防止表格在页面中间断开
            
            // 查找表格的父容器，通常是section
            let tableParent = table.parentElement;
            while (tableParent && !tableParent.classList.contains('preview-section') && tableParent !== contentClone) {
                tableParent = tableParent.parentElement;
            }
            
            // 为父容器也添加分页控制
            if (tableParent && tableParent.classList.contains('preview-section')) {
                tableParent.style.pageBreakInside = 'avoid';
            }
        });
        
        // 为每个section添加分页避免属性，确保内容不会在页面之间截断
        const sections = contentClone.querySelectorAll('.preview-section');
        sections.forEach(section => {
            section.style.pageBreakInside = 'avoid'; // 避免节内分页
            section.style.breakInside = 'avoid'; // 新规范属性支持
            section.style.display = 'block'; // 确保块级显示以应用分页规则
        });
        
        // 设置PDF导出配置
        const opt = {
            margin: [0, 5, 0, 5], // 上右下左
            filename: filename + '.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 3,
                useCORS: true,
                logging: false,
                width: 1000 // 设置渲染宽度
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a3', // 改为A3纸，提供更宽的显示区域
                orientation: 'landscape' // 使用横向布局以获得更多水平空间
            },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] } // 启用智能分页避免规则
        };
        
        // 显示加载状态
        document.body.style.cursor = 'wait';
        const exportBtn = document.getElementById('exportOrderToPdf');
        if (exportBtn) {
            exportBtn.disabled = true;
            exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>导出中...';
        }
        
        // 执行PDF导出
        html2pdf().set(opt).from(contentClone).save().then(() => {
            // 恢复按钮状态
            if (exportBtn) {
                exportBtn.disabled = false;
                exportBtn.innerHTML = '<i class="fas fa-file-pdf me-1"></i>导出PDF';
            }
            document.body.style.cursor = 'default';
            console.log('PDF导出成功');
        }).catch(error => {
            console.error('PDF导出失败:', error);
            alert('PDF导出失败: ' + error.message);
            // 恢复按钮状态
            if (exportBtn) {
                exportBtn.disabled = false;
                exportBtn.innerHTML = '<i class="fas fa-file-pdf me-1"></i>导出PDF';
            }
            document.body.style.cursor = 'default';
        });
    } catch (error) {
        console.error('PDF导出发生错误:', error);
        alert('PDF导出失败: ' + error.message);
        document.body.style.cursor = 'default';
    }
}

// 显示订单预览
function showOrderPreview(orderId) {
    try {
        // 获取订单数据
        const order = window.orders.find(o => o.id === orderId);
        if (!order) {
            console.error('未找到指定订单:', orderId);
            alert('无法预览：未找到指定订单');
            return;
        }
        
        // 设置标题为 "订单日期 - 客户姓名 - 订单类型"
        document.getElementById('orderPreviewModalTitle').textContent = 
        order.dealDate + ' - ' + order.customerName + ' - ' + (order.orderType || '订单详情');
        
        // 渲染预览内容
        renderPreviewBasicInfo(order);
        renderPreviewStyleInfo(order);
        renderPreviewSizeInfo(order);
        renderPreviewOtherInfo(order);
        
        // 设置导出PDF按钮事件
        const exportPdfBtn = document.getElementById('exportOrderToPdf');
        if (exportPdfBtn) {
            // 移除旧事件监听器
            const newBtn = exportPdfBtn.cloneNode(true);
            exportPdfBtn.parentNode.replaceChild(newBtn, exportPdfBtn);
            
            // 添加新事件监听器
            newBtn.addEventListener('click', function() {
                exportOrderToPdf(order);
            });
        }
        
        // 显示预览模态窗口
        const modal = new bootstrap.Modal(document.getElementById('orderPreviewModal'));
        modal.show();
    } catch (error) {
        console.error('显示订单预览时出错:', error);
        alert('显示订单预览失败: ' + error.message);
    }
}

// ... existing code ...
// 导出函数到window全局对象，便于HTML中调用
if (typeof exportSelectedOrdersToExcel === 'function') {
    window.exportSelectedOrdersToExcel = exportSelectedOrdersToExcel;
}
if (typeof exportCompleteOrderContentToExcel === 'function') {
    window.exportCompleteOrderContentToExcel = exportCompleteOrderContentToExcel;
}
// ... existing code ...

function toggleStyleFormsByOrderType(orderType) {
    // ... 现有代码保持不变 ...
    
    try {
        // 获取所有款式表单
        const suitStyleForm = document.getElementById('suitStyleForm');
        const pantsStyleForm = document.getElementById('pantsStyleForm');
        const vestStyleForm = document.getElementById('vestStyleForm');
        const shirtStyleForm = document.getElementById('shirtStyleForm');
        const coatStyleForm = document.getElementById('coatStyleForm'); // 添加大衣款式表单
        
        // 检查表单元素是否存在
        if (!suitStyleForm) console.warn('未找到西服款式表单元素');
        if (!pantsStyleForm) console.warn('未找到裤子款式表单元素');
        if (!vestStyleForm) console.warn('未找到马甲款式表单元素');
        if (!shirtStyleForm) console.warn('未找到衬衣款式表单元素');
        if (!coatStyleForm) console.warn('未找到大衣款式表单元素');
        
        // 首先隐藏所有款式表单
        if (suitStyleForm) suitStyleForm.style.display = 'none';
        if (pantsStyleForm) pantsStyleForm.style.display = 'none';
        if (vestStyleForm) vestStyleForm.style.display = 'none';
        if (shirtStyleForm) shirtStyleForm.style.display = 'none';
        if (coatStyleForm) coatStyleForm.style.display = 'none';
        
        console.log('当前订单类型:', orderType);
        console.log('ORDER_TYPES值:', JSON.stringify(window.ORDER_TYPES || {}));
        
        // 获取尺寸表相关元素 - 直接通过id获取
        const jacketSizeSection = document.getElementById('jacketSizeSection');
        const pantsSizeSection = document.getElementById('pantsSizeSection');
        const vestSizeSection = document.getElementById('vestSizeSection');
        
        if (!jacketSizeSection) console.warn('未找到西服上衣尺寸部分');
        if (!pantsSizeSection) console.warn('未找到西裤尺寸部分');
        if (!vestSizeSection) console.warn('未找到马甲尺寸部分');
        
        // 默认隐藏所有尺寸表
        if (jacketSizeSection) jacketSizeSection.style.display = 'none';
        if (pantsSizeSection) pantsSizeSection.style.display = 'none';
        if (vestSizeSection) vestSizeSection.style.display = 'none';
        
        // 根据不同订单类型设置尺寸表标题
        if (jacketSizeSection) {
            const jacketSizeHeading = jacketSizeSection.querySelector('h6');
            if (jacketSizeHeading) {
                switch (orderType) {
                    case '单西':
                        jacketSizeHeading.textContent = '西服上衣尺寸';
                        break;
                    case '衬衣':
                        jacketSizeHeading.textContent = '衬衣尺寸';
                        break;
                    case '马甲':
                        jacketSizeHeading.textContent = '马甲尺寸';
                        break;
                    case '大衣':
                        jacketSizeHeading.textContent = '大衣尺寸';
                        break;
                    case '西服西裤':
                        jacketSizeHeading.textContent = '西服上衣尺寸';
                        break;
                    case '西服西裤马甲':
                        jacketSizeHeading.textContent = '西服上衣尺寸';
                        break;
                    default:
                        jacketSizeHeading.textContent = '上衣/衬衣/马甲/大衣尺寸';
                        break;
                }
            }
        }
        
        // 根据订单类型显示相应的款式表单和尺寸区域
        switch (orderType) {
            case '西服西裤': // 直接使用字符串常量，不依赖ORDER_TYPES
                if (suitStyleForm) suitStyleForm.style.display = 'block';
                if (pantsStyleForm) pantsStyleForm.style.display = 'block';
                // 显示相应的尺寸表
                if (jacketSizeSection) jacketSizeSection.style.display = 'block';
                if (pantsSizeSection) pantsSizeSection.style.display = 'block';
                break;
            case '西服西裤马甲':
                if (suitStyleForm) suitStyleForm.style.display = 'block';
                if (pantsStyleForm) pantsStyleForm.style.display = 'block';
                if (vestStyleForm) vestStyleForm.style.display = 'block';
                // 显示所有三个尺寸表
                if (jacketSizeSection) {
                    jacketSizeSection.style.display = 'block';
                    const jacketSizeHeading = jacketSizeSection.querySelector('h6');
                    if (jacketSizeHeading) {
                        jacketSizeHeading.textContent = '西服上衣尺寸';
                    }
                }
                if (pantsSizeSection) pantsSizeSection.style.display = 'block';
                if (vestSizeSection) vestSizeSection.style.display = 'block';
                break;
            case '单西':
                if (suitStyleForm) suitStyleForm.style.display = 'block';
                // 只显示上衣尺寸表
                if (jacketSizeSection) jacketSizeSection.style.display = 'block';
                break;
            case '大衣':
                if (coatStyleForm) coatStyleForm.style.display = 'block';
                // 只显示上衣尺寸表
                if (jacketSizeSection) jacketSizeSection.style.display = 'block';
                break;
            case '单裤':
                if (pantsStyleForm) pantsStyleForm.style.display = 'block';
                // 只显示裤子尺寸表
                if (pantsSizeSection) pantsSizeSection.style.display = 'block';
                break;
            case '衬衣':
                if (shirtStyleForm) shirtStyleForm.style.display = 'block';
                // 只显示上衣尺寸表
                if (jacketSizeSection) jacketSizeSection.style.display = 'block';
                break;
            case '马甲':
                if (vestStyleForm) vestStyleForm.style.display = 'block';
                // 显示马甲尺寸表
                if (vestSizeSection) {
                    vestSizeSection.style.display = 'block';
                } else {
                    // 如果没有专门的马甲尺寸表，使用通用上衣尺寸表
                    if (jacketSizeSection) {
                        jacketSizeSection.style.display = 'block';
                        const jacketSizeHeading = jacketSizeSection.querySelector('h6');
                        if (jacketSizeHeading) {
                            jacketSizeHeading.textContent = '马甲尺寸';
                        }
                    }
                }
                break;
            case '皮鞋':
                // 不显示任何款式表单，尺寸表也已在前面被隐藏
                break;
            case '现货衬衣':
                // 不显示款式表单，但显示上衣尺寸表
                if (jacketSizeSection) jacketSizeSection.style.display = 'block';
                break;
            case '领带':
            case '其他':
                // 这些类型保留选项卡标签，但内容为空
                // 不需要做任何处理，所有款式表单和尺寸表已在前面被隐藏
                break;
            default:
                console.warn(`未知的订单类型: ${orderType}`);
        }
        
        // 处理选项卡的显示
        const styleTab = document.getElementById('style-tab');
        const sizeTab = document.getElementById('size-tab');
        const othersTab = document.getElementById('others-tab');
        
        // 确保所有类型都显示所有选项卡标签
        if (styleTab) styleTab.parentElement.style.display = 'block';
        if (sizeTab) sizeTab.parentElement.style.display = 'block';
        if (othersTab) othersTab.parentElement.style.display = 'block';
        
        // 初始化尺寸字段默认值
        if (typeof initializeSizeFields === 'function') {
            initializeSizeFields();
        }
    } catch (error) {
        console.error('切换款式表单时出错:', error);
    }
}

