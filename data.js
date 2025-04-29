// 全局数据存储
window.orders = [];
window.operatingCosts = [];
window.productionCosts = [];
window.adCosts = [];

// 生成随机订单数据
function generateMockOrderData(count = 10) {
    console.log('开始生成模拟订单数据...');
    
    // 先备份现有数据，确保不会丢失
    console.log('为生成示例数据，先备份现有数据...');
    const backupResult = backupData('示例数据生成前的自动备份');
    if (backupResult.success) {
        console.log(`成功创建备份：${backupResult.backupName}`);
    } else {
        console.error('备份失败，但将继续生成示例数据:', backupResult.message);
    }
    
    const customers = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '郑十一', '王十二'];
    const statuses = ['待确认', '待生产', '生产中', '待交付', '已完成', '已取消'];
    const fabricBrands = ['品牌A', '品牌B', '品牌C', '品牌D', '品牌E'];
    const fabricTypes = ['50%羊毛', '80%羊毛', '100%羊毛面料', '棉麻', '真丝'];
    
    // 不清空现有数据，而是创建新的示例数据数组
    const newOrders = [];
    
    // 固定生成10条完整订单详情
    const completeOrderCount = 10;
    
    // 生成指定数量的订单
    for (let i = 1; i <= completeOrderCount; i++) {
        // 创建随机日期（近180天内）
        const today = new Date();
        const dealDate = new Date(today);
        dealDate.setDate(today.getDate() - Math.floor(Math.random() * 180)); // 过去180天内的随机日期
        
        // 计算预计交付日期（成交日期后的20-30天）
        const expectedDeliveryDate = new Date(dealDate);
        expectedDeliveryDate.setDate(dealDate.getDate() + 20 + Math.floor(Math.random() * 11));
        
        // 计算实际交付日期（70%的订单有实际交付日期）
        let actualDeliveryDate = null;
        if (Math.random() < 0.7) { // 70%的订单有实际交付日期
            actualDeliveryDate = new Date(expectedDeliveryDate);
            // 30%概率延期，70%概率提前
            const delay = Math.random() < 0.3 
                ? Math.floor(Math.random() * 10) // 延期1-10天
                : -Math.floor(Math.random() * 7); // 提前1-7天
            actualDeliveryDate.setDate(expectedDeliveryDate.getDate() + delay);
        }
        
        // 生成随机价格（2000-10000之间）
        const totalPrice = 2000 + Math.floor(Math.random() * 8001);
        const depositAmount = Math.round(totalPrice * 0.7 * 100) / 100; // 预付款为总价的70%
        
        // 选择客户
        const customer = customers[Math.floor(Math.random() * customers.length)];
        
        // 选择订单状态
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        // 选择面料信息
        const fabricBrand = fabricBrands[Math.floor(Math.random() * fabricBrands.length)];
        const fabricType = fabricTypes[Math.floor(Math.random() * fabricTypes.length)];
        
        // 创建订单前缀，确保示例订单有特殊标记
        const orderPrefix = `DEMO-${String(i).padStart(3, '0')}`;
        
        // 创建订单对象
        const order = {
            id: orderPrefix,
            customerName: `测试-${customer}`,
            customerPhone: `1${Math.floor(Math.random() * 9) + 3}${Array(9).fill(0).map(() => Math.floor(Math.random() * 10)).join('')}`,
            dealDate: formatDate(dealDate),
            expectedDeliveryDate: formatDate(expectedDeliveryDate),
            actualDeliveryDate: actualDeliveryDate ? formatDate(actualDeliveryDate) : null,
            status: status,
            totalPrice: totalPrice.toFixed(2),
            depositAmount: depositAmount.toFixed(2),
            balanceAmount: (totalPrice - depositAmount).toFixed(2),
            paidAmount: Math.random() > 0.2 ? (Math.random() > 0.5 ? totalPrice : depositAmount).toFixed(2) : '0.00',
            fabricBrand: fabricBrand,
            fabricCode: `FB${Math.floor(Math.random() * 1000)}`,
            fabricType: fabricType,
            specifications: `${Math.floor(Math.random() * 50) + 150}cm × ${Math.floor(Math.random() * 50) + 200}cm`,
            notes: '这是示例数据，可安全删除'
        };
        
        // 添加到新订单数组
        newOrders.push(order);
        
        // 生成详情数据
        const orderDetails = generateOrderDetails(order);
        localStorage.setItem(`orderDetails_${order.id}`, JSON.stringify(orderDetails));
        
        // 生成款式数据
        const orderStyle = generateOrderStyle(order);
        localStorage.setItem(`orderStyle_${order.id}`, JSON.stringify(orderStyle));
        
        // 生成尺寸体型数据
        const orderSize = generateOrderSize(order);
        localStorage.setItem(`orderSize_${order.id}`, JSON.stringify(orderSize));
        
        // 生成其他项数据
        const orderOther = generateOrderOther(order);
        localStorage.setItem(`orderOther_${order.id}`, JSON.stringify(orderOther));
        
        // 生成附件数据
        const orderAttachments = generateOrderAttachments(order);
        localStorage.setItem(`orderAttachments_${order.id}`, JSON.stringify(orderAttachments));
        
        console.log(`已为测试订单 ${order.id} 生成完整详情数据`);
    }
    
    // 获取现有订单数据
    let existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    // 合并新生成的订单到现有订单
    const mergedOrders = [...existingOrders, ...newOrders];
    
    // 保存到localStorage
    localStorage.setItem('orders', JSON.stringify(mergedOrders));
    
    console.log(`生成了${completeOrderCount}条测试订单数据，每条均包含完整详情。现有数据已备份至"${backupResult.backupName}"`);
    return newOrders;
}

// 生成订单基本信息
function generateOrderDetails(order) {
    return {
        orderId: order.id,
        orderNumber: `DEMO-${order.dealDate.slice(2, 4)}${order.dealDate.slice(5, 7)}${order.dealDate.slice(8, 10)}-${Math.floor(Math.random() * 900) + 100}`,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerAddress: `测试地址：某某市某某区某某路${Math.floor(Math.random() * 100) + 1}号`,
        customerHeight: Math.floor(Math.random() * 30) + 160, // 160-190cm
        customerWeight: Math.floor(Math.random() * 40) + 50, // 50-90kg
        orderRemarks: "这是测试数据生成的订单详情，包含完整信息，可安全删除",
        lastModified: new Date().toISOString()
    };
}

// 生成款式数据
function generateOrderStyle(order) {
    const styles = ['商务款', '休闲款', '正装款', '时尚款', '传统款'];
    const collars = ['直领', '方领', '尖领', '温莎领', '意大利领'];
    const cuffs = ['法式袖口', '标准袖口', '单纽扣袖口', '双纽扣袖口'];
    const pockets = ['常规口袋', '斜插口袋', '贴袋', '无口袋'];
    const backStyles = ['中央开衩', '双开衩', '无开衩'];
    
    return {
        orderId: order.id,
        mainStyle: styles[Math.floor(Math.random() * styles.length)],
        collarStyle: collars[Math.floor(Math.random() * collars.length)],
        cuffStyle: cuffs[Math.floor(Math.random() * cuffs.length)],
        pocketStyle: pockets[Math.floor(Math.random() * pockets.length)],
        backStyle: backStyles[Math.floor(Math.random() * backStyles.length)],
        fabricDetails: {
            mainFabric: order.fabricType,
            brand: order.fabricBrand,
            code: order.fabricCode
        },
        // 常用字段映射 - 确保数据在不同地方都能显示
        suitLapelStyle: collars[Math.floor(Math.random() * collars.length)],
        suitButtonCount: Math.floor(Math.random() * 3) + 1, // 1-3粒扣
        suitVent: backStyles[Math.floor(Math.random() * backStyles.length)],
        suitSleeveButtons: Math.floor(Math.random() * 3) + 2, // 2-4粒袖扣
        suitPocket: pockets[Math.floor(Math.random() * pockets.length)],
        styleRemarks: "测试数据 - 款式信息已完整生成",
        lastModified: new Date().toISOString()
    };
}

// 生成尺寸体型数据
function generateOrderSize(order) {
    // 根据客户体型随机生成各项尺寸数据
    return {
        orderId: order.id,
        measurements: {
            shoulderWidth: (Math.random() * 10 + 40).toFixed(1),
            chestCircumference: (Math.random() * 20 + 90).toFixed(1),
            waistCircumference: (Math.random() * 20 + 75).toFixed(1),
            hipCircumference: (Math.random() * 20 + 85).toFixed(1),
            sleeveLength: (Math.random() * 10 + 55).toFixed(1),
            frontLength: (Math.random() * 10 + 65).toFixed(1),
            backLength: (Math.random() * 10 + 70).toFixed(1),
            neckCircumference: (Math.random() * 5 + 35).toFixed(1),
            armCircumference: (Math.random() * 5 + 30).toFixed(1)
        },
        // 添加裤子尺寸
        pantsMeasurements: {
            waistCircumference: (Math.random() * 20 + 75).toFixed(1),
            hipCircumference: (Math.random() * 20 + 90).toFixed(1),
            thighCircumference: (Math.random() * 10 + 50).toFixed(1),
            kneeCircumference: (Math.random() * 5 + 40).toFixed(1),
            crotchLength: (Math.random() * 5 + 25).toFixed(1),
            inseam: (Math.random() * 10 + 75).toFixed(1),
            outseam: (Math.random() * 10 + 100).toFixed(1),
            bottomWidth: (Math.random() * 5 + 15).toFixed(1)
        },
        bodyShape: Math.random() > 0.5 ? '标准体型' : Math.random() > 0.5 ? '偏瘦体型' : '偏胖体型',
        specialAdjustments: '测试数据 - 特殊调整信息',
        sizeRemarks: "测试数据 - 尺寸体型信息已完整生成",
        lastModified: new Date().toISOString()
    };
}

// 生成其他项数据
function generateOrderOther(order) {
    const buttonTypes = ['牛角纽扣', '金属纽扣', '珍珠纽扣', '木质纽扣', '塑料纽扣'];
    const linings = ['全衬', '半衬', '无衬'];
    const embroideries = ['袖口刺绣', '前胸刺绣', '背部刺绣', '领口刺绣'];
    
    // 测试数据总是包含刺绣
    const embroidery = embroideries[Math.floor(Math.random() * embroideries.length)];
    
    return {
        orderId: order.id,
        buttonType: buttonTypes[Math.floor(Math.random() * buttonTypes.length)],
        liningType: linings[Math.floor(Math.random() * linings.length)],
        hasEmbroidery: true,
        embroideryDetails: {
            position: embroidery,
            text: `测试-${order.customerName.charAt(0)}`,
            color: ['红色', '蓝色', '金色', '黑色'][Math.floor(Math.random() * 4)]
        },
        accessories: ['领带', '袖扣', '口袋巾'][Math.floor(Math.random() * 3)],
        otherRemarks: "测试数据 - 其他项信息已完整生成",
        lastModified: new Date().toISOString()
    };
}

// 生成附件数据
function generateOrderAttachments(order) {
    // 为测试数据生成简单的附件信息
    return {
        orderId: order.id,
        bodyPhotos: ['示例体型照片链接1', '示例体型照片链接2'],
        stylePhotos: ['示例款式照片链接1', '示例款式照片链接2'],
        fabricPhotos: ['示例面料照片链接'],
        attachmentRemarks: "测试数据 - 这些仅为示例附件数据，无实际图片",
        lastModified: new Date().toISOString()
    };
}

// 生成生产成本数据
function generateProductionCostData(orderIds = null) {
    console.log('生成模拟生产成本数据...');
    
    // 决定要为哪些订单生成生产成本
    let targetOrderIds = [];
    
    if (orderIds && Array.isArray(orderIds) && orderIds.length > 0) {
        // 如果提供了特定的订单ID列表，使用它们
        targetOrderIds = orderIds;
    } else {
        // 否则获取所有以DEMO开头的示例订单
        const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        targetOrderIds = allOrders
            .filter(order => order.id && order.id.startsWith('DEMO-'))
            .map(order => order.id);
    }
    
    if (targetOrderIds.length === 0) {
        console.log('没有找到示例订单，无法生成生产成本数据');
        return [];
    }
    
    console.log(`将为${targetOrderIds.length}个示例订单生成生产成本数据`);
    
    // 获取现有生产成本数据
    const existingProductionCosts = JSON.parse(localStorage.getItem('productionCosts') || '[]');
    
    // 创建新的生产成本数组
    const newProductionCosts = [];
    
    // 为每个示例订单生成对应的生产成本记录
    for (const orderId of targetOrderIds) {
        // 检查是否已经存在该订单的生产成本记录
        const existingCost = existingProductionCosts.find(cost => cost.orderId === orderId);
        if (existingCost) {
            console.log(`订单 ${orderId} 已存在生产成本记录，跳过`);
            continue;
        }
        
        // 获取订单信息
        const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        const order = allOrders.find(o => o.id === orderId);
        
        if (!order) {
            console.log(`找不到订单 ${orderId}，跳过生成生产成本`);
            continue;
        }
        
        // 生成随机成本数据
        const fabricCost = Math.round(parseFloat(order.totalPrice) * (0.3 + Math.random() * 0.1) * 100) / 100; // 面料成本约为总价的30-40%
        const processingCost = Math.round(parseFloat(order.totalPrice) * (0.2 + Math.random() * 0.1) * 100) / 100; // 加工成本约为总价的20-30%
        const expressCost = 20 + Math.floor(Math.random() * 30); // 快递成本20-50元
        const modificationCost = Math.random() > 0.7 ? 50 + Math.floor(Math.random() * 100) : 0; // 30%概率有修改成本，50-150元
        const salesCommission = Math.round(parseFloat(order.totalPrice) * 0.05 * 100) / 100; // 销售提成约为总价的5%
        
        // 计算总成本
        const totalCost = fabricCost + processingCost + expressCost + modificationCost + salesCommission;
        
        // 创建成本对象
        const productionCost = {
            id: `PC-${orderId}`,
            orderId: orderId,
            fabricBrand: order.fabricBrand || '未知品牌',
            fabricCode: order.fabricCode || '未知编码',
            fabricType: order.fabricType || '未知类型',
            fabricUsage: (1.5 + Math.random() * 1).toFixed(2), // 1.5-2.5米
            fabricUnit: '米',
            fabricCost: fabricCost.toFixed(2),
            processingCost: processingCost.toFixed(2),
            expressCost: expressCost.toFixed(2),
            modificationCost: modificationCost.toFixed(2),
            salesCommission: salesCommission.toFixed(2),
            totalCost: totalCost.toFixed(2),
            costDate: order.dealDate,
            manufacturer: ['厂商A', '厂商B', '厂商C'][Math.floor(Math.random() * 3)],
            notes: '示例成本数据，可安全删除'
        };
        
        // 添加到新成本数组
        newProductionCosts.push(productionCost);
        console.log(`已为示例订单 ${orderId} 生成生产成本数据`);
    }
    
    // 合并新的成本数据到现有数据
    const mergedProductionCosts = [...existingProductionCosts, ...newProductionCosts];
    
    // 保存到localStorage
    localStorage.setItem('productionCosts', JSON.stringify(mergedProductionCosts));
    
    console.log(`成功生成了${newProductionCosts.length}条示例生产成本数据`);
    return newProductionCosts;
}

// 生成随机运营成本数据
function generateOperatingCostData(count = 50) {
    console.log('生成模拟运营成本数据...');
    
    const costItems = ['房租', '物业', '水费', '电费', '工资', '停车费', '杂费'];
    
    // 清空现有数据
    window.operatingCosts = [];
    
    // 生成指定数量的运营成本
    for (let i = 1; i <= count; i++) {
        // 创建随机日期（近180天内）
        const today = new Date();
        const costDate = new Date(today);
        costDate.setDate(today.getDate() - Math.floor(Math.random() * 180)); // 过去180天内的随机日期
        
        // 选择随机成本项目
        const costItem = costItems[Math.floor(Math.random() * costItems.length)];
        
        // 根据成本项目设置合理的金额范围
        let amount;
        switch (costItem) {
            case '房租':
                amount = 5000 + Math.floor(Math.random() * 5001); // 5000-10000
                break;
            case '物业':
                amount = 1000 + Math.floor(Math.random() * 1001); // 1000-2000
                break;
            case '水费':
                amount = 100 + Math.floor(Math.random() * 401); // 100-500
                break;
            case '电费':
                amount = 500 + Math.floor(Math.random() * 1001); // 500-1500
                break;
            case '工资':
                amount = 10000 + Math.floor(Math.random() * 20001); // 10000-30000
                break;
            case '停车费':
                amount = 200 + Math.floor(Math.random() * 301); // 200-500
                break;
            case '杂费':
                amount = 50 + Math.floor(Math.random() * 951); // 50-1000
                break;
            default:
                amount = 100 + Math.floor(Math.random() * 901); // 100-1000
        }
        
        // 创建运营成本对象
        const operatingCost = {
            id: `OC${String(i).padStart(6, '0')}`,
            date: formatDate(costDate),
            costType: '运营成本',
            costCategory: '日常运营',
            costItem: costItem,
            amount: amount.toFixed(2),
            costDate: formatDate(costDate), // 添加costDate字段以兼容不同版本的代码
            description: `${costDate.getFullYear()}年${costDate.getMonth() + 1}月${costItem}费用`,
            notes: Math.random() > 0.7 ? `${costDate.getMonth() + 1}月${costItem}` : ''
        };
        
        // 添加到运营成本数组
        window.operatingCosts.push(operatingCost);
    }
    
    // 保存到localStorage
    localStorage.setItem('operatingCosts', JSON.stringify(window.operatingCosts));
    
    console.log(`生成了${count}条模拟运营成本数据`);
    return window.operatingCosts;
}

// 生成随机广告成本数据
function generateAdCostData(count = 30) {
    console.log('生成模拟广告成本数据...');
    
    const costItems = ['小红书', '抖音', '地图', '快手', '视频号', '美团', '其他'];
    
    // 清空现有数据
    window.adCosts = [];
    
    // 生成指定数量的广告成本
    for (let i = 1; i <= count; i++) {
        // 创建随机日期（近180天内）
        const today = new Date();
        const costDate = new Date(today);
        costDate.setDate(today.getDate() - Math.floor(Math.random() * 180)); // 过去180天内的随机日期
        
        // 选择随机成本项目
        const costItem = costItems[Math.floor(Math.random() * costItems.length)];
        
        // 根据成本项目设置合理的金额范围
        let amount;
        switch (costItem) {
            case '小红书':
                amount = 1000 + Math.floor(Math.random() * 4001); // 1000-5000
                break;
            case '抖音':
                amount = 2000 + Math.floor(Math.random() * 8001); // 2000-10000
                break;
            case '地图':
                amount = 500 + Math.floor(Math.random() * 1501); // 500-2000
                break;
            case '快手':
                amount = 1500 + Math.floor(Math.random() * 3501); // 1500-5000
                break;
            case '视频号':
                amount = 1000 + Math.floor(Math.random() * 3001); // 1000-4000
                break;
            case '美团':
                amount = 800 + Math.floor(Math.random() * 1201); // 800-2000
                break;
            case '其他':
                amount = 300 + Math.floor(Math.random() * 1701); // 300-2000
                break;
            default:
                amount = 500 + Math.floor(Math.random() * 4501); // 500-5000
        }
        
        // 创建广告成本对象
        const adCost = {
            id: `AD${String(i).padStart(6, '0')}`,
            date: formatDate(costDate),
            costType: '广告成本',
            costCategory: '营销推广',
            costItem: costItem,
            amount: amount.toFixed(2),
            costDate: formatDate(costDate), // 添加costDate字段以兼容不同版本的代码
            platform: costItem,
            campaignName: `${costDate.getFullYear()}年${costDate.getMonth() + 1}月${costItem}推广活动`,
            description: `${costItem}平台推广费用`,
            notes: Math.random() > 0.7 ? `${costDate.getMonth() + 1}月${costItem}推广` : ''
        };
        
        // 添加到广告成本数组
        window.adCosts.push(adCost);
    }
    
    // 保存到localStorage
    localStorage.setItem('adCosts', JSON.stringify(window.adCosts));
    
    console.log(`生成了${count}条模拟广告成本数据`);
    return window.adCosts;
}

// 生成随机工资数据
function generateSalaryData(count = 10) {
    console.log('生成模拟工资数据...');
    
    const employeeNames = ['张师傅', '李师傅', '王师傅', '赵师傅', '钱师傅', '孙师傅', '周师傅', '吴师傅', '郑师傅', '陈师傅'];
    const positions = ['裁剪师', '缝纫师', '设计师', '客户经理', '店长', '助理'];
    
    // 清空现有数据
    const salaries = [];
    
    // 生成指定数量的工资记录
    for (let i = 1; i <= count; i++) {
        // 创建随机日期（近90天内）
        const today = new Date();
        const salaryDate = new Date(today);
        salaryDate.setDate(today.getDate() - Math.floor(Math.random() * 90)); // 过去90天内的随机日期
        
        // 固定基础工资为5000元
        const baseSalary = 5000;
        
        // 随机生成标准工资（800-2000元）
        const standardSalary = 800 + Math.floor(Math.random() * 1201);
        
        // 随机生成提成（300-2000元）
        const commission = 300 + Math.floor(Math.random() * 1701);
        
        // 随机考勤数据
        const workDays = 20 + Math.floor(Math.random() * 6); // 20-25天
        const leaveDays = Math.floor(Math.random() * 3); // 0-2天
        const overtimeHours = Math.floor(Math.random() * 16); // 0-15小时
        
        // 计算应发工资
        const overtimePay = overtimeHours * 30; // 加班费：每小时30元
        const deduction = leaveDays * (baseSalary / 22); // 请假扣款：按基础工资天数比例
        
        const totalSalary = baseSalary + standardSalary + commission + overtimePay - deduction;
        
        // 创建工资对象
        const salary = {
            id: `SA${String(i).padStart(6, '0')}`,
            date: formatDate(salaryDate),
            year: salaryDate.getFullYear(),
            month: salaryDate.getMonth() + 1,
            employeeName: employeeNames[Math.floor(Math.random() * employeeNames.length)],
            position: positions[Math.floor(Math.random() * positions.length)],
            baseSalary: baseSalary.toFixed(2),
            standardSalary: standardSalary.toFixed(2),
            commission: commission.toFixed(2),
            workDays: workDays,
            leaveDays: leaveDays,
            overtimeHours: overtimeHours,
            overtimePay: overtimePay.toFixed(2),
            deduction: deduction.toFixed(2),
            totalSalary: totalSalary.toFixed(2),
            status: '已发放',
            remarks: Math.random() > 0.8 ? '本月业绩优秀' : ''
        };
        
        // 添加到工资数组
        salaries.push(salary);
    }
    
    // 保存到localStorage
    localStorage.setItem('salaries', JSON.stringify(salaries));
    
    console.log(`生成了${count}条模拟工资数据`);
    return salaries;
}

// 从localStorage加载数据
function loadDataFromStorage() {
    console.log('开始从localStorage加载数据...');
    
    // 加载订单数据
    const storedOrders = localStorage.getItem('orders');
    if (storedOrders) {
        window.orders = JSON.parse(storedOrders);
        console.log(`加载了${window.orders.length}条订单数据`);
    } else {
        console.log('未找到订单数据，初始化为空数组');
        window.orders = [];
    }
    
    // 加载生产成本数据
    const storedProductionCosts = localStorage.getItem('productionCosts');
    if (storedProductionCosts) {
        window.productionCosts = JSON.parse(storedProductionCosts);
        console.log(`加载了${window.productionCosts.length}条生产成本数据`);
    } else {
        console.log('未找到生产成本数据，初始化为空数组');
        window.productionCosts = [];
    }
    
    // 加载运营成本数据
    const storedOperatingCosts = localStorage.getItem('operatingCosts');
    if (storedOperatingCosts) {
        window.operatingCosts = JSON.parse(storedOperatingCosts);
        console.log(`加载了${window.operatingCosts.length}条运营成本数据`);
    } else {
        console.log('未找到运营成本数据，初始化为空数组');
        window.operatingCosts = [];
    }
    
    // 加载广告成本数据
    const storedAdCosts = localStorage.getItem('adCosts');
    if (storedAdCosts) {
        window.adCosts = JSON.parse(storedAdCosts);
        console.log(`加载了${window.adCosts.length}条广告成本数据`);
    } else {
        console.log('未找到广告成本数据，初始化为空数组');
        window.adCosts = [];
    }
    
    console.log('数据加载完成');
}

// 格式化日期为YYYY-MM-DD
function formatDate(date) {
    if (!date) return '';
    
    if (typeof date === 'string') {
        date = new Date(date);
    }
    
    if (isNaN(date.getTime())) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

// 加载订单数据
function loadOrdersFromStorage() {
    const storedOrders = localStorage.getItem('orders');
    if (storedOrders) {
        window.orders = JSON.parse(storedOrders);
        console.log(`加载了${window.orders.length}条订单数据`);
    } else {
        console.log('未找到订单数据，使用空数组');
        window.orders = [];
    }
    return window.orders;
}

// 加载生产成本数据
function loadProductionCostsFromStorage() {
    const storedProductionCosts = localStorage.getItem('productionCosts');
    if (storedProductionCosts) {
        window.productionCosts = JSON.parse(storedProductionCosts);
        console.log(`加载了${window.productionCosts.length}条生产成本数据`);
    } else {
        console.log('未找到生产成本数据，使用空数组');
        window.productionCosts = [];
    }
    return window.productionCosts;
}

// 数据备份功能
function backupData() {
    console.log('开始创建数据备份...');
    
    try {
        // 收集所有需要备份的数据
        const backup = {
            orders: JSON.parse(localStorage.getItem('orders') || '[]'),
            costs: JSON.parse(localStorage.getItem('costs') || '[]'), // 兼容旧版本
            productionCosts: JSON.parse(localStorage.getItem('productionCosts') || '[]'),
            operatingCosts: JSON.parse(localStorage.getItem('operatingCosts') || '[]'),
            adCosts: JSON.parse(localStorage.getItem('adCosts') || '[]'),
            salaries: JSON.parse(localStorage.getItem('salaries') || '[]'),
            orderSequence: localStorage.getItem('orderSequence') || '1',
            backupDate: new Date().toISOString(),
            version: '1.0'
        };
        
        // 创建带时间戳的备份名称
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupName = `dataBackup_${timestamp}`;
        
        // 保存备份到localStorage
        localStorage.setItem(backupName, JSON.stringify(backup));
        
        // 更新备份列表
        let backupList = JSON.parse(localStorage.getItem('backupList') || '[]');
        backupList.push({
            name: backupName,
            date: new Date().toISOString(),
            ordersCount: backup.orders.length,
            productionCostsCount: backup.productionCosts.length,
            operatingCostsCount: backup.operatingCosts.length,
            adCostsCount: backup.adCosts.length,
            salariesCount: backup.salaries.length
        });
        
        // 只保留最新的10个备份记录
        if (backupList.length > 10) {
            // 删除最旧的备份
            const oldestBackup = backupList.shift();
            localStorage.removeItem(oldestBackup.name);
        }
        
        // 保存更新后的备份列表
        localStorage.setItem('backupList', JSON.stringify(backupList));
        
        console.log(`数据备份成功，备份名称: ${backupName}`);
        return {
            success: true,
            backupName: backupName,
            message: '数据备份成功！'
        };
    } catch (error) {
        console.error('数据备份失败:', error);
        return {
            success: false,
            message: '数据备份失败: ' + error.message
        };
    }
}

// 获取备份列表
function getBackupList() {
    try {
        // 从localStorage获取备份列表
        let backupList = JSON.parse(localStorage.getItem('backupList') || '[]');
        
        // 按日期从新到旧排序
        backupList.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        return backupList;
    } catch (error) {
        console.error('获取备份列表失败:', error);
        return [];
    }
}

// 恢复备份数据
function restoreBackup(backupName) {
    console.log(`开始恢复备份: ${backupName}...`);
    
    try {
        // 先备份当前数据
        const currentBackup = {
            orders: JSON.parse(localStorage.getItem('orders') || '[]'),
            costs: JSON.parse(localStorage.getItem('costs') || '[]'),
            productionCosts: JSON.parse(localStorage.getItem('productionCosts') || '[]'),
            operatingCosts: JSON.parse(localStorage.getItem('operatingCosts') || '[]'),
            adCosts: JSON.parse(localStorage.getItem('adCosts') || '[]'),
            salaries: JSON.parse(localStorage.getItem('salaries') || '[]'),
            orderSequence: localStorage.getItem('orderSequence') || '1',
            backupDate: new Date().toISOString(),
            version: '1.0'
        };
        localStorage.setItem('dataBackupBeforeRestore', JSON.stringify(currentBackup));
        
        // 获取指定的备份数据
        const backupData = JSON.parse(localStorage.getItem(backupName));
        if (!backupData) {
            throw new Error(`找不到备份: ${backupName}`);
        }
        
        // 恢复各项数据到localStorage
        localStorage.setItem('orders', JSON.stringify(backupData.orders || []));
        localStorage.setItem('costs', JSON.stringify(backupData.costs || []));
        localStorage.setItem('productionCosts', JSON.stringify(backupData.productionCosts || []));
        localStorage.setItem('operatingCosts', JSON.stringify(backupData.operatingCosts || []));
        localStorage.setItem('adCosts', JSON.stringify(backupData.adCosts || []));
        localStorage.setItem('salaries', JSON.stringify(backupData.salaries || []));
        if (backupData.orderSequence) {
            localStorage.setItem('orderSequence', backupData.orderSequence);
        }
        
        // 更新全局变量
        window.orders = backupData.orders || [];
        window.costs = backupData.costs || [];
        window.productionCosts = backupData.productionCosts || [];
        window.operatingCosts = backupData.operatingCosts || [];
        window.adCosts = backupData.adCosts || [];
        window.salaries = backupData.salaries || [];
        window.orderSequence = parseInt(backupData.orderSequence || '1');
        
        console.log('数据恢复成功!');
        return {
            success: true,
            message: '数据恢复成功！',
            stats: {
                orders: backupData.orders.length,
                productionCosts: backupData.productionCosts.length,
                operatingCosts: backupData.operatingCosts.length,
                adCosts: backupData.adCosts.length,
                salaries: backupData.salaries ? backupData.salaries.length : 0
            }
        };
    } catch (error) {
        console.error('数据恢复失败:', error);
        return {
            success: false,
            message: '数据恢复失败: ' + error.message
        };
    }
}

// 自动备份数据（每次页面加载时调用）
function autoBackup() {
    // 获取上次备份时间
    const lastBackupDate = localStorage.getItem('lastAutoBackupDate');
    
    // 如果未设置过备份时间或距离上次备份已超过1天，则进行自动备份
    if (!lastBackupDate || (new Date() - new Date(lastBackupDate)) > 24*60*60*1000) {
        console.log('执行自动备份...');
        
        // 执行备份
        const result = backupData();
        
        // 更新最后备份时间
        if (result.success) {
            localStorage.setItem('lastAutoBackupDate', new Date().toISOString());
            console.log('自动备份成功，更新最后备份时间');
        }
        
        // 检查并修复生产成本数据与订单数据的关联一致性
        checkAndFixProductionCosts();
        
        return result;
    } else {
        console.log('自动备份条件未满足，跳过备份');
        return {
            success: true,
            message: '已跳过自动备份（距离上次备份时间不足1天）'
        };
    }
}

// 删除指定备份
function deleteBackup(backupName) {
    console.log(`开始删除备份: ${backupName}...`);
    
    try {
        // 从localStorage中移除备份数据
        localStorage.removeItem(backupName);
        
        // 更新备份列表
        let backupList = JSON.parse(localStorage.getItem('backupList') || '[]');
        backupList = backupList.filter(backup => backup.name !== backupName);
        localStorage.setItem('backupList', JSON.stringify(backupList));
        
        console.log(`备份 ${backupName} 已删除`);
        return {
            success: true,
            message: '备份已成功删除！'
        };
    } catch (error) {
        console.error('删除备份失败:', error);
        return {
            success: false,
            message: '删除备份失败: ' + error.message
        };
    }
}

// 检查并修复生产成本数据与订单数据的关联一致性
function checkAndFixProductionCosts() {
    console.log('开始检查并修复生产成本数据与订单数据的关联一致性...');
    
    try {
        // 加载订单和生产成本数据
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const productionCosts = JSON.parse(localStorage.getItem('productionCosts') || '[]');
        
        console.log(`当前有 ${orders.length} 条订单和 ${productionCosts.length} 条生产成本记录`);
        
        // 用于跟踪修复情况的计数器
        const stats = {
            missingCosts: 0,
            updatedCosts: 0,
            orphanedCosts: 0
        };
        
        // 检查每个订单是否有对应的生产成本记录
        const ordersWithoutCosts = orders.filter(order => 
            !productionCosts.some(cost => cost.orderId === order.id)
        );
        
        stats.missingCosts = ordersWithoutCosts.length;
        console.log(`发现 ${ordersWithoutCosts.length} 条订单没有对应的生产成本记录`);
        
        // 为没有生产成本记录的订单创建新记录
        for (const order of ordersWithoutCosts) {
            const newCost = {
                id: `PC${generateUniqueId()}`,
                orderId: order.id,
                fabricBrand: order.fabricBrand || '',
                fabricCode: order.fabricCode || '',
                fabricType: order.fabricType || '',
                fabricUsage: order.fabricAmount || '0',
                fabricUnit: '米',
                fabricCost: "",
                processingCost: "",
                expressCost: "",
                modificationCost: "",
                salesCommission: "",
                totalCost: "0.00",
                manufacturer: order.manufacturer || '未指定',
                configuration: order.configuration || '标准配置',
                notes: `自动为订单 ${order.orderNumber || order.id} 创建的生产成本记录`
            };
            
            productionCosts.push(newCost);
        }
        
        // 检查已有生产成本记录中的数据是否与对应订单一致
        let updatedCount = 0;
        productionCosts.forEach(cost => {
            const relatedOrder = orders.find(order => order.id === cost.orderId);
            if (relatedOrder) {
                // 检查并更新基础字段，确保一致性
                let updated = false;
                
                if (relatedOrder.fabricBrand && cost.fabricBrand !== relatedOrder.fabricBrand) {
                    cost.fabricBrand = relatedOrder.fabricBrand;
                    updated = true;
                }
                
                if (relatedOrder.fabricCode && cost.fabricCode !== relatedOrder.fabricCode) {
                    cost.fabricCode = relatedOrder.fabricCode;
                    updated = true;
                }
                
                if (relatedOrder.fabricType && cost.fabricType !== relatedOrder.fabricType) {
                    cost.fabricType = relatedOrder.fabricType;
                    updated = true;
                }
                
                if (relatedOrder.fabricAmount && cost.fabricUsage !== relatedOrder.fabricAmount) {
                    cost.fabricUsage = relatedOrder.fabricAmount;
                    updated = true;
                }
                
                if (relatedOrder.manufacturer && cost.manufacturer !== relatedOrder.manufacturer) {
                    cost.manufacturer = relatedOrder.manufacturer;
                    updated = true;
                }
                
                if (relatedOrder.configuration && cost.configuration !== relatedOrder.configuration) {
                    cost.configuration = relatedOrder.configuration;
                    updated = true;
                }
                
                if (updated) {
                    updatedCount++;
                }
            }
        });
        
        stats.updatedCosts = updatedCount;
        console.log(`已更新 ${updatedCount} 条生产成本记录，使其与订单数据保持一致`);
        
        // 检查是否有孤立的生产成本记录（没有对应的订单）
        const orphanedCosts = productionCosts.filter(cost => 
            !orders.some(order => order.id === cost.orderId)
        );
        
        stats.orphanedCosts = orphanedCosts.length;
        console.log(`发现 ${orphanedCosts.length} 条孤立的生产成本记录（没有关联的订单）`);
        
        // 将修复后的生产成本数据保存回localStorage
        localStorage.setItem('productionCosts', JSON.stringify(productionCosts));
        
        // 更新全局变量
        window.productionCosts = productionCosts;
        
        console.log('生产成本数据检查和修复完成');
        return {
            success: true,
            message: '生产成本数据检查和修复成功！',
            stats: stats
        };
    } catch (error) {
        console.error('检查并修复生产成本数据失败:', error);
        return {
            success: false,
            message: '检查并修复生产成本数据失败: ' + error.message
        };
    }
}

// 生成唯一ID的辅助函数
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// 检查订单数据完整性并修复常见问题
function checkAndFixOrderData() {
    console.log('开始检查并修复订单数据完整性...');
    
    try {
        // 加载订单数据
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        
        console.log(`准备检查 ${orders.length} 条订单数据`);
        
        // 用于跟踪修复情况的计数器
        const stats = {
            missingId: 0,
            missingOrderNumber: 0,
            missingDates: 0,
            duplicateIds: 0,
            fixedTotal: 0
        };
        
        // 检查ID是否唯一
        const idMap = new Map();
        orders.forEach(order => {
            if (idMap.has(order.id)) {
                stats.duplicateIds++;
                // 修复重复ID
                order.id = 'ord-' + generateUniqueId();
                stats.fixedTotal++;
            }
            idMap.set(order.id, true);
        });
        
        // 检查并修复每个订单
        orders.forEach(order => {
            let fixed = false;
            
            // 检查并修复缺失的ID
            if (!order.id) {
                order.id = 'ord-' + generateUniqueId();
                stats.missingId++;
                fixed = true;
            }
            
            // 检查并修复缺失的订单编号
            if (!order.orderNumber) {
                // 创建一个订单编号格式：SR+年份后两位+月份+日期+随机3位数字
                const now = new Date();
                const year = now.getFullYear().toString().substr(2);
                const month = (now.getMonth() + 1).toString().padStart(2, '0');
                const day = now.getDate().toString().padStart(2, '0');
                const randomNum = Math.floor(Math.random() * 900) + 100;
                
                order.orderNumber = `SR${year}${month}${day}-${randomNum}`;
                stats.missingOrderNumber++;
                fixed = true;
            }
            
            // 检查并修复缺失的日期
            if (!order.orderDate) {
                order.orderDate = formatDate(new Date());
                stats.missingDates++;
                fixed = true;
            }
            
            if (!order.dealDate) {
                order.dealDate = order.orderDate; // 使用订单日期作为成交日期
                stats.missingDates++;
                fixed = true;
            }
            
            // 如果状态为"已完成"但缺少交付日期，则添加交付日期
            if (order.status === '已完成' && !order.deliveryDate) {
                order.deliveryDate = formatDate(new Date());
                stats.missingDates++;
                fixed = true;
            }
            
            // 计算已修复的总订单数
            if (fixed) {
                stats.fixedTotal++;
            }
        });
        
        // 保存修复后的订单数据
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // 更新全局变量
        window.orders = orders;
        
        console.log('订单数据检查和修复完成');
        return {
            success: true,
            message: '订单数据检查和修复成功！',
            stats: stats
        };
    } catch (error) {
        console.error('检查并修复订单数据失败:', error);
        return {
            success: false,
            message: '检查并修复订单数据失败: ' + error.message
        };
    }
}

// 检查成本数据完整性并修复常见问题
function checkAndFixCostData() {
    console.log('开始检查并修复成本数据完整性...');
    
    try {
        // 加载所有成本数据
        const operatingCosts = JSON.parse(localStorage.getItem('operatingCosts') || '[]');
        const adCosts = JSON.parse(localStorage.getItem('adCosts') || '[]');
        
        console.log(`准备检查 ${operatingCosts.length} 条运营成本数据和 ${adCosts.length} 条广告成本数据`);
        
        // 用于跟踪修复情况的计数器
        const stats = {
            missingId: 0,
            missingDates: 0,
            missingAmounts: 0,
            duplicateIds: 0,
            fixedTotal: 0
        };
        
        // 检查并修复运营成本数据
        checkAndFixCostArray(operatingCosts, 'op-', stats);
        
        // 检查并修复广告成本数据
        checkAndFixCostArray(adCosts, 'ad-', stats);
        
        // 保存修复后的成本数据
        localStorage.setItem('operatingCosts', JSON.stringify(operatingCosts));
        localStorage.setItem('adCosts', JSON.stringify(adCosts));
        
        // 兼容旧版本，也保存到costs字段
        localStorage.setItem('costs', JSON.stringify(operatingCosts));
        
        // 更新全局变量
        window.operatingCosts = operatingCosts;
        window.adCosts = adCosts;
        window.costs = operatingCosts; // 兼容旧代码
        
        console.log('成本数据检查和修复完成');
        return {
            success: true,
            message: '成本数据检查和修复成功！',
            stats: stats
        };
    } catch (error) {
        console.error('检查并修复成本数据失败:', error);
        return {
            success: false,
            message: '检查并修复成本数据失败: ' + error.message
        };
    }
}

// 辅助函数：检查并修复成本数据数组
function checkAndFixCostArray(costsArray, idPrefix, stats) {
    // 检查ID是否唯一
    const idMap = new Map();
    costsArray.forEach(cost => {
        if (idMap.has(cost.id)) {
            stats.duplicateIds++;
            // 修复重复ID
            cost.id = idPrefix + generateUniqueId();
            stats.fixedTotal++;
        }
        idMap.set(cost.id, true);
    });
    
    // 检查并修复每个成本记录
    costsArray.forEach(cost => {
        let fixed = false;
        
        // 检查并修复缺失的ID
        if (!cost.id) {
            cost.id = idPrefix + generateUniqueId();
            stats.missingId++;
            fixed = true;
        }
        
        // 检查并修复缺失的日期
        if (!cost.date) {
            if (cost.costDate) {
                cost.date = cost.costDate; // 使用costDate字段
            } else {
                cost.date = formatDate(new Date());
                stats.missingDates++;
                fixed = true;
            }
        }
        
        // 确保同时存在date和costDate字段（兼容性考虑）
        if (!cost.costDate) {
            cost.costDate = cost.date;
        }
        
        // 检查并修复缺失或无效的金额
        if (!cost.amount || isNaN(parseFloat(cost.amount))) {
            cost.amount = "0.00";
            stats.missingAmounts++;
            fixed = true;
        }
        
        // 确保同时存在amount和costAmount字段（兼容性考虑）
        if (!cost.costAmount) {
            cost.costAmount = cost.amount;
        }
        
        // 确保成本类型字段存在
        if (!cost.costType) {
            cost.costType = cost.id.startsWith('ad-') ? '广告成本' : '运营成本';
            fixed = true;
        }
        
        // 确保成本类别字段存在
        if (!cost.costCategory) {
            cost.costCategory = cost.id.startsWith('ad-') ? '营销推广' : '日常运营';
            fixed = true;
        }
        
        // 计算已修复的总记录数
        if (fixed) {
            stats.fixedTotal++;
        }
    });
}

// 执行全面数据检查并修复，返回详细报告
function performFullDataCheck() {
    console.log('开始执行全面数据检查...');
    
    try {
        // 创建一个完整的检查报告
        const report = {
            timestamp: new Date().toISOString(),
            orderCheck: null,
            costCheck: null,
            productionCostCheck: null,
            overallSuccess: false
        };
        
        // 执行订单数据检查
        report.orderCheck = checkAndFixOrderData();
        
        // 执行成本数据检查
        report.costCheck = checkAndFixCostData();
        
        // 执行生产成本数据关联性检查
        report.productionCostCheck = checkAndFixProductionCosts();
        
        // 确定整体检查是否成功
        report.overallSuccess = report.orderCheck.success && 
                               report.costCheck.success && 
                               report.productionCostCheck.success;
        
        // 生成汇总报告消息
        let summaryMessage = '';
        
        if (report.overallSuccess) {
            summaryMessage = '数据检查和修复已成功完成！详细信息：\n\n';
            
            if (report.orderCheck.stats.fixedTotal > 0) {
                summaryMessage += `- 修复了 ${report.orderCheck.stats.fixedTotal} 条订单数据问题\n`;
            } else {
                summaryMessage += '- 订单数据未发现问题\n';
            }
            
            if (report.costCheck.stats.fixedTotal > 0) {
                summaryMessage += `- 修复了 ${report.costCheck.stats.fixedTotal} 条成本数据问题\n`;
            } else {
                summaryMessage += '- 成本数据未发现问题\n';
            }
            
            if (report.productionCostCheck.stats.missingCosts > 0 || 
                report.productionCostCheck.stats.updatedCosts > 0 || 
                report.productionCostCheck.stats.orphanedCosts > 0) {
                
                summaryMessage += `- 生产成本数据：为 ${report.productionCostCheck.stats.missingCosts} 条订单创建了生产成本记录，`;
                summaryMessage += `更新了 ${report.productionCostCheck.stats.updatedCosts} 条记录，`;
                summaryMessage += `发现 ${report.productionCostCheck.stats.orphanedCosts} 条孤立记录\n`;
            } else {
                summaryMessage += '- 生产成本数据未发现问题\n';
            }
        } else {
            summaryMessage = '数据检查过程中发生错误，请查看详细报告。';
        }
        
        // 将检查报告保存到localStorage
        localStorage.setItem('lastDataCheckReport', JSON.stringify(report));
        
        console.log('全面数据检查完成，报告已保存');
        
        // 返回检查结果和汇总消息
        return {
            success: report.overallSuccess,
            message: summaryMessage,
            report: report
        };
    } catch (error) {
        console.error('执行全面数据检查失败:', error);
        return {
            success: false,
            message: '执行全面数据检查失败: ' + error.message
        };
    }
}

// 扩展订单对象结构，添加完整详情数据
function expandOrderExportStructure(order) {
  console.log(`获取订单ID=${order.id}的完整详情数据`);
  
  try {
    // 获取订单详情数据
    const detailsData = localStorage.getItem(`orderDetails_${order.id}`);
    const styleData = localStorage.getItem(`orderStyle_${order.id}`);
    const sizeData = localStorage.getItem(`orderSize_${order.id}`);
    const otherData = localStorage.getItem(`orderOther_${order.id}`);
    const attachmentsData = localStorage.getItem(`orderAttachments_${order.id}`);
    
    // 将所有详情合并到扩展的订单对象中
    const expandedOrder = {
      ...order,
      details: detailsData ? JSON.parse(detailsData) : null,
      style: styleData ? JSON.parse(styleData) : null,
      size: sizeData ? JSON.parse(sizeData) : null,
      other: otherData ? JSON.parse(otherData) : null,
      attachments: attachmentsData ? JSON.parse(attachmentsData) : null
    };
    
    console.log(`订单ID=${order.id}的详情数据已获取:`, 
      detailsData ? '基本信息✓' : '基本信息✗', 
      styleData ? '款式✓' : '款式✗',
      sizeData ? '尺寸体型✓' : '尺寸体型✗',
      otherData ? '其他项✓' : '其他项✗',
      attachmentsData ? '附件✓' : '附件✗'
    );
    
    return expandedOrder;
  } catch (error) {
    console.error(`获取订单ID=${order.id}的详情数据失败:`, error);
    // 返回原始订单数据，避免导出失败
    return order;
  }
}

// 导出所有系统数据为JSON文件
function exportAllData(isFullExport = false) {
    console.log(`开始导出所有系统数据，模式: ${isFullExport ? '完整' : '基础'}...`);
    
    try {
        // 获取订单数据
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        console.log(`准备导出 ${orders.length} 条订单数据`);
        
        // 根据导出模式处理订单数据
        let processedOrders = orders;
        if (isFullExport) {
          console.log('正在获取完整订单详情...');
          processedOrders = orders.map(order => expandOrderExportStructure(order));
          console.log('完整订单详情获取完成');
        }
        
        // 收集所有需要导出的数据
        const exportData = {
            orders: processedOrders,
            costs: JSON.parse(localStorage.getItem('costs') || '[]'), // 兼容旧版本
            productionCosts: JSON.parse(localStorage.getItem('productionCosts') || '[]'),
            operatingCosts: JSON.parse(localStorage.getItem('operatingCosts') || '[]'),
            adCosts: JSON.parse(localStorage.getItem('adCosts') || '[]'),
            salaries: JSON.parse(localStorage.getItem('salaries') || '[]'),
            orderSequence: localStorage.getItem('orderSequence') || '1',
            exportDate: new Date().toISOString(),
            exportType: isFullExport ? 'full' : 'basic',
            version: isFullExport ? '3.0' : '2.0',
            system: {
                name: '尚荣定制管理系统',
                exportTimestamp: new Date().toISOString(),
                stats: {
                    ordersCount: orders.length,
                    costsCount: JSON.parse(localStorage.getItem('costs') || '[]').length,
                    productionCostsCount: JSON.parse(localStorage.getItem('productionCosts') || '[]').length,
                    operatingCostsCount: JSON.parse(localStorage.getItem('operatingCosts') || '[]').length,
                    adCostsCount: JSON.parse(localStorage.getItem('adCosts') || '[]').length,
                    salariesCount: JSON.parse(localStorage.getItem('salaries') || '[]').length
                }
            }
        };
        
        // 创建JSON字符串
        console.log('正在创建JSON数据...');
        const jsonStr = JSON.stringify(exportData, null, 2);
        
        // 创建Blob对象
        const blob = new Blob([jsonStr], { type: 'application/json' });
        
        // 创建下载链接
        const url = URL.createObjectURL(blob);
        
        // 创建临时下载元素
        const a = document.createElement('a');
        a.href = url;
        
        // 使用当前日期和时间作为文件名
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        
        const exportType = isFullExport ? 'full' : 'basic';
        a.download = `shangrong_data_${exportType}_${year}${month}${day}_${hours}${minutes}.json`;
        
        // 触发下载
        document.body.appendChild(a);
        a.click();
        
        // 清理
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        
        console.log(`数据导出成功，模式: ${isFullExport ? '完整' : '基础'}`);
        return {
            success: true,
            message: isFullExport ? '完整订单数据导出成功！' : '基础数据导出成功！',
            fileName: a.download,
            exportType: isFullExport ? 'full' : 'basic'
        };
    } catch (error) {
        console.error('导出数据失败:', error);
        return {
            success: false,
            message: '导出数据失败: ' + error.message
        };
    }
}

// 从文件导入数据
function importDataFromFile(file) {
    return new Promise((resolve, reject) => {
        console.log('开始从文件导入数据...');
        
        try {
            // 检查文件类型
            if (!file || file.type !== 'application/json') {
                reject(new Error('请选择JSON格式的文件'));
                return;
            }
            
            // 创建文件读取器
            const reader = new FileReader();
            
            // 设置文件读取完成事件处理程序
            reader.onload = function(event) {
                try {
                    // 导入数据
                    const result = importData(event.target.result);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            };
            
            // 设置文件读取错误事件处理程序
            reader.onerror = function(error) {
                reject(new Error('读取文件失败: ' + error.message));
            };
            
            // 读取文件内容
            reader.readAsText(file);
        } catch (error) {
            reject(error);
        }
    });
}

// 导入数据
function importData(jsonData) {
    console.log('开始导入数据...');
    
    try {
        // 解析JSON数据
        let data;
        if (typeof jsonData === 'string') {
            data = JSON.parse(jsonData);
        } else {
            data = jsonData;
        }
        
        // 验证数据格式
        if (!data.orders || !Array.isArray(data.orders)) {
            throw new Error('导入的数据格式不正确，缺少订单数据');
        }
        
        // 检查是否为完整导出格式
        const isFullImport = data.exportType === 'full' || data.version === '3.0';
        console.log(`导入模式: ${isFullImport ? '完整' : '基础'}`);
        
        // 创建当前数据的备份
        backupData();
        console.log('在导入前已创建当前数据的备份');
        
        // 如果是完整导出格式，拆分订单详情数据
        if (isFullImport) {
            console.log('正在处理完整订单详情数据...');
            data.orders.forEach(order => {
                // 储存详情数据
                if (order.details) {
                    localStorage.setItem(`orderDetails_${order.id}`, JSON.stringify(order.details));
                    delete order.details;
                }
                if (order.style) {
                    localStorage.setItem(`orderStyle_${order.id}`, JSON.stringify(order.style));
                    delete order.style;
                }
                if (order.size) {
                    localStorage.setItem(`orderSize_${order.id}`, JSON.stringify(order.size));
                    delete order.size;
                }
                if (order.other) {
                    localStorage.setItem(`orderOther_${order.id}`, JSON.stringify(order.other));
                    delete order.other;
                }
                if (order.attachments) {
                    localStorage.setItem(`orderAttachments_${order.id}`, JSON.stringify(order.attachments));
                    delete order.attachments;
                }
            });
            console.log('完整订单详情数据处理完成');
        }
        
        // 导入订单数据
        localStorage.setItem('orders', JSON.stringify(data.orders));
        window.orders = data.orders;
        console.log(`已导入 ${data.orders.length} 条订单数据`);
        
        // 导入成本数据（兼容不同版本的数据结构）
        
        // 导入生产成本数据
        if (data.productionCosts && Array.isArray(data.productionCosts)) {
            localStorage.setItem('productionCosts', JSON.stringify(data.productionCosts));
            window.productionCosts = data.productionCosts;
            console.log(`已导入 ${data.productionCosts.length} 条生产成本数据`);
        } else {
            console.log('导入的数据中没有生产成本数据，使用空数组');
            localStorage.setItem('productionCosts', '[]');
            window.productionCosts = [];
        }
        
        // 导入运营成本数据
        if (data.operatingCosts && Array.isArray(data.operatingCosts)) {
            localStorage.setItem('operatingCosts', JSON.stringify(data.operatingCosts));
            window.operatingCosts = data.operatingCosts;
            console.log(`已导入 ${data.operatingCosts.length} 条运营成本数据`);
        } else if (data.costs && Array.isArray(data.costs)) {
            // 兼容旧版本
            localStorage.setItem('operatingCosts', JSON.stringify(data.costs));
            localStorage.setItem('costs', JSON.stringify(data.costs));
            window.operatingCosts = data.costs;
            window.costs = data.costs;
            console.log(`已导入 ${data.costs.length} 条运营成本数据（从旧版本字段）`);
        } else {
            console.log('导入的数据中没有运营成本数据，使用空数组');
            localStorage.setItem('operatingCosts', '[]');
            localStorage.setItem('costs', '[]');
            window.operatingCosts = [];
            window.costs = [];
        }
        
        // 导入广告成本数据
        if (data.adCosts && Array.isArray(data.adCosts)) {
            localStorage.setItem('adCosts', JSON.stringify(data.adCosts));
            window.adCosts = data.adCosts;
            console.log(`已导入 ${data.adCosts.length} 条广告成本数据`);
        } else {
            console.log('导入的数据中没有广告成本数据，使用空数组');
            localStorage.setItem('adCosts', '[]');
            window.adCosts = [];
        }
        
        // 导入工资数据
        if (data.salaries && Array.isArray(data.salaries)) {
            localStorage.setItem('salaries', JSON.stringify(data.salaries));
            window.salaries = data.salaries;
            console.log(`已导入 ${data.salaries.length} 条工资数据`);
        } else {
            console.log('导入的数据中没有工资数据，使用空数组');
            localStorage.setItem('salaries', '[]');
            window.salaries = [];
        }
        
        // 导入订单序列号
        if (data.orderSequence) {
            localStorage.setItem('orderSequence', data.orderSequence);
            window.orderSequence = parseInt(data.orderSequence);
            console.log(`已导入订单序列号: ${data.orderSequence}`);
        } else {
            // 如果没有提供序列号，则使用订单数量+1作为新的序列号
            const newSequence = data.orders.length + 1;
            localStorage.setItem('orderSequence', newSequence.toString());
            window.orderSequence = newSequence;
            console.log(`未找到订单序列号，根据订单数量设置为: ${newSequence}`);
        }
        
        // 执行数据检查和修复，确保导入的数据一致性
        const checkResult = performFullDataCheck();
        console.log('已对导入的数据执行检查和修复');
        
        console.log(`数据导入成功，模式: ${isFullImport ? '完整' : '基础'}`);
        return {
            success: true,
            message: isFullImport ? '完整订单数据导入成功！' : '基础数据导入成功！',
            checkResult: checkResult,
            importType: isFullImport ? 'full' : 'basic',
            stats: {
                orders: data.orders.length,
                productionCosts: data.productionCosts ? data.productionCosts.length : 0,
                operatingCosts: data.operatingCosts ? data.operatingCosts.length : (data.costs ? data.costs.length : 0),
                adCosts: data.adCosts ? data.adCosts.length : 0,
                salaries: data.salaries ? data.salaries.length : 0
            }
        };
    } catch (error) {
        console.error('导入数据失败:', error);
        return {
            success: false,
            message: '导入数据失败: ' + error.message
        };
    }
}

// 清空所有数据
function clearAllData() {
    console.log('开始清空所有数据...');
    
    try {
        // 先创建备份，以便用户后悔时可以恢复
        const backupResult = backupData();
        
        if (!backupResult.success) {
            console.warn('在清空数据前创建备份失败:', backupResult.message);
        } else {
            console.log('在清空数据前已创建备份:', backupResult.backupName);
        }
        
        // 清空所有数据数组
        window.orders = [];
        window.productionCosts = [];
        window.operatingCosts = [];
        window.adCosts = [];
        window.costs = [];
        window.salaries = [];
        
        // 保存空数组到localStorage
        localStorage.setItem('orders', '[]');
        localStorage.setItem('productionCosts', '[]');
        localStorage.setItem('operatingCosts', '[]');
        localStorage.setItem('adCosts', '[]');
        localStorage.setItem('costs', '[]');
        localStorage.setItem('salaries', '[]');
        
        // 设置订单序列号为1
        localStorage.setItem('orderSequence', '1');
        window.orderSequence = 1;
        
        // 设置数据已清空标志
        localStorage.setItem('dataCleared', 'true');
        
        console.log('所有数据已清空');
        
        return {
            success: true,
            message: '所有数据已清空！如需恢复，请使用备份功能。',
            backupName: backupResult.success ? backupResult.backupName : null
        };
    } catch (error) {
        console.error('清空数据失败:', error);
        return {
            success: false,
            message: '清空数据失败: ' + error.message
        };
    }
}

// 使用自调用函数确保所有函数正确挂载到window对象
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM已加载完成，开始挂载数据函数到window对象...');
    
    // 确保将所有函数挂载到window对象上，供外部调用
    window.generateMockOrderData = generateMockOrderData;
    window.generateProductionCostData = generateProductionCostData;
    window.generateOperatingCostData = generateOperatingCostData;
    window.generateAdCostData = generateAdCostData;
    window.generateSalaryData = generateSalaryData;
    window.loadDataFromStorage = loadDataFromStorage;
    window.formatDate = formatDate;
    window.loadOrdersFromStorage = loadOrdersFromStorage;
    window.loadProductionCostsFromStorage = loadProductionCostsFromStorage;
    window.backupData = backupData;
    window.getBackupList = getBackupList;
    window.restoreBackup = restoreBackup;
    window.autoBackup = autoBackup;
    window.deleteBackup = deleteBackup;
    window.checkAndFixProductionCosts = checkAndFixProductionCosts;
    window.generateUniqueId = generateUniqueId;
    window.checkAndFixOrderData = checkAndFixOrderData;
    window.checkAndFixCostData = checkAndFixCostData;
    window.checkAndFixCostArray = checkAndFixCostArray;
    window.performFullDataCheck = performFullDataCheck;
    window.exportAllData = exportAllData;
    window.importData = importData;
    window.importDataFromFile = importDataFromFile;
    window.clearAllData = clearAllData;
    
    // 添加调试日志，验证关键函数是否挂载成功
    console.log('数据管理模块全部函数已挂载到window对象，可供外部调用');
    console.log('关键函数挂载验证:');
    console.log('- window.exportAllData:', typeof window.exportAllData === 'function' ? '已挂载' : '未挂载');
    console.log('- window.clearAllData:', typeof window.clearAllData === 'function' ? '已挂载' : '未挂载');
    console.log('- window.generateMockOrderData:', typeof window.generateMockOrderData === 'function' ? '已挂载' : '未挂载');
    console.log('- window.importDataFromFile:', typeof window.importDataFromFile === 'function' ? '已挂载' : '未挂载');
    console.log('- window.generateSalaryData:', typeof window.generateSalaryData === 'function' ? '已挂载' : '未挂载');
    
    // 触发自定义事件通知UI组件
    console.log('触发dataJsLoaded事件');
    document.dispatchEvent(new Event('dataJsLoaded'));
    
    // 加载数据和执行自动备份
    loadDataFromStorage();
    autoBackup();
  });
  
  // 如果DOM已经加载完成，立即触发函数挂载
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('DOM已经加载完成，立即挂载函数');
    
    // 确保将所有函数挂载到window对象上，供外部调用
    window.generateMockOrderData = generateMockOrderData;
    window.generateProductionCostData = generateProductionCostData;
    window.generateOperatingCostData = generateOperatingCostData;
    window.generateAdCostData = generateAdCostData;
    window.generateSalaryData = generateSalaryData;
    window.loadDataFromStorage = loadDataFromStorage;
    window.formatDate = formatDate;
    window.loadOrdersFromStorage = loadOrdersFromStorage;
    window.loadProductionCostsFromStorage = loadProductionCostsFromStorage;
    window.backupData = backupData;
    window.getBackupList = getBackupList;
    window.restoreBackup = restoreBackup;
    window.autoBackup = autoBackup;
    window.deleteBackup = deleteBackup;
    window.checkAndFixProductionCosts = checkAndFixProductionCosts;
    window.generateUniqueId = generateUniqueId;
    window.checkAndFixOrderData = checkAndFixOrderData;
    window.checkAndFixCostData = checkAndFixCostData;
    window.checkAndFixCostArray = checkAndFixCostArray;
    window.performFullDataCheck = performFullDataCheck;
    window.exportAllData = exportAllData;
    window.importData = importData;
    window.importDataFromFile = importDataFromFile;
    window.clearAllData = clearAllData;
    
    console.log('数据管理模块全部函数已立即挂载到window对象，可供外部调用');
    
    // 延迟触发自定义事件，确保页面其他部分已准备好
    setTimeout(() => {
      console.log('触发延迟dataJsLoaded事件');
      document.dispatchEvent(new Event('dataJsLoaded'));
      
      // 加载数据和执行自动备份
      loadDataFromStorage();
      autoBackup();
    }, 100);
  }
})(); 