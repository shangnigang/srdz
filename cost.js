// 成本管理模块脚本

// 防止脚本重复初始化的标志
if (typeof window.costModuleInitialized !== 'undefined') {
    console.log('成本管理模块已经初始化，跳过重复初始化');
} else {
    window.costModuleInitialized = true;
    console.log('首次初始化成本管理模块');
}

// 全局变量
let filteredCosts = []; // 筛选后的运营成本
let filteredProductionCosts = []; // 筛选后的生产成本
let filteredAdCosts = []; // 筛选后的广告成本

// 数据缓存
const dataCache = {
    operating: {
        data: null,
        filtered: null,
        lastUpdate: null,
        rendered: false
    },
    production: {
        data: null,
        filtered: null,
        lastUpdate: null,
        rendered: false
    },
    ad: {
        data: null,
        filtered: null,
        lastUpdate: null,
        rendered: false
    }
};

// 分页相关变量
let currentOperatingPage = 1; // 当前运营成本页码
let currentProductionPage = 1; // 当前生产成本页码
let currentAdPage = 1; // 当前广告成本页码
let recordsPerPage = 10; // 每页显示10条记录

// 设置一个全局变量标记是否已从localStorage加载过生产成本数据
window.productionCostsLoaded = false;

// 初始化成本管理模块
function initCostModule() {
    console.log('正在初始化成本管理模块...');
    try {
        // 加载成本数据
        loadCostData();
        
        // 修复广告成本数据
        fixAdCostItemField();
        
        // 初始化模块切换功能
        initModuleSwitch();
        
        // 初始化子模块切换事件
        initSubModuleSwitchEvents();
        
        // 初始化成本表格事件
        addCostEventListeners();
        
        // 初始化全选复选框
        initSelectAllCheckboxes();
        
        // 初始化运营成本和广告成本图表
        setTimeout(() => {
            // 确保图表容器已经加载
            if (document.getElementById('operatingCostChart')) {
                initOperatingCostChart();
                console.log('运营成本图表初始化完成');
            } else {
                console.error('找不到运营成本图表容器');
            }
            
            if (document.getElementById('adCostChart')) {
                initAdCostChart();
                console.log('广告成本图表初始化完成');
            } else {
                console.error('找不到广告成本图表容器');
            }
        }, 300);
        
        // 设置默认日期范围（近3个月）
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 3);
        
        document.getElementById('costStartDate').value = formatDate(startDate);
        document.getElementById('costEndDate').value = formatDate(endDate);
        
        // 初始化筛选按钮事件
        const filterBtn = document.getElementById('filterCostBtn');
        if (filterBtn) {
            filterBtn.addEventListener('click', function() {
                renderCostTables(true);
            });
        }
        
        // 初始化重置筛选按钮事件
        const resetFilterBtn = document.getElementById('resetCostFilterBtn');
        if (resetFilterBtn) {
            resetFilterBtn.addEventListener('click', function() {
                document.getElementById('costStartDate').value = formatDate(startDate);
                document.getElementById('costEndDate').value = formatDate(endDate);
                document.getElementById('costSearchField').value = '';
                renderCostTables(true);
            });
        }
        
        // 初始化成本表格
        renderCostTables();
        
        // 根据保存的模块状态决定显示哪个模块
        const savedTab = sessionStorage.getItem('currentCostTab');
        if (savedTab) {
            const tabLink = document.querySelector(`.nav-link[data-module="${savedTab}"]`);
            if (tabLink) {
                // 在DOM加载完成后延迟执行，确保所有元素都已加载
                setTimeout(() => {
                    tabLink.click();
                }, 100);
            }
        } else {
            // 默认显示成本列表模块
            const defaultTab = document.querySelector('.nav-link[data-module="costModule"]');
            if (defaultTab) {
                setTimeout(() => {
                    defaultTab.click();
                }, 100);
            }
        }
        
        console.log('成本管理模块初始化完成');
        return true;
    } catch (error) {
        console.error('初始化成本管理模块时发生错误:', error);
        return false;
    }
}

// 初始化广告成本数据
function initAdCostData() {
    console.log('初始化广告成本数据...');
    try {
        // 从localStorage加载广告成本数据
        const savedAdCosts = localStorage.getItem('adCosts');
        if (savedAdCosts) {
            try {
                window.adCosts = JSON.parse(savedAdCosts);
                console.log(`从localStorage加载了${window.adCosts.length}条广告成本数据`);
            } catch (e) {
                console.error('解析广告成本数据失败:', e);
                window.adCosts = [];
            }
        } else {
            console.log('localStorage中没有广告成本数据');
            window.adCosts = [];
        }
        
        // 确保window.adCosts是数组
        if (!Array.isArray(window.adCosts)) {
            console.warn('window.adCosts不是数组，重置为空数组');
            window.adCosts = [];
        }
        
        // 确保我们有最新的数据
        dataCache.ad.data = window.adCosts;
        dataCache.ad.lastUpdate = new Date();
        
        console.log(`广告成本初始化完成，共${window.adCosts.length}条数据`);
        return window.adCosts;
    } catch (error) {
        console.error('初始化广告成本数据失败:', error);
        return [];
    }
}

// 生成广告成本测试数据
function generateAdCostTestData() {
    console.log('生成广告成本测试数据...');
    
    // 确保广告成本数组已创建
    if (!window.adCosts) {
        window.adCosts = [];
    }
    
    // 广告平台列表
    const adPlatforms = ['小红书', '抖音', '快手', '视频号', '美团', '地图', '老客户推荐', '老客户', '其他'];
    
    // 生成20条测试数据
    for (let i = 1; i <= 20; i++) {
        // 创建随机日期（近6个月内）
        const today = new Date();
        const randomDate = new Date(today);
        randomDate.setDate(today.getDate() - Math.floor(Math.random() * 180));
        
        // 随机选择平台
        const platform = adPlatforms[Math.floor(Math.random() * adPlatforms.length)];
        
        // 随机金额，不同平台有不同范围
        let amount;
        switch (platform) {
            case '抖音':
                amount = 2000 + Math.random() * 8000;
                break;
            case '小红书':
                amount = 1000 + Math.random() * 4000;
                break;
            case '快手':
                amount = 1500 + Math.random() * 3500;
                break;
            default:
                amount = 500 + Math.random() * 2500;
        }
        
        // 创建广告成本记录
        const adCost = {
            id: `AD${String(i).padStart(4, '0')}`,
            date: formatDate(randomDate),
            costType: '广告成本',
            costItem: platform,
            amount: amount.toFixed(2),
            notes: `${platform}推广费用 - ${formatDate(randomDate)}`
        };
        
        // 添加到广告成本数组
        window.adCosts.push(adCost);
    }
    
    // 保存到localStorage
    localStorage.setItem('adCosts', JSON.stringify(window.adCosts));
    
    console.log(`生成了 ${window.adCosts.length} 条广告成本测试数据`);
    return window.adCosts;
}

// 生成广告成本示例数据函数 - 重命名为manualGenerateAdCostData，只能由用户手动触发
function manualGenerateAdCostData() {
    console.log('手动生成广告成本示例数据...');
    
    // 确保广告成本数组已创建
    if (!window.adCosts) {
        window.adCosts = [];
    }
    
    // 广告平台列表
    const adPlatforms = ['小红书', '抖音', '快手', '视频号', '美团', '地图', '老客户推荐', '老客户', '其他'];
    
    // 生成20条测试数据
    for (let i = 1; i <= 20; i++) {
        // 创建随机日期（近6个月内）
        const today = new Date();
        const randomDate = new Date(today);
        randomDate.setDate(today.getDate() - Math.floor(Math.random() * 180));
        
        // 随机选择平台
        const platform = adPlatforms[Math.floor(Math.random() * adPlatforms.length)];
        
        // 随机金额，不同平台有不同范围
        let amount;
        switch (platform) {
            case '抖音':
                amount = 2000 + Math.random() * 8000;
                break;
            case '小红书':
                amount = 1000 + Math.random() * 4000;
                break;
            case '快手':
                amount = 1500 + Math.random() * 3500;
                break;
            default:
                amount = 500 + Math.random() * 2500;
        }
        
        // 创建广告成本记录
        const adCost = {
            id: `AD${String(i).padStart(4, '0')}`,
            date: formatDate(randomDate),
            costType: '广告成本',
            costItem: platform,
            amount: amount.toFixed(2),
            notes: `${platform}推广费用 - ${formatDate(randomDate)}`
        };
        
        // 添加到广告成本数组
        window.adCosts.push(adCost);
    }
    
    // 保存到localStorage
    localStorage.setItem('adCosts', JSON.stringify(window.adCosts));
    
    // 更新缓存和统计
    dataCache.ad.data = window.adCosts;
    dataCache.ad.lastUpdate = new Date();
    dataCache.ad.rendered = false;
    
    console.log(`已手动生成 ${window.adCosts.length} 条广告成本示例数据`);
    return window.adCosts;
}

// 初始化模块切换
function initModuleSwitch() {
    console.log('初始化模块切换...');
    
    const navLinks = document.querySelectorAll('.nav-link[data-module]');
    
    // 获取所有模块内容元素
    const costModule = document.getElementById('costModule');
    const costStatistics = document.getElementById('costStatistics');
    
    if (!costModule || !costStatistics) {
        console.error('找不到成本模块或统计模块元素');
        return;
    }
    
    // 为每个导航链接添加点击事件
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            const targetModule = this.getAttribute('data-module');
            console.log(`切换到模块: ${targetModule}`);
            
            // 更新导航栏激活状态
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            this.classList.add('active');
            
            // 根据所选模块显示相应的内容
            if (targetModule === 'costModule') {
                costModule.style.display = 'block';
                costStatistics.style.display = 'none';
                
                // 确保子模块导航和工具栏显示
                const submoduleNav = document.querySelector('.submodule-nav');
                const toolbar = document.querySelector('.toolbar');
                
                if (submoduleNav) submoduleNav.style.display = 'flex';
                if (toolbar) toolbar.style.display = 'flex';
                
                // 触发当前子模块的显示
                const currentSubModule = sessionStorage.getItem('currentCostSubModule') || 'productionCost';
                const subModuleBtn = document.querySelector(`.submodule-btn[data-sub-module="${currentSubModule}"]`);
                if (subModuleBtn) {
                    subModuleBtn.click();
                }
            } else if (targetModule === 'costStatistics') {
                costModule.style.display = 'none';
                costStatistics.style.display = 'block';
                
                // 初始化统计数据
                if (typeof initCostStatistics === 'function') {
                    initCostStatistics();
                } else {
                    console.error('initCostStatistics函数未定义');
                }
            }
            
            // 保存当前模块到会话存储
            sessionStorage.setItem('currentCostTab', targetModule);
        });
    });
    
    // 从会话存储中恢复当前模块状态
    const savedTab = sessionStorage.getItem('currentCostTab');
    if (savedTab) {
        const tabLink = document.querySelector(`.nav-link[data-module="${savedTab}"]`);
        if (tabLink) {
            tabLink.click();
        }
    } else {
        // 默认显示成本模块
        const defaultTab = document.querySelector('.nav-link[data-module="costModule"]');
        if (defaultTab) {
            defaultTab.click();
        }
    }
}

// 初始化成本统计
function initCostStatistics() {
    console.log('初始化成本统计...');
    try {
        // 确保统计模块是可见的
        const costStatisticsModule = document.getElementById('costStatistics');
        if (costStatisticsModule) {
            costStatisticsModule.style.display = 'block';
        } else {
            console.error('找不到成本统计模块元素');
            return;
        }
        
        // 初始化Chart.js库
        loadChartJsIfNeeded().then(() => {
            // 设置默认日期范围（近3个月）
            const endDate = new Date();
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 3);
            
            const startDateInput = document.getElementById('costStatsStartDate');
            const endDateInput = document.getElementById('costStatsEndDate');
            
            if (startDateInput && endDateInput) {
                startDateInput.value = formatDate(startDate);
                endDateInput.value = formatDate(endDate);
            } else {
                console.error('找不到统计日期输入框');
                return;
            }
            
            // 确保图表元素存在
            if (checkStatisticsElements()) {
                // 生成统计数据
                generateCostStatistics();
                
                // 添加筛选按钮事件
                const applyFilterBtn = document.getElementById('applyCostStatsFilter');
                if (applyFilterBtn) {
                    // 移除旧的事件监听器，避免重复添加
                    applyFilterBtn.removeEventListener('click', generateCostStatistics);
                    applyFilterBtn.addEventListener('click', generateCostStatistics);
                }
            } else {
                console.error('成本统计模块缺少必要的图表元素');
            }
        }).catch(error => {
            console.error('加载Chart.js失败:', error);
        });
    } catch (error) {
        console.error('初始化成本统计失败:', error);
    }
}

// 检查成本统计所需的图表元素是否存在
function checkStatisticsElements() {
    // 检查必要的DOM元素是否存在
    const requiredElements = [
        'totalCostAmount',
        'productionCostPercentage',
        'operatingCostPercentage',
        'adCostPercentage',
        'costTrendChart',
        'costTypeChart',
        'productionCostDetailChart',
        'operatingCostDetailChart'
    ];
    
    let allElementsExist = true;
    
    requiredElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (!element) {
            console.error(`缺少必要的统计元素: #${elementId}`);
            allElementsExist = false;
        }
    });
    
    return allElementsExist;
}

// 按需加载Chart.js
function loadChartJsIfNeeded() {
    return new Promise((resolve, reject) => {
        if (window.Chart) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js';
        script.onload = () => {
            console.log('Chart.js加载成功');
            resolve();
        };
        script.onerror = (error) => {
            console.error('Chart.js加载失败:', error);
            reject(error);
        };
        document.head.appendChild(script);
    });
}

// 生成成本统计数据
function generateCostStatistics() {
    try {
        console.log('生成成本统计数据...');
        
        // 获取日期范围
        const startDateInput = document.getElementById('costStatsStartDate');
        const endDateInput = document.getElementById('costStatsEndDate');
        const costTypeSelect = document.getElementById('costStatsType');
        
        if (!startDateInput || !endDateInput || !costTypeSelect) {
            console.error('找不到必要的筛选输入元素');
            return;
        }
        
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        const costType = costTypeSelect.value;
        
        // 检查日期有效性
        if (!startDate || !endDate) {
            alert('请选择有效的日期范围');
            return;
        }
        
        // 筛选成本数据
        // 筛选运营成本
        let filteredOperatingCosts = [];
        if (window.operatingCosts && window.operatingCosts.length > 0) {
            filteredOperatingCosts = window.operatingCosts.filter(cost => {
                return cost.date >= startDate && cost.date <= endDate;
            });
        }
        
        // 筛选生产成本
        let filteredProductionCosts = [];
        if (window.productionCosts && window.productionCosts.length > 0) {
            filteredProductionCosts = window.productionCosts.filter(cost => {
                if (!cost.orderId) return false;
                const order = window.orders ? window.orders.find(order => order.id === cost.orderId) : null;
                return order && order.dealDate >= startDate && order.dealDate <= endDate;
            });
        }
        
        // 筛选广告成本
        let filteredAdCosts = [];
        if (window.adCosts && window.adCosts.length > 0) {
            filteredAdCosts = window.adCosts.filter(cost => {
                return cost.date >= startDate && cost.date <= endDate;
            });
        }
        
        console.log(`筛选结果 - 运营成本: ${filteredOperatingCosts.length}, 生产成本: ${filteredProductionCosts.length}, 广告成本: ${filteredAdCosts.length}`);
        
        // 更新统计卡片
        updateCostStatisticsCards(filteredOperatingCosts, filteredProductionCosts, filteredAdCosts, costType);
        
        // 更新图表
        updateCostTrendChart(filteredOperatingCosts, filteredProductionCosts, filteredAdCosts, startDate, endDate, costType);
        updateCostTypeChart(filteredOperatingCosts, filteredProductionCosts, filteredAdCosts, costType);
        updateProductionCostDetailChart(filteredProductionCosts, costType);
        updateOperatingCostDetailChart(filteredOperatingCosts, costType);
    } catch (error) {
        console.error('生成成本统计数据出错:', error);
        alert('生成统计数据时发生错误，请查看控制台日志');
    }
}

// 更新成本统计卡片
function updateCostStatisticsCards(operatingCosts, productionCosts, adCosts, costType) {
    // 计算总成本
    let totalProductionCost = productionCosts.reduce((sum, cost) => sum + (calculateTotalProductionCost(cost) || 0), 0);
    let totalOperatingCost = operatingCosts.reduce((sum, cost) => sum + (parseFloat(cost.amount) || 0), 0);
    let totalAdCost = adCosts.reduce((sum, cost) => sum + (parseFloat(cost.amount) || 0), 0);
    
    const totalCost = totalProductionCost + totalOperatingCost + totalAdCost;
    
    // 根据筛选条件过滤
    if (costType !== 'all') {
        if (costType === 'production') {
            // 只显示生产成本
            totalOperatingCost = 0;
            totalAdCost = 0;
        } else if (costType === 'operating') {
            // 只显示运营成本
            totalProductionCost = 0;
            totalAdCost = 0;
        } else if (costType === 'ad') {
            // 只显示广告成本
            totalProductionCost = 0;
            totalOperatingCost = 0;
        }
    }
    
    // 更新总成本
    document.getElementById('totalCostAmount').textContent = '¥' + totalCost.toFixed(2);
    
    // 更新成本占比
    const productionPercentage = totalCost > 0 ? (totalProductionCost / totalCost * 100).toFixed(1) : 0;
    const operatingPercentage = totalCost > 0 ? (totalOperatingCost / totalCost * 100).toFixed(1) : 0;
    const adPercentage = totalCost > 0 ? (totalAdCost / totalCost * 100).toFixed(1) : 0;
    
    document.getElementById('productionCostPercentage').textContent = productionPercentage + '%';
    document.getElementById('operatingCostPercentage').textContent = operatingPercentage + '%';
    document.getElementById('adCostPercentage').textContent = adPercentage + '%';
}

// 计算总生产成本
function calculateTotalProductionCost(cost) {
    if (!cost) return 0;
    
    // 获取各个成本项，如果为空字符串则视为0
    const fabricCost = cost.fabricCost === '' ? 0 : (parseFloat(cost.fabricCost || 0));
    const processingCost = cost.processingCost === '' ? 0 : (parseFloat(cost.processingCost || 0));
    const expressCost = cost.expressCost === '' ? 0 : (parseFloat(cost.expressCost || 0));
    const modificationCost = cost.modificationCost === '' ? 0 : (parseFloat(cost.modificationCost || 0));
    const salesCommission = cost.salesCommission === '' ? 0 : (parseFloat(cost.salesCommission || 0));
    
    // 严格执行总生产成本=面料费+加工费+快递费+修改费+销售提成
    return fabricCost + processingCost + expressCost + modificationCost + salesCommission;
}

// 格式化日期函数
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

// 更新分页控件
function renderPagination(containerId, totalPages, currentPage, totalItems, callback) {
    console.log(`渲染分页控件: 容器=${containerId}, 总页数=${totalPages}, 当前页=${currentPage}, 总记录数=${totalItems}`);
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('未找到分页容器:', containerId);
        return;
    }
    
    container.innerHTML = '';
    
    if (totalPages <= 1) {
        // 如果只有一页，显示记录数量
        container.innerHTML = `<div class="pagination-info">共 ${totalItems} 条记录</div>`;
        return; // 不需要分页
    }
    
    // 创建分页控件
    const paginationDiv = document.createElement('div');
    paginationDiv.className = 'd-flex justify-content-between align-items-center';
    
    // 分页导航
    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', '分页导航');
    
    const ul = document.createElement('ul');
    ul.className = 'pagination pagination-sm mb-0';
    
    // 添加"首页"按钮
    const firstLi = document.createElement('li');
    firstLi.className = 'page-item' + (currentPage === 1 ? ' disabled' : '');
    
    const firstLink = document.createElement('a');
    firstLink.className = 'page-link';
    firstLink.href = '#';
    firstLink.innerHTML = '<i class="fas fa-angle-double-left"></i>';
    firstLink.setAttribute('aria-label', '首页');
    firstLink.setAttribute('data-page', '1');
    
    // 添加点击事件
    if (currentPage > 1) {
        firstLink.onclick = function(e) {
            e.preventDefault();
            callback(1);
        };
    }
    
    firstLi.appendChild(firstLink);
    ul.appendChild(firstLi);
    
    // 添加"上一页"按钮
    const prevLi = document.createElement('li');
    prevLi.className = 'page-item' + (currentPage === 1 ? ' disabled' : '');
    
    const prevLink = document.createElement('a');
    prevLink.className = 'page-link';
    prevLink.href = '#';
    prevLink.innerHTML = '<i class="fas fa-angle-left"></i>';
    prevLink.setAttribute('aria-label', '上一页');
    prevLink.setAttribute('data-page', (currentPage - 1).toString());
    
    // 添加点击事件
    if (currentPage > 1) {
        prevLink.onclick = function(e) {
            e.preventDefault();
            callback(currentPage - 1);
        };
    }
    
    prevLi.appendChild(prevLink);
    ul.appendChild(prevLi);
    
    // 确定显示哪些页码
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    // 调整startPage，确保显示5个页码（如果有足够的页数）
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }
    
    // 添加页码按钮
    for (let i = startPage; i <= endPage; i++) {
        const li = document.createElement('li');
        li.className = 'page-item' + (i === currentPage ? ' active' : '');
        
        const a = document.createElement('a');
        a.className = 'page-link';
        a.href = '#';
        a.textContent = i;
        a.setAttribute('data-page', i.toString());
        
        // 为页码按钮添加点击事件
        if (i !== currentPage) {
            a.onclick = function(e) {
                e.preventDefault();
                callback(i);
            };
        }
        
        li.appendChild(a);
        ul.appendChild(li);
    }
    
    // 添加"下一页"按钮
    const nextLi = document.createElement('li');
    nextLi.className = 'page-item' + (currentPage === totalPages ? ' disabled' : '');
    
    const nextLink = document.createElement('a');
    nextLink.className = 'page-link';
    nextLink.href = '#';
    nextLink.innerHTML = '<i class="fas fa-angle-right"></i>';
    nextLink.setAttribute('aria-label', '下一页');
    nextLink.setAttribute('data-page', (currentPage + 1).toString());
    
    // 添加点击事件
    if (currentPage < totalPages) {
        nextLink.onclick = function(e) {
            e.preventDefault();
            callback(currentPage + 1);
        };
    }
    
    nextLi.appendChild(nextLink);
    ul.appendChild(nextLi);
    
    // 添加"末页"按钮
    const lastLi = document.createElement('li');
    lastLi.className = 'page-item' + (currentPage === totalPages ? ' disabled' : '');
    
    const lastLink = document.createElement('a');
    lastLink.className = 'page-link';
    lastLink.href = '#';
    lastLink.innerHTML = '<i class="fas fa-angle-double-right"></i>';
    lastLink.setAttribute('aria-label', '末页');
    lastLink.setAttribute('data-page', totalPages.toString());
    
    // 添加点击事件
    if (currentPage < totalPages) {
        lastLink.onclick = function(e) {
            e.preventDefault();
            callback(totalPages);
        };
    }
    
    lastLi.appendChild(lastLink);
    ul.appendChild(lastLi);
    
    nav.appendChild(ul);
    paginationDiv.appendChild(nav);
    
    // 分页信息
    const info = document.createElement('div');
    info.className = 'pagination-info ms-3';
    info.textContent = `第 ${currentPage}/${totalPages} 页，共 ${totalItems} 条记录`;
    paginationDiv.appendChild(info);
    
    container.appendChild(paginationDiv);
}

// 渲染成本表格
function renderCostTables(applyFilter = true) {
    console.log('渲染成本表格...当前子模块:', window.currentSubModule, '是否应用筛选条件:', applyFilter);
    try {
        // 获取当前子模块
        const currentSubModule = window.currentSubModule || 'productionCost';
        
        // 根据当前子模块渲染对应的表格
        if (currentSubModule === 'productionCost') {
            renderProductionCostsTable(applyFilter);
            
            // 显示生产成本内容区域，隐藏其他
            document.getElementById('productionCostContent').style.display = 'block';
            document.getElementById('operatingCostContent').style.display = 'none';
            document.getElementById('adCostContent').style.display = 'none';
        } else if (currentSubModule === 'operatingCost') {
            renderOperatingCostsTable(applyFilter);
            
            // 显示运营成本内容区域，隐藏其他
            document.getElementById('productionCostContent').style.display = 'none';
            document.getElementById('operatingCostContent').style.display = 'block';
            document.getElementById('adCostContent').style.display = 'none';
        } else if (currentSubModule === 'adCost') {
            renderAdCostsTable(applyFilter);
            
            // 显示广告成本内容区域，隐藏其他
            document.getElementById('productionCostContent').style.display = 'none';
            document.getElementById('operatingCostContent').style.display = 'none';
            document.getElementById('adCostContent').style.display = 'block';
        }
        
        // 更新筛选结果数量显示
        updateFilterResultCount();
        
        // 重新初始化全选复选框功能
        setTimeout(initSelectAllCheckboxes, 50);
        
        return true;
    } catch (error) {
        console.error('渲染成本表格失败:', error);
        return false;
    }
}

// 渲染生产成本表格
function renderProductionCostsTable(applyFilter = true) {
    console.log('渲染生产成本表格...');
    
    try {
        const tableBody = document.getElementById('productionCostTableBody');
        if (!tableBody) {
            console.error('找不到生产成本表格容器');
            return;
        }
        
        // 确保先同步生产成本和订单数据，保证新增订单的生产成本记录被创建
        if (typeof window.syncProductionCostsWithOrders === 'function') {
            console.log('先执行数据同步确保表格数据一致性...');
            // 使用强制同步确保数据一致性
            window.syncProductionCostsWithOrders(true);
        }
        
        // 清空表格
        tableBody.innerHTML = '';
        
        // 筛选条件
        const startDate = document.getElementById('costStartDate').value;
        const endDate = document.getElementById('costEndDate').value;
        const searchField = document.getElementById('costSearchField').value;
        
        // 首先确保生产成本数据与订单同步，删除没有对应订单的生产成本记录
        const orderIds = window.orders.map(order => order.id);
        const beforeFilterLength = window.productionCosts.length;
        
        // 直接过滤掉没有对应订单的生产成本记录
        window.productionCosts = window.productionCosts.filter(cost => {
            // 确保使用字符串比较，避免类型转换问题
            return orderIds.some(id => String(id) === String(cost.orderId));
        });
        
        const removedCount = beforeFilterLength - window.productionCosts.length;
        if (removedCount > 0) {
            console.log(`已从生产成本表中移除${removedCount}条无对应订单的记录`);
            // 保存更新后的生产成本数据
            localStorage.setItem('productionCosts', JSON.stringify(window.productionCosts));
        }
        
        // 筛选数据
        if (applyFilter) {
            // 应用筛选条件
            filteredProductionCosts = window.productionCosts.filter(cost => {
                // 获取对应的订单
                const order = window.orders.find(o => String(o.id) === String(cost.orderId));
                if (!order) return false;
                
                // 检查日期范围
                const dealDate = order.dealDate || '';
                const dateMatches = (!startDate || dealDate >= startDate) && (!endDate || dealDate <= endDate);
                
                // 检查搜索字段
                const fieldMatches = !searchField || 
                    (cost.fabricType && cost.fabricType.includes(searchField)) ||
                    (cost.fabricCode && cost.fabricCode.includes(searchField)) ||
                    (order.customerName && order.customerName.includes(searchField));
                    
                return dateMatches && fieldMatches;
            });
            
            // 显示筛选结果数量
            const countDisplay = document.getElementById('costFilterResultCount');
            if (countDisplay) {
                countDisplay.textContent = `筛选显示 ${filteredProductionCosts.length} 条记录`;
                countDisplay.style.display = 'block';
            }
        } else {
            // 不应用筛选，显示所有数据
            filteredProductionCosts = [...window.productionCosts];
            
            // 隐藏筛选结果数量显示
            const countDisplay = document.getElementById('costFilterResultCount');
            if (countDisplay) {
                countDisplay.style.display = 'none';
            }
        }
        
        // 数据按时间倒序排序
        filteredProductionCosts.sort((a, b) => {
            const orderA = window.orders.find(o => String(o.id) === String(a.orderId)) || {};
            const orderB = window.orders.find(o => String(o.id) === String(b.orderId)) || {};
            
            const dateA = orderA.dealDate || '';
            const dateB = orderB.dealDate || '';
            
            // 时间倒序，最新的在前面
            return dateB.localeCompare(dateA);
        });
        
        // 计算总页数
        const totalPages = Math.max(1, Math.ceil(filteredProductionCosts.length / recordsPerPage));
        
        // 确保当前页码有效
        if (currentProductionPage > totalPages) {
            currentProductionPage = totalPages;
        }
        
        // 计算当前页的数据范围
        const startIndex = (currentProductionPage - 1) * recordsPerPage;
        const endIndex = Math.min(startIndex + recordsPerPage, filteredProductionCosts.length);
        const currentPageData = filteredProductionCosts.slice(startIndex, endIndex);
        
        // 渲染表格数据
        if (currentPageData.length === 0) {
            // 如果没有数据，显示提示信息
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="17" class="text-center">暂无生产成本数据</td>`;
            tableBody.appendChild(emptyRow);
        } else {
            // 渲染每一行数据
            currentPageData.forEach((cost, index) => {
                // 获取对应的订单，使用字符串比较避免类型不匹配问题
                const order = window.orders.find(o => String(o.id) === String(cost.orderId)) || {};
                
                // 检查订单是否存在，如果不存在则跳过这条记录
                if (!order.id) {
                    console.log(`跳过显示无效订单ID的生产成本记录: ${cost.id}`);
                    return;
                }
                
                // 计算总成本
                const totalCost = calculateTotalProductionCost(cost);
                
                // 计算毛利润
                const grossProfit = (parseFloat(order.totalPrice) || 0) - (totalCost || 0);
                
                // 创建行元素
                const row = document.createElement('tr');
                row.setAttribute('data-id', cost.id);
                
                // 复选框单元格
                const checkboxCell = document.createElement('td');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'select-production-cost';
                checkbox.setAttribute('data-id', cost.id);
                checkboxCell.appendChild(checkbox);
                
                // 基本信息单元格
                const dateTd = document.createElement('td');
                dateTd.textContent = formatDate(order.dealDate) || '-';
                
                const customerTd = document.createElement('td');
                customerTd.textContent = order.customerName || '-';
                
                const fabricBrandTd = document.createElement('td');
                fabricBrandTd.textContent = cost.fabricBrand || '-';
                
                const fabricCodeTd = document.createElement('td');
                fabricCodeTd.textContent = cost.fabricCode || '-';
                
                // 可编辑的单元格：用料
                const fabricUsageTd = document.createElement('td');
                fabricUsageTd.className = 'editable';
                fabricUsageTd.setAttribute('data-field', 'fabricAmount');
                fabricUsageTd.textContent = `${cost.fabricAmount || '-'}米`;
                fabricUsageTd.addEventListener('dblclick', function(e) {
                    editCostCell(this, cost, 'fabricAmount', 'number');
                    e.stopPropagation();
                });
                
                const configTd = document.createElement('td');
                configTd.textContent = cost.configuration || '-';
                
                const manufacturerTd = document.createElement('td');
                manufacturerTd.textContent = cost.manufacturer || '-';
                
                const totalPriceTd = document.createElement('td');
                totalPriceTd.textContent = `¥${parseFloat(order.totalPrice || 0).toFixed(2)}`;
                
                const totalCostTd = document.createElement('td');
                totalCostTd.textContent = `¥${totalCost.toFixed(2)}`;
                
                const profitTd = document.createElement('td');
                profitTd.textContent = `¥${grossProfit.toFixed(2)}`;
                if (grossProfit < 0) {
                    profitTd.classList.add('text-danger');
                } else {
                    profitTd.classList.add('text-success');
                }
                
                // 可编辑的单元格：面料费
                const fabricCostTd = document.createElement('td');
                fabricCostTd.className = 'editable';
                fabricCostTd.setAttribute('data-field', 'fabricCost');
                fabricCostTd.textContent = cost.fabricCost === '' ? '-' : `¥${parseFloat(cost.fabricCost || 0).toFixed(2)}`;
                fabricCostTd.addEventListener('dblclick', function(e) {
                    editCostCell(this, cost, 'fabricCost', 'number');
                    e.stopPropagation();
                });
                
                // 可编辑的单元格：加工费
                const processingCostTd = document.createElement('td');
                processingCostTd.className = 'editable';
                processingCostTd.setAttribute('data-field', 'processingCost');
                processingCostTd.textContent = cost.processingCost === '' ? '-' : `¥${parseFloat(cost.processingCost || 0).toFixed(2)}`;
                processingCostTd.addEventListener('dblclick', function(e) {
                    editCostCell(this, cost, 'processingCost', 'number');
                    e.stopPropagation();
                });
                
                // 可编辑的单元格：快递费
                const shippingCostTd = document.createElement('td');
                shippingCostTd.className = 'editable';
                shippingCostTd.setAttribute('data-field', 'expressCost');
                shippingCostTd.textContent = cost.expressCost === '' ? '-' : `¥${parseFloat(cost.expressCost || 0).toFixed(2)}`;
                shippingCostTd.addEventListener('dblclick', function(e) {
                    editCostCell(this, cost, 'expressCost', 'number');
                    e.stopPropagation();
                });
                
                // 可编辑的单元格：修改费
                const revisionCostTd = document.createElement('td');
                revisionCostTd.className = 'editable';
                revisionCostTd.setAttribute('data-field', 'modificationCost');
                revisionCostTd.textContent = cost.modificationCost === '' ? '-' : `¥${parseFloat(cost.modificationCost || 0).toFixed(2)}`;
                revisionCostTd.addEventListener('dblclick', function(e) {
                    editCostCell(this, cost, 'modificationCost', 'number');
                    e.stopPropagation();
                });
                
                // 可编辑的单元格：销售提成
                const salesCommissionTd = document.createElement('td');
                salesCommissionTd.className = 'editable';
                salesCommissionTd.setAttribute('data-field', 'salesCommission');
                salesCommissionTd.textContent = cost.salesCommission === '' ? '-' : `¥${parseFloat(cost.salesCommission || 0).toFixed(2)}`;
                salesCommissionTd.addEventListener('dblclick', function(e) {
                    editCostCell(this, cost, 'salesCommission', 'number');
                    e.stopPropagation();
                });
                
                // 可编辑的单元格：备注
                const notesTd = document.createElement('td');
                notesTd.className = 'editable';
                notesTd.setAttribute('data-field', 'notes');
                notesTd.textContent = cost.notes || '-';
                notesTd.addEventListener('dblclick', function(e) {
                    editCostCell(this, cost, 'notes', 'text');
                    e.stopPropagation();
                });
                
                // 添加所有单元格到行
                row.appendChild(checkboxCell);
                row.appendChild(dateTd);
                row.appendChild(customerTd);
                row.appendChild(fabricBrandTd);
                row.appendChild(fabricCodeTd);
                row.appendChild(fabricUsageTd);
                row.appendChild(configTd);
                row.appendChild(manufacturerTd);
                row.appendChild(totalPriceTd);
                row.appendChild(totalCostTd);
                row.appendChild(profitTd);
                row.appendChild(fabricCostTd);
                row.appendChild(processingCostTd);
                row.appendChild(shippingCostTd);
                row.appendChild(revisionCostTd);
                row.appendChild(salesCommissionTd);
                row.appendChild(notesTd);
                
                // 添加行到表格
                tableBody.appendChild(row);
            });
        }
        
        // 更新分页控件
        renderPagination('productionCostPagination', totalPages, currentProductionPage, filteredProductionCosts.length, function(page) {
            currentProductionPage = page;
            renderProductionCostsTable(applyFilter);
        });
        
        // 添加全选复选框功能
        const selectAllProductionCost = document.getElementById('selectAllProductionCost');
        if (selectAllProductionCost) {
            // 移除旧的事件监听器
            const newSelectAllCheckbox = selectAllProductionCost.cloneNode(true);
            selectAllProductionCost.parentNode.replaceChild(newSelectAllCheckbox, selectAllProductionCost);
            
            // 添加新的事件监听器
            newSelectAllCheckbox.addEventListener('change', function() {
                const checkboxes = document.querySelectorAll('.select-production-cost');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = this.checked;
                });
            });
        }
    } catch (error) {
        console.error('渲染生产成本表格失败:', error);
        
        // 显示错误信息
        const tableBody = document.getElementById('productionCostTableBody');
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="17" class="text-center text-danger">加载数据时出错: ${error.message}</td></tr>`;
        }
    }
}

// 渲染运营成本表格
function renderOperatingCostsTable(applyFilter = true) {
    console.log('渲染运营成本表格...是否应用筛选条件:', applyFilter);
    try {
        // 获取表格容器
        const tableBody = document.getElementById('operatingCostTableBody');
        if (!tableBody) {
            console.error('找不到运营成本表格容器');
            return;
        }
        
        // 清空表格
        tableBody.innerHTML = '';
        
        // 筛选条件
        const startDate = document.getElementById('costStartDate').value;
        const endDate = document.getElementById('costEndDate').value;
        const searchField = document.getElementById('costSearchField').value;
        
        // 筛选数据
        if (applyFilter) {
            // 应用筛选条件
            filteredCosts = window.operatingCosts.filter(cost => {
                // 检查日期范围
                const dateMatches = (!startDate || cost.date >= startDate) && (!endDate || cost.date <= endDate);
                
                // 检查搜索字段
                const fieldMatches = !searchField || 
                    (cost.costCategory && cost.costCategory.includes(searchField)) ||
                    (cost.costItem && cost.costItem.includes(searchField));
                    
                return dateMatches && fieldMatches && cost.costType === '运营成本';
            });
            
            // 显示筛选结果数量
            const countDisplay = document.getElementById('costFilterResultCount');
            if (countDisplay) {
                countDisplay.textContent = `筛选显示 ${filteredCosts.length} 条记录`;
                countDisplay.style.display = 'block';
            }
        } else {
            // 不应用筛选，显示所有运营成本数据
            filteredCosts = window.operatingCosts.filter(cost => cost.costType === '运营成本');
            
            // 隐藏筛选结果数量显示
            const countDisplay = document.getElementById('costFilterResultCount');
            if (countDisplay) {
                countDisplay.style.display = 'none';
            }
        }
        
        // 数据按时间倒序排序
        filteredCosts.sort((a, b) => {
            const dateA = a.date || '';
            const dateB = b.date || '';
            
            // 时间倒序，最新的在前面
            return dateB.localeCompare(dateA);
        });
        
        // 计算总页数
        const totalPages = Math.max(1, Math.ceil(filteredCosts.length / recordsPerPage));
        
        // 确保当前页码有效
        if (currentOperatingPage > totalPages) {
            currentOperatingPage = totalPages;
        }
        
        // 计算当前页的数据范围
        const startIndex = (currentOperatingPage - 1) * recordsPerPage;
        const endIndex = Math.min(startIndex + recordsPerPage, filteredCosts.length);
        const currentPageData = filteredCosts.slice(startIndex, endIndex);
        
        // 渲染表格数据
        if (currentPageData.length === 0) {
            // 如果没有数据，显示提示信息
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="6" class="text-center">暂无运营成本数据</td>`;
            tableBody.appendChild(emptyRow);
        } else {
            // 渲染每一行数据
            currentPageData.forEach((cost, index) => {
                // 创建行元素
                const row = document.createElement('tr');
                row.setAttribute('data-id', cost.id);
                row.innerHTML = `
                    <td>
                        <input type="checkbox" class="select-operating-cost" data-id="${cost.id}" />
                    </td>
                    <td class="editable" data-field="date" data-type="date">${formatDate(cost.date) || '-'}</td>
                    <td class="editable" data-field="costItem" data-type="text">${cost.costItem || '-'}</td>
                    <td class="editable" data-field="amount" data-type="number">¥${parseFloat(cost.amount || 0).toFixed(2)}</td>
                    <td class="editable" data-field="notes" data-type="text">${cost.notes || '-'}</td>
                `;
                tableBody.appendChild(row);

                // 为每个可编辑单元格添加双击事件
                const editableCells = row.querySelectorAll('.editable');
                editableCells.forEach(cell => {
                    cell.addEventListener('dblclick', function() {
                        const field = this.getAttribute('data-field');
                        const type = this.getAttribute('data-type');
                        
                        // 调用编辑函数
                        editOperatingCostCell(this, cost, field, type);
                    });
                });
            });
        }
        
        // 更新分页控件
        renderPagination('operatingCostPagination', totalPages, currentOperatingPage, filteredCosts.length, function(page) {
            currentOperatingPage = page;
            renderOperatingCostsTable(applyFilter);
        });
        
        // 更新运营成本图表
        updateOperatingCostChart('halfYear');
        
        // 添加全选复选框功能
        const selectAllOperatingCost = document.getElementById('selectAllOperatingCost');
        if (selectAllOperatingCost) {
            // 移除旧的事件监听器
            const newSelectAllCheckbox = selectAllOperatingCost.cloneNode(true);
            selectAllOperatingCost.parentNode.replaceChild(newSelectAllCheckbox, selectAllOperatingCost);
            
            // 添加新的事件监听器
            newSelectAllCheckbox.addEventListener('change', function() {
                const checkboxes = document.querySelectorAll('.select-operating-cost');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = this.checked;
                });
            });
        }
    } catch (error) {
        console.error('渲染运营成本表格失败:', error);
        
        // 显示错误信息
        const tableBody = document.getElementById('operatingCostTableBody');
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">加载数据时出错: ${error.message}</td></tr>`;
        }
    }
}

// 渲染广告成本表格
function renderAdCostsTable(applyFilter = true) {
    console.log('渲染广告成本表格...是否应用筛选条件:', applyFilter);
    try {
        // 确保window.adCosts存在
        if (!window.adCosts) {
            window.adCosts = [];
        }
        
        // 获取表格容器
        const tableBody = document.getElementById('adCostTableBody');
        if (!tableBody) {
            console.error('找不到广告成本表格容器');
            return;
        }
        
        // 清空表格
        tableBody.innerHTML = '';
        
        // 筛选条件
        const startDate = document.getElementById('costStartDate').value;
        const endDate = document.getElementById('costEndDate').value;
        const searchField = document.getElementById('costSearchField').value;
        
        // 筛选数据
        if (applyFilter) {
            // 应用筛选条件
            filteredAdCosts = window.adCosts.filter(cost => {
                // 检查日期范围
                const dateMatches = (!startDate || cost.date >= startDate) && (!endDate || cost.date <= endDate);
                
                // 检查搜索字段
                const fieldMatches = !searchField || 
                    (cost.costCategory && cost.costCategory.includes(searchField)) ||
                    (cost.costItem && cost.costItem.includes(searchField));
                    
                const typeMatch = cost.costType === '广告成本';
                
                return dateMatches && fieldMatches && typeMatch;
            });
            
            // 显示筛选结果数量
            const countDisplay = document.getElementById('costFilterResultCount');
            if (countDisplay) {
                countDisplay.textContent = `筛选显示 ${filteredAdCosts.length} 条记录`;
                countDisplay.style.display = 'block';
            }
        } else {
            // 不应用筛选，显示所有广告成本数据
            filteredAdCosts = window.adCosts.filter(cost => cost.costType === '广告成本');
            
            // 隐藏筛选结果数量显示
            const countDisplay = document.getElementById('costFilterResultCount');
            if (countDisplay) {
                countDisplay.style.display = 'none';
            }
        }
        
        // 数据按时间倒序排序
        filteredAdCosts.sort((a, b) => {
            const dateA = a.date || '';
            const dateB = b.date || '';
            
            // 时间倒序，最新的在前面
            return dateB.localeCompare(dateA);
        });
        
        // 计算总页数
        const totalPages = Math.max(1, Math.ceil(filteredAdCosts.length / recordsPerPage));
        
        // 确保当前页码有效
        if (currentAdPage > totalPages) {
            currentAdPage = totalPages;
        }
        
        // 计算当前页的数据范围
        const startIndex = (currentAdPage - 1) * recordsPerPage;
        const endIndex = Math.min(startIndex + recordsPerPage, filteredAdCosts.length);
        const currentPageData = filteredAdCosts.slice(startIndex, endIndex);
        
        // 渲染表格数据
        if (currentPageData.length === 0) {
            // 如果没有数据，显示提示信息
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="5" class="text-center">暂无广告成本数据</td>`;
            tableBody.appendChild(emptyRow);
        } else {
            // 渲染每一行数据
            currentPageData.forEach((cost, index) => {
                // 创建行元素
                const row = document.createElement('tr');
                row.setAttribute('data-id', cost.id);
                row.innerHTML = `
                    <td>
                        <input type="checkbox" class="select-ad-cost" data-id="${cost.id}" />
                    </td>
                    <td class="editable" data-field="date" data-type="date">${formatDate(cost.date) || '-'}</td>
                    <td class="editable" data-field="adCostItem" data-type="text">${cost.costItem || cost.adCostItem || cost.platform || '-'}</td>
                    <td class="editable" data-field="amount" data-type="number">¥${parseFloat(cost.amount || 0).toFixed(2)}</td>
                    <td class="editable" data-field="notes" data-type="text">${cost.notes || '-'}</td>
                `;
                tableBody.appendChild(row);

                // 为每个可编辑单元格添加双击事件
                const editableCells = row.querySelectorAll('.editable');
                editableCells.forEach(cell => {
                    cell.addEventListener('dblclick', function() {
                        const field = this.getAttribute('data-field');
                        const type = this.getAttribute('data-type');
                        
                        // 调用编辑函数
                        editAdCostCell(this, cost, field, type);
                    });
                });
            });
        }
        
        // 更新分页控件
        renderPagination('adCostPagination', totalPages, currentAdPage, filteredAdCosts.length, function(page) {
            currentAdPage = page;
            renderAdCostsTable(applyFilter);
        });
        
        // 更新广告成本图表
        updateAdCostChart('halfYear');
        
        // 添加全选复选框功能
        const selectAllAdCost = document.getElementById('selectAllAdCost');
        if (selectAllAdCost) {
            // 移除旧的事件监听器
            const newSelectAllCheckbox = selectAllAdCost.cloneNode(true);
            selectAllAdCost.parentNode.replaceChild(newSelectAllCheckbox, selectAllAdCost);
            
            // 添加新的事件监听器
            newSelectAllCheckbox.addEventListener('change', function() {
                const checkboxes = document.querySelectorAll('.select-ad-cost');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = this.checked;
                });
            });
        }
    } catch (error) {
        console.error('渲染广告成本表格失败:', error);
        
        // 显示错误信息
        const tableBody = document.getElementById('adCostTableBody');
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">加载数据时出错: ${error.message}</td></tr>`;
        }
    }
}

// 初始化子模块切换事件
function initSubModuleSwitchEvents() {
    console.log('初始化子模块切换事件...');
    try {
        const subModuleBtns = document.querySelectorAll('.submodule-btn');
        
        subModuleBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // 获取目标子模块
                const targetSubModule = this.getAttribute('data-sub-module');
                
                // 更新激活状态
                subModuleBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // 更新当前子模块
                window.currentSubModule = targetSubModule;
                
                // 保存当前子模块到会话存储
                sessionStorage.setItem('currentCostSubModule', targetSubModule);
                
                console.log('切换到子模块:', targetSubModule);
                
                // 重新渲染成本表格，不应用筛选条件
                renderCostTables(false);
            });
        });
        
        console.log('子模块切换事件初始化完成');
        return true;
    } catch (error) {
        console.error('初始化子模块切换事件失败:', error);
        return false;
    }
}

// 添加成本管理相关事件监听
function addCostEventListeners() {
    console.log('初始化成本事件监听...');
    
    try {
        // 添加新增成本按钮事件
        const addCostBtn = document.getElementById('addCostBtn');
        if (addCostBtn) {
            addCostBtn.addEventListener('click', function() {
                // 根据当前选择的子模块决定显示哪种成本表单
                const currentSubModule = window.currentSubModule || 'operatingCost';
                showCostForm('add', currentSubModule);
            });
            console.log('已添加新增成本按钮事件');
        } else {
            console.warn('未找到新增成本按钮');
        }
        
        // 使用事件委托方式添加保存按钮事件，避免重复添加
        document.addEventListener('click', function(e) {
            if (e.target && e.target.id === 'saveCostBtn') {
                e.preventDefault();
                saveCost();
            }
        }, false);
        console.log('已添加保存成本按钮事件（使用事件委托）');
        
        // 恢复生产成本数据按钮事件
        const restoreButton = document.getElementById('restoreProductionCosts');
        if (restoreButton) {
            restoreButton.addEventListener('click', function() {
                console.log('点击了恢复生产成本数据按钮');
                if (confirm('确定要恢复生产成本数据吗？这将为所有订单重新创建生产成本记录。')) {
                    if (typeof window.restoreProductionCosts === 'function') {
                        const result = window.restoreProductionCosts();
                        if (result) {
                            alert('生产成本数据恢复成功！');
                            // 重新渲染生产成本表格
                            renderProductionCostsTable(false);
                        } else {
                            alert('生产成本数据恢复失败，请查看控制台了解详情。');
                        }
                    } else {
                        alert('恢复功能不可用，请刷新页面后重试。');
                    }
                }
            });
            console.log('已添加恢复生产成本数据按钮事件');
        } else {
            console.warn('未找到恢复生产成本数据按钮');
        }
        
        // 复制成本按钮事件
        const copyCostBtn = document.getElementById('copyCostBtn');
        if (copyCostBtn) {
            copyCostBtn.addEventListener('click', function() {
                // 根据当前选择的子模块决定复制哪种成本
                const currentSubModule = window.currentSubModule || 'operatingCost';
                
                // 生产成本不需要复制功能
                if (currentSubModule === 'productionCost') {
                    alert('生产成本数据是从订单管理中同步的，不需要复制功能');
                    return;
                }
                
                // 获取选中的成本
                let selectedCosts = [];
                if (currentSubModule === 'operatingCost') {
                    const checkboxes = document.querySelectorAll('.select-operating-cost:checked');
                    checkboxes.forEach(checkbox => {
                        const costId = checkbox.getAttribute('data-id');
                        const cost = window.operatingCosts.find(c => c.id === costId);
                        if (cost) selectedCosts.push(cost);
                    });
                } else if (currentSubModule === 'adCost') {
                    const checkboxes = document.querySelectorAll('.select-ad-cost:checked');
                    checkboxes.forEach(checkbox => {
                        const costId = checkbox.getAttribute('data-id');
                        const cost = window.adCosts.find(c => c.id === costId);
                        if (cost) selectedCosts.push(cost);
                    });
                }
                
                if (selectedCosts.length === 0) {
                    alert('请先选择要复制的成本记录');
                    return;
                }
                
                if (selectedCosts.length > 1) {
                    alert('一次只能复制一条成本记录');
                    return;
                }
                
                // 直接复制选中的成本记录并添加到数据列表中
                const costToCopy = selectedCosts[0];
                
                // 创建新成本记录（深拷贝）
                const newCost = JSON.parse(JSON.stringify(costToCopy));
                
                // 更改ID为新的唯一ID
                newCost.id = generateUUID();
                
                // 添加备注信息
                newCost.notes = (newCost.notes || '') + ' (复制)';
                newCost.costRemark = (newCost.costRemark || '') + ' (复制)';
                
                // 根据子模块保存到对应数组并更新localStorage
                if (currentSubModule === 'operatingCost') {
                    // 添加到运营成本数组
                    window.operatingCosts.push(newCost);
                    
                    // 同时更新costs数组（保持兼容性）
                    window.costs = window.operatingCosts;
                    
                    // 保存到localStorage
                    localStorage.setItem('operatingCosts', JSON.stringify(window.operatingCosts));
                    localStorage.setItem('costs', JSON.stringify(window.operatingCosts));
                    
                    // 重新渲染表格
                    renderOperatingCostsTable(false);
                    
                    alert('已成功复制运营成本记录');
                } else if (currentSubModule === 'adCost') {
                    // 添加到广告成本数组
                    window.adCosts.push(newCost);
                    
                    // 保存到localStorage
                    localStorage.setItem('adCosts', JSON.stringify(window.adCosts));
                    
                    // 重新渲染表格
                    renderAdCostsTable(false);
                    
                    alert('已成功复制广告成本记录');
                }
            });
            console.log('已添加复制成本按钮事件');
        }
        
        // 删除成本按钮事件
        const deleteCostBtn = document.getElementById('deleteCostBtn');
        if (deleteCostBtn) {
            deleteCostBtn.addEventListener('click', function() {
                // 根据当前选择的子模块决定删除哪种成本
                const currentSubModule = window.currentSubModule || 'operatingCost';
                
                // 生产成本不需要删除功能
                if (currentSubModule === 'productionCost') {
                    alert('生产成本数据是从订单管理中同步的，不能直接删除');
                    return;
                }
                
                // 获取选中的成本
                let selectedIds = [];
                if (currentSubModule === 'operatingCost') {
                    const checkboxes = document.querySelectorAll('.select-operating-cost:checked');
                    selectedIds = Array.from(checkboxes).map(checkbox => checkbox.getAttribute('data-id'));
                } else if (currentSubModule === 'adCost') {
                    const checkboxes = document.querySelectorAll('.select-ad-cost:checked');
                    selectedIds = Array.from(checkboxes).map(checkbox => checkbox.getAttribute('data-id'));
                }
                
                if (selectedIds.length === 0) {
                    alert('请先选择要删除的成本记录');
                    return;
                }
                
                if (confirm(`确定要删除选中的 ${selectedIds.length} 条成本记录吗？`)) {
                    // 删除选中的成本
                    if (currentSubModule === 'operatingCost') {
                        window.operatingCosts = window.operatingCosts.filter(cost => !selectedIds.includes(cost.id));
                        
                        // 同时更新costs数组（保持兼容性）
                        window.costs = window.operatingCosts.filter(cost => cost.costType === '运营成本');
                        
                        // 保存到localStorage
                        localStorage.setItem('operatingCosts', JSON.stringify(window.operatingCosts));
                        localStorage.setItem('costs', JSON.stringify(window.costs));
                        
                        // 重新渲染表格
                        renderOperatingCostsTable(false);
                    } else if (currentSubModule === 'adCost') {
                        window.adCosts = window.adCosts.filter(cost => !selectedIds.includes(cost.id));
                        localStorage.setItem('adCosts', JSON.stringify(window.adCosts));
                        renderAdCostsTable(false);
                    }
                    
                    alert('已成功删除选中的成本记录');
                }
            });
            console.log('已添加删除成本按钮事件');
        }
        
        // 导出成本按钮事件
        const exportCostBtn = document.getElementById('exportCostBtn');
        if (exportCostBtn) {
            exportCostBtn.addEventListener('click', function() {
                // 根据当前选择的子模块决定导出哪种成本
                const currentSubModule = window.currentSubModule || 'operatingCost';
                
                if (currentSubModule === 'productionCost') {
                    exportProductionCostToExcel();
                } else if (currentSubModule === 'operatingCost') {
                    exportOperatingCostToExcel();
                } else if (currentSubModule === 'adCost') {
                    exportAdCostToExcel();
                }
            });
            console.log('已添加导出成本按钮事件');
        }
        
        // 筛选按钮事件
        const filterButton = document.getElementById('filterCostBtn');
        if (filterButton) {
            filterButton.addEventListener('click', function() {
                // 重置分页为第一页
                currentOperatingPage = 1;
                currentProductionPage = 1;
                currentAdPage = 1;
                
                // 重新渲染表格，并应用筛选条件
                renderCostTables(true);
            });
            console.log('已添加筛选按钮事件');
        } else {
            console.warn('未找到筛选按钮');
        }
        
        // 重置筛选按钮事件
        const resetButton = document.getElementById('resetCostFilterBtn');
        if (resetButton) {
            resetButton.addEventListener('click', function() {
                // 设置当年的日期范围
                const today = new Date();
                const currentYear = today.getFullYear();
                
                // 设置当年1月1日为开始日期
                const startOfYear = new Date(currentYear, 0, 1);
                document.getElementById('costStartDate').value = formatDate(startOfYear);
                
                // 设置当前日期为结束日期
                document.getElementById('costEndDate').value = formatDate(today);
                
                // 清空搜索字段
                document.getElementById('costSearchField').value = '';
                
                // 重置分页为第一页
                currentOperatingPage = 1;
                currentProductionPage = 1;
                currentAdPage = 1;
                
                // 重新渲染表格，不应用筛选条件
                renderCostTables(false);
            });
            console.log('已添加重置筛选按钮事件');
        } else {
            console.warn('未找到重置筛选按钮');
        }
        
        // 其他原有事件监听...
        
        console.log('成本管理相关事件监听添加完成');
        return true;
    } catch (error) {
        console.error('添加成本管理相关事件监听失败:', error);
        return false;
    }
}

// 初始化时添加调用
window.addEventListener('DOMContentLoaded', function() {
    initNavEvents();
    
    // 初始化成本子模块事件
    initSubModuleEvents();
    
    // 初始化时根据当前子模块更新成本项目下拉菜单
    const currentSubModule = sessionStorage.getItem('currentCostSubModule') || 'productionCost';
    updateCostItemsDropdown(currentSubModule);
});

// 更新运营成本图表
function updateOperatingCostChart(timeRange) {
    console.log('更新运营成本图表, 时间范围:', timeRange);
    try {
        // 获取图表容器
        const chartContainer = document.getElementById('operatingCostChart');
        if (!chartContainer) {
            console.error('找不到运营成本图表容器');
            return;
        }

        // 清除旧图表
        if (window.operatingCostChartInstance) {
            window.operatingCostChartInstance.destroy();
        }
        
        // 准备数据
        const today = new Date();
        let startDate = new Date();
        
        // 根据选择的时间范围设置起始日期
        switch (timeRange) {
            case 'month':
                startDate.setMonth(today.getMonth() - 1);
                break;
            case 'halfYear':
                startDate.setMonth(today.getMonth() - 6);
                break;
            case 'year':
                startDate.setFullYear(today.getFullYear() - 1);
                break;
            default:
                startDate.setMonth(today.getMonth() - 6);
        }
        
        startDate = new Date(startDate.setHours(0, 0, 0, 0));
        
        // 转换为日期字符串格式
        const startDateStr = formatDate(startDate);
        const endDateStr = formatDate(today);
        
        console.log(`图表时间范围: ${startDateStr} - ${endDateStr}`);
        
        // 筛选指定时间范围内的运营成本数据
        const filteredData = window.operatingCosts.filter(cost => 
            cost.date >= startDateStr && cost.date <= endDateStr && cost.costType === '运营成本'
        );
        
        console.log(`筛选到 ${filteredData.length} 条运营成本数据用于图表`);
        
        if (filteredData.length === 0) {
            console.log('没有找到符合条件的运营成本数据');
            
            // 在canvas上显示无数据提示
            const ctx = chartContainer.getContext('2d');
            ctx.clearRect(0, 0, chartContainer.width, chartContainer.height);
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#6c757d';
            ctx.fillText('暂无运营成本数据', chartContainer.width / 2, chartContainer.height / 2);
            
            return;
        }
        
        // 按项目分组数据
        const costByItem = {};
        
        // 初始化所有运营成本项目
        const items = ['房租', '物业', '水费', '电费', '工资', '停车费', '杂费', '其他'];
        items.forEach(item => {
            costByItem[item] = 0;
        });
        
        // 累加每个项目的成本
        filteredData.forEach(cost => {
            const item = cost.costItem || '其他';
            const amount = parseFloat(cost.amount) || 0;
            
            if (costByItem[item] !== undefined) {
                costByItem[item] += amount;
            } else {
                costByItem[item] = amount;
            }
        });
        
        // 按月份分组数据
        const monthlyData = {};
        
        // 生成月份序列
        const months = [];
        let currentDate = new Date(startDate);
        
        while (currentDate <= today) {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = 0;
                months.push(monthKey);
            }
            
            // 增加一个月
            currentDate.setMonth(currentDate.getMonth() + 1);
        }
        
        // 累加每月的运营成本
        filteredData.forEach(cost => {
            const dateParts = cost.date.split('-');
            const year = dateParts[0];
            const month = dateParts[1];
            const monthKey = `${year}-${month}`;
            
            if (monthlyData[monthKey] !== undefined) {
                monthlyData[monthKey] += parseFloat(cost.amount) || 0;
            }
        });
        
        // 准备图表数据 - 月度趋势
        const monthLabels = months.map(month => {
            const [year, monthNum] = month.split('-');
            return `${year.slice(2)}/${monthNum}`;
        });
        
        const monthlyAmounts = months.map(month => monthlyData[month] || 0);
        
        // 创建图表数据
        const chartData = {
            labels: monthLabels,
            datasets: [{
                type: 'bar',
                label: '月度费用',
                data: monthlyAmounts,
                backgroundColor: 'rgba(46, 204, 113, 0.7)',
                borderColor: 'rgba(46, 204, 113, 1)',
                borderWidth: 1,
                order: 2
            }, {
                type: 'line',
                label: '趋势',
                data: monthlyAmounts,
                borderColor: 'rgba(52, 152, 219, 1)',
                borderWidth: 2,
                pointRadius: 3,
                pointBackgroundColor: 'rgba(52, 152, 219, 1)',
                tension: 0.4,
                fill: false,
                order: 1
            }]
        };
        
        // 创建图表配置
        const config = {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            boxWidth: 12,
                            font: {
                                size: 11
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed.y || 0;
                                return `成本: ¥${value.toFixed(2)}`;
                            },
                            footer: function(tooltipItems) {
                                // 计算总成本
                                const totalCost = monthlyAmounts.reduce((sum, cost) => sum + cost, 0);
                                const currentCost = tooltipItems[0].parsed.y;
                                const percentage = totalCost > 0 ? (currentCost / totalCost * 100).toFixed(1) : 0;
                                return `占比: ${percentage}%`;
                            }
                        }
                    },
                    title: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 10
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                if (value >= 1000) {
                                    return '¥' + (value / 1000).toFixed(1) + 'K';
                                }
                                return '¥' + value;
                            },
                            font: {
                                size: 10
                            }
                        }
                    }
                },
                layout: {
                    padding: {
                        left: 5,
                        right: 10,
                        top: 15,
                        bottom: 5
                    }
                }
            }
        };
        
        // 创建图表实例
        const ctx = chartContainer.getContext('2d');
        window.operatingCostChartInstance = new Chart(ctx, config);
        
        console.log('运营成本图表更新完成');
    } catch (error) {
        console.error('更新运营成本图表失败:', error);
        console.error('错误堆栈:', error.stack);
    }
}

// 更新广告成本图表
function updateAdCostChart(timeRange) {
    console.log('更新广告成本图表, 时间范围:', timeRange);
    try {
        // 获取图表容器
        const chartContainer = document.getElementById('adCostChart');
        if (!chartContainer) {
            console.error('找不到广告成本图表容器');
            return;
        }
        
        // 清除旧图表
        if (window.adCostChartInstance) {
            window.adCostChartInstance.destroy();
        }
        
        // 准备数据
        const today = new Date();
        let startDate = new Date();
        
        // 根据选择的时间范围设置起始日期
        switch (timeRange) {
            case 'month':
                startDate.setMonth(today.getMonth() - 1);
                break;
            case 'halfYear':
                startDate.setMonth(today.getMonth() - 6);
                break;
            case 'year':
                startDate.setFullYear(today.getFullYear() - 1);
                break;
            default:
                startDate.setMonth(today.getMonth() - 6);
        }
        
        startDate = new Date(startDate.setHours(0, 0, 0, 0));
        
        // 转换为日期字符串格式
        const startDateStr = formatDate(startDate);
        const endDateStr = formatDate(today);
        
        console.log(`图表时间范围: ${startDateStr} - ${endDateStr}`);
        
        // 筛选指定时间范围内的广告成本数据
        const filteredData = window.adCosts.filter(cost => 
            cost.date >= startDateStr && cost.date <= endDateStr && cost.costType === '广告成本'
        );
        
        console.log(`筛选到 ${filteredData.length} 条广告成本数据用于图表`);
        
        if (filteredData.length === 0) {
            console.log('没有找到符合条件的广告成本数据');
            
            // 显示无数据提示
            const ctx = chartContainer.getContext('2d');
            ctx.clearRect(0, 0, chartContainer.width, chartContainer.height);
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#6c757d';
            ctx.fillText('暂无广告成本数据', chartContainer.width / 2, chartContainer.height / 2);
            
            return;
        }
        
        // 按平台分组数据
        const costByPlatform = {};
        
        // 初始化所有广告平台
        const platforms = ['小红书', '抖音', '快手', '视频号', '美团', '地图', '老客户推荐', '老客户', '其他'];
        platforms.forEach(platform => {
            costByPlatform[platform] = 0;
        });
        
        // 累加每个平台的成本
        filteredData.forEach(cost => {
            const platform = cost.costItem || '其他';
            const amount = parseFloat(cost.amount) || 0;
            
            if (costByPlatform[platform] !== undefined) {
                costByPlatform[platform] += amount;
            } else {
                costByPlatform[platform] = amount;
            }
        });
        
        // 按月份分组数据
        const monthlyData = {};
        
        // 生成月份序列
        const months = [];
        let currentDate = new Date(startDate);
        
        while (currentDate <= today) {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = 0;
                months.push(monthKey);
            }
            
            // 增加一个月
            currentDate.setMonth(currentDate.getMonth() + 1);
        }
        
        // 累加每月的广告成本
        filteredData.forEach(cost => {
            const dateParts = cost.date.split('-');
            const year = dateParts[0];
            const month = dateParts[1];
            const monthKey = `${year}-${month}`;
            
            if (monthlyData[monthKey] !== undefined) {
                monthlyData[monthKey] += parseFloat(cost.amount) || 0;
            }
        });
        
        // 准备图表数据 - 月度趋势
        const monthLabels = months.map(month => {
            const [year, monthNum] = month.split('-');
            return `${year.slice(2)}/${monthNum}`;
        });
        
        const monthlyAmounts = months.map(month => monthlyData[month] || 0);
        
        // 计算每个平台的总金额
        const platformData = Object.entries(costByPlatform)
            .filter(([_, amount]) => amount > 0)
            .sort((a, b) => b[1] - a[1]);
            
        // 准备图表数据 - 平台分布
        const platformLabels = platformData.map(item => item[0]);
        const platformAmounts = platformData.map(item => item[1]);
        
        // 定义图表颜色
        const backgroundColors = [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)',
            'rgba(199, 199, 199, 0.7)',
            'rgba(83, 102, 255, 0.7)'
        ];
        
        // 创建图表数据
        const chartData = {
            labels: monthLabels,
            datasets: [{
                type: 'bar',
                label: '月度费用',
                data: monthlyAmounts,
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                order: 2
            }, {
                type: 'line',
                label: '趋势',
                data: monthlyAmounts,
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2,
                pointRadius: 3,
                pointBackgroundColor: 'rgba(255, 99, 132, 1)',
                tension: 0.4,
                fill: false,
                order: 1
            }]
        };
        
        // 创建图表配置
        const config = {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            boxWidth: 12,
                            font: {
                                size: 11
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed.y || 0;
                                return `成本: ¥${value.toFixed(2)}`;
                            },
                            footer: function(tooltipItems) {
                                // 计算总成本
                                const totalCost = monthlyAmounts.reduce((sum, cost) => sum + cost, 0);
                                const currentCost = tooltipItems[0].parsed.y;
                                const percentage = totalCost > 0 ? (currentCost / totalCost * 100).toFixed(1) : 0;
                                return `占比: ${percentage}%`;
                            }
                        }
                    },
                    title: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 10
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                if (value >= 1000) {
                                    return '¥' + (value / 1000).toFixed(1) + 'K';
                                }
                                return '¥' + value;
                            },
                            font: {
                                size: 10
                            }
                        }
                    }
                },
                layout: {
                    padding: {
                        left: 5,
                        right: 10,
                        top: 15,
                        bottom: 5
                    }
                }
            }
        };
        
        // 创建图表实例
        const ctx = chartContainer.getContext('2d');
        window.adCostChartInstance = new Chart(ctx, config);
        
        console.log('广告成本图表更新完成');
    } catch (error) {
        console.error('更新广告成本图表失败:', error);
        console.error('错误堆栈:', error.stack);
    }
}

// 初始化广告成本图表
function initAdCostChart() {
    console.log('初始化广告成本图表...');
    try {
        // 默认显示半年数据
        updateAdCostChart('halfYear');
        
        // 添加图表时间范围切换按钮事件
        const chartBtns = document.querySelectorAll('[onclick^="updateAdCostChart"]');
        chartBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // 移除其他按钮的活跃状态
                chartBtns.forEach(b => b.classList.remove('active'));
                
                // 添加当前按钮的活跃状态
                this.classList.add('active');
            });
        });
        
        console.log('广告成本图表初始化完成');
    } catch (error) {
        console.error('初始化广告成本图表失败:', error);
    }
}

// 初始化运营成本图表
function initOperatingCostChart() {
    console.log('初始化运营成本图表...');
    try {
        // 默认显示半年数据
        updateOperatingCostChart('halfYear');
        
        // 添加图表时间范围切换按钮事件
        const chartBtns = document.querySelectorAll('[onclick^="updateOperatingCostChart"]');
        chartBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // 移除其他按钮的活跃状态
                chartBtns.forEach(b => b.classList.remove('active'));
                
                // 添加当前按钮的活跃状态
                this.classList.add('active');
            });
        });
        
        console.log('运营成本图表初始化完成');
    } catch (error) {
        console.error('初始化运营成本图表失败:', error);
    }
}

// 初始化子模块切换事件
function initSubModuleEvents() {
    console.log('初始化子模块切换事件...');
    try {
        const subModuleBtns = document.querySelectorAll('.submodule-btn');
        
        subModuleBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // 获取目标子模块
                const targetSubModule = this.getAttribute('data-sub-module');
                
                // 更新激活状态
                subModuleBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // 更新当前子模块
                window.currentSubModule = targetSubModule;
                
                // 保存当前子模块到会话存储
                sessionStorage.setItem('currentCostSubModule', targetSubModule);
                
                console.log('切换到子模块:', targetSubModule);
                
                // 更新成本项目下拉菜单
                updateCostItemsDropdown(targetSubModule);
                
                // 重新渲染成本表格，不应用筛选条件
                renderCostTables(false);
            });
        });
        
        console.log('子模块切换事件初始化完成');
        return true;
    } catch (error) {
        console.error('初始化子模块切换事件失败:', error);
        return false;
    }
}

// 更新成本项目下拉菜单
function updateCostItemsDropdown(subModule) {
    console.log('更新成本项目下拉菜单, 当前子模块:', subModule);
    try {
        // 获取成本项目下拉菜单
        const dropdown = document.getElementById('costSearchField');
        
        // 获取所有成本项目组
        const productionGroup = document.getElementById('productionCostItems');
        const operatingGroup = document.getElementById('operatingCostItems');
        const adGroup = document.getElementById('adCostItems');
        
        // 首先隐藏所有组
        if (productionGroup) productionGroup.style.display = 'none';
        if (operatingGroup) operatingGroup.style.display = 'none';
        if (adGroup) adGroup.style.display = 'none';
        
        // 根据当前子模块显示相应的选项组
        switch (subModule) {
            case 'productionCost':
                if (productionGroup) productionGroup.style.display = '';
                dropdown.selectedIndex = 0; // 重置为"全部项目"
                break;
                
            case 'operatingCost':
                if (operatingGroup) operatingGroup.style.display = '';
                dropdown.selectedIndex = 0; // 重置为"全部项目"
                break;
                
            case 'adCost':
                if (adGroup) adGroup.style.display = '';
                dropdown.selectedIndex = 0; // 重置为"全部项目"
                break;
        }
    } catch (error) {
        console.error('更新成本项目下拉菜单失败:', error);
    }
}

// 渲染生产成本表格
function renderProductionCostTable(applyFilter = true) {
    console.log('渲染生产成本表格...');
    
    try {
        const tableBody = document.getElementById('productionCostTableBody');
        if (!tableBody) {
            console.error('找不到生产成本表格容器');
            return;
        }
        
        // 确保先同步生产成本和订单数据，保证新增订单的生产成本记录被创建
        if (typeof window.syncProductionCostsWithOrders === 'function') {
            console.log('先执行数据同步确保表格数据一致性...');
            // 使用强制同步确保数据一致性
            window.syncProductionCostsWithOrders(true);
        }
        
        // 清空表格
        tableBody.innerHTML = '';
        
        // 筛选条件
        const startDate = document.getElementById('costStartDate').value;
        const endDate = document.getElementById('costEndDate').value;
        const searchField = document.getElementById('costSearchField').value;
        
        // 首先确保生产成本数据与订单同步，删除没有对应订单的生产成本记录
        const orderIds = window.orders.map(order => order.id);
        const beforeFilterLength = window.productionCosts.length;
        
        // 直接过滤掉没有对应订单的生产成本记录
        window.productionCosts = window.productionCosts.filter(cost => {
            // 确保使用字符串比较，避免类型转换问题
            return orderIds.some(id => String(id) === String(cost.orderId));
        });
        
        const removedCount = beforeFilterLength - window.productionCosts.length;
        if (removedCount > 0) {
            console.log(`已从生产成本表中移除${removedCount}条无对应订单的记录`);
            // 保存更新后的生产成本数据
            localStorage.setItem('productionCosts', JSON.stringify(window.productionCosts));
        }
        
        // 筛选数据
        if (applyFilter) {
            // 应用筛选条件
            filteredProductionCosts = window.productionCosts.filter(cost => {
                // 获取对应的订单
                const order = window.orders.find(o => String(o.id) === String(cost.orderId));
                if (!order) return false;
                
                // 检查日期范围
                const dealDate = order.dealDate || '';
                const dateMatches = (!startDate || dealDate >= startDate) && (!endDate || dealDate <= endDate);
                
                // 检查搜索字段
                const fieldMatches = !searchField || 
                    (cost.fabricType && cost.fabricType.includes(searchField)) ||
                    (cost.fabricCode && cost.fabricCode.includes(searchField)) ||
                    (order.customerName && order.customerName.includes(searchField));
                    
                return dateMatches && fieldMatches;
            });
            
            // 显示筛选结果数量
            const countDisplay = document.getElementById('costFilterResultCount');
            if (countDisplay) {
                countDisplay.textContent = `筛选显示 ${filteredProductionCosts.length} 条记录`;
                countDisplay.style.display = 'block';
            }
        } else {
            // 不应用筛选，显示所有数据
            filteredProductionCosts = [...window.productionCosts];
            
            // 隐藏筛选结果数量显示
            const countDisplay = document.getElementById('costFilterResultCount');
            if (countDisplay) {
                countDisplay.style.display = 'none';
            }
        }
        
        // 数据按时间倒序排序
        filteredProductionCosts.sort((a, b) => {
            const orderA = window.orders.find(o => String(o.id) === String(a.orderId)) || {};
            const orderB = window.orders.find(o => String(o.id) === String(b.orderId)) || {};
            
            const dateA = orderA.dealDate || '';
            const dateB = orderB.dealDate || '';
            
            // 时间倒序，最新的在前面
            return dateB.localeCompare(dateA);
        });
        
        // 计算总页数
        const totalPages = Math.max(1, Math.ceil(filteredProductionCosts.length / recordsPerPage));
        
        // 确保当前页码有效
        if (currentProductionPage > totalPages) {
            currentProductionPage = totalPages;
        }
        
        // 计算当前页的数据范围
        const startIndex = (currentProductionPage - 1) * recordsPerPage;
        const endIndex = Math.min(startIndex + recordsPerPage, filteredProductionCosts.length);
        const currentPageData = filteredProductionCosts.slice(startIndex, endIndex);
        
        // 渲染表格数据
        if (currentPageData.length === 0) {
            // 如果没有数据，显示提示信息
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="17" class="text-center">暂无生产成本数据</td>`;
            tableBody.appendChild(emptyRow);
        } else {
            // 渲染每一行数据
            currentPageData.forEach((cost, index) => {
                // 获取对应的订单，使用字符串比较避免类型不匹配问题
                const order = window.orders.find(o => String(o.id) === String(cost.orderId)) || {};
                
                // 检查订单是否存在，如果不存在则跳过这条记录
                if (!order.id) {
                    console.log(`跳过显示无效订单ID的生产成本记录: ${cost.id}`);
                    return;
                }
                
                // 计算总成本
                const totalCost = calculateTotalProductionCost(cost);
                
                // 计算毛利润
                const grossProfit = (parseFloat(order.totalPrice) || 0) - (totalCost || 0);
                
                // 创建行元素
                const row = document.createElement('tr');
                row.setAttribute('data-id', cost.id);
                
                // 复选框单元格
                const checkboxCell = document.createElement('td');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'select-production-cost';
                checkbox.setAttribute('data-id', cost.id);
                checkboxCell.appendChild(checkbox);
                
                // 基本信息单元格
                const dateTd = document.createElement('td');
                dateTd.textContent = formatDate(order.dealDate) || '-';
                
                const customerTd = document.createElement('td');
                customerTd.textContent = order.customerName || '-';
                
                const fabricBrandTd = document.createElement('td');
                fabricBrandTd.textContent = cost.fabricBrand || '-';
                
                const fabricCodeTd = document.createElement('td');
                fabricCodeTd.textContent = cost.fabricCode || '-';
                
                // 可编辑的单元格：用料
                const fabricUsageTd = document.createElement('td');
                fabricUsageTd.className = 'editable';
                fabricUsageTd.setAttribute('data-field', 'fabricAmount');
                fabricUsageTd.textContent = `${cost.fabricAmount || '-'}米`;
                fabricUsageTd.addEventListener('dblclick', function(e) {
                    editCostCell(this, cost, 'fabricAmount', 'number');
                    e.stopPropagation();
                });
                
                const configTd = document.createElement('td');
                configTd.textContent = cost.configuration || '-';
                
                const manufacturerTd = document.createElement('td');
                manufacturerTd.textContent = cost.manufacturer || '-';
                
                const totalPriceTd = document.createElement('td');
                totalPriceTd.textContent = `¥${parseFloat(order.totalPrice || 0).toFixed(2)}`;
                
                const totalCostTd = document.createElement('td');
                totalCostTd.textContent = `¥${totalCost.toFixed(2)}`;
                
                const profitTd = document.createElement('td');
                profitTd.textContent = `¥${grossProfit.toFixed(2)}`;
                if (grossProfit < 0) {
                    profitTd.classList.add('text-danger');
                } else {
                    profitTd.classList.add('text-success');
                }
                
                // 可编辑的单元格：面料费
                const fabricCostTd = document.createElement('td');
                fabricCostTd.className = 'editable';
                fabricCostTd.setAttribute('data-field', 'fabricCost');
                fabricCostTd.textContent = cost.fabricCost === '' ? '-' : `¥${parseFloat(cost.fabricCost || 0).toFixed(2)}`;
                fabricCostTd.addEventListener('dblclick', function(e) {
                    editCostCell(this, cost, 'fabricCost', 'number');
                    e.stopPropagation();
                });
                
                // 可编辑的单元格：加工费
                const processingCostTd = document.createElement('td');
                processingCostTd.className = 'editable';
                processingCostTd.setAttribute('data-field', 'processingCost');
                processingCostTd.textContent = cost.processingCost === '' ? '-' : `¥${parseFloat(cost.processingCost || 0).toFixed(2)}`;
                processingCostTd.addEventListener('dblclick', function(e) {
                    editCostCell(this, cost, 'processingCost', 'number');
                    e.stopPropagation();
                });
                
                // 可编辑的单元格：快递费
                const shippingCostTd = document.createElement('td');
                shippingCostTd.className = 'editable';
                shippingCostTd.setAttribute('data-field', 'expressCost');
                shippingCostTd.textContent = cost.expressCost === '' ? '-' : `¥${parseFloat(cost.expressCost || 0).toFixed(2)}`;
                shippingCostTd.addEventListener('dblclick', function(e) {
                    editCostCell(this, cost, 'expressCost', 'number');
                    e.stopPropagation();
                });
                
                // 可编辑的单元格：修改费
                const revisionCostTd = document.createElement('td');
                revisionCostTd.className = 'editable';
                revisionCostTd.setAttribute('data-field', 'modificationCost');
                revisionCostTd.textContent = cost.modificationCost === '' ? '-' : `¥${parseFloat(cost.modificationCost || 0).toFixed(2)}`;
                revisionCostTd.addEventListener('dblclick', function(e) {
                    editCostCell(this, cost, 'modificationCost', 'number');
                    e.stopPropagation();
                });
                
                // 可编辑的单元格：销售提成
                const salesCommissionTd = document.createElement('td');
                salesCommissionTd.className = 'editable';
                salesCommissionTd.setAttribute('data-field', 'salesCommission');
                salesCommissionTd.textContent = cost.salesCommission === '' ? '-' : `¥${parseFloat(cost.salesCommission || 0).toFixed(2)}`;
                salesCommissionTd.addEventListener('dblclick', function(e) {
                    editCostCell(this, cost, 'salesCommission', 'number');
                    e.stopPropagation();
                });
                
                // 可编辑的单元格：备注
                const notesTd = document.createElement('td');
                notesTd.className = 'editable';
                notesTd.setAttribute('data-field', 'notes');
                notesTd.textContent = cost.notes || '-';
                notesTd.addEventListener('dblclick', function(e) {
                    editCostCell(this, cost, 'notes', 'text');
                    e.stopPropagation();
                });
                
                // 添加所有单元格到行
                row.appendChild(checkboxCell);
                row.appendChild(dateTd);
                row.appendChild(customerTd);
                row.appendChild(fabricBrandTd);
                row.appendChild(fabricCodeTd);
                row.appendChild(fabricUsageTd);
                row.appendChild(configTd);
                row.appendChild(manufacturerTd);
                row.appendChild(totalPriceTd);
                row.appendChild(totalCostTd);
                row.appendChild(profitTd);
                row.appendChild(fabricCostTd);
                row.appendChild(processingCostTd);
                row.appendChild(shippingCostTd);
                row.appendChild(revisionCostTd);
                row.appendChild(salesCommissionTd);
                row.appendChild(notesTd);
                
                // 添加行到表格
                tableBody.appendChild(row);
            });
        }
        
        // 更新分页控件
        renderPagination('productionCostPagination', totalPages, currentProductionPage, filteredProductionCosts.length, function(page) {
            currentProductionPage = page;
            renderProductionCostTable(applyFilter);
        });
        
        // 添加全选复选框功能
        const selectAllProductionCost = document.getElementById('selectAllProductionCost');
        if (selectAllProductionCost) {
            // 移除旧的事件监听器
            const newSelectAllCheckbox = selectAllProductionCost.cloneNode(true);
            selectAllProductionCost.parentNode.replaceChild(newSelectAllCheckbox, selectAllProductionCost);
            
            // 添加新的事件监听器
            newSelectAllCheckbox.addEventListener('change', function() {
                const checkboxes = document.querySelectorAll('.select-production-cost');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = this.checked;
                });
            });
        }
    } catch (error) {
        console.error('渲染生产成本表格失败:', error);
        
        // 显示错误信息
        const tableBody = document.getElementById('productionCostTableBody');
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="17" class="text-center text-danger">加载数据时出错: ${error.message}</td></tr>`;
        }
    }
}

// 编辑成本单元格
function editCostCell(cell, cost, fieldName, type, options = []) {
    // 防止重复编辑
    if (cell.classList.contains('editing-cell')) {
        return;
    }
    
    // 标记单元格为编辑状态
    cell.classList.add('editing-cell');
    
    // 移除现有事件监听
    cell.replaceWith(cell.cloneNode(true));
    cell = document.querySelector(`[data-id="${cost.id}"] td[data-field="${fieldName}"]`);
    
    // 获取当前值
    let originalValue = cost[fieldName];
    let displayValue = cell.textContent;
    
    // 对于数值类型的金额字段，需要移除¥符号
    if (type === 'number' && ['fabricCost', 'processingCost', 'expressCost', 
                              'modificationCost', 'salesCommission'].includes(fieldName)) {
        originalValue = originalValue === '' ? '' : (parseFloat(originalValue) || 0).toString();
        displayValue = displayValue === '-' ? '' : displayValue.replace('¥', '');
    }
    
    // 清空单元格内容
    cell.textContent = '';
    
    // 创建编辑控件
    let input;
    
    if (type === 'text') {
        input = document.createElement('input');
        input.type = 'text';
        input.value = originalValue || '';
    } else if (type === 'number') {
        input = document.createElement('input');
        input.type = 'number';
        input.step = '0.01';
        
        if (fieldName === 'fabricAmount') {
            input.value = originalValue || '';
        } else {
            input.value = originalValue || '';
        }
    } else if (type === 'date') {
        input = document.createElement('input');
        input.type = 'date';
        input.value = originalValue || '';
    } else if (type === 'select' && options.length > 0) {
        input = document.createElement('select');
        
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            
            if (option === originalValue) {
                optionElement.selected = true;
            }
            
            input.appendChild(optionElement);
        });
        
        // 添加空选项
        if (!originalValue) {
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = '-- 请选择 --';
            emptyOption.selected = true;
            input.insertBefore(emptyOption, input.firstChild);
        }
    } else {
        input = document.createElement('input');
        input.type = 'text';
        input.value = originalValue || '';
    }
    
    input.className = 'inline-editor';
    
    // 添加键盘事件
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            saveEdit();
            e.preventDefault();
        } else if (e.key === 'Escape') {
            cancelEdit();
            e.preventDefault();
        }
    });
    
    // 失去焦点时保存
    input.addEventListener('blur', function() {
        saveEdit();
    });
    
    // 将编辑控件添加到单元格
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
            // 对于数值类型，如果输入为空，设置为空字符串，不再默认为0
            newValue = input.value === '' ? '' : (parseFloat(input.value) || 0);
        } else {
            newValue = input.value;
        }
        
        // 如果值没有变化，直接返回
        if (cost[fieldName] === newValue) {
            cancelEdit();
            return;
        }
        
        // 保存原始总成本值用于后续比较
        const originalTotalCost = cost.totalCost;
        
        // 更新成本数据
        cost[fieldName] = newValue;
        console.log('已更新成本数据：', fieldName, newValue);
        
        // 标记该记录为手动修改过
        cost.manuallyEdited = true;
        
        // 计算新的总成本，但仅当修改了成本相关字段时
        let newTotalCost = null;
        if (['fabricCost', 'processingCost', 'expressCost', 'modificationCost', 'salesCommission'].includes(fieldName)) {
            newTotalCost = calculateTotalProductionCost(cost);
            // 更新总成本字段
            cost.totalCost = newTotalCost.toFixed(2);
        }
        
        // 保存数据到localStorage之前先设置防自动生成标志
        localStorage.setItem('disableAutoCostGeneration', 'true');
        
        // 保存数据到localStorage
        localStorage.setItem('productionCosts', JSON.stringify(window.productionCosts));
        
        // 更新单元格显示
        if (type === 'date') {
            cell.textContent = newValue;
        } else if (type === 'number') {
            if (fieldName === 'fabricCost' || fieldName === 'processingCost' || 
                fieldName === 'expressCost' || fieldName === 'modificationCost' || 
                fieldName === 'salesCommission') {
                // 如果值为空字符串，显示'-'，否则显示格式化的金额
                cell.textContent = newValue === '' ? '-' : '¥' + parseFloat(newValue).toFixed(2);
                
                // 仅当计算了新的总成本时才更新UI
                if (newTotalCost !== null) {
                    // 更新总成本单元格
                    const row = cell.parentNode;
                    const totalCostCell = row.querySelector('td:nth-child(10)');
                    if (totalCostCell) {
                        totalCostCell.textContent = '¥' + newTotalCost.toFixed(2);
                    }
                    
                    // 获取总价格并更新毛利润
                    const totalPriceCell = row.querySelector('td:nth-child(9)');
                    if (totalPriceCell) {
                        const totalPriceText = totalPriceCell.textContent;
                        const totalPrice = parseFloat(totalPriceText.replace('¥', '')) || 0;
                        
                        // 计算并更新毛利润
                        const profit = totalPrice - newTotalCost;
                        const profitCell = row.querySelector('td:nth-child(11)');
                        if (profitCell) {
                            profitCell.textContent = '¥' + profit.toFixed(2);
                            
                            // 根据利润是否为负，设置不同的颜色
                            if (profit < 0) {
                                profitCell.className = 'text-danger';
                            } else {
                                profitCell.className = 'text-success';
                            }
                        }
                    }
                }
            } else if (fieldName === 'fabricAmount') {
                cell.textContent = newValue === '' ? '-' : newValue + '米';
            } else {
                cell.textContent = newValue === '' ? '-' : newValue;
            }
        } else {
            cell.textContent = newValue || '-';
        }
        
        // 重新添加事件监听器，让单元格再次可编辑
        cell.classList.remove('editing-cell');
        cell.className = 'editable';
        cell.setAttribute('data-field', fieldName);
        cell.addEventListener('dblclick', function(e) {
            editCostCell(this, cost, fieldName, type, options);
            e.stopPropagation();
        });
        
        console.log(`成本数据 ${fieldName} 已更新，已保存到localStorage`);
    }
    
    // 取消编辑
    function cancelEdit() {
        cell.classList.remove('editing-cell');
        cell.textContent = displayValue;
        
        // 重新添加事件监听器
        cell.className = 'editable';
        cell.setAttribute('data-field', fieldName);
        cell.addEventListener('dblclick', function(e) {
            editCostCell(this, cost, fieldName, type, options);
            e.stopPropagation();
        });
    }
}

// 保存生产成本数据到localStorage
function saveProductionCosts() {
    localStorage.setItem('productionCosts', JSON.stringify(window.productionCosts));
    console.log('已保存生产成本数据到本地存储');
}

// 计算总生产成本
function calculateTotalProductionCost(cost) {
    const fabricCost = parseFloat(cost.fabricCost) || 0;
    const processingCost = parseFloat(cost.processingCost) || 0;
    const expressCost = parseFloat(cost.expressCost) || 0;
    const modificationCost = parseFloat(cost.modificationCost) || 0;
    const salesCommission = parseFloat(cost.salesCommission) || 0;
    
    // 严格执行总生产成本=面料费+加工费+快递费+修改费+销售提成
    return fabricCost + processingCost + expressCost + modificationCost + salesCommission;
}

// 渲染生产成本数据到表格
function renderProductionCosts(page = 1) {
    console.log('渲染生产成本数据');
    
    // 确定显示的数据（筛选后的或全部）
    const dataToShow = window.filteredProductionCosts.length > 0 ? window.filteredProductionCosts : window.productionCosts;
    
    // 使用新的渲染函数来绘制表格
    renderProductionCostTable(dataToShow, page);
}

// 格式化金额显示
function formatMoney(value) {
    return parseFloat(value).toFixed(2);
}

// 为文件名格式化日期
function formatDateForFilename(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}`;
}

// 导出生产成本到Excel
function exportProductionCostToExcel() {
    console.log('导出生产成本到Excel...');
    
    try {
        // 检查是否有生产成本数据
        if (!window.productionCosts || !Array.isArray(window.productionCosts) || window.productionCosts.length === 0) {
            alert('没有生产成本数据可导出');
            return;
        }
        
        // 检查是否有订单数据
        if (!window.orders || !Array.isArray(window.orders)) {
            alert('没有订单数据，无法导出生产成本');
            return;
        }
        
        // 准备导出数据
        const exportData = [];
        
        // 遍历生产成本数据
        window.productionCosts.forEach(cost => {
            // 查找对应的订单
            const order = window.orders.find(o => String(o.id) === String(cost.orderId)) || {};
            
            // 计算总成本
            const totalCost = calculateTotalProductionCost(cost);
            
            // 计算毛利润
            const grossProfit = (parseFloat(order.totalPrice) || 0) - (totalCost || 0);
            
            // 创建导出记录
            const exportRecord = {
                '日期': formatDate(order.dealDate) || '-',
                '客户': order.customerName || '-',
                '面料品牌': cost.fabricBrand || '-',
                '面料编号': cost.fabricCode || '-',
                '用量': `${cost.fabricAmount || '0'}米`,
                '款式': cost.configuration || order.configuration || '-',
                '工厂': cost.manufacturer || order.manufacturer || '-',
                '订单金额': parseFloat(order.totalPrice || 0).toFixed(2),
                '总成本': totalCost.toFixed(2),
                '毛利润': grossProfit.toFixed(2),
                '面料费': cost.fabricCost === '' ? '-' : parseFloat(cost.fabricCost || 0).toFixed(2),
                '加工费': cost.processingCost === '' ? '-' : parseFloat(cost.processingCost || 0).toFixed(2),
                '快递费': cost.expressCost === '' ? '-' : parseFloat(cost.expressCost || 0).toFixed(2),
                '修改费': cost.modificationCost === '' ? '-' : parseFloat(cost.modificationCost || 0).toFixed(2),
                '销售提成': cost.salesCommission === '' ? '-' : parseFloat(cost.salesCommission || 0).toFixed(2),
                '备注': cost.remarks || '-'
            };
            
            exportData.push(exportRecord);
        });
        
        // 检查是否有数据
        if (exportData.length === 0) {
            alert('没有符合条件的数据可导出');
            return;
        }
        
        // 导出文件名
        const today = new Date();
        const fileName = `生产成本数据_${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}.xlsx`;
        
        // 检查xlsx库是否可用
        if (typeof XLSX === 'undefined') {
            alert('导出功能不可用，请确保已加载XLSX库');
            return;
        }
        
        // 创建工作簿
        const wb = XLSX.utils.book_new();
        
        // 创建工作表
        const ws = XLSX.utils.json_to_sheet(exportData);
        
        // 添加工作表到工作簿
        XLSX.utils.book_append_sheet(wb, ws, '生产成本数据');
        
        // 导出Excel文件
        XLSX.writeFile(wb, fileName);
        
        console.log('生产成本数据导出成功:', fileName);
        // 删除弹窗提示，避免干扰用户体验
    } catch (error) {
        console.error('导出生产成本数据失败:', error);
        alert('导出失败: ' + error.message);
    }
}

// 删除选中的生产成本记录
function deleteSelectedProductionCosts() {
    console.log('删除选中的生产成本记录...');
    
    try {
        // 获取选中的复选框
        const checkboxes = document.querySelectorAll('.select-production-cost:checked');
        
        // 检查是否有选中的记录
        if (checkboxes.length === 0) {
            alert('请至少选择一条记录');
            return;
        }
        
        // 确认删除
        if (!confirm(`确定要删除选中的 ${checkboxes.length} 条记录吗？`)) {
            return;
        }
        
        // 获取选中的ID
        const selectedIds = Array.from(checkboxes).map(checkbox => checkbox.getAttribute('data-id'));
        
        // 从生产成本数组中删除选中的记录
        const originalLength = window.productionCosts.length;
        window.productionCosts = window.productionCosts.filter(cost => !selectedIds.includes(cost.id));
        
        // 保存更新后的数据
        localStorage.setItem('productionCosts', JSON.stringify(window.productionCosts));
        
        // 重新渲染表格
        renderProductionCostsTable();
        
        console.log(`成功删除了${originalLength - window.productionCosts.length}条生产成本记录`);
        alert(`成功删除了${originalLength - window.productionCosts.length}条记录`);
    } catch (error) {
        console.error('删除生产成本记录失败:', error);
        alert('删除失败: ' + error.message);
    }
}

// 显示成本表单
function showCostForm(mode, subModule, costData = null) {
    console.log(`显示${mode === 'add' ? '新增' : '编辑'}成本表单，子模块:`, subModule);
    
    try {
        // 生产成本需要特殊处理
        if (subModule === 'productionCost') {
            alert('生产成本数据是从订单管理中同步的，不需要手动添加');
            return;
        }
        
        // 设置表单标题
        const formTitle = document.getElementById('costFormTitle');
        if (formTitle) {
            formTitle.textContent = mode === 'add' ? 
                (subModule === 'operatingCost' ? '新增运营成本' : '新增广告成本') : 
                (subModule === 'operatingCost' ? '编辑运营成本' : '编辑广告成本');
        }
        
        // 重置表单
        const form = document.getElementById('costForm');
        if (form) {
            form.reset();
        }
        
        // 设置子模块标识
        document.getElementById('costSubModule').value = subModule;
        
        // 隐藏所有表单字段
        document.getElementById('operatingCostFormFields').style.display = 'none';
        document.getElementById('productionCostFormFields').style.display = 'none';
        document.getElementById('adCostFormFields').style.display = 'none';
        
        // 根据子模块显示对应的表单字段
        if (subModule === 'operatingCost') {
            document.getElementById('operatingCostFormFields').style.display = 'block';
            
            // 设置默认日期为今天
            if (mode === 'add') {
                document.getElementById('costDate').value = formatDate(new Date());
            } else if (costData) {
                // 填充表单数据
                document.getElementById('costId').value = costData.id || '';
                document.getElementById('costDate').value = costData.date || formatDate(new Date());
                document.getElementById('costItem').value = costData.costItem || '';
                document.getElementById('costAmount').value = costData.amount || '';
                document.getElementById('costRemark').value = costData.notes || '';
            }
        } else if (subModule === 'adCost') {
            document.getElementById('adCostFormFields').style.display = 'block';
            
            // 设置默认日期为今天
            if (mode === 'add') {
                document.getElementById('adCostDate').value = formatDate(new Date());
            } else if (costData) {
                // 编辑模式下填充表单
                if (mode === 'edit' && costData) {
                    document.getElementById('adCostDate').value = costData.date || costData.costDate || '';
                    document.getElementById('adCostItem').value = costData.adCostItem || costData.costItem || '';
                    document.getElementById('adCostAmount').value = costData.amount || costData.costAmount || '';
                    document.getElementById('adCostRemark').value = costData.notes || costData.costRemark || '';
                } else {
                    // 填充表单数据
                    document.getElementById('costId').value = costData.id || '';
                    document.getElementById('adCostDate').value = costData.date || formatDate(new Date());
                    document.getElementById('adCostItem').value = costData.costItem || '';
                    document.getElementById('adCostAmount').value = costData.amount || '';
                    document.getElementById('adCostRemark').value = costData.notes || '';
                }
            }
        }
        
        // 显示模态框
        const modal = new bootstrap.Modal(document.getElementById('costFormModal'));
        modal.show();
    } catch (error) {
        console.error(`显示${mode === 'add' ? '新增' : '编辑'}成本表单失败:`, error);
        alert(`显示${mode === 'add' ? '新增' : '编辑'}成本表单失败: ${error.message}`);
    }
}

// 保存成本数据
function saveCost() {
    console.log('保存成本数据...');
    
    // 防止重复提交
    if (window.isSubmittingCost === true) {
        console.log('表单正在提交中，请勿重复点击');
        return;
    }
    
    // 设置全局提交标志
    window.isSubmittingCost = true;
    
    try {
        // 获取表单数据
        const form = document.getElementById('costForm');
        const formData = new FormData(form);
        
        // 获取子模块
        const subModule = formData.get('subModule');
        
        // 创建成本数据对象
        const costData = {};
        
        // 获取ID（如果是编辑模式）
        const costId = formData.get('id');
        if (costId) {
            costData.id = costId;
        } else {
            // 新增模式，生成唯一ID
            costData.id = generateUUID();
        }
        
        // 根据子模块获取对应的表单数据
        if (subModule === 'operatingCost') {
            costData.date = formData.get('costDate');
            costData.costDate = formData.get('costDate'); // 兼容性字段
            costData.costType = '运营成本';
            costData.costCategory = '日常运营';
            costData.costItem = formData.get('costItem');
            costData.amount = parseFloat(formData.get('costAmount')) || 0;
            costData.costAmount = parseFloat(formData.get('costAmount')) || 0; // 兼容性字段
            costData.notes = formData.get('costRemark');
            costData.costRemark = formData.get('costRemark'); // 兼容性字段
            costData.paymentMethod = '其他'; // 默认支付方式
            
            // 检查必填字段
            if (!costData.date || !costData.costItem || costData.amount <= 0) {
                alert('请填写所有必填字段（日期、成本项目、金额）');
                return;
            }
            
            // 确保window.operatingCosts存在
            if (!window.operatingCosts) {
                window.operatingCosts = [];
            }
            
            // 添加或更新数据
            if (costId) {
                // 更新现有数据
                const index = window.operatingCosts.findIndex(cost => cost.id === costId);
                if (index !== -1) {
                    window.operatingCosts[index] = costData;
                } else {
                    // 如果找不到对应ID的数据，添加为新数据
                    window.operatingCosts.push(costData);
                }
            } else {
                // 添加新数据
                window.operatingCosts.push(costData);
            }
            
            // 同时更新costs数组（保持兼容性）
            window.costs = window.operatingCosts;
            
            // 保存到localStorage（同时保存到costs和operatingCosts两个键）
            localStorage.setItem('operatingCosts', JSON.stringify(window.operatingCosts));
            localStorage.setItem('costs', JSON.stringify(window.operatingCosts));
            
            // 重新渲染表格
            renderOperatingCostsTable(false);
        } else if (subModule === 'adCost') {
            costData.date = formData.get('adCostDate');
            costData.costDate = formData.get('adCostDate'); // 兼容性字段
            costData.costType = '广告成本';
            costData.costCategory = '营销推广';
            costData.costItem = formData.get('adCostItem');
            costData.adCostItem = formData.get('adCostItem'); // 添加这个字段确保与表格渲染匹配
            costData.amount = parseFloat(formData.get('adCostAmount')) || 0;
            costData.costAmount = parseFloat(formData.get('adCostAmount')) || 0; // 兼容性字段
            costData.notes = formData.get('adCostRemark');
            costData.costRemark = formData.get('adCostRemark'); // 兼容性字段
            costData.paymentMethod = '其他'; // 默认支付方式
            
            console.log('广告成本表单数据:', {
                date: costData.date,
                item: costData.costItem,
                amount: costData.amount
            });
            
            // 检查必填字段
            if (!costData.date || !costData.costItem || costData.amount <= 0) {
                alert('请填写所有必填字段（日期、成本项目、金额）');
                return;
            }
            
            // 确保window.adCosts存在
            if (!window.adCosts) {
                window.adCosts = [];
            }
            
            // 添加或更新数据
            if (costId) {
                // 更新现有数据
                const index = window.adCosts.findIndex(cost => cost.id === costId);
                if (index !== -1) {
                    window.adCosts[index] = costData;
                } else {
                    // 如果找不到对应ID的数据，添加为新数据
                    window.adCosts.push(costData);
                }
            } else {
                // 添加新数据
                window.adCosts.push(costData);
            }
            
            // 保存到localStorage
            localStorage.setItem('adCosts', JSON.stringify(window.adCosts));
            
            // 重新渲染表格
            renderAdCostsTable(false);
        }
        
        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('costFormModal'));
        if (modal) {
            modal.hide();
        }
        
        // 提示成功
        alert(`${costId ? '编辑' : '新增'}成本记录成功！`);
        
    } catch (error) {
        console.error('保存成本数据失败:', error);
        alert('保存成本数据失败: ' + error.message);
    } finally {
        // 无论成功还是失败，都重置提交标志
        setTimeout(() => {
            window.isSubmittingCost = false;
            console.log('重置提交状态');
        }, 1000);
    }
}

// 导出运营成本到Excel
function exportOperatingCostToExcel() {
    try {
        // 获取选中的行
        const selectedCheckboxes = document.querySelectorAll('.select-operating-cost:checked');
        
        // 如果有选中的行，则只导出选中的数据
        let costsToExport = [];
        
        if (selectedCheckboxes.length > 0) {
            // 获取选中的ID
            const selectedIds = Array.from(selectedCheckboxes).map(checkbox => checkbox.getAttribute('data-id'));
            
            // 筛选选中的成本数据
            costsToExport = window.operatingCosts.filter(cost => selectedIds.includes(cost.id));
            
            console.log(`已选择${selectedCheckboxes.length}条运营成本记录进行导出`);
        } else {
            // 没有选中行，则导出当前筛选后的所有数据
            costsToExport = filteredCosts.length > 0 ? filteredCosts : window.operatingCosts.filter(cost => cost.costType === '运营成本');
            console.log(`未选择特定记录，将导出所有${costsToExport.length}条运营成本数据`);
        }
        
        if (costsToExport.length === 0) {
            alert('没有可导出的运营成本数据');
            return;
        }
        
        // 格式化数据
        const formattedData = costsToExport.map(cost => ({
            '日期': cost.date || cost.costDate || '',
            '成本类型': cost.costType || '运营成本',
            '成本项目': cost.costItem || '',
            '金额(元)': parseFloat(cost.amount || cost.costAmount || 0).toFixed(2),
            '备注': cost.notes || cost.costRemark || ''
        }));
        
        // 生成文件名
        const fileName = `运营成本数据_${formatDateForFilename(new Date())}.xlsx`;
        
        // 导出到Excel
        exportArrayToExcel(formattedData, fileName, '运营成本');
        
        console.log('运营成本数据导出成功:', fileName);
    } catch (error) {
        console.error('导出运营成本数据失败:', error);
        alert('导出运营成本数据失败: ' + error.message);
    }
}

// 导出广告成本到Excel
function exportAdCostToExcel() {
    try {
        // 获取选中的行
        const selectedCheckboxes = document.querySelectorAll('.select-ad-cost:checked');
        
        // 如果有选中的行，则只导出选中的数据
        let costsToExport = [];
        
        if (selectedCheckboxes.length > 0) {
            // 获取选中的ID
            const selectedIds = Array.from(selectedCheckboxes).map(checkbox => checkbox.getAttribute('data-id'));
            
            // 筛选选中的成本数据
            costsToExport = window.adCosts.filter(cost => selectedIds.includes(cost.id));
            
            console.log(`已选择${selectedCheckboxes.length}条广告成本记录进行导出`);
        } else {
            // 没有选中行，则导出当前筛选后的所有数据
            costsToExport = filteredAdCosts.length > 0 ? filteredAdCosts : window.adCosts.filter(cost => cost.costType === '广告成本');
            console.log(`未选择特定记录，将导出所有${costsToExport.length}条广告成本数据`);
        }
        
        if (costsToExport.length === 0) {
            alert('没有可导出的广告成本数据');
            return;
        }
        
        // 格式化数据
        const formattedData = costsToExport.map(cost => ({
            '日期': cost.date || cost.costDate || '',
            '成本类型': cost.costType || '广告成本',
            '成本项目': cost.costItem || '',
            '金额(元)': parseFloat(cost.amount || cost.costAmount || 0).toFixed(2),
            '备注': cost.notes || cost.costRemark || ''
        }));
        
        // 生成文件名
        const fileName = `广告成本数据_${formatDateForFilename(new Date())}.xlsx`;
        
        // 导出到Excel
        exportArrayToExcel(formattedData, fileName, '广告成本');
        
        console.log('广告成本数据导出成功:', fileName);
    } catch (error) {
        console.error('导出广告成本数据失败:', error);
        alert('导出广告成本数据失败: ' + error.message);
    }
}

// 将数组导出为Excel文件
function exportArrayToExcel(dataArray, fileName, sheetName) {
    try {
        // 检查XLSX库是否可用
        if (typeof XLSX === 'undefined') {
            alert('导出功能不可用，请确保已加载XLSX库');
            return;
        }
        
        // 创建工作簿
        const wb = XLSX.utils.book_new();
        
        // 创建工作表
        const ws = XLSX.utils.json_to_sheet(dataArray);
        
        // 添加工作表到工作簿
        XLSX.utils.book_append_sheet(wb, ws, sheetName || '数据');
        
        // 导出Excel文件
        XLSX.writeFile(wb, fileName);
        
        console.log('数据导出成功:', fileName);
        // 删除成功提示弹窗，避免干扰用户体验
    } catch (error) {
        console.error('导出数据失败:', error);
        alert('导出失败: ' + error.message);
    }
}

// 初始化全选复选框功能
function initSelectAllCheckboxes() {
    console.log('初始化全选复选框功能...');
    
    // 生产成本表格全选
    const selectAllProductionCost = document.getElementById('selectAllProductionCost');
    if (selectAllProductionCost) {
        selectAllProductionCost.addEventListener('click', function() {
            const isChecked = this.checked;
            const checkboxes = document.querySelectorAll('.select-production-cost');
            checkboxes.forEach(checkbox => {
                checkbox.checked = isChecked;
            });
            console.log(`已${isChecked ? '选中' : '取消选中'}${checkboxes.length}条生产成本记录`);
        });
        console.log('生产成本全选功能初始化完成');
    } else {
        console.warn('未找到生产成本全选复选框');
    }
    
    // 运营成本表格全选
    const selectAllOperatingCost = document.getElementById('selectAllOperatingCost');
    if (selectAllOperatingCost) {
        selectAllOperatingCost.addEventListener('click', function() {
            const isChecked = this.checked;
            const checkboxes = document.querySelectorAll('.select-operating-cost');
            checkboxes.forEach(checkbox => {
                checkbox.checked = isChecked;
            });
            console.log(`已${isChecked ? '选中' : '取消选中'}${checkboxes.length}条运营成本记录`);
        });
        console.log('运营成本全选功能初始化完成');
    } else {
        console.warn('未找到运营成本全选复选框');
    }
    
    // 广告成本表格全选
    const selectAllAdCost = document.getElementById('selectAllAdCost');
    if (selectAllAdCost) {
        selectAllAdCost.addEventListener('click', function() {
            const isChecked = this.checked;
            const checkboxes = document.querySelectorAll('.select-ad-cost');
            checkboxes.forEach(checkbox => {
                checkbox.checked = isChecked;
            });
            console.log(`已${isChecked ? '选中' : '取消选中'}${checkboxes.length}条广告成本记录`);
        });
        console.log('广告成本全选功能初始化完成');
    } else {
        console.warn('未找到广告成本全选复选框');
    }
}

// 更新成本趋势图表
function updateCostTrendChart(operatingCosts, productionCosts, adCosts, startDate, endDate, costType) {
    console.log('更新成本趋势图表...');
    
    // 获取图表容器
    const chartContainer = document.getElementById('costTrendChart');
    if (!chartContainer) {
        console.error('未找到成本趋势图表容器');
        return;
    }
    
    // 如果已有图表实例，先销毁
    if (window.costTrendChartInstance) {
        window.costTrendChartInstance.destroy();
    }
    
    // 准备图表数据
    
    // 1. 设置日期范围
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // 2. 根据日期范围长度决定数据粒度：天、周、月
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let labels = [];
    let groupingUnit = 'day'; // 默认按天分组
    
    if (diffDays > 90) {
        groupingUnit = 'month'; // 三个月以上按月分组
    } else if (diffDays > 30) {
        groupingUnit = 'week'; // 一个月以上按周分组
    }
    
    // 3. 生成时间标签
    if (groupingUnit === 'day') {
        // 按天生成标签
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            labels.push(formatDate(d));
        }
    } else if (groupingUnit === 'week') {
        // 按周生成标签
        let currentDate = new Date(start);
        while (currentDate <= end) {
            // 获取这周的开始日期
            const weekStart = new Date(currentDate);
            labels.push(formatDate(weekStart) + '周');
            // 前进一周
            currentDate.setDate(currentDate.getDate() + 7);
        }
    } else {
        // 按月生成标签
        const months = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const monthKey = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2);
            if (!months.includes(monthKey)) {
                months.push(monthKey);
                labels.push(monthKey);
            }
        }
    }
    
    // 4. 准备数据集
    const operatingCostData = new Array(labels.length).fill(0);
    const productionCostData = new Array(labels.length).fill(0);
    const adCostData = new Array(labels.length).fill(0);
    
    // 5. 根据粒度聚合数据
    // 处理运营成本
    operatingCosts.forEach(cost => {
        const date = new Date(cost.date);
        const amount = parseFloat(cost.amount) || 0;
        
        if (groupingUnit === 'day') {
            // 按天
            const dateStr = formatDate(date);
            const index = labels.indexOf(dateStr);
            if (index >= 0) {
                operatingCostData[index] += amount;
            }
        } else if (groupingUnit === 'week') {
            // 按周
            // 找到这个日期所在的周
            for (let i = 0; i < labels.length; i++) {
                const weekStart = new Date(labels[i].replace('周', ''));
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);
                
                if (date >= weekStart && date <= weekEnd) {
                    operatingCostData[i] += amount;
                    break;
                }
            }
        } else {
            // 按月
            const monthKey = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2);
            const index = labels.indexOf(monthKey);
            if (index >= 0) {
                operatingCostData[index] += amount;
            }
        }
    });
    
    // 处理广告成本
    adCosts.forEach(cost => {
        const date = new Date(cost.date);
        const amount = parseFloat(cost.amount) || 0;
        
        if (groupingUnit === 'day') {
            const dateStr = formatDate(date);
            const index = labels.indexOf(dateStr);
            if (index >= 0) {
                adCostData[index] += amount;
            }
        } else if (groupingUnit === 'week') {
            for (let i = 0; i < labels.length; i++) {
                const weekStart = new Date(labels[i].replace('周', ''));
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);
                
                if (date >= weekStart && date <= weekEnd) {
                    adCostData[i] += amount;
                    break;
                }
            }
        } else {
            const monthKey = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2);
            const index = labels.indexOf(monthKey);
            if (index >= 0) {
                adCostData[index] += amount;
            }
        }
    });
    
    // 处理生产成本
    productionCosts.forEach(cost => {
        // 查找对应的订单
        const order = window.orders ? window.orders.find(o => o.id === cost.orderId) : null;
        if (!order) return;
        
        const date = new Date(order.dealDate);
        const amount = calculateTotalProductionCost(cost); // 计算总生产成本
        
        if (groupingUnit === 'day') {
            const dateStr = formatDate(date);
            const index = labels.indexOf(dateStr);
            if (index >= 0) {
                productionCostData[index] += amount;
            }
        } else if (groupingUnit === 'week') {
            for (let i = 0; i < labels.length; i++) {
                const weekStart = new Date(labels[i].replace('周', ''));
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);
                
                if (date >= weekStart && date <= weekEnd) {
                    productionCostData[i] += amount;
                    break;
                }
            }
        } else {
            const monthKey = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2);
            const index = labels.indexOf(monthKey);
            if (index >= 0) {
                productionCostData[index] += amount;
            }
        }
    });
    
    // 6. 根据筛选条件过滤数据
    let datasets = [];
    if (costType === 'all' || costType === 'operating') {
        datasets.push({
            label: '运营成本',
            data: operatingCostData,
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderWidth: 2,
            fill: false
        });
    }
    
    if (costType === 'all' || costType === 'production') {
        datasets.push({
            label: '生产成本',
            data: productionCostData,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderWidth: 2,
            fill: false
        });
    }
    
    if (costType === 'all' || costType === 'ad') {
        datasets.push({
            label: '广告成本',
            data: adCostData,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 2,
            fill: false
        });
    }
    
    // 7. 创建图表配置
    const config = {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: '成本趋势分析'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ¥' + context.raw.toFixed(2);
                        }
                    }
                },
                legend: {
                    position: 'top',
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: groupingUnit === 'day' ? '日期' : (groupingUnit === 'week' ? '周' : '月份')
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '金额 (元)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '¥' + value;
                        }
                    }
                }
            }
        }
    };
    
    // 8. 创建图表
    const ctx = chartContainer.getContext('2d');
    window.costTrendChartInstance = new Chart(ctx, config);
    
    console.log('成本趋势图表更新完成');
}

// 更新成本类型饼图
function updateCostTypeChart(operatingCosts, productionCosts, adCosts, costType) {
    console.log('更新成本类型饼图...');
    
    // 获取图表容器
    const chartContainer = document.getElementById('costTypeChart');
    if (!chartContainer) {
        console.error('未找到成本类型图表容器');
        return;
    }
    
    // 如果已有图表实例，先销毁
    if (window.costTypeChartInstance) {
        window.costTypeChartInstance.destroy();
    }
    
    // 计算各类成本总额
    const totalOperatingCost = operatingCosts.reduce((sum, cost) => sum + (parseFloat(cost.amount) || 0), 0);
    const totalProductionCost = productionCosts.reduce((sum, cost) => sum + (calculateTotalProductionCost(cost) || 0), 0);
    const totalAdCost = adCosts.reduce((sum, cost) => sum + (parseFloat(cost.amount) || 0), 0);
    
    // 准备数据
    let labels = [];
    let data = [];
    let backgroundColor = [];
    
    // 根据筛选条件显示相应数据
    if (costType === 'all' || costType === 'operating') {
        labels.push('运营成本');
        data.push(totalOperatingCost);
        backgroundColor.push('rgba(54, 162, 235, 0.8)');
    }
    
    if (costType === 'all' || costType === 'production') {
        labels.push('生产成本');
        data.push(totalProductionCost);
        backgroundColor.push('rgba(255, 99, 132, 0.8)');
    }
    
    if (costType === 'all' || costType === 'ad') {
        labels.push('广告成本');
        data.push(totalAdCost);
        backgroundColor.push('rgba(75, 192, 192, 0.8)');
    }
    
    // 创建图表配置
    const config = {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColor,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: '成本类型分布'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return label + ': ¥' + value.toFixed(2) + ' (' + percentage + '%)';
                        }
                    }
                },
                legend: {
                    position: 'top',
                }
            }
        }
    };
    
    // 创建图表
    const ctx = chartContainer.getContext('2d');
    window.costTypeChartInstance = new Chart(ctx, config);
    
    console.log('成本类型饼图更新完成');
}

// 更新生产成本详细分析图表
function updateProductionCostDetailChart(productionCosts, costType) {
    console.log('更新生产成本详细分析图表...');
    
    // 如果不是生产成本或全部成本类型，不更新此图表
    if (costType !== 'all' && costType !== 'production') {
        console.log('当前不显示生产成本，跳过更新生产成本详细图表');
        return;
    }
    
    // 获取图表容器
    const chartContainer = document.getElementById('productionCostDetailChart');
    if (!chartContainer) {
        console.error('未找到生产成本详细图表容器');
        return;
    }
    
    // 如果已有图表实例，先销毁
    if (window.productionCostDetailChartInstance) {
        window.productionCostDetailChartInstance.destroy();
    }
    
    // 如果没有生产成本数据，显示无数据信息
    if (!productionCosts || productionCosts.length === 0) {
        const ctx = chartContainer.getContext('2d');
        ctx.clearRect(0, 0, chartContainer.width, chartContainer.height);
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#999';
        ctx.fillText('暂无生产成本数据', chartContainer.width / 2, chartContainer.height / 2);
        return;
    }
    
    // 计算各项成本总和
    let fabricCostTotal = 0;
    let processingCostTotal = 0;
    let expressCostTotal = 0;
    let modificationCostTotal = 0;
    let salesCommissionTotal = 0;
    let otherCostTotal = 0;
    
    productionCosts.forEach(cost => {
        fabricCostTotal += parseFloat(cost.fabricCost || 0);
        processingCostTotal += parseFloat(cost.processingCost || 0);
        expressCostTotal += parseFloat(cost.expressCost || 0);
        modificationCostTotal += parseFloat(cost.modificationCost || 0);
        salesCommissionTotal += parseFloat(cost.salesCommission || 0);
        otherCostTotal += parseFloat(cost.otherCost || 0);
    });
    
    // 准备数据
    const labels = ['面料费', '加工费', '快递费', '修改费', '销售提成', '其他'];
    const data = [
        fabricCostTotal.toFixed(2),
        processingCostTotal.toFixed(2),
        expressCostTotal.toFixed(2),
        modificationCostTotal.toFixed(2),
        salesCommissionTotal.toFixed(2),
        otherCostTotal.toFixed(2)
    ];
    
    // 设置颜色
    const backgroundColor = [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)'
    ];
    
    // 创建图表配置
    const config = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '金额',
                data: data,
                backgroundColor: backgroundColor,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: '生产成本明细分析'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '金额: ¥' + context.raw;
                        }
                    }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '金额 (元)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '¥' + value;
                        }
                    }
                }
            }
        }
    };
    
    // 创建图表
    const ctx = chartContainer.getContext('2d');
    window.productionCostDetailChartInstance = new Chart(ctx, config);
    
    console.log('生产成本详细分析图表更新完成');
}

// 更新运营成本详细分析图表
function updateOperatingCostDetailChart(operatingCosts, costType) {
    console.log('更新运营成本详细分析图表...');
    
    // 如果不是运营成本或全部成本类型，不更新此图表
    if (costType !== 'all' && costType !== 'operating') {
        console.log('当前不显示运营成本，跳过更新运营成本详细图表');
        return;
    }
    
    // 获取图表容器
    const chartContainer = document.getElementById('operatingCostDetailChart');
    if (!chartContainer) {
        console.error('未找到运营成本详细图表容器');
        return;
    }
    
    // 如果已有图表实例，先销毁
    if (window.operatingCostDetailChartInstance) {
        window.operatingCostDetailChartInstance.destroy();
    }
    
    // 如果没有运营成本数据，显示无数据信息
    if (!operatingCosts || operatingCosts.length === 0) {
        const ctx = chartContainer.getContext('2d');
        ctx.clearRect(0, 0, chartContainer.width, chartContainer.height);
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#999';
        ctx.fillText('暂无运营成本数据', chartContainer.width / 2, chartContainer.height / 2);
        return;
    }
    
    // 按成本项目分组统计
    const costItemMap = {};
    operatingCosts.forEach(cost => {
        const costItem = cost.costItem || '其他';
        const amount = parseFloat(cost.amount) || 0;
        
        if (!costItemMap[costItem]) {
            costItemMap[costItem] = 0;
        }
        costItemMap[costItem] += amount;
    });
    
    // 准备数据
    const labels = Object.keys(costItemMap);
    const data = labels.map(key => costItemMap[key].toFixed(2));
    
    // 设置颜色
    const colorPool = [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)',
        'rgba(201, 203, 207, 0.8)',
        'rgba(255, 99, 71, 0.8)',
        'rgba(46, 139, 87, 0.8)',
        'rgba(106, 90, 205, 0.8)'
    ];
    
    const backgroundColor = labels.map((_, i) => colorPool[i % colorPool.length]);
    
    // 创建图表配置
    const config = {
        type: 'polarArea',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColor,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: '运营成本项目分布'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return label + ': ¥' + value + ' (' + percentage + '%)';
                        }
                    }
                },
                legend: {
                    position: 'right',
                }
            }
        }
    };
    
    // 创建图表
    const ctx = chartContainer.getContext('2d');
    window.operatingCostDetailChartInstance = new Chart(ctx, config);
    
    console.log('运营成本详细分析图表更新完成');
}

// 加载成本数据
function loadCostData() {
    console.log('加载成本数据...');
    
    // 设置禁用自动生成标志
    localStorage.setItem('disableAutoCostGeneration', 'true');
    console.log('已设置禁用自动生成标志，确保不会重置生产成本数据');
    
    // 初始化生产成本数据缓存
    window.dataCache = window.dataCache || {};
    window.dataCache.production = {
        data: null,
        filtered: null,
        lastUpdate: null,
        rendered: false
    };
    
    // 初始化其他成本数据缓存
    window.dataCache.operating = {
        data: null,
        filtered: null,
        lastUpdate: null,
        rendered: false
    };
    
    window.dataCache.ad = {
        data: null,
        filtered: null,
        lastUpdate: null,
        rendered: false
    };
    
    // 确保数据已加载
    if (!window.productionCosts) {
        if (localStorage.getItem('productionCosts')) {
            try {
                window.productionCosts = JSON.parse(localStorage.getItem('productionCosts'));
                console.log(`加载了 ${window.productionCosts.length} 条生产成本数据`);
            } catch (error) {
                console.error('解析生产成本数据出错:', error);
                window.productionCosts = [];
            }
        } else {
            window.productionCosts = [];
            console.log('未找到生产成本数据，初始化为空数组');
        }
    }
    
    if (!window.operatingCosts) {
        if (localStorage.getItem('operatingCosts')) {
            try {
                window.operatingCosts = JSON.parse(localStorage.getItem('operatingCosts'));
                console.log(`加载了 ${window.operatingCosts.length} 条运营成本数据`);
            } catch (error) {
                console.error('解析运营成本数据出错:', error);
                window.operatingCosts = [];
            }
        } else {
            // 兼容旧数据，尝试从costs加载
            if (localStorage.getItem('costs')) {
                try {
                    window.operatingCosts = JSON.parse(localStorage.getItem('costs'));
                    console.log(`加载了 ${window.operatingCosts.length} 条运营成本数据（从旧数据结构）`);
                } catch (error) {
                    console.error('解析costs数据出错:', error);
                    window.operatingCosts = [];
                }
            } else {
                window.operatingCosts = [];
                console.log('未找到运营成本数据，初始化为空数组');
            }
        }
    }
    
    // 同时初始化window.costs（兼容旧代码）
    window.costs = window.operatingCosts;
    
    if (!window.adCosts) {
        if (localStorage.getItem('adCosts')) {
            try {
                window.adCosts = JSON.parse(localStorage.getItem('adCosts'));
                console.log(`加载了 ${window.adCosts.length} 条广告成本数据`);
            } catch (error) {
                console.error('解析广告成本数据出错:', error);
                window.adCosts = [];
            }
        } else {
            window.adCosts = [];
            console.log('未找到广告成本数据，初始化为空数组');
        }
    }
    
    // 初始化筛选过的数据数组
    window.filteredProductionCosts = [];
    window.filteredOperatingCosts = [];
    window.filteredAdCosts = [];
}

/**
 * 更新广告成本明细图表
 * @param {Array} adCosts - 广告成本数据
 * @param {String} costType - 成本类型
 */
function updateAdCostDetailChart(adCosts, costType) {
    console.log('更新广告成本明细图表', adCosts.length);
    
    // 获取图表容器
    const chartContainer = document.getElementById('adCostDetailChart');
    if (!chartContainer) {
        console.error('找不到广告成本明细图表容器');
        return;
    }
    
    // 销毁旧图表实例
    if (window.adCostDetailChartInstance) {
        window.adCostDetailChartInstance.destroy();
    }
    
    // 如果没有数据，显示无数据提示
    if (!adCosts || adCosts.length === 0) {
        // 创建画布上下文
        const ctx = chartContainer.getContext('2d');
        
        // 清除画布
        ctx.clearRect(0, 0, chartContainer.width, chartContainer.height);
        
        // 绘制无数据提示
        ctx.font = '16px Microsoft YaHei';
        ctx.fillStyle = '#999';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('暂无广告成本数据', chartContainer.width / 2, chartContainer.height / 2);
        
        return;
    }
    
    // 统计不同平台的广告费用
    const platformCosts = {};
    adCosts.forEach(item => {
        const platform = item.platform || '其他';
        if (!platformCosts[platform]) {
            platformCosts[platform] = 0;
        }
        platformCosts[platform] += parseFloat(item.amount || 0);
    });
    
    // 准备图表数据
    const labels = Object.keys(platformCosts);
    const amounts = labels.map(label => platformCosts[label]);
    
    // 颜色设置
    const backgroundColors = [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)',
        'rgba(199, 199, 199, 0.7)'
    ];
    
    // 创建画布上下文
    const ctx = chartContainer.getContext('2d');
    
    // 配置图表
    const config = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '广告费用(元)',
                data: amounts,
                backgroundColor: backgroundColors.slice(0, labels.length),
                borderColor: backgroundColors.slice(0, labels.length).map(color => color.replace('0.7', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += '¥' + context.parsed.y.toFixed(2);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '¥' + value;
                        }
                    }
                }
            }
        }
    };
    
    // 创建图表实例
    window.adCostDetailChartInstance = new Chart(ctx, config);
}

/**
 * 加载并显示成本统计数据
 */
function loadCostStatisticsData() {
    console.log('加载成本统计数据...');
    
    // 获取所有成本数据
    const productionCosts = getCostsFromStorage('productionCosts') || [];
    const operatingCosts = getCostsFromStorage('operatingCosts') || [];
    const adCosts = getCostsFromStorage('adCosts') || [];
    
    // 获取筛选条件
    const startDate = document.getElementById('costStatsStartDate').value;
    const endDate = document.getElementById('costStatsEndDate').value;
    const costType = document.getElementById('costStatsType').value;
    
    // 筛选数据
    let filteredProductionCosts = productionCosts;
    let filteredOperatingCosts = operatingCosts;
    let filteredAdCosts = adCosts;
    
    if (startDate && endDate) {
        filteredProductionCosts = filterProductionCostsByDateRange(productionCosts, startDate, endDate);
        filteredOperatingCosts = filterCostsByDateRange(operatingCosts, startDate, endDate);
        filteredAdCosts = filterCostsByDateRange(adCosts, startDate, endDate);
    }
    
    // 根据成本类型进一步筛选
    if (costType !== 'all') {
        if (costType === 'production') {
            filteredOperatingCosts = [];
            filteredAdCosts = [];
        } else if (costType === 'operating') {
            filteredProductionCosts = [];
            filteredAdCosts = [];
        } else if (costType === 'ad') {
            filteredProductionCosts = [];
            filteredOperatingCosts = [];
        }
    }
    
    // 保存筛选后的数据到全局变量，以便其他函数使用
    window.filteredProductionCosts = filteredProductionCosts;
    window.filteredOperatingCosts = filteredOperatingCosts;
    window.filteredAdCosts = filteredAdCosts;
    
    // 更新各图表
    updateCostSummaryCards(filteredProductionCosts, filteredOperatingCosts, filteredAdCosts);
    updateCostTrendChart(filteredProductionCosts, filteredOperatingCosts, filteredAdCosts, costType);
    updateCostTypeChart(filteredProductionCosts, filteredOperatingCosts, filteredAdCosts, costType);
    updateProductionCostDetailChart(filteredProductionCosts, costType);
    updateOperatingCostDetailChart(filteredOperatingCosts, costType);
    updateAdCostDetailChart(filteredAdCosts, costType);
}

// 编辑运营成本单元格
function editOperatingCostCell(cell, cost, fieldName, type) {
    // 防止重复编辑
    if (cell.classList.contains('editing-cell')) {
        return;
    }
    
    // 标记单元格为编辑状态
    cell.classList.add('editing-cell');
    
    // 移除现有事件监听
    const originalCell = cell;
    cell.replaceWith(cell.cloneNode(true));
    cell = document.querySelector(`[data-id="${cost.id}"] td[data-field="${fieldName}"]`);
    
    // 获取当前值
    let originalValue = cost[fieldName];
    let displayValue = cell.textContent;
    
    // 对于数值类型的金额字段，需要移除¥符号
    if (type === 'number' && fieldName === 'amount') {
        originalValue = originalValue === '' ? '' : (parseFloat(originalValue) || 0).toString();
        displayValue = displayValue === '-' ? '' : displayValue.replace('¥', '');
    }
    
    // 清空单元格内容
    cell.textContent = '';
    
    // 创建编辑控件
    let input;
    
    if (type === 'text') {
        input = document.createElement('input');
        input.type = 'text';
        input.value = originalValue || '';
    } else if (type === 'number') {
        input = document.createElement('input');
        input.type = 'number';
        input.step = '0.01';
        input.value = originalValue || '';
    } else if (type === 'date') {
        input = document.createElement('input');
        input.type = 'date';
        input.value = originalValue || '';
    } else {
        input = document.createElement('input');
        input.type = 'text';
        input.value = originalValue || '';
    }
    
    input.className = 'inline-editor';
    
    // 添加键盘事件
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            saveEdit();
            e.preventDefault();
        } else if (e.key === 'Escape') {
            cancelEdit();
            e.preventDefault();
        }
    });
    
    // 失去焦点时保存
    input.addEventListener('blur', function() {
        saveEdit();
    });
    
    // 将编辑控件添加到单元格
    cell.appendChild(input);
    
    // 聚焦到编辑控件
    input.focus();
    
    // 如果不是select，选择所有文本
    input.select();
    
    // 保存编辑
    function saveEdit() {
        // 获取新值
        let newValue;
        if (type === 'date') {
            newValue = input.value;
        } else if (type === 'number') {
            // 对于数值类型，如果输入为空，设置为空字符串，不再默认为0
            newValue = input.value === '' ? '' : (parseFloat(input.value) || 0);
        } else {
            newValue = input.value;
        }
        
        // 如果值没有变化，直接返回
        if (cost[fieldName] === newValue) {
            cancelEdit();
            return;
        }
        
        // 更新成本数据
        cost[fieldName] = newValue;
        console.log('已更新运营成本数据：', fieldName, newValue);
        
        // 标记该记录为手动修改过
        cost.manuallyEdited = true;
        
        // 保存数据到localStorage
        localStorage.setItem('operatingCosts', JSON.stringify(window.operatingCosts));
        
        // 更新单元格显示
        if (type === 'date') {
            cell.textContent = formatDate(newValue) || '-';
        } else if (type === 'number') {
            if (fieldName === 'amount') {
                cell.textContent = newValue === '' ? '-' : '¥' + parseFloat(newValue).toFixed(2);
            } else {
                cell.textContent = newValue === '' ? '-' : newValue;
            }
        } else {
            cell.textContent = newValue || '-';
        }
        
        // 移除编辑状态标记
        cell.classList.remove('editing-cell');
        
        // 更新运营成本图表
        updateOperatingCostChart('halfYear');
        
        // 更新成本统计数据
        if (document.getElementById('costStatistics').style.display !== 'none') {
            loadCostStatisticsData();
        }
    }
    
    // 取消编辑
    function cancelEdit() {
        // 移除编辑控件，恢复原始显示
        if (type === 'date') {
            cell.textContent = formatDate(originalValue) || '-';
        } else if (type === 'number' && fieldName === 'amount') {
            cell.textContent = originalValue === '' ? '-' : '¥' + parseFloat(originalValue).toFixed(2);
        } else {
            cell.textContent = originalValue || '-';
        }
        
        // 移除编辑状态标记
        cell.classList.remove('editing-cell');
    }
}

// 编辑广告成本单元格
function editAdCostCell(cell, cost, fieldName, type) {
    // 防止重复编辑
    if (cell.classList.contains('editing-cell')) {
        return;
    }
    
    // 处理字段兼容性
    if (fieldName === 'adCostItem') {
        // 确保使用实际存在的字段值
        if (!cost.hasOwnProperty('adCostItem')) {
            cost.adCostItem = cost.costItem || cost.platform || '';
        }
        // 同时更新costItem字段，保持一致性
        cost.costItem = cost.adCostItem;
    }
    
    // 标记单元格为编辑状态
    cell.classList.add('editing-cell');
    
    // 移除现有事件监听
    const originalCell = cell;
    cell.replaceWith(cell.cloneNode(true));
    cell = document.querySelector(`[data-id="${cost.id}"] td[data-field="${fieldName}"]`);
    
    // 获取当前值
    let originalValue = cost[fieldName];
    let displayValue = cell.textContent;
    
    // 对于数值类型的金额字段，需要移除¥符号
    if (type === 'number' && fieldName === 'amount') {
        originalValue = originalValue === '' ? '' : (parseFloat(originalValue) || 0).toString();
        displayValue = displayValue === '-' ? '' : displayValue.replace('¥', '');
    }
    
    // 清空单元格内容
    cell.textContent = '';
    
    // 创建编辑控件
    let input;
    
    if (type === 'text') {
        input = document.createElement('input');
        input.type = 'text';
        input.value = originalValue || '';
    } else if (type === 'number') {
        input = document.createElement('input');
        input.type = 'number';
        input.step = '0.01';
        input.value = originalValue || '';
    } else if (type === 'date') {
        input = document.createElement('input');
        input.type = 'date';
        input.value = originalValue || '';
    } else {
        input = document.createElement('input');
        input.type = 'text';
        input.value = originalValue || '';
    }
    
    input.className = 'inline-editor';
    
    // 添加键盘事件
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            saveEdit();
            e.preventDefault();
        } else if (e.key === 'Escape') {
            cancelEdit();
            e.preventDefault();
        }
    });
    
    // 失去焦点时保存
    input.addEventListener('blur', function() {
        saveEdit();
    });
    
    // 将编辑控件添加到单元格
    cell.appendChild(input);
    
    // 聚焦到编辑控件
    input.focus();
    
    // 如果不是select，选择所有文本
    input.select();
    
    // 保存编辑
    function saveEdit() {
        // 获取新值
        let newValue;
        if (type === 'date') {
            newValue = input.value;
        } else if (type === 'number') {
            // 对于数值类型，如果输入为空，设置为空字符串，不再默认为0
            newValue = input.value === '' ? '' : (parseFloat(input.value) || 0);
        } else {
            newValue = input.value;
        }
        
        // 如果值没有变化，直接返回
        if (cost[fieldName] === newValue) {
            cancelEdit();
            return;
        }
        
        // 更新成本数据
        cost[fieldName] = newValue;
        
        // 如果更新的是adCostItem字段，同时更新costItem字段保持兼容性
        if (fieldName === 'adCostItem') {
            cost.costItem = newValue;
            cost.platform = newValue;
        }
        
        console.log('已更新广告成本数据：', fieldName, newValue);
        
        // 标记该记录为手动修改过
        cost.manuallyEdited = true;
        
        // 保存数据到localStorage
        localStorage.setItem('adCosts', JSON.stringify(window.adCosts));
        
        // 更新单元格显示
        if (type === 'date') {
            cell.textContent = formatDate(newValue) || '-';
        } else if (type === 'number') {
            if (fieldName === 'amount') {
                cell.textContent = newValue === '' ? '-' : '¥' + parseFloat(newValue).toFixed(2);
            } else {
                cell.textContent = newValue === '' ? '-' : newValue;
            }
        } else {
            cell.textContent = newValue || '-';
        }
        
        // 移除编辑状态标记
        cell.classList.remove('editing-cell');
        
        // 更新广告成本图表
        updateAdCostChart('halfYear');
        
        // 更新成本统计数据
        if (document.getElementById('costStatistics').style.display !== 'none') {
            loadCostStatisticsData();
        }
    }
    
    // 取消编辑
    function cancelEdit() {
        // 移除编辑控件，恢复原始显示
        if (type === 'date') {
            cell.textContent = formatDate(originalValue) || '-';
        } else if (type === 'number' && fieldName === 'amount') {
            cell.textContent = originalValue === '' ? '-' : '¥' + parseFloat(originalValue).toFixed(2);
        } else {
            cell.textContent = originalValue || '-';
        }
        
        // 移除编辑状态标记
        cell.classList.remove('editing-cell');
    }
}

// 修复广告成本数据的adCostItem字段
function fixAdCostItemField() {
    console.log('开始修复广告成本数据...');
    
    if (window.adCosts && window.adCosts.length > 0) {
        let hasFixedData = false;
        
        window.adCosts.forEach(cost => {
            if (cost.costItem && !cost.adCostItem) {
                cost.adCostItem = cost.costItem;
                hasFixedData = true;
            }
        });
        
        if (hasFixedData) {
            console.log('已修复广告成本数据中缺失的adCostItem字段');
            localStorage.setItem('adCosts', JSON.stringify(window.adCosts));
            // 重新渲染广告成本表格
            if (typeof renderAdCostsTable === 'function') {
                renderAdCostsTable(false);
            }
        } else {
            console.log('广告成本数据无需修复');
        }
    } else {
        console.log('无广告成本数据可修复');
    }
}

// 页面加载完成后的初始化函数
document.addEventListener('DOMContentLoaded', function() {
    // 在页面已经加载了另一个脚本的情况下，不重复初始化
    if (window.costModuleInitialized === true) {
        console.log('成本管理模块已在其他地方初始化，跳过重复初始化');
        return;
    }
    
    console.log('页面加载完成，初始化成本管理模块...');
    
    // 设置初始化标志
    window.costModuleInitialized = true;
    
    // 初始化模块
    initCostModule();
    
    // 修复广告成本数据
    setTimeout(fixAdCostItemField, 1000);
    
    // 初始化全选功能
    setTimeout(initSelectAllCheckboxes, 500);
});