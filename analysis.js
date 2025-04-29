// 经营分析模块脚本

// 分析模块全局变量
let filteredOrdersForAnalysis = [];
let filteredCostsForAnalysis = [];
let filteredProductionCostsForAnalysis = [];
let chartInstances = {};

// 初始化分析模块
function initAnalysisModule() {
    try {
        console.log('初始化经营分析模块...');
        
        // 设置默认日期范围（最近半年）
        const today = new Date();
        document.getElementById('analysisEndDate').value = formatDate(today);
        
        const halfYearAgo = new Date();
        halfYearAgo.setMonth(halfYearAgo.getMonth() - 6);
        document.getElementById('analysisStartDate').value = formatDate(halfYearAgo);
        
        // 默认加载最近半年的数据
        refreshAnalysisData('overviewAnalysis', formatDate(halfYearAgo), formatDate(today));
        
        // 添加事件监听
        addAnalysisEventListeners();
        
        console.log('经营分析模块初始化完成');
    } catch (error) {
        console.error('初始化经营分析模块出错:', error);
        alert('初始化失败: ' + error.message);
    }
}

// 刷新分析数据
function refreshAnalysisData(subModule, startDate, endDate) {
    try {
        console.log('刷新分析数据，子模块:', subModule);
        
        // 【新增】检查是否强制显示空数据
        const forceEmptyData = localStorage.getItem('forceEmptyData') === 'true';
        if (forceEmptyData) {
            console.log('检测到强制清空数据标志，将显示空数据状态');
            clearAllAnalysisSubModules();
            localStorage.removeItem('forceEmptyData'); // 清除标志，避免一直显示空数据
            return;
        }
        
        // 获取日期范围
        if (!startDate) startDate = document.getElementById('analysisStartDate').value;
        if (!endDate) endDate = document.getElementById('analysisEndDate').value;
        
        if (!startDate || !endDate) {
            alert('请选择有效的日期范围');
            return;
        }
        
        // 【新增】检查localStorage中是否有数据
        const ordersData = localStorage.getItem('orders');
        const costsData = localStorage.getItem('costs');
        const productionCostsData = localStorage.getItem('productionCosts');
        
        // 判断是否真的有数据（排除空数组的情况）
        const hasNoData = 
            (!ordersData || ordersData === '[]') && 
            (!costsData || costsData === '[]') && 
            (!productionCostsData || productionCostsData === '[]');
        
        if (hasNoData) {
            console.log('检测到无数据，将显示空数据状态');
            clearAllAnalysisSubModules();
            return;
        }
        
        // 强制从localStorage重新加载最新数据，确保不使用可能已过期的缓存数据
        const loadOrders = localStorage.getItem('orders');
        if (loadOrders) {
            orders = JSON.parse(loadOrders);
            window.orders = orders;
            console.log('已强制重新加载订单数据:', orders.length, '条');
        } else {
            orders = [];
            window.orders = [];
            console.log('localStorage中没有订单数据');
        }
        
        const loadCosts = localStorage.getItem('costs');
        if (loadCosts) {
            costs = JSON.parse(loadCosts);
            window.costs = costs;
            console.log('已强制重新加载成本数据:', costs.length, '条');
        } else {
            costs = [];
            window.costs = [];
            console.log('localStorage中没有成本数据');
        }
        
        const loadProductionCosts = localStorage.getItem('productionCosts');
        if (loadProductionCosts) {
            productionCosts = JSON.parse(loadProductionCosts);
            window.productionCosts = productionCosts;
            console.log('已强制重新加载生产成本数据:', productionCosts.length, '条');
        } else {
            productionCosts = [];
            window.productionCosts = [];
            console.log('localStorage中没有生产成本数据');
        }
        
        // 筛选指定日期范围内的数据
        filterDataByDateRange(startDate, endDate);
        
        // 【新增】再次检查筛选后是否有数据
        if (filteredOrdersForAnalysis.length === 0 && 
            filteredCostsForAnalysis.length === 0 && 
            filteredProductionCostsForAnalysis.length === 0) {
            console.log('筛选后无数据，将显示空数据状态');
            clearAllAnalysisSubModules();
            return;
        }
        
        // 根据子模块类型加载不同的分析
        switch (subModule) {
            case 'overviewAnalysis':
                loadOverviewAnalysis();
                break;
            case 'salesAnalysis':
                loadSalesAnalysis();
                break;
            case 'customerAnalysis':
                loadCustomerAnalysis();
                break;
            case 'productAnalysis':
                loadProductAnalysis();
                break;
            case 'profitAnalysis':
                loadProfitAnalysis();
                break;
            default:
                console.warn('未知的分析子模块:', subModule);
        }
    } catch (error) {
        console.error('刷新分析数据出错:', error);
        alert('加载分析数据失败: ' + error.message);
        // 出错时也显示空状态
        clearAllAnalysisSubModules();
    }
}

// 按日期范围筛选数据
function filterDataByDateRange(startDate, endDate) {
    try {
        console.log('按日期范围筛选数据:', startDate, '至', endDate);
        
        // 筛选订单数据 - 使用成交日期(dealDate)
        filteredOrdersForAnalysis = orders.filter(order => {
            const orderDate = order.dealDate || '1970-01-01';
            return orderDate >= startDate && orderDate <= endDate;
        });
        
        // 筛选运营成本数据 - 使用成本日期(costDate)
        filteredCostsForAnalysis = costs.filter(cost => {
            const costDate = cost.costDate || '1970-01-01';
            return costDate >= startDate && costDate <= endDate;
        });
        
        // 筛选生产成本数据 - 通过关联订单的成交日期筛选
        filteredProductionCostsForAnalysis = productionCosts.filter(cost => {
            if (!cost.orderId) return false;
            
            const relatedOrder = orders.find(order => order.id === cost.orderId);
            if (!relatedOrder) return false;
            
            const orderDate = relatedOrder.dealDate || '1970-01-01';
            return orderDate >= startDate && orderDate <= endDate;
        });
        
        console.log('筛选结果 - 订单:', filteredOrdersForAnalysis.length, 
                   '运营成本:', filteredCostsForAnalysis.length, 
                   '生产成本:', filteredProductionCostsForAnalysis.length);
    } catch (error) {
        console.error('按日期范围筛选数据出错:', error);
        throw error;
    }
}

// 加载整体概览分析
function loadOverviewAnalysis() {
    try {
        console.log('加载整体概览分析...');
        
        // 更新统计卡片
        updateStatCards();
        
        // 加载销售与利润趋势图
        loadSalesProfitTrendChart();
        
        // 加载订单来源饼图
        loadOrderSourcePieChart();
        
        // 加载面料品牌偏好图
        loadFabricBrandChart();
        
        // 加载季节订单分布图
        loadSeasonalOrderChart();
        
        console.log('整体概览分析加载完成');
    } catch (error) {
        console.error('加载整体概览分析出错:', error);
    }
}

// 加载销售分析
function loadSalesAnalysis() {
    try {
        console.log('加载销售分析...');
        
        // 更新销售分析统计卡片
        updateSalesAnalysisCards();
        
        // 加载月度销售趋势图
        loadMonthlySalesChart();
        
        // 加载销售渠道分析图
        loadSalesChannelChart();
        
        // 加载价格区间分布图
        loadPriceRangeChart();
        
        console.log('销售分析加载完成');
    } catch (error) {
        console.error('加载销售分析出错:', error);
    }
}

// 加载客户分析
function loadCustomerAnalysis() {
    try {
        console.log('加载客户分析...');
        
        // 更新客户分析统计卡片
        updateCustomerAnalysisCards();
        
        // 加载客户来源分析图
        loadCustomerSourceChart();
        
        // 加载客户性别分布图
        loadCustomerGenderChart();
        
        // 加载新老客户比例图
        loadNewReturningCustomerChart();
        
        console.log('客户分析加载完成');
    } catch (error) {
        console.error('加载客户分析出错:', error);
    }
}

// 加载产品分析
function loadProductAnalysis() {
    try {
        console.log('加载产品分析...');
        
        // 更新产品分析统计卡片
        updateProductAnalysisCards();
        
        // 加载热门面料品牌分析图
        loadPopularFabricBrandChart();
        
        // 加载颜色偏好分析图
        loadColorPreferenceChart();
        
        // 加载面料用量分布图
        loadFabricUsageChart();
        
        console.log('产品分析加载完成');
    } catch (error) {
        console.error('加载产品分析出错:', error);
    }
}

// 加载利润分析
function loadProfitAnalysis() {
    try {
        console.log('加载利润分析...');
        
        // 检查是否有实际数据
        if (filteredOrdersForAnalysis.length === 0 && filteredCostsForAnalysis.length === 0 && filteredProductionCostsForAnalysis.length === 0) {
            // 如果没有数据，显示空状态
            updateEmptyProfitCards();
            clearProfitCharts();
            return;
        }
        
        // 加载月度利润趋势图
        loadMonthlyProfitChart();
        
        // 加载各面料品牌利润对比图
        loadFabricBrandProfitChart();
        
        // 加载成本与利润比例图
        loadCostProfitRatioChart();
        
        // 更新利润分析统计卡片
        updateProfitAnalysisCards();
        
        console.log('利润分析加载完成');
    } catch (error) {
        console.error('加载利润分析出错:', error);
        // 出错时显示空状态
        updateEmptyProfitCards();
        clearProfitCharts();
    }
}

// 更新统计卡片
function updateStatCards() {
    try {
        // 计算当前时段的统计数据
        const totalOrders = filteredOrdersForAnalysis.length;
        const totalSales = filteredOrdersForAnalysis.reduce((sum, order) => sum + (parseFloat(order.totalPrice) || 0), 0);
        
        // 计算总成本 = 运营成本 + 生产成本
        const operatingCosts = filteredCostsForAnalysis.reduce((sum, cost) => sum + (parseFloat(cost.costAmount) || 0), 0);
        
        let productionCostsTotal = 0;
        filteredProductionCostsForAnalysis.forEach(cost => {
            productionCostsTotal += (parseFloat(cost.fabricCost) || 0) + 
                                   (parseFloat(cost.processingCost) || 0) + 
                                   (parseFloat(cost.accessoriesCost) || 0);
        });
        
        const totalCosts = operatingCosts + productionCostsTotal;
        const totalProfit = totalSales - totalCosts;
        
        // 更新UI显示
        document.getElementById('totalOrdersValue').textContent = totalOrders;
        document.getElementById('totalSalesValue').textContent = '¥' + totalSales.toFixed(2);
        document.getElementById('totalCostsValue').textContent = '¥' + totalCosts.toFixed(2);
        document.getElementById('totalProfitValue').textContent = '¥' + totalProfit.toFixed(2);
        
        // 暂时不计算环比增长，需要前后两个时间段的数据
        // TODO: 实现环比增长计算
    } catch (error) {
        console.error('更新统计卡片出错:', error);
    }
}

// 创建/更新图表的通用函数
function createOrUpdateChart(chartId, chartType, options) {
    try {
        const chartDom = document.getElementById(chartId);
        if (!chartDom) {
            console.error('找不到图表容器:', chartId);
            return null;
        }
        
        // 如果已存在图表实例，销毁它
        if (chartInstances[chartId]) {
            chartInstances[chartId].dispose();
        }
        
        // 创建新的图表实例
        const chart = echarts.init(chartDom);
        chartInstances[chartId] = chart;
        
        // 设置图表选项
        chart.setOption(options);
        
        // 响应窗口大小变化
        window.addEventListener('resize', function() {
            chart.resize();
        });
        
        return chart;
    } catch (error) {
        console.error('创建/更新图表出错:', error, '图表ID:', chartId);
        return null;
    }
}

// ===================== 图表生成函数 =====================

// 加载销售与利润趋势图
function loadSalesProfitTrendChart() {
    try {
        console.log('加载销售与利润趋势图...');
        
        // 按月份分组数据
        const monthlyData = groupDataByMonth(filteredOrdersForAnalysis, filteredCostsForAnalysis);
        
        // 准备图表数据
        const months = Object.keys(monthlyData).sort();
        const salesData = months.map(month => monthlyData[month].sales);
        const profitData = months.map(month => monthlyData[month].profit);
        
        // 配置图表选项
        const options = {
            title: {
                text: '销售与利润趋势',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                formatter: function(params) {
                    let result = params[0].name + '<br/>';
                    params.forEach(param => {
                        result += param.seriesName + ': ¥' + param.value.toFixed(2) + '<br/>';
                    });
                    return result;
                }
            },
            legend: {
                data: ['销售额', '利润'],
                bottom: 10
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '15%',
                top: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: months,
                axisTick: {
                    alignWithLabel: true
                }
            },
            yAxis: {
                type: 'value',
                name: '金额 (¥)',
                axisLabel: {
                    formatter: '{value} 元'
                }
            },
            series: [
                {
                    name: '销售额',
                    type: 'line',
                    data: salesData,
                    smooth: true,
                    lineStyle: {
                        width: 3
                    },
                    itemStyle: {
                        color: '#5470C6'
                    }
                },
                {
                    name: '利润',
                    type: 'line',
                    data: profitData,
                    smooth: true,
                    lineStyle: {
                        width: 3
                    },
                    itemStyle: {
                        color: '#91CC75'
                    }
                }
            ]
        };
        
        // 创建或更新图表
        createOrUpdateChart('salesProfitTrendChart', 'line', options);
    } catch (error) {
        console.error('加载销售与利润趋势图出错:', error);
    }
}

// 加载订单来源饼图
function loadOrderSourcePieChart() {
    try {
        console.log('加载订单来源饼图...');
        
        // 统计不同来源的订单数量
        const sourceCount = {};
        
        filteredOrdersForAnalysis.forEach(order => {
            const source = order.customerSource || '未知';
            sourceCount[source] = (sourceCount[source] || 0) + 1;
        });
        
        // 准备图表数据
        const pieData = Object.keys(sourceCount).map(source => ({
            name: source,
            value: sourceCount[source]
        }));
        
        // 配置图表选项
        const options = {
            title: {
                text: '订单来源分布',
                left: 'center'
            },
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c} ({d}%)'
            },
            legend: {
                orient: 'horizontal',
                bottom: 10,
                data: Object.keys(sourceCount)
            },
            series: [
                {
                    name: '订单来源',
                    type: 'pie',
                    radius: ['30%', '70%'],
                    avoidLabelOverlap: false,
                    label: {
                        show: true,
                        formatter: '{b}: {c} ({d}%)'
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: '18',
                            fontWeight: 'bold'
                        }
                    },
                    data: pieData
                }
            ]
        };
        
        // 创建或更新图表
        createOrUpdateChart('orderSourcePieChart', 'pie', options);
    } catch (error) {
        console.error('加载订单来源饼图出错:', error);
    }
}

// 加载面料品牌偏好图
function loadFabricBrandChart() {
    try {
        console.log('加载面料品牌偏好图...');
        
        // 统计不同面料品牌的使用次数
        const brandCount = {};
        
        filteredOrdersForAnalysis.forEach(order => {
            const brand = order.fabricBrand || '未知';
            brandCount[brand] = (brandCount[brand] || 0) + 1;
        });
        
        // 排序并获取前10个品牌
        const sortedBrands = Object.keys(brandCount)
            .sort((a, b) => brandCount[b] - brandCount[a])
            .slice(0, 10);
        
        // 准备图表数据
        const brands = sortedBrands;
        const counts = brands.map(brand => brandCount[brand]);
        
        // 配置图表选项
        const options = {
            title: {
                text: '面料品牌偏好',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '15%',
                top: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: brands,
                axisLabel: {
                    interval: 0,
                    rotate: 30
                }
            },
            yAxis: {
                type: 'value',
                name: '订单数量'
            },
            series: [
                {
                    name: '订单数量',
                    type: 'bar',
                    data: counts,
                    itemStyle: {
                        color: function(params) {
                            const colorList = [
                                '#5470C6', '#91CC75', '#FAC858', '#EE6666', 
                                '#73C0DE', '#3BA272', '#FC8452', '#9A60B4',
                                '#ea7ccc', '#546570'
                            ];
                            return colorList[params.dataIndex % colorList.length];
                        }
                    },
                    label: {
                        show: true,
                        position: 'top'
                    }
                }
            ]
        };
        
        // 创建或更新图表
        createOrUpdateChart('fabricBrandChart', 'bar', options);
    } catch (error) {
        console.error('加载面料品牌偏好图出错:', error);
    }
}

// 加载季节订单分布图
function loadSeasonalOrderChart() {
    try {
        console.log('加载季节订单分布图...');
        
        // 初始化季节数据
        const seasonalData = {
            '春季(3-5月)': 0,
            '夏季(6-8月)': 0,
            '秋季(9-11月)': 0,
            '冬季(12-2月)': 0
        };
        
        // 统计各季节的订单数量
        filteredOrdersForAnalysis.forEach(order => {
            if (!order.dealDate) return;
            
            const date = new Date(order.dealDate);
            const month = date.getMonth() + 1; // 1-12
            
            if (month >= 3 && month <= 5) {
                seasonalData['春季(3-5月)'] += 1;
            } else if (month >= 6 && month <= 8) {
                seasonalData['夏季(6-8月)'] += 1;
            } else if (month >= 9 && month <= 11) {
                seasonalData['秋季(9-11月)'] += 1;
            } else {
                seasonalData['冬季(12-2月)'] += 1;
            }
        });
        
        // 准备图表数据
        const seasons = Object.keys(seasonalData);
        const counts = seasons.map(season => seasonalData[season]);
        
        // 配置图表选项
        const options = {
            title: {
                text: '季节订单分布',
                left: 'center'
            },
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c} ({d}%)'
            },
            legend: {
                orient: 'horizontal',
                bottom: 10,
                data: seasons
            },
            series: [
                {
                    name: '订单季节',
                    type: 'pie',
                    radius: '50%',
                    center: ['50%', '50%'],
                    data: seasons.map(season => ({
                        name: season,
                        value: seasonalData[season]
                    })),
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };
        
        // 创建或更新图表
        createOrUpdateChart('seasonalOrderChart', 'pie', options);
    } catch (error) {
        console.error('加载季节订单分布图出错:', error);
    }
}

// 加载月度销售趋势图
function loadMonthlySalesChart() {
    try {
        console.log('加载月度销售趋势图...');
        
        // 按月份分组数据
        const monthlyData = groupDataByMonth(filteredOrdersForAnalysis, filteredCostsForAnalysis);
        
        // 准备图表数据
        const months = Object.keys(monthlyData).sort();
        const salesData = months.map(month => monthlyData[month].sales);
        const orderCountData = months.map(month => monthlyData[month].orderCount);
        
        // 配置图表选项
        const options = {
            title: {
                text: '月度销售趋势',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    crossStyle: {
                        color: '#999'
                    }
                }
            },
            legend: {
                data: ['销售额', '订单数'],
                bottom: 10
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '15%',
                top: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: months,
                axisPointer: {
                    type: 'shadow'
                }
            },
            yAxis: [
                {
                    type: 'value',
                    name: '销售额(元)',
                    min: 0,
                    axisLabel: {
                        formatter: '{value} 元'
                    }
                },
                {
                    type: 'value',
                    name: '订单数',
                    min: 0,
                    axisLabel: {
                        formatter: '{value}'
                    }
                }
            ],
            series: [
                {
                    name: '销售额',
                    type: 'bar',
                    data: salesData,
                    itemStyle: {
                        color: '#5470C6'
                    }
                },
                {
                    name: '订单数',
                    type: 'line',
                    yAxisIndex: 1,
                    data: orderCountData,
                    itemStyle: {
                        color: '#91CC75'
                    },
                    lineStyle: {
                        width: 3
                    },
                    symbol: 'circle',
                    symbolSize: 8
                }
            ]
        };
        
        // 创建或更新图表
        createOrUpdateChart('monthlySalesChart', 'bar', options);
    } catch (error) {
        console.error('加载月度销售趋势图出错:', error);
    }
}

// 加载销售渠道分析图
function loadSalesChannelChart() {
    try {
        console.log('加载销售渠道分析图...');
        
        // 统计不同渠道的销售额
        const channelSales = {};
        
        filteredOrdersForAnalysis.forEach(order => {
            const channel = order.customerSource || '未知';
            channelSales[channel] = (channelSales[channel] || 0) + (parseFloat(order.totalPrice) || 0);
        });
        
        // 准备图表数据
        const channels = Object.keys(channelSales);
        const salesData = channels.map(channel => ({
            name: channel,
            value: channelSales[channel]
        }));
        
        // 配置图表选项
        const options = {
            title: {
                text: '销售渠道分析',
                left: 'center'
            },
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: ¥{c} ({d}%)'
            },
            legend: {
                orient: 'horizontal',
                bottom: 10,
                data: channels
            },
            series: [
                {
                    name: '销售额',
                    type: 'pie',
                    radius: ['30%', '70%'],
                    avoidLabelOverlap: false,
                    label: {
                        show: true,
                        formatter: '{b}: ¥{c} ({d}%)'
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: '18',
                            fontWeight: 'bold'
                        }
                    },
                    data: salesData
                }
            ]
        };
        
        // 创建或更新图表
        createOrUpdateChart('salesChannelChart', 'pie', options);
    } catch (error) {
        console.error('加载销售渠道分析图出错:', error);
    }
}

// 加载价格区间分布图
function loadPriceRangeChart() {
    try {
        console.log('加载价格区间分布图...');
        
        // 定义价格区间
        const priceRanges = [
            { label: '0-500元', min: 0, max: 500 },
            { label: '500-1000元', min: 500, max: 1000 },
            { label: '1000-1500元', min: 1000, max: 1500 },
            { label: '1500-2000元', min: 1500, max: 2000 },
            { label: '2000元以上', min: 2000, max: Infinity }
        ];
        
        // 统计各价格区间的订单数量
        const rangeCount = priceRanges.map(range => ({
            name: range.label,
            value: filteredOrdersForAnalysis.filter(order => {
                const price = parseFloat(order.totalPrice) || 0;
                return price >= range.min && price < range.max;
            }).length
        }));
        
        // 配置图表选项
        const options = {
            title: {
                text: '价格区间分布',
                left: 'center'
            },
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c}个订单 ({d}%)'
            },
            legend: {
                orient: 'horizontal',
                bottom: 10,
                data: priceRanges.map(range => range.label)
            },
            series: [
                {
                    name: '价格区间',
                    type: 'pie',
                    radius: '50%',
                    center: ['50%', '50%'],
                    data: rangeCount,
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };
        
        // 创建或更新图表
        createOrUpdateChart('priceRangeChart', 'pie', options);
    } catch (error) {
        console.error('加载价格区间分布图出错:', error);
    }
}

// ===================== 数据处理函数 =====================

// 按月份分组数据
function groupDataByMonth(orders, costs) {
    try {
        const monthlyData = {};
        
        // 处理订单数据
        orders.forEach(order => {
            if (!order.dealDate) return;
            
            // 提取年月作为键
            const yearMonth = order.dealDate.substring(0, 7);
            
            if (!monthlyData[yearMonth]) {
                monthlyData[yearMonth] = {
                    orderCount: 0,
                    sales: 0,
                    costs: 0,
                    profit: 0
                };
            }
            
            monthlyData[yearMonth].orderCount += 1;
            monthlyData[yearMonth].sales += parseFloat(order.totalPrice) || 0;
        });
        
        // 处理成本数据
        costs.forEach(cost => {
            if (!cost.costDate) return;
            
            // 提取年月作为键
            const yearMonth = cost.costDate.substring(0, 7);
            
            if (!monthlyData[yearMonth]) {
                monthlyData[yearMonth] = {
                    orderCount: 0,
                    sales: 0,
                    costs: 0,
                    profit: 0
                };
            }
            
            monthlyData[yearMonth].costs += parseFloat(cost.costAmount) || 0;
        });
        
        // 计算利润
        Object.keys(monthlyData).forEach(month => {
            monthlyData[month].profit = monthlyData[month].sales - monthlyData[month].costs;
        });
        
        return monthlyData;
    } catch (error) {
        console.error('按月份分组数据出错:', error);
        return {};
    }
}

// 格式化日期为 YYYY-MM-DD 格式
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// ===================== 事件监听器 =====================

// 添加分析模块事件监听
function addAnalysisEventListeners() {
    try {
        console.log('添加分析模块事件监听器...');
        
        // 子模块导航按钮点击事件
        document.querySelectorAll('.submodule-btn').forEach(button => {
            button.addEventListener('click', function() {
                // 移除所有按钮的活动状态
                document.querySelectorAll('.submodule-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // 添加当前按钮的活动状态
                this.classList.add('active');
                
                // 获取子模块ID
                const subModule = this.getAttribute('data-sub-module');
                
                // 获取当前的日期范围
                const startDate = document.getElementById('analysisStartDate').value;
                const endDate = document.getElementById('analysisEndDate').value;
                
                // 直接刷新数据，不需要用户点击应用按钮
                refreshAnalysisData(subModule, startDate, endDate);
            });
        });
        
        // 筛选按钮点击事件
        document.getElementById('applyAnalysisFilter').addEventListener('click', function() {
            const startDate = document.getElementById('analysisStartDate').value;
            const endDate = document.getElementById('analysisEndDate').value;
            
            // 获取当前活动的子模块
            const activeSubModule = document.querySelector('.submodule-btn.active');
            const subModule = activeSubModule ? activeSubModule.getAttribute('data-sub-module') : 'overviewAnalysis';
            
            // 刷新数据
            refreshAnalysisData(subModule, startDate, endDate);
        });
        
        // 重置筛选按钮点击事件
        document.getElementById('resetAnalysisFilter').addEventListener('click', function() {
            // 设置默认日期范围（最近半年）
            const today = new Date();
            document.getElementById('analysisEndDate').value = formatDate(today);
            
            const halfYearAgo = new Date();
            halfYearAgo.setMonth(halfYearAgo.getMonth() - 6);
            document.getElementById('analysisStartDate').value = formatDate(halfYearAgo);
            
            // 获取当前活动的子模块
            const activeSubModule = document.querySelector('.submodule-btn.active');
            const subModule = activeSubModule ? activeSubModule.getAttribute('data-sub-module') : 'overviewAnalysis';
            
            // 刷新数据
            refreshAnalysisData(subModule, formatDate(halfYearAgo), formatDate(today));
        });
        
        // 添加返回首页链接事件监听
        document.querySelector('.nav-link[href="index.html"]').addEventListener('click', function() {
            console.log('返回首页');
        });
        
        console.log('分析模块事件监听器添加完成');
    } catch (error) {
        console.error('添加分析模块事件监听器出错:', error);
    }
}

// 将函数暴露给全局作用域
window.addAnalysisEventListeners = addAnalysisEventListeners;

// 加载客户来源分析图
function loadCustomerSourceChart() {
    try {
        console.log('加载客户来源分析图...');
        
        // 统计不同来源的客户数量
        const sourceCount = {};
        
        // 创建一个集合来存储已处理的客户，避免重复计数
        const processedCustomers = new Set();
        
        filteredOrdersForAnalysis.forEach(order => {
            const customerId = order.customerId;
            const source = order.customerSource || '未知';
            
            // 如果这个客户已经计数过了，就跳过
            if (customerId && processedCustomers.has(customerId)) return;
            
            sourceCount[source] = (sourceCount[source] || 0) + 1;
            
            // 记录已处理的客户
            if (customerId) {
                processedCustomers.add(customerId);
            }
        });
        
        // 准备图表数据
        const pieData = Object.keys(sourceCount).map(source => ({
            name: source,
            value: sourceCount[source]
        }));
        
        // 配置图表选项
        const options = {
            title: {
                text: '客户来源分析',
                left: 'center'
            },
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c}人 ({d}%)'
            },
            legend: {
                orient: 'horizontal',
                bottom: 10,
                data: Object.keys(sourceCount)
            },
            series: [
                {
                    name: '客户来源',
                    type: 'pie',
                    radius: ['30%', '70%'],
                    avoidLabelOverlap: false,
                    label: {
                        show: true,
                        formatter: '{b}: {c}人 ({d}%)'
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: '18',
                            fontWeight: 'bold'
                        }
                    },
                    data: pieData
                }
            ]
        };
        
        // 创建或更新图表
        createOrUpdateChart('customerSourceChart', 'pie', options);
    } catch (error) {
        console.error('加载客户来源分析图出错:', error);
    }
}

// 加载客户性别分布图
function loadCustomerGenderChart() {
    try {
        console.log('加载客户性别分布图...');
        
        // 统计不同性别的客户数量
        const genderCount = {
            '男': 0,
            '女': 0,
            '未知': 0
        };
        
        // 创建一个集合来存储已处理的客户，避免重复计数
        const processedCustomers = new Set();
        
        filteredOrdersForAnalysis.forEach(order => {
            const customerId = order.customerId;
            const gender = order.customerGender || '未知';
            
            // 如果这个客户已经计数过了，就跳过
            if (customerId && processedCustomers.has(customerId)) return;
            
            if (gender === '男' || gender === '男性') {
                genderCount['男'] += 1;
            } else if (gender === '女' || gender === '女性') {
                genderCount['女'] += 1;
            } else {
                genderCount['未知'] += 1;
            }
            
            // 记录已处理的客户
            if (customerId) {
                processedCustomers.add(customerId);
            }
        });
        
        // 准备图表数据
        const pieData = Object.keys(genderCount).map(gender => ({
            name: gender,
            value: genderCount[gender]
        }));
        
        // 配置图表选项
        const options = {
            title: {
                text: '客户性别分布',
                left: 'center'
            },
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c}人 ({d}%)'
            },
            legend: {
                orient: 'horizontal',
                bottom: 10,
                data: Object.keys(genderCount)
            },
            series: [
                {
                    name: '客户性别',
                    type: 'pie',
                    radius: '50%',
                    center: ['50%', '50%'],
                    data: pieData,
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    },
                    label: {
                        show: true,
                        formatter: '{b}: {c}人 ({d}%)'
                    }
                }
            ]
        };
        
        // 创建或更新图表
        createOrUpdateChart('customerGenderChart', 'pie', options);
    } catch (error) {
        console.error('加载客户性别分布图出错:', error);
    }
}

// 加载新老客户比例图
function loadNewReturningCustomerChart() {
    try {
        console.log('加载新老客户比例图...');
        
        // 获取分析时段的起始时间
        const startDate = document.getElementById('analysisStartDate').value;
        
        // 统计客户首次下单时间
        const customerFirstOrder = {};
        
        filteredOrdersForAnalysis.forEach(order => {
            if (!order.customerId || !order.dealDate) return;
            
            const customerId = order.customerId;
            const dealDate = order.dealDate;
            
            // 记录最早的订单日期
            if (!customerFirstOrder[customerId] || dealDate < customerFirstOrder[customerId]) {
                customerFirstOrder[customerId] = dealDate;
            }
        });
        
        // 计算新客户和老客户
        let newCustomers = 0;
        let returningCustomers = 0;
        
        Object.keys(customerFirstOrder).forEach(customerId => {
            const firstOrderDate = customerFirstOrder[customerId];
            
            // 如果首次订单日期在分析时段内，则为新客户
            if (firstOrderDate >= startDate) {
                newCustomers++;
            } else {
                returningCustomers++;
            }
        });
        
        // 准备图表数据
        const pieData = [
            { name: '新客户', value: newCustomers },
            { name: '老客户', value: returningCustomers }
        ];
        
        // 配置图表选项
        const options = {
            title: {
                text: '新老客户比例',
                left: 'center'
            },
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c}人 ({d}%)'
            },
            legend: {
                orient: 'horizontal',
                bottom: 10,
                data: ['新客户', '老客户']
            },
            series: [
                {
                    name: '客户类型',
                    type: 'pie',
                    radius: '50%',
                    center: ['50%', '50%'],
                    data: pieData,
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    },
                    label: {
                        show: true,
                        formatter: '{b}: {c}人 ({d}%)'
                    }
                }
            ]
        };
        
        // 创建或更新图表
        createOrUpdateChart('newReturningCustomerChart', 'pie', options);
    } catch (error) {
        console.error('加载新老客户比例图出错:', error);
    }
}

// 加载热门面料品牌分析图
function loadPopularFabricBrandChart() {
    try {
        console.log('加载热门面料品牌分析图...');
        
        // 统计不同面料品牌的使用次数和总销售额
        const brandStats = {};
        
        filteredOrdersForAnalysis.forEach(order => {
            const brand = order.fabricBrand || '未知';
            const price = parseFloat(order.totalPrice) || 0;
            
            if (!brandStats[brand]) {
                brandStats[brand] = {
                    count: 0,
                    totalSales: 0
                };
            }
            
            brandStats[brand].count += 1;
            brandStats[brand].totalSales += price;
        });
        
        // 排序并获取前10个品牌
        const sortedBrands = Object.keys(brandStats)
            .sort((a, b) => brandStats[b].totalSales - brandStats[a].totalSales)
            .slice(0, 10);
        
        // 准备图表数据
        const brands = sortedBrands;
        const salesData = brands.map(brand => brandStats[brand].totalSales);
        const countData = brands.map(brand => brandStats[brand].count);
        
        // 配置图表选项
        const options = {
            title: {
                text: '热门面料品牌分析',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    crossStyle: {
                        color: '#999'
                    }
                },
                formatter: function(params) {
                    let result = params[0].name + '<br/>';
                    params.forEach(param => {
                        if (param.seriesName === '销售额') {
                            result += param.seriesName + ': ¥' + param.value.toFixed(2) + '<br/>';
                        } else {
                            result += param.seriesName + ': ' + param.value + '件<br/>';
                        }
                    });
                    return result;
                }
            },
            legend: {
                data: ['销售额', '订单数'],
                bottom: 10
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '15%',
                top: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: brands,
                axisLabel: {
                    interval: 0,
                    rotate: 30
                }
            },
            yAxis: [
                {
                    type: 'value',
                    name: '销售额(元)',
                    min: 0,
                    axisLabel: {
                        formatter: '{value} 元'
                    }
                },
                {
                    type: 'value',
                    name: '订单数',
                    min: 0,
                    axisLabel: {
                        formatter: '{value}'
                    }
                }
            ],
            series: [
                {
                    name: '销售额',
                    type: 'bar',
                    data: salesData,
                    itemStyle: {
                        color: '#5470C6'
                    }
                },
                {
                    name: '订单数',
                    type: 'line',
                    yAxisIndex: 1,
                    data: countData,
                    itemStyle: {
                        color: '#91CC75'
                    },
                    lineStyle: {
                        width: 3
                    },
                    symbol: 'circle',
                    symbolSize: 8
                }
            ]
        };
        
        // 创建或更新图表
        createOrUpdateChart('popularFabricBrandChart', 'bar', options);
    } catch (error) {
        console.error('加载热门面料品牌分析图出错:', error);
    }
}

// 加载颜色偏好分析图
function loadColorPreferenceChart() {
    try {
        console.log('加载颜色偏好分析图...');
        
        // 统计不同颜色的使用次数
        const colorCount = {};
        
        filteredOrdersForAnalysis.forEach(order => {
            const color = order.fabricColor || '未知';
            colorCount[color] = (colorCount[color] || 0) + 1;
        });
        
        // 排序并获取前10个颜色
        const sortedColors = Object.keys(colorCount)
            .sort((a, b) => colorCount[b] - colorCount[a])
            .slice(0, 10);
        
        // 准备图表数据
        const colors = sortedColors;
        const counts = colors.map(color => colorCount[color]);
        
        // 配置图表选项
        const options = {
            title: {
                text: '颜色偏好分析',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '15%',
                top: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: colors,
                axisLabel: {
                    interval: 0,
                    rotate: 30
                }
            },
            yAxis: {
                type: 'value',
                name: '订单数量'
            },
            series: [
                {
                    name: '订单数量',
                    type: 'bar',
                    data: counts,
                    itemStyle: {
                        color: function(params) {
                            const colorList = [
                                '#5470C6', '#91CC75', '#FAC858', '#EE6666', 
                                '#73C0DE', '#3BA272', '#FC8452', '#9A60B4',
                                '#ea7ccc', '#546570'
                            ];
                            return colorList[params.dataIndex % colorList.length];
                        }
                    },
                    label: {
                        show: true,
                        position: 'top'
                    }
                }
            ]
        };
        
        // 创建或更新图表
        createOrUpdateChart('colorPreferenceChart', 'bar', options);
    } catch (error) {
        console.error('加载颜色偏好分析图出错:', error);
    }
}

// 加载月度利润趋势图
function loadMonthlyProfitChart() {
    try {
        console.log('加载月度利润趋势图...');
        
        // 按月份分组数据
        const monthlyData = groupDataByMonth(filteredOrdersForAnalysis, filteredCostsForAnalysis);
        
        // 准备图表数据
        const months = Object.keys(monthlyData).sort();
        const salesData = months.map(month => monthlyData[month].sales);
        const costsData = months.map(month => monthlyData[month].costs);
        const profitData = months.map(month => monthlyData[month].profit);
        
        // 配置图表选项
        const options = {
            title: {
                text: '月度利润趋势',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    crossStyle: {
                        color: '#999'
                    }
                },
                formatter: function(params) {
                    let result = params[0].name + '<br/>';
                    params.forEach(param => {
                        result += param.seriesName + ': ¥' + param.value.toFixed(2) + '<br/>';
                    });
                    return result;
                }
            },
            legend: {
                data: ['销售额', '成本', '利润'],
                bottom: 10
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '15%',
                top: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: months,
                axisPointer: {
                    type: 'shadow'
                }
            },
            yAxis: {
                type: 'value',
                name: '金额(元)',
                axisLabel: {
                    formatter: '{value} 元'
                }
            },
            series: [
                {
                    name: '销售额',
                    type: 'bar',
                    stack: 'total',
                    data: salesData,
                    itemStyle: {
                        color: '#5470C6'
                    }
                },
                {
                    name: '成本',
                    type: 'bar',
                    stack: 'total',
                    data: costsData,
                    itemStyle: {
                        color: '#EE6666'
                    }
                },
                {
                    name: '利润',
                    type: 'line',
                    data: profitData,
                    itemStyle: {
                        color: '#91CC75'
                    },
                    lineStyle: {
                        width: 3
                    },
                    symbol: 'circle',
                    symbolSize: 8
                }
            ]
        };
        
        // 创建或更新图表
        createOrUpdateChart('monthlyProfitChart', 'bar', options);
    } catch (error) {
        console.error('加载月度利润趋势图出错:', error);
    }
}

// 【新增】清空所有分析子模块的图表和数据
function clearAllAnalysisSubModules() {
    console.log('清空所有分析子模块的图表和数据');
    try {
        // 销毁所有图表
        for (const chartId in chartInstances) {
            if (chartInstances[chartId]) {
                try {
                    chartInstances[chartId].destroy();
                } catch (e) {
                    console.error(`销毁图表${chartId}失败:`, e);
                }
            }
        }
        // 重置图表实例
        chartInstances = {};
        window.chartInstances = {};
        
        // 获取所有图表容器并添加空数据提示
        const allChartContainers = document.querySelectorAll('.chart-container');
        allChartContainers.forEach(container => {
            container.innerHTML = '<div class="empty-data-message">暂无数据</div>';
            container.style.display = 'flex';
            container.style.justifyContent = 'center';
            container.style.alignItems = 'center';
            container.style.height = '300px';
            container.style.border = '1px dashed #ccc';
            container.style.borderRadius = '5px';
        });
        
        // 清空所有统计卡片
        updateEmptyStatCards();
        
        console.log('所有分析子模块已清空');
        return true;
    } catch (error) {
        console.error('清空分析子模块失败:', error);
        return false;
    }
}

// 切换分析子模块
function switchAnalysisSubModule(subModule) {
    console.log('切换到分析子模块:', subModule);
    
    // 【新增】检查是否刚清空过数据
    const dataCleared = localStorage.getItem('dataCleared');
    if (dataCleared === 'true') {
        console.log('检测到数据已被清空，清空所有分析子模块');
        clearAllAnalysisSubModules();
        localStorage.removeItem('dataCleared');
    }
    
    // 检查localStorage中是否有数据
    const ordersData = localStorage.getItem('orders');
    const costsData = localStorage.getItem('costs');
    const productionCostsData = localStorage.getItem('productionCosts');
    
    // 判断是否所有数据都为空
    const hasNoData = (!ordersData || ordersData === '[]') && 
                      (!costsData || costsData === '[]') && 
                      (!productionCostsData || productionCostsData === '[]');
    
    if (hasNoData) {
        console.log('检测到所有数据为空，清空所有分析子模块');
        clearAllAnalysisSubModules();
    }
    
    // 隐藏所有内容
    document.querySelectorAll('.analysis-content').forEach(content => {
        content.style.display = 'none';
    });
    
    // 显示选中的内容
    const targetContent = document.getElementById(subModule + 'Content');
    if (targetContent) {
        targetContent.style.display = 'block';
    } else {
        console.error('未找到目标内容:', subModule + 'Content');
    }
    
    // 更新当前子模块
    currentAnalysisSubModule = subModule;
    
    // 更新按钮状态
    document.querySelectorAll('.submodule-btn').forEach(btn => {
        if (btn.getAttribute('data-sub-module') === subModule) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // 如果有数据，则根据选中的子模块重新加载数据
    if (!hasNoData) {
        console.log('加载模块数据:', subModule);
        const startDate = document.getElementById('analysisStartDate').value;
        const endDate = document.getElementById('analysisEndDate').value;
        refreshAnalysisData(subModule, startDate, endDate);
    } else {
        console.log('没有数据可加载，保持空状态');
    }
}

// 将函数暴露给全局作用域
window.switchAnalysisSubModule = switchAnalysisSubModule;

// 更新销售分析统计卡片
function updateSalesAnalysisCards() {
    try {
        // 计算月均销售额
        const monthlyData = groupDataByMonth(filteredOrdersForAnalysis, filteredCostsForAnalysis);
        const months = Object.keys(monthlyData);
        const totalSales = months.reduce((sum, month) => sum + monthlyData[month].sales, 0);
        const monthlySalesAvg = months.length > 0 ? totalSales / months.length : 0;
        
        // 计算客单价
        const totalOrders = filteredOrdersForAnalysis.length;
        const perCustomerSales = totalOrders > 0 ? totalSales / totalOrders : 0;
        
        // 假设销售转化率和退单率数据（实际项目中应从数据源获取）
        const salesConversionRate = 32.5; // 示例值
        const refundRate = 2.3; // 示例值
        
        // 更新UI显示
        document.getElementById('monthlySalesAvgValue').textContent = '¥' + monthlySalesAvg.toFixed(2);
        document.getElementById('perCustomerSalesValue').textContent = '¥' + perCustomerSales.toFixed(2);
        document.getElementById('salesConversionRateValue').textContent = salesConversionRate + '%';
        document.getElementById('refundRateValue').textContent = refundRate + '%';
        
        // 暂时不计算环比增长，需要前后两个时间段的数据
    } catch (error) {
        console.error('更新销售分析统计卡片出错:', error);
    }
}

// 更新客户分析统计卡片
function updateCustomerAnalysisCards() {
    try {
        // 检查是否有实际数据
        if (filteredOrdersForAnalysis.length === 0) {
            // 如果没有数据，显示0值
            document.getElementById('activeCustomersValue').textContent = '0';
            document.getElementById('newCustomersValue').textContent = '0';
            document.getElementById('repeatPurchaseRateValue').textContent = '0%';
            document.getElementById('customerChurnRateValue').textContent = '0%';
            return;
        }
        
        // 提取客户数据
        const uniqueCustomers = new Set(filteredOrdersForAnalysis.map(order => order.customerId)).size;
        
        // 基于实际数据计算，或者使用示例值
        const activeCustomers = uniqueCustomers || 0;
        const newCustomers = Math.round(uniqueCustomers * 0.2) || 0; // 假设20%为新客户
        const repeatPurchaseRate = filteredOrdersForAnalysis.length > uniqueCustomers 
            ? Math.round((filteredOrdersForAnalysis.length - uniqueCustomers) / uniqueCustomers * 100) 
            : 0;
        const customerChurnRate = Math.round(uniqueCustomers * 0.05) || 0; // 假设5%的流失率
        
        // 更新UI显示
        document.getElementById('activeCustomersValue').textContent = activeCustomers;
        document.getElementById('newCustomersValue').textContent = newCustomers;
        document.getElementById('repeatPurchaseRateValue').textContent = repeatPurchaseRate + '%';
        document.getElementById('customerChurnRateValue').textContent = customerChurnRate + '%';
    } catch (error) {
        console.error('更新客户分析统计卡片出错:', error);
        // 出错时显示0值
        document.getElementById('activeCustomersValue').textContent = '0';
        document.getElementById('newCustomersValue').textContent = '0';
        document.getElementById('repeatPurchaseRateValue').textContent = '0%';
        document.getElementById('customerChurnRateValue').textContent = '0%';
    }
}

// 更新产品分析统计卡片
function updateProductAnalysisCards() {
    try {
        // 检查是否有实际数据
        if (filteredOrdersForAnalysis.length === 0) {
            // 如果没有数据，显示0值
            document.getElementById('hotProductsValue').textContent = '0';
            document.getElementById('fabricUsageValue').textContent = '0平米';
            document.getElementById('productMarginValue').textContent = '0%';
            document.getElementById('customProductRatioValue').textContent = '0%';
            return;
        }
        
        // 基于实际数据计算
        // 获取不同产品的数量
        const uniqueStyles = new Set(filteredOrdersForAnalysis.map(order => order.styleType)).size;
        const hotProducts = uniqueStyles || 0;
        
        // 计算面料使用量（假设每个订单平均使用10平米）
        const fabricUsage = filteredOrdersForAnalysis.length * 10;
        
        // 计算产品毛利率
        let totalSales = 0;
        let totalCosts = 0;
        
        filteredOrdersForAnalysis.forEach(order => {
            totalSales += parseFloat(order.totalPrice) || 0;
        });
        
        filteredProductionCostsForAnalysis.forEach(cost => {
            totalCosts += (parseFloat(cost.fabricCost) || 0) + 
                         (parseFloat(cost.processingCost) || 0) + 
                         (parseFloat(cost.accessoriesCost) || 0);
        });
        
        const productMargin = totalSales > 0 ? Math.round((totalSales - totalCosts) / totalSales * 100) : 0;
        
        // 定制款占比（假设80%为定制款）
        const customProductRatio = Math.round(filteredOrdersForAnalysis.filter(order => 
            order.isCustom || order.styleType?.includes('定制')).length / filteredOrdersForAnalysis.length * 100) || 0;
        
        // 更新UI显示
        document.getElementById('hotProductsValue').textContent = hotProducts;
        document.getElementById('fabricUsageValue').textContent = fabricUsage + '平米';
        document.getElementById('productMarginValue').textContent = productMargin + '%';
        document.getElementById('customProductRatioValue').textContent = customProductRatio + '%';
    } catch (error) {
        console.error('更新产品分析统计卡片出错:', error);
        // 出错时显示0值
        document.getElementById('hotProductsValue').textContent = '0';
        document.getElementById('fabricUsageValue').textContent = '0平米';
        document.getElementById('productMarginValue').textContent = '0%';
        document.getElementById('customProductRatioValue').textContent = '0%';
    }
}

// 【新增】更新利润分析统计卡片
function updateProfitAnalysisCards() {
    try {
        // 计算总成本
        let totalOperatingCost = 0;
        let totalProductionCost = 0;
        let totalAdCost = 0;
        
        // 计算运营成本
        filteredCostsForAnalysis.forEach(cost => {
            totalOperatingCost += parseFloat(cost.costAmount) || 0;
        });
        
        // 计算生产成本
        filteredProductionCostsForAnalysis.forEach(cost => {
            totalProductionCost += (parseFloat(cost.fabricCost) || 0) + 
                                  (parseFloat(cost.processingCost) || 0) + 
                                  (parseFloat(cost.accessoriesCost) || 0);
        });
        
        // 假设广告成本为总成本的10%
        totalAdCost = Math.round((totalOperatingCost + totalProductionCost) * 0.1);
        
        // 计算总成本
        const totalCost = totalOperatingCost + totalProductionCost + totalAdCost;
        
        // 计算各类成本占比
        const productionCostRatio = totalCost > 0 ? Math.round(totalProductionCost / totalCost * 100) : 0;
        const operationCostRatio = totalCost > 0 ? Math.round(totalOperatingCost / totalCost * 100) : 0;
        const adCostRatio = totalCost > 0 ? Math.round(totalAdCost / totalCost * 100) : 0;
        
        // 更新UI显示
        document.getElementById('totalCostValue').textContent = '¥' + totalCost.toFixed(2);
        document.getElementById('productionCostRatio').textContent = productionCostRatio + '%';
        document.getElementById('operationCostRatio').textContent = operationCostRatio + '%';
        document.getElementById('adCostRatio').textContent = adCostRatio + '%';
    } catch (error) {
        console.error('更新利润分析统计卡片出错:', error);
        updateEmptyProfitCards();
    }
}

// 【新增】更新利润分析空状态统计卡片
function updateEmptyProfitCards() {
    // 更新UI显示为0
    document.getElementById('totalCostValue').textContent = '¥0';
    document.getElementById('productionCostRatio').textContent = '0%';
    document.getElementById('operationCostRatio').textContent = '0%';
    document.getElementById('adCostRatio').textContent = '0%';
}

// 【新增】清空利润图表
function clearProfitCharts() {
    // 获取所有利润分析图表容器
    const profitChartContainers = document.querySelectorAll('#profitAnalysisContent .chart-container');
    profitChartContainers.forEach(container => {
        container.innerHTML = '<div class="empty-data-message">暂无数据</div>';
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        container.style.height = '300px';
        container.style.border = '1px dashed #ccc';
        container.style.borderRadius = '5px';
    });
    
    // 销毁图表实例
    const profitChartIds = ['monthlyProfitChart', 'fabricBrandProfitChart', 'costProfitRatioChart'];
    profitChartIds.forEach(chartId => {
        if (chartInstances[chartId]) {
            try {
                chartInstances[chartId].destroy();
                delete chartInstances[chartId];
            } catch (e) {
                console.error(`销毁图表${chartId}失败:`, e);
            }
        }
    });
}

// 【新增】更新空数据的统计卡片
function updateEmptyStatCards() {
    try {
        console.log('更新所有统计卡片为空数据状态');
        
        // 获取所有以Value结尾的元素ID
        const allValueElements = document.querySelectorAll('[id$="Value"]');
        console.log(`找到${allValueElements.length}个统计卡片元素`);
        
        // 遍历所有元素并设置空值
        allValueElements.forEach(element => {
            try {
                if (element.id.includes('Rate') || element.id.includes('Ratio') || 
                    element.id.includes('Percentage') || element.id.includes('Margin')) {
                    element.textContent = '0%';
                } else if (element.id.includes('Price') || element.id.includes('Cost') || 
                           element.id.includes('Sales') || element.id.includes('Profit') ||
                           element.id.includes('Amount') || element.id.includes('Revenue')) {
                    element.textContent = '¥0';
                } else if (element.id.includes('Usage')) {
                    element.textContent = '0平米';
                } else {
                    element.textContent = '0';
                }
                console.log(`已清空元素: ${element.id}`);
            } catch (e) {
                console.error(`清空元素${element.id}失败:`, e);
            }
        });
        
        // 特别处理销售分析卡片
        try {
            document.getElementById('monthlySalesAvgValue').textContent = '¥0';
            document.getElementById('perCustomerSalesValue').textContent = '¥0';
            document.getElementById('salesConversionRateValue').textContent = '0%';
            document.getElementById('refundRateValue').textContent = '0%';
        } catch (e) {
            console.error('清空销售分析卡片失败:', e);
        }
        
        // 特别处理客户分析卡片
        try {
            document.getElementById('activeCustomersValue').textContent = '0';
            document.getElementById('newCustomersValue').textContent = '0';
            document.getElementById('repeatPurchaseRateValue').textContent = '0%';
            document.getElementById('customerChurnRateValue').textContent = '0%';
        } catch (e) {
            console.error('清空客户分析卡片失败:', e);
        }
        
        // 特别处理产品分析卡片
        try {
            document.getElementById('hotProductsValue').textContent = '0';
            document.getElementById('fabricUsageValue').textContent = '0平米';
            document.getElementById('productMarginValue').textContent = '0%';
            document.getElementById('customProductRatioValue').textContent = '0%';
        } catch (e) {
            console.error('清空产品分析卡片失败:', e);
        }
        
        // 特别处理利润分析卡片
        try {
            document.getElementById('totalCostValue').textContent = '¥0';
            document.getElementById('productionCostRatio').textContent = '0%';
            document.getElementById('operationCostRatio').textContent = '0%';
            document.getElementById('adCostRatio').textContent = '0%';
        } catch (e) {
            console.error('清空利润分析卡片失败:', e);
        }
        
        // 更新所有趋势指标
        const trendElements = document.querySelectorAll('.stat-card-trend');
        trendElements.forEach(element => {
            try {
                element.innerHTML = '<i class="fas fa-minus"></i> <span>0%</span>';
                element.style.color = '#999';
            } catch (e) {
                console.error('清空趋势指标失败:', e);
            }
        });
        
        console.log('所有统计卡片已更新为空数据状态');
        
        // 向全局暴露此函数
        window.updateEmptyStatCards = updateEmptyStatCards;
    } catch (error) {
        console.error('更新统计卡片为空数据失败:', error);
    }
} 