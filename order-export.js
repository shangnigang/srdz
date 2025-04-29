/**
 * 订单导出功能模块
 * 实现将订单导出为Excel的相关功能
 */

// 引入XLSX库，确保页面中已加载此库
// 如果页面中没有加载，请确保在HTML中添加 <script src="https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js"></script>

// 导出订单完整内容到Excel
function exportOrderToExcel() {
    try {
        console.log('开始导出订单到Excel...');
        
        // 获取选中的订单
        const checkboxes = document.querySelectorAll('#orderTableBody input[type="checkbox"]:checked');
        
        if (checkboxes.length === 0) {
            alert('请至少选择一个订单进行导出');
            return;
        }
        
        // 批量导出所有选中的订单
        checkboxes.forEach(checkbox => {
            const row = checkbox.closest('tr');
            const orderJson = row.getAttribute('data-order');
            if (orderJson) {
                try {
                    const order = JSON.parse(orderJson);
                    exportSingleOrderToExcel(order);
                } catch (parseError) {
                    console.error('解析订单数据失败:', parseError);
                }
            }
        });
        
    } catch (error) {
        console.error('导出订单出错:', error);
        alert('导出订单失败: ' + error.message);
    }
}

// 导出单个订单到Excel
function exportSingleOrderToExcel(order) {
    try {
        if (!window.XLSX) {
            alert('未找到XLSX库，请确保已正确加载');
            return;
        }
        
        const orderType = order.orderType || '西服西裤';
        
        // 创建有序数据数组，按照基本信息、款式、尺寸体型、其他项的顺序排列
        const orderedData = [];
        
        // ============ 1. 基本信息 ============
        let currentCategory = '【基本信息】';
        let currentSubcategory = '';
        
        // 添加基本信息字段
        orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '成交日期', '值': order.dealDate || '' });
        orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '客户姓名', '值': order.customerName || '' });
        orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '性别', '值': order.gender || '' });
        orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '身高', '值': order.height || '' });
        orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '体重', '值': order.weight || '' });
        orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '出生日期', '值': order.birthDate || '' });
        orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '使用场景', '值': order.usageScenario || '' });
        orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '客户职业', '值': order.customerOccupation || '' });
        orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '客户来源', '值': order.customerSource || '' });
        orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '面料品牌', '值': order.fabricBrand || '' });
        orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '面料编号', '值': order.fabricCode || '' });
        orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '颜色', '值': order.color || '' });
        orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '用料(米)', '值': order.fabricAmount || '' });
        orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '尺码', '值': order.size || '' });
        orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '配置', '值': order.configuration || '' });
        orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '厂家', '值': order.manufacturer || '' });
        orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '半成品日期', '值': order.semifinishedDate || '' });
        orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '下料日期', '值': order.cuttingDate || '' });
        orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '下单日期', '值': order.orderDate || '' });
        orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '交货日期', '值': order.deliveryDate || '' });
        orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '总价格(元)', '值': order.totalPrice || '' });
        orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '预付款(元)', '值': order.prepaidAmount || '' });
        
        // ============ 2. 款式信息 ============
        currentCategory = '【款式信息】';
        currentSubcategory = '';
        orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '订单类型', '值': orderType });
        
        // 2.1 西服款式（如适用）
        if (orderType.includes('西服') || orderType === '单西') {
            currentSubcategory = '西服款式';
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '版型', '值': order.suitFit || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '领型', '值': order.suitLapelStyle || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '前片止口', '值': order.suitButtonCount || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '背后开衩', '值': order.suitVent || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '袖口开衩', '值': order.suitSleeveButtons || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '袖口眼颜色', '值': order.suitSleeveButtonholes || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '珠边颜色', '值': order.suitPearlEdgeColor || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '下摆', '值': order.suitHemStyle || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '笔袋', '值': order.suitPenPocket || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '驳头眼', '值': order.suitLapelHole || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '驳头眼颜色', '值': order.suitLapelHoleColor || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '驳头宽度', '值': order.suitLapelWidth || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '纽扣编号', '值': order.suitButtonNumber || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '领底绒', '值': order.suitCollarFelt || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '里布编号', '值': order.suitLiningNumber || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '刺绣内容', '值': order.suitEmbroideryContent || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '刺绣字体', '值': order.suitEmbroideryFont || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '刺绣图案', '值': order.suitEmbroideryPattern || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '刺绣颜色', '值': order.suitEmbroideryColor || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '胸兜', '值': order.suitChestPocket || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '腰兜', '值': order.suitPocket || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '票袋', '值': order.suitTicketPocket || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '备注', '值': order.suitRemark || '' });
        }
        
        // 2.2 西裤款式（如适用）
        if (orderType.includes('西裤') || orderType === '单裤') {
            currentSubcategory = '西裤款式';
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '版型', '值': order.pantsFit || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '裤腰', '值': order.pantsWaist || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '裤褶', '值': order.pantsPleats || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '裤侧袋', '值':order.pantsSidePocket || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '后袋', '值': order.pantsBackPocket || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '裤脚口', '值': order.pantsHem || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '内里', '值': order.pantsLining || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '款式', '值': order.pantsStyle || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '刺绣内容', '值': order.pantsEmbroideryContent || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '刺绣字体', '值': order.pantsEmbroideryFont || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '刺绣颜色', '值': order.pantsEmbroideryColor || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '备注', '值': order.pantsRemark || '' });
        }
        
        // 2.3 马甲款式（如适用）
        if (orderType.includes('马甲')) {
            currentSubcategory = '马甲款式';
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '版型', '值': order.vestFit || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '领型', '值': order.vestCollar || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '门襟', '值': order.vestFront || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '胸口袋', '值': order.vestChestPocket || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '下口袋', '值': order.vestPocket || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '下摆型', '值':order.vestHem || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '里布', '值': order.vestLining || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '后背', '值': order.vestBack || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '备注', '值': order.vestRemark || '' });
        }
        
        // 2.4 衬衣款式（如适用）
        if (orderType.includes('衬衣')) {
            currentSubcategory = '衬衣款式';
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '款式选择', '值': order.shirtStyle || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '版型', '值': order.shirtFit || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '领型', '值': order.shirtCollar || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '领底高', '值': order.shirtCollarHeight || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '插片', '值': order.shirtPlacket || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '门襟', '值': order.shirtFront || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '口袋', '值': order.shirtPocket || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '袖口', '值': order.shirtCuff || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '袖褶', '值': order.shirtSleevePleat || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '后片', '值': order.shirtBack || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '下摆', '值': order.shirtHem || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '门襟锁眼', '值': order.shirtButtonhole || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '侧缝底摆贴布', '值': order.shirtHemTape || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '全身纽扣', '值': order.shirtButtons || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '钉扣方式', '值': order.shirtButtonStitch || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '刺绣位置', '值': order.shirtEmbroideryPosition || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '刺绣线色', '值': order.shirtEmbroideryColor || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '刺绣字体', '值': order.shirtEmbroideryFont || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '刺绣内容', '值': order.shirtEmbroideryContent || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '刺绣高度', '值': order.shirtEmbroideryHeight || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '刺绣图案', '值': order.shirtEmbroideryPattern || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '备注', '值': order.shirtRemark || '' });
        }
        
        // 2.5 大衣款式（如适用）
        if (orderType.includes('大衣')) {
            currentSubcategory = '大衣款式';
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '版型', '值': order.coatFit || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '领型', '值': order.coatCollar || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '前片止口', '值': order.coatFrontHem || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '背后开衩', '值': order.coatBackVent || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '胸兜', '值': order.coatChestPocket || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '腰兜', '值': order.coatWaistPocket || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '袖口开衩', '值': order.coatSleeveVent || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '袖口眼颜色', '值': order.coatSleeveButtonColor || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '驳头眼', '值': order.coatLapelHole || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '驳头眼颜色', '值': order.coatLapelHoleColor || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '驳头宽度', '值': order.coatLapelWidth || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '纽扣编号', '值': order.coatButtonNumber || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '里布编号', '值': order.coatLiningNumber || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '刺绣内容', '值': order.coatEmbroideryContent || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '刺绣字体', '值': order.coatEmbroideryFont || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '刺绣图案', '值': order.coatEmbroideryPattern || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '刺绣颜色', '值': order.coatEmbroideryColor || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '备注', '值': order.coatRemark || '' });
        }
        
        // ============ 3. 尺寸体型 ============
        currentCategory = '【尺寸体型】';
        currentSubcategory = '';
        
        // 3.1 上衣/衬衣/马甲/大衣尺寸
        if (orderType.includes('西服') || orderType === '单西' || orderType.includes('衬衣') || orderType.includes('马甲') || orderType.includes('大衣')) {
            // 净尺寸
            currentSubcategory = '上衣净尺寸';
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '领口', '值': order.jacketNetCollar || ''  });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '胸围', '值': order.jacketNetChest || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '中腰', '值': order.jacketNetWaist || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '胸高', '值': order.jacketNetChestHeight || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '肚围', '值': order.jacketNetBelly || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '肩宽', '值': order.jacketNetShoulder || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '袖长', '值': order.jacketNetSleeveLength || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '袖肥', '值': order.jacketNetSleeveWidth || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '袖口', '值': order.jacketNetCuff || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '前衣长', '值': order.jacketNetFrontLength || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '后衣长', '值': order.jacketNetBackLength || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '下摆', '值': order.jacketNetHem || '' });
            
            // 成衣尺寸
            currentSubcategory = '上衣成衣尺寸';
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '领口', '值': order.jacketFinishedCollar || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '胸围', '值': order.jacketFinishedChest || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '中腰', '值': order.jacketFinishedWaist || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '胸高', '值': order.jacketFinishedChestHeight || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '肚围', '值': order.jacketFinishedBelly || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '肩宽', '值': order.jacketFinishedShoulder || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '袖长', '值': order.jacketFinishedSleeveLength || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '袖肥', '值': order.jacketFinishedSleeveWidth || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '袖口', '值': order.jacketFinishedCuff || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '前衣长', '值': order.jacketFinishedFrontLength || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '后衣长', '值': order.jacketFinishedBackLength || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '下摆', '值': order.jacketFinishedHem || '' });
        }
        
        // 3.2 西裤尺寸
        if (orderType.includes('西裤') || orderType === '单裤') {
            // 净尺寸
            currentSubcategory = '裤子净尺寸';
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '裤腰', '值': order.pantsNetWaist || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '臀围', '值': order.pantsNetHip || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '横裆', '值': order.pantsNetCrotch || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '膝围', '值': order.pantsNetKnee || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '小腿围', '值': order.pantsNetCalf || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '脚口', '值': order.pantsNetHem || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '裤长', '值': order.pantsNetLength || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '裙长', '值': order.pantsNetOutLength || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '总裆', '值': order.pantsNetTotalCrotch || '' });
            
            // 成衣尺寸
            currentSubcategory = '裤子成衣尺寸';
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '裤腰', '值': order.pantsFinishedWaist || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '臀围', '值': order.pantsFinishedHip || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '横裆', '值': order.pantsFinishedCrotch || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '膝围', '值': order.pantsFinishedKnee || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '小腿围', '值': order.pantsFinishedCalf || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '脚口', '值': order.pantsFinishedHem || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '裤长', '值': order.pantsFinishedLength || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '裙长', '值': order.pantsFinishedOutLength || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '总裆', '值': order.pantsFinishedTotalCrotch || '' });
        }
        // 3.3 马甲尺寸
        if (orderType.includes('马甲') || orderType === '马甲') {
            // 净尺寸 
            currentSubcategory = '马甲净尺寸';
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '领口', '值': order.vestNetCollar || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '胸围', '值': order.vestNetChest || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '中腰', '值': order.vestNetWaist || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '肩宽', '值': order.vestNetShoulder || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '前衣长', '值': order.vestNetFrontLength || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '后衣长', '值': order.vestNetBackLength || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '下摆', '值': order.vestNetHem || '' });
            
            // 成衣尺寸
            currentSubcategory = '马甲成衣尺寸';
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '领口', '值': order.vestFinishedCollar || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '胸围', '值': order.vestFinishedChest || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '中腰', '值': order.vestFinishedWaist || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '肩宽', '值': order.vestFinishedShoulder || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '前衣长', '值': order.vestFinishedFrontLength || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '后衣长', '值': order.vestFinishedBackLength || '' });
            orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '下摆', '值': order.vestFinishedHem || '' });
        }            
        
        // 3.4 体型特征
        currentSubcategory = '体型特征';
        orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '腹部', '值': order.bodyBelly || '' });
        orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '凹腰挺肚', '值': order.bodyConcaveBelly || '' });
        orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '胸型', '值': order.bodyChest || '' });
        orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '背型', '值': order.bodyBack || '' });
        orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '溜肩型', '值': order.bodyShoulder || '' });
        orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '高低肩', '值': order.bodyHighLowShoulder || '' });
        orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '冲肩型', '值': order.bodyShoulderProtrude || '' });
        orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '后仰', '值': order.bodyLeanBack || '' });
        orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '手袖位移', '值': order.bodySleeve || '' });
        orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '备注', '值': order.bodyNote || '' });
        
        // ============ 4. 其他项 ============
        currentCategory = '【其他项】';
        currentSubcategory = '';
        orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '设计师', '值': order.designer || '' });
        orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '量体师', '值': order.measurer || '' });
        orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '面料库存', '值': order.fabricCheck || '' });
        orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '客户写评价', '值': order.reminderForComment || '' });
        orderedData.push({ '分类': currentCategory, '子分类': currentSubcategory, '字段': '备注', '值': order.otherNotes || '' });
        
        // 创建工作簿和工作表
        const wb = XLSX.utils.book_new();
        
        // 使用json_to_sheet时指定想要的列顺序
        const ws = XLSX.utils.json_to_sheet(orderedData, {
            header: ['分类', '子分类', '字段', '值']
        });
        
        // 设置列宽
        ws['!cols'] = [
            { wch: 15 },  // 分类列宽度
            { wch: 15 },  // 子分类列宽度
            { wch: 15 },  // 字段列宽度
            { wch: 30 }   // 值列宽度
        ];
        
        // 处理单元格合并 - 相邻相同的分类和子分类合并
        // 初始化合并单元格数组
        if (!ws['!merges']) ws['!merges'] = [];
        
        // 获取总行数
        const range = XLSX.utils.decode_range(ws['!ref']);
        const rowCount = range.e.r + 1;
        
        // 为工作表添加默认样式
        if (!ws['!styles']) ws['!styles'] = {};
        
        // 设置所有单元格的默认边框和对齐方式
        for (let r = 0; r <= range.e.r; r++) {
            for (let c = 0; c <= range.e.c; c++) {
                const cellRef = XLSX.utils.encode_cell({r: r, c: c});
                if (!ws[cellRef]) continue;
                
                // 创建单元格样式对象（如果不存在）
                if (!ws[cellRef].s) ws[cellRef].s = {};
                
                // 设置边框样式
                ws[cellRef].s.border = {
                    top: { style: 'thin' },
                    bottom: { style: 'thin' },
                    left: { style: 'thin' },
                    right: { style: 'thin' }
                };
                
                // 设置对齐方式
                let alignment = {
                    vertical: 'center',
                    wrapText: true
                };
                
                // 根据列设置水平对齐方式
                if (c < 2) { // 分类和子分类列
                    alignment.horizontal = 'center';
                } else if (c == 2) { // 字段列
                    alignment.horizontal = 'center';
                } else { // 值列
                    alignment.horizontal = 'left';
                }
                
                ws[cellRef].s.alignment = alignment;
                
                // 标题行加粗
                if (r === 0) {
                    ws[cellRef].s.font = { bold: true };
                }
            }
        }
        
        // 按字段内容识别分类和子分类的合并区间
        // 收集所有具有相同分类和子分类的行范围
        const categoryRanges = {};
        const subcategoryRanges = {};
        
        // 第一遍扫描：按分类名称分组
        for (let i = 0; i < orderedData.length; i++) {
            const category = orderedData[i]['分类'];
            if (!categoryRanges[category]) {
                categoryRanges[category] = { start: i + 1, end: i + 1, rows: [] }; // +1因为跳过标题行
            }
            categoryRanges[category].end = i + 2; // +2因为end应指向下一行
            categoryRanges[category].rows.push(i + 1);
        }
        
        // 第二遍扫描：按子分类名称分组（考虑父分类）
        for (let i = 0; i < orderedData.length; i++) {
            const category = orderedData[i]['分类'];
            const subcategory = orderedData[i]['子分类'];
            
            // 使用组合键区分不同父分类下的相同子分类名
            // 对于空子分类，使用特殊标记 "[空]" + 分类名，确保不同分类下的空子分类不会混淆
            const key = subcategory ? `${category}-${subcategory}` : `${category}-[空]`;
            
            if (!subcategoryRanges[key]) {
                subcategoryRanges[key] = { start: i + 1, end: i + 1, rows: [] };
            }
            subcategoryRanges[key].end = i + 2; // +2因为end应指向下一行
            subcategoryRanges[key].rows.push(i + 1);
        }
        
        // 执行分类的合并
        for (const category in categoryRanges) {
            const { start, end } = categoryRanges[category];
            if (end - start > 1) {
                // 添加合并单元格
                ws['!merges'].push({
                    s: { r: start, c: 0 },
                    e: { r: end - 1, c: 0 }
                });
                
                // 确保合并单元格中的内容正确
                const cellRef = XLSX.utils.encode_cell({r: start, c: 0});
                ws[cellRef].v = category;
                
                // 确保样式设置为垂直和水平居中对齐
                if (!ws[cellRef].s) ws[cellRef].s = {};
                ws[cellRef].s.alignment = {
                    vertical: 'center', 
                    horizontal: 'center',
                    wrapText: true
                };
            }
        }
        
        // 执行子分类的合并
        for (const key in subcategoryRanges) {
            const { start, end } = subcategoryRanges[key];
            // 检查键名格式，如果是 "分类-[空]" 格式，说明是空子分类
            const isEmptySubcategory = key.endsWith('-[空]');
            // 获取子分类值，对于空子分类使用空字符串
            const subcategory = isEmptySubcategory ? '' : key.split('-')[1];
            
            if (end - start > 1) {
                // 添加合并单元格
                ws['!merges'].push({
                    s: { r: start, c: 1 },
                    e: { r: end - 1, c: 1 }
                });
                
                // 确保合并单元格中的内容正确
                const cellRef = XLSX.utils.encode_cell({r: start, c: 1});
                ws[cellRef].v = subcategory;
                
                // 确保样式设置为垂直和水平居中对齐
                if (!ws[cellRef].s) ws[cellRef].s = {};
                ws[cellRef].s.alignment = {
                    vertical: 'center', 
                    horizontal: 'center',
                    wrapText: true
                };
            }
        }
        
        // 设置表格样式
        // XLSX.js直接支持的样式有限，如果想要更复杂的样式，可能需要后期处理Excel文件
        ws['!outline'] = {}; // 添加大纲级别
        
        // 将工作表添加到工作簿
        XLSX.utils.book_append_sheet(wb, ws, '订单完整内容');
        
        // 文件名格式：成交日期+客户姓名+订单类型+尚荣定制
        let fileName = '';
        if (order.dealDate) {
            fileName += order.dealDate.replace(/-/g, '') + '-';
        }
        fileName += (order.customerName || '未知客户') + '-';
        fileName += (order.orderType || '订单') + '-尚荣定制.xlsx';
        
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
        a.download = fileName;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        
        // 清理
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
        
        console.log(`导出订单 ${order.id || ''} 完成`);
    } catch (error) {
        console.error('导出订单出错:', error);
        alert(`导出订单失败: ${error.message}`);
    }
}

// 导出模块
window.orderExport = {
    exportOrderToExcel
};
