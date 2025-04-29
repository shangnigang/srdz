// 订单统计模块 - 独立实现
// 与order.js解耦，避免冲突

// 在页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('订单统计模块初始化中...');
    
    // 绑定统计模块导航事件
    bindStatisticsNavEvent();
    
    // 如果URL参数中有统计模块标记，则自动切换到统计模块
    if (window.location.search.includes('module=statistics')) {
        showStatisticsModule();
    }
});

// 绑定统计模块导航事件
function bindStatisticsNavEvent() {
    const statisticsNavLink = document.querySelector('.nav-link[data-module="orderStatistics"]');
    if (statisticsNavLink) {
        console.log('找到订单统计导航链接，绑定事件');
        
        statisticsNavLink.addEventListener('click', function(event) {
            event.preventDefault();
            showStatisticsModule();
        });
    } else {
        console.error('未找到订单统计导航链接');
    }
}

// 显示统计模块
function showStatisticsModule() {
    console.log('切换到订单统计模块');
    
    // 更新导航状态
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    const statisticsNavLink = document.querySelector('.nav-link[data-module="orderStatistics"]');
    if (statisticsNavLink) {
        statisticsNavLink.classList.add('active');
    }
    
    // 隐藏其他模块，显示统计模块
    document.querySelectorAll('.module-content').forEach(module => {
        module.style.display = 'none';
    });
    
    const statisticsModule = document.getElementById('orderStatistics');
    if (statisticsModule) {
        statisticsModule.style.display = 'block';
        initializeStatistics();
    } else {
        console.error('未找到订单统计模块容器');
    }
}

// 初始化统计功能
function initializeStatistics() {
    console.log('初始化统计数据和图表');
    
    // 确保订单数据已加载
    if (!window.orders || !Array.isArray(window.orders)) {
        console.log('订单数据未加载，准备加载数据');
        loadOrderData().then(() => {
            setupStatisticsModule();
        }).catch(error => {
            console.error('加载订单数据失败:', error);
            showErrorMessage('无法加载订单数据，请刷新页面重试');
        });
    } else {
        console.log(`订单数据已加载，共 ${window.orders.length} 条记录`);
        setupStatisticsModule();
    }
}

// 加载订单数据
function loadOrderData() {
    return new Promise((resolve, reject) => {
        try {
            // 检查common.js中是否有loadOrders函数
            if (typeof window.loadOrders === 'function') {
                console.log('使用common.js中的loadOrders函数加载数据');
                window.loadOrders().then(resolve).catch(reject);
            } else {
                console.log('无法找到全局loadOrders函数，尝试从localStorage加载');
                
                // 从localStorage直接加载
                const ordersData = localStorage.getItem('orders');
                if (ordersData) {
                    try {
                        window.orders = JSON.parse(ordersData);
                        console.log(`从localStorage加载了 ${window.orders.length} 条订单数据`);
                        resolve();
                    } catch (e) {
                        console.error('解析订单数据失败:', e);
                        reject(new Error('解析订单数据失败'));
                    }
                } else {
                    window.orders = [];
                    console.warn('未找到订单数据，使用空数组');
                    resolve();
                }
            }
        } catch (error) {
            console.error('加载订单数据过程中出错:', error);
            reject(error);
        }
    });
}

// 设置统计模块
function setupStatisticsModule() {
    try {
        // 设置默认日期范围（近3个月）
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 3);
        
        const statsStartDate = document.getElementById('statsStartDate');
        const statsEndDate = document.getElementById('statsEndDate');
        
        if (statsStartDate && statsEndDate) {
            statsStartDate.value = formatDate(startDate);
            statsEndDate.value = formatDate(endDate);
            console.log('日期范围设置成功:', formatDate(startDate), '至', formatDate(endDate));
        } else {
            console.error('未找到日期选择器元素');
        }
        
        // 加载Chart.js库
        loadChartJS().then(() => {
            console.log('Chart.js加载成功，开始生成统计数据');
            // 生成统计数据
            generateStatistics();
            
            // 绑定筛选按钮事件
            const applyStatsFilter = document.getElementById('applyStatsFilter');
            if (applyStatsFilter) {
                // 先移除之前可能存在的事件监听器，避免重复绑定
                applyStatsFilter.removeEventListener('click', generateStatistics);
                applyStatsFilter.addEventListener('click', generateStatistics);
                console.log('筛选按钮事件绑定成功');
            } else {
                console.error('找不到统计筛选按钮');
            }
        }).catch(error => {
            console.error('加载Chart.js失败:', error);
            showErrorMessage('无法加载图表库，请检查网络连接');
        });
    } catch (error) {
        console.error('设置统计模块时出错:', error);
    }
}

// 加载Chart.js库
function loadChartJS() {
    return new Promise((resolve, reject) => {
        // 如果已加载，直接返回
        if (window.Chart) {
            resolve();
            return;
        }
        
        // CDN列表
        const cdnUrls = [
            'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js',
            'https://unpkg.com/chart.js@3.9.1/dist/chart.min.js',
            'https://cdn.bootcdn.net/ajax/libs/Chart.js/3.9.1/chart.min.js'
        ];
        
        // 尝试加载
        let loadAttempt = 0;
        
        function tryLoadScript() {
            if (loadAttempt >= cdnUrls.length) {
                reject(new Error('所有Chart.js CDN加载失败'));
                return;
            }
            
            const script = document.createElement('script');
            script.src = cdnUrls[loadAttempt];
            
            script.onload = () => {
                if (window.Chart) {
                    resolve();
                } else {
                    loadAttempt++;
                    tryLoadScript();
                }
            };
            
            script.onerror = () => {
                loadAttempt++;
                tryLoadScript();
            };
            
            document.head.appendChild(script);
        }
        
        tryLoadScript();
    });
}

// 生成统计数据
function generateStatistics() {
    try {
        console.log('生成订单统计数据...');
        
        // 获取日期范围
        const startDate = document.getElementById('statsStartDate')?.value || '';
        const endDate = document.getElementById('statsEndDate')?.value || '';
        
        if (!startDate || !endDate) {
            showErrorMessage('请选择有效的日期范围');
            return;
        }
        
        // 筛选订单
        const filteredOrders = window.orders.filter(order => 
            order.dealDate && order.dealDate >= startDate && order.dealDate <= endDate
        );
        
        console.log(`筛选出 ${filteredOrders.length} 条订单记录`);
        
        // 更新统计卡片
        updateStatisticsCards(filteredOrders);
        
        // 更新图表
        updateOrderTrendChart(filteredOrders, startDate, endDate);
        updateCustomerSourceChart(filteredOrders);
        updateFabricBrandChart(filteredOrders);
        updateOrderAmountChart(filteredOrders);
        
        console.log('统计数据生成完成');
    } catch (error) {
        console.error('生成统计数据时出错:', error);
        showErrorMessage('生成统计数据时出错，请查看控制台日志');
    }
}

// 更新统计卡片
function updateStatisticsCards(orders) {
    // 订单总数
    const totalOrdersCount = document.getElementById('totalOrdersCount');
    if (totalOrdersCount) {
        totalOrdersCount.textContent = orders.length;
    }
    
    // 销售总额
    const totalSales = orders.reduce((sum, order) => sum + (parseFloat(order.totalPrice) || 0), 0);
    const totalSalesAmount = document.getElementById('totalSalesAmount');
    if (totalSalesAmount) {
        totalSalesAmount.textContent = '¥' + totalSales.toFixed(2);
    }
    
    // 平均订单金额
    const avgOrderAmount = orders.length > 0 ? totalSales / orders.length : 0;
    const avgOrderAmountElement = document.getElementById('avgOrderAmount');
    if (avgOrderAmountElement) {
        avgOrderAmountElement.textContent = '¥' + avgOrderAmount.toFixed(2);
    }
    
    // 客户数量
    const uniqueCustomers = new Set(orders.map(order => order.customerName));
    const customerCount = document.getElementById('customerCount');
    if (customerCount) {
        customerCount.textContent = uniqueCustomers.size;
    }
}

// 更新订单趋势图表
function updateOrderTrendChart(orders, startDate, endDate) {
    try {
        console.log('更新订单趋势图表...');
        
        const canvas = document.getElementById('orderTrendChart');
        if (!canvas) {
            console.error('找不到订单趋势图表容器');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        // 清除旧图表
        if (window.orderTrendChartInstance) {
            window.orderTrendChartInstance.destroy();
        }
        
        // 按月份对订单进行分组
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
        
        // 统计每月的订单数和销售额
        orders.forEach(order => {
            if (!order.dealDate) return;
            
            const orderDate = new Date(order.dealDate);
            const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
            
            if (monthData[monthKey] !== undefined) {
                monthData[monthKey]++;
                salesData[monthKey] += parseFloat(order.totalPrice) || 0;
            }
        });
        
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
        
        // 创建图表配置
        const config = {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
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
        
        // 创建图表实例
        window.orderTrendChartInstance = new Chart(ctx, config);
        console.log('订单趋势图表更新完成');
    } catch (error) {
        console.error('更新订单趋势图表时出错:', error);
    }
}

// 更新客户来源饼图
function updateCustomerSourceChart(orders) {
    try {
        console.log('更新客户来源分布图...');
        
        const canvas = document.getElementById('customerSourceChart');
        if (!canvas) {
            console.error('找不到客户来源图表容器');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
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
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 15
                        }
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
        console.log('客户来源分布图更新完成');
    } catch (error) {
        console.error('更新客户来源分布图时出错:', error);
    }
}

// 更新面料品牌饼图
function updateFabricBrandChart(orders) {
    try {
        console.log('更新面料品牌分布图...');
        
        const canvas = document.getElementById('fabricBrandChart');
        if (!canvas) {
            console.error('找不到面料品牌图表容器');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
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
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 15
                        }
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
        console.log('面料品牌分布图更新完成');
    } catch (error) {
        console.error('更新面料品牌分布图时出错:', error);
    }
}

// 更新订单金额柱状图
function updateOrderAmountChart(orders) {
    try {
        console.log('更新订单金额分布图...');
        
        const canvas = document.getElementById('orderAmountChart');
        if (!canvas) {
            console.error('找不到订单金额图表容器');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
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
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '订单数量'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        };
        
        // 创建图表实例
        window.orderAmountChartInstance = new Chart(ctx, config);
        console.log('订单金额分布图更新完成');
    } catch (error) {
        console.error('更新订单金额分布图时出错:', error);
    }
}

// 辅助函数 - 格式化日期
function formatDate(date) {
    if (!date) return '';
    
    if (typeof date === 'string') {
        // 如果已经是YYYY-MM-DD格式，直接返回
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return date;
        }
        // 否则转为Date对象
        date = new Date(date);
    }
    
    // 检查日期对象是否有效
    if (isNaN(date.getTime())) {
        console.error('无效的日期:', date);
        return '';
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

// 辅助函数 - 显示错误消息
function showErrorMessage(message) {
    alert(message);
} 