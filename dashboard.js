// 定义常量
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5分钟自动刷新
const PROFIT_THRESHOLD = 0.2; // 利润率预警阈值
const DELIVERY_WARNING_DAYS = 3; // 交付预警天数

// 初始化仪表盘
function initDashboard() {
    console.log('初始化仪表盘...');
    loadDashboardData();
    setupAutoRefresh();
    setupEventListeners();
}

// 加载仪表盘数据
async function loadDashboardData() {
    try {
        console.log('加载仪表盘数据...');
        await Promise.all([
            updateOverviewCards(),
            updateCharts(),
            updateTodoLists(),
            updateWarnings()
        ]);
        console.log('仪表盘数据加载完成');
    } catch (error) {
        console.error('加载仪表盘数据失败:', error);
        showErrorMessage('数据加载失败，请刷新页面重试');
    }
}

// 设置自动刷新
function setupAutoRefresh() {
    setInterval(() => {
        loadDashboardData();
    }, REFRESH_INTERVAL);
}

// 设置事件监听器
function setupEventListeners() {
    // 手动刷新按钮
    document.getElementById('refreshDashboard')?.addEventListener('click', loadDashboardData);
    
    // 时间范围选择器
    document.getElementById('chartTimeRange')?.addEventListener('change', updateCharts);
    
    // 区域折叠/展开按钮
    document.querySelectorAll('.section-toggle').forEach(button => {
        button.addEventListener('click', toggleSection);
    });
}

// 更新总览卡片
async function updateOverviewCards() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // 获取订单数据
    const allOrders = window.orders || [];
    const thisMonthOrders = allOrders.filter(order => new Date(order.orderDate) >= firstDayOfMonth);
    const lastMonthOrders = allOrders.filter(order => {
        const orderDate = new Date(order.orderDate);
        return orderDate >= lastMonthStart && orderDate <= lastMonthEnd;
    });

    // 计算订单数据
    const orderStats = {
        total: allOrders.length,
        thisMonth: thisMonthOrders.length,
        growth: calculateGrowthRate(thisMonthOrders.length, lastMonthOrders.length)
    };

    // 计算营收数据
    const revenueStats = {
        total: calculateTotalRevenue(allOrders),
        thisMonth: calculateTotalRevenue(thisMonthOrders),
        growth: calculateGrowthRate(
            calculateTotalRevenue(thisMonthOrders),
            calculateTotalRevenue(lastMonthOrders)
        )
    };

    // 计算成本数据
    const costStats = {
        total: calculateTotalCosts(allOrders),
        thisMonth: calculateTotalCosts(thisMonthOrders),
        growth: calculateGrowthRate(
            calculateTotalCosts(thisMonthOrders),
            calculateTotalCosts(lastMonthOrders)
        )
    };

    // 计算客户数据
    const customerStats = {
        total: countUniqueCustomers(allOrders),
        thisMonth: countUniqueCustomers(thisMonthOrders),
        growth: calculateGrowthRate(
            countUniqueCustomers(thisMonthOrders),
            countUniqueCustomers(lastMonthOrders)
        )
    };

    // 更新UI
    updateOverviewCard('orderCard', orderStats);
    updateOverviewCard('revenueCard', revenueStats);
    updateOverviewCard('costCard', costStats);
    updateOverviewCard('customerCard', customerStats);
}

// 更新图表
async function updateCharts() {
    const timeRange = document.getElementById('chartTimeRange')?.value || 'month';
    const months = 6;
    
    // 准备数据
    const chartData = prepareChartData(timeRange, months);
    
    // 更新各个图表
    drawOrderTrendChart(chartData.orders);
    drawRevenueTrendChart(chartData.revenue);
    drawCustomerSourceChart(chartData.customerSources);
    drawProfitTrendChart(chartData.profits);
}

// 更新待办事项列表
async function updateTodoLists() {
    updateDeliveryTodoList();
    updatePaymentTodoList();
    updateProductionTodoList();
}

// 更新预警信息
async function updateWarnings() {
    updateDeliveryWarnings();
    updateCostWarnings();
    updateProfitWarnings();
}

// 辅助函数：计算增长率
function calculateGrowthRate(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
}

// 辅助函数：计算总收入
function calculateTotalRevenue(orders) {
    return orders.reduce((sum, order) => sum + (parseFloat(order.totalPrice) || 0), 0);
}

// 辅助函数：计算总成本
function calculateTotalCosts(orders) {
    return orders.reduce((sum, order) => {
        const costs = [
            parseFloat(order.fabricCost) || 0,
            parseFloat(order.processingCost) || 0,
            parseFloat(order.shippingCost) || 0,
            parseFloat(order.modificationCost) || 0,
            parseFloat(order.commission) || 0,
            parseFloat(order.otherCost) || 0
        ];
        return sum + costs.reduce((a, b) => a + b, 0);
    }, 0);
}

// 辅助函数：统计唯一客户数
function countUniqueCustomers(orders) {
    return new Set(orders.map(order => order.customerName)).size;
}

// 更新总览卡片UI
function updateOverviewCard(cardId, stats) {
    const card = document.getElementById(cardId);
    if (!card) return;

    const totalElement = card.querySelector('.total-value');
    const monthlyElement = card.querySelector('.monthly-value');
    const growthElement = card.querySelector('.growth-value');

    if (totalElement) totalElement.textContent = formatNumber(stats.total);
    if (monthlyElement) monthlyElement.textContent = formatNumber(stats.thisMonth);
    if (growthElement) {
        growthElement.textContent = formatGrowth(stats.growth);
        growthElement.classList.toggle('positive', stats.growth >= 0);
        growthElement.classList.toggle('negative', stats.growth < 0);
    }
}

// 格式化数字
function formatNumber(value) {
    if (typeof value === 'number') {
        return value.toLocaleString('zh-CN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
    return '0.00';
}

// 格式化增长率
function formatGrowth(value) {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
}

// 显示错误消息
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

// 切换区域显示/隐藏
function toggleSection(event) {
    const section = event.target.closest('.dashboard-section');
    const content = section.querySelector('.section-content');
    const icon = event.target.querySelector('i');
    
    content.classList.toggle('collapsed');
    icon.classList.toggle('rotated');
}

// 准备图表数据
function prepareChartData(timeRange, months) {
    const now = new Date();
    const data = {
        orders: [],
        revenue: [],
        customerSources: {},
        profits: []
    };

    // 生成时间范围内的数据点
    for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        
        // 过滤该时间段的订单
        const periodOrders = window.orders.filter(order => {
            const orderDate = new Date(order.orderDate);
            return orderDate >= date && orderDate <= endDate;
        });

        // 统计数据
        const periodRevenue = calculateTotalRevenue(periodOrders);
        const periodCosts = calculateTotalCosts(periodOrders);
        const periodProfit = periodRevenue - periodCosts;
        const profitRate = periodRevenue > 0 ? (periodProfit / periodRevenue) * 100 : 0;

        // 添加到数据集
        data.orders.push({
            date: date.toISOString().slice(0, 7),
            value: periodOrders.length
        });

        data.revenue.push({
            date: date.toISOString().slice(0, 7),
            value: periodRevenue
        });

        data.profits.push({
            date: date.toISOString().slice(0, 7),
            value: profitRate
        });

        // 统计客户来源
        periodOrders.forEach(order => {
            const source = order.customerSource || '其他';
            data.customerSources[source] = (data.customerSources[source] || 0) + 1;
        });
    }

    return data;
}

// 导出函数
window.initDashboard = initDashboard;
window.loadDashboardData = loadDashboardData; 