/**
 * 工资录入模块 JavaScript
 * 包含工资信息管理、计算、统计等功能
 */

// 全局变量
let salaries = []; // 所有工资数据
let filteredSalaries = []; // 筛选后的工资数据
let currentSalaryPage = 1; // 当前工资数据页码
let salaryModal; // 工资表单模态框
let editingSalaryId = null; // 当前编辑中的工资记录ID

// 图表实例
let salaryTrendChart = null;
let salaryCompositionChart = null;
let employeeSalaryChart = null;

// 常量定义
const DEFAULT_BASIC_SALARY = 3000; // 默认基本工资
const DEFAULT_PERFORMANCE_SALARY = 1000; // 默认绩效工资
const DEFAULT_POSITION_SALARY = 1000; // 默认岗位工资
const LEAVE_DEDUCTION_PER_DAY = 100; // 每天请假扣款
const LATE_DEDUCTION_PER_TIME = 30; // 每次迟到扣款
const SALES_BONUS_THRESHOLD_1 = 50000; // 销售额奖金阈值1
const SALES_BONUS_1 = 500; // 销售额奖金1
const SALES_BONUS_THRESHOLD_2 = 100000; // 销售额奖金阈值2
const SALES_BONUS_2 = 1000; // 销售额奖金2
const SALARY_PAGE_SIZE = 10; // 每页显示的工资记录数

// DOM加载完成后执行初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('工资录入模块初始化...');
    
    // 初始化模态框
    salaryModal = new bootstrap.Modal(document.getElementById('salaryModal'));
    
    // 加载工资数据
    loadSalaryData();
    
    // 初始化表单事件监听
    initFormListeners();
    
    // 初始化模块导航
    initModuleNavigation();
    
    // 初始化年份选项
    populateYearOptions();
    
    // 初始化工资表格
    renderSalaryTable();
    
    // 初始化筛选功能
    initFilterFunctions();
    
    // 初始化按钮事件
    initButtonEvents();
    
    // 初始化统计图表
    initStatisticsCharts();
    
    console.log('工资录入模块初始化完成');
});

/**
 * 初始化模块导航
 */
function initModuleNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            // 移除所有激活状态
            navLinks.forEach(item => item.classList.remove('active'));
            // 添加当前点击的链接激活状态
            this.classList.add('active');
            
            // 切换模块显示
            const moduleId = this.getAttribute('data-module');
            document.querySelectorAll('.module-content').forEach(content => {
                content.style.display = content.id === moduleId ? 'block' : 'none';
            });
            
            // 如果切换到统计模块，刷新图表
            if (moduleId === 'salaryStatistics') {
                refreshStatisticsCharts();
            }
        });
    });
}

/**
 * 初始化年份选项
 */
function populateYearOptions() {
    const currentYear = new Date().getFullYear();
    const yearSelects = document.querySelectorAll('#salaryYear, #salaryYearFilter, #salaryStatsYear');
    
    // 添加从当前年份开始往前5年的选项
    for (let i = 0; i < 5; i++) {
        const year = currentYear - i;
        yearSelects.forEach(select => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year + '年';
            select.appendChild(option);
        });
    }
}

/**
 * 加载工资数据
 */
function loadSalaryData() {
    try {
        // 从localStorage中获取工资数据
        const savedSalaries = localStorage.getItem('salaries');
        if (savedSalaries) {
            salaries = JSON.parse(savedSalaries);
            console.log(`成功加载${salaries.length}条工资记录`);
        } else {
            salaries = [];
            console.log('没有找到工资数据，初始化为空数组');
        }
    } catch (error) {
        console.error('加载工资数据时出错:', error);
        salaries = [];
    }
}

/**
 * 保存工资数据到localStorage
 */
function saveSalaryData() {
    try {
        localStorage.setItem('salaries', JSON.stringify(salaries));
        console.log(`已保存${salaries.length}条工资记录到本地存储`);
        
        // 同步到成本管理模块
        syncSalaryToCostModule();
    } catch (error) {
        console.error('保存工资数据时出错:', error);
        alert('保存工资数据失败: ' + error.message);
    }
}

/**
 * 计算基础工资合计
 * @param {number} basicSalary - 基本工资
 * @param {number} performanceSalary - 绩效工资
 * @param {number} positionSalary - 岗位工资
 * @returns {number} 基础工资合计
 */
function calculateBaseSalaryTotal(basicSalary, performanceSalary, positionSalary) {
    return parseFloat(basicSalary) + parseFloat(performanceSalary) + parseFloat(positionSalary);
}

/**
 * 计算加班费
 * @param {number} hours - 加班小时数
 * @param {number} baseSalaryTotal - 基础工资合计
 * @returns {number} 加班费
 */
function calculateOvertimePay(hours, baseSalaryTotal) {
    return parseFloat(hours) * parseFloat(baseSalaryTotal) / 30 / 8;
}

/**
 * 计算缺勤扣发
 * @param {number} days - 请假天数
 * @returns {number} 缺勤扣发金额
 */
function calculateLeaveDeduction(days) {
    return parseFloat(days) * LEAVE_DEDUCTION_PER_DAY;
}

/**
 * 计算迟到扣发
 * @param {number} count - 迟到次数
 * @returns {number} 迟到扣发金额
 */
function calculateLateDeduction(count) {
    return parseFloat(count) * LATE_DEDUCTION_PER_TIME;
}

/**
 * 计算标准工资合计
 * @param {number} reimbursementAmount - 报销金额
 * @param {number} overtimePay - 加班费
 * @param {number} leaveDeduction - 缺勤扣发
 * @param {number} lateDeduction - 迟到扣发
 * @returns {number} 标准工资合计
 */
function calculateStandardSalaryTotal(reimbursementAmount, overtimePay, leaveDeduction, lateDeduction) {
    return parseFloat(reimbursementAmount) + parseFloat(overtimePay) - parseFloat(leaveDeduction) - parseFloat(lateDeduction);
}

/**
 * 计算奖金
 * @param {number} year - 年份
 * @param {number} month - 月份
 * @returns {number} 奖金金额
 */
function calculateBonus(year, month) {
    // 从订单统计模块获取销售数据
    const salesAmount = getMonthSalesAmount(year, month);
    
    if (salesAmount >= SALES_BONUS_THRESHOLD_2) {
        return SALES_BONUS_2;
    } else if (salesAmount >= SALES_BONUS_THRESHOLD_1) {
        return SALES_BONUS_1;
    }
    return 0;
}

/**
 * 从订单统计模块获取指定年月的销售总额
 * @param {number} year - 年份
 * @param {number} month - 月份
 * @returns {number} 销售总额
 */
function getMonthSalesAmount(year, month) {
    try {
        // 从localStorage获取订单数据
        const savedOrders = localStorage.getItem('orders');
        if (!savedOrders) {
            console.log('未找到订单数据');
            return 0;
        }
        
        const orders = JSON.parse(savedOrders);
        
        // 筛选指定年月的订单
        const filteredOrders = orders.filter(order => {
            // 解析订单日期，格式为YYYY-MM-DD
            if (!order.orderDate) return false;
            
            const dateParts = order.orderDate.split('-');
            if (dateParts.length !== 3) return false;
            
            const orderYear = parseInt(dateParts[0]);
            const orderMonth = parseInt(dateParts[1]);
            
            return orderYear === year && orderMonth === month;
        });
        
        // 计算订单总金额
        const totalAmount = filteredOrders.reduce((sum, order) => {
            return sum + (parseFloat(order.totalAmount) || 0);
        }, 0);
        
        console.log(`${year}年${month}月销售总额: ${totalAmount}元`);
        return totalAmount;
    } catch (error) {
        console.error('获取月销售额时出错:', error);
        return 0;
    }
}

/**
 * 计算提成合计
 * @param {number} highEndCommission - 高定提成
 * @param {number} groupCommission - 团单提成
 * @param {number} bonus - 奖金
 * @returns {number} 提成合计
 */
function calculateCommissionTotal(highEndCommission, groupCommission, bonus) {
    return parseFloat(highEndCommission) + parseFloat(groupCommission) + parseFloat(bonus);
}

/**
 * 计算应发工资
 * @param {number} baseSalaryTotal - 基础工资合计
 * @param {number} standardSalaryTotal - 标准工资合计
 * @param {number} commissionTotal - 提成合计
 * @returns {number} 应发工资
 */
function calculateTotalSalary(baseSalaryTotal, standardSalaryTotal, commissionTotal) {
    return parseFloat(baseSalaryTotal) + parseFloat(standardSalaryTotal) + parseFloat(commissionTotal);
}

/**
 * 格式化金额，保留1位小数
 * @param {number} amount - 金额
 * @returns {string} 格式化后的金额字符串
 */
function formatMoney(amount) {
    return parseFloat(amount).toFixed(1);
}

/**
 * 渲染工资表格
 * @param {number} page - 页码
 * @param {boolean} applyFilter - 是否应用筛选
 */
function renderSalaryTable(page = 1, applyFilter = false) {
    const tableBody = document.getElementById('salaryTableBody');
    if (!tableBody) {
        console.error('找不到工资表格容器');
        return;
    }
    
    // 清空表格
    tableBody.innerHTML = '';
    
    try {
        // 准备数据
        let displayData = applyFilter ? filteredSalaries : [...salaries];
        
        // 按年份和月份降序排序（从新到旧）
        displayData.sort((a, b) => {
            if (a.year !== b.year) {
                return b.year - a.year;
            }
            return b.month - a.month;
        });
        
        // 分页处理
        currentSalaryPage = page;
        const totalPages = Math.ceil(displayData.length / SALARY_PAGE_SIZE);
        const startIndex = (page - 1) * SALARY_PAGE_SIZE;
        const endIndex = Math.min(startIndex + SALARY_PAGE_SIZE, displayData.length);
        const currentPageData = displayData.slice(startIndex, endIndex);
        
        // 显示筛选结果计数
        if (applyFilter) {
            const resultCount = document.getElementById('salaryFilterResultCount');
            if (resultCount) {
                resultCount.textContent = `找到 ${displayData.length} 条记录`;
                resultCount.style.display = 'inline-block';
            }
        } else {
            const resultCount = document.getElementById('salaryFilterResultCount');
            if (resultCount) {
                resultCount.style.display = 'none';
            }
        }
        
        // 如果没有数据，显示提示
        if (currentPageData.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="22" class="text-center">暂无工资数据</td>`;
            tableBody.appendChild(emptyRow);
            
            // 渲染分页
            renderSalaryPagination(page, totalPages);
            return;
        }
        
        // 添加数据行
        currentPageData.forEach(salary => {
            const row = document.createElement('tr');
            
            // 添加复选框列
            const checkboxCell = document.createElement('td');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = salary.id;
            checkbox.classList.add('salary-checkbox');
            checkboxCell.appendChild(checkbox);
            row.appendChild(checkboxCell);
            
            // 添加年份列
            const yearCell = document.createElement('td');
            yearCell.textContent = salary.year;
            row.appendChild(yearCell);
            
            // 添加月份列
            const monthCell = document.createElement('td');
            monthCell.textContent = salary.month + '月';
            row.appendChild(monthCell);
            
            // 添加员工姓名列
            const nameCell = document.createElement('td');
            nameCell.textContent = salary.employeeName;
            row.appendChild(nameCell);
            
            // 添加基本工资列
            const basicSalaryCell = document.createElement('td');
            basicSalaryCell.textContent = formatMoney(salary.basicSalary) + '元';
            row.appendChild(basicSalaryCell);
            
            // 添加绩效工资列
            const performanceSalaryCell = document.createElement('td');
            performanceSalaryCell.textContent = formatMoney(salary.performanceSalary) + '元';
            row.appendChild(performanceSalaryCell);
            
            // 添加岗位工资列
            const positionSalaryCell = document.createElement('td');
            positionSalaryCell.textContent = formatMoney(salary.positionSalary) + '元';
            row.appendChild(positionSalaryCell);
            
            // 添加基础工资合计列
            const baseSalaryTotalCell = document.createElement('td');
            baseSalaryTotalCell.textContent = formatMoney(salary.baseSalaryTotal) + '元';
            baseSalaryTotalCell.classList.add('font-weight-bold');
            row.appendChild(baseSalaryTotalCell);
            
            // 添加报销金额列
            const reimbursementAmountCell = document.createElement('td');
            reimbursementAmountCell.textContent = formatMoney(salary.reimbursementAmount) + '元';
            row.appendChild(reimbursementAmountCell);
            
            // 添加加班小时列
            const overtimeHoursCell = document.createElement('td');
            overtimeHoursCell.textContent = formatMoney(salary.overtimeHours) + '小时';
            row.appendChild(overtimeHoursCell);
            
            // 添加加班费列
            const overtimePayCell = document.createElement('td');
            overtimePayCell.textContent = formatMoney(salary.overtimePay) + '元';
            overtimePayCell.classList.add('auto-calculated');
            row.appendChild(overtimePayCell);
            
            // 添加请假天数列
            const leaveDaysCell = document.createElement('td');
            leaveDaysCell.textContent = salary.leaveDays + '天';
            row.appendChild(leaveDaysCell);
            
            // 添加缺勤扣发列
            const leaveDeductionCell = document.createElement('td');
            leaveDeductionCell.textContent = formatMoney(salary.leaveDeduction) + '元';
            leaveDeductionCell.classList.add('auto-calculated');
            row.appendChild(leaveDeductionCell);
            
            // 添加迟到次数列
            const lateCountCell = document.createElement('td');
            lateCountCell.textContent = salary.lateCount + '次';
            row.appendChild(lateCountCell);
            
            // 添加迟到扣发列
            const lateDeductionCell = document.createElement('td');
            lateDeductionCell.textContent = formatMoney(salary.lateDeduction) + '元';
            lateDeductionCell.classList.add('auto-calculated');
            row.appendChild(lateDeductionCell);
            
            // 添加标准工资合计列
            const standardSalaryTotalCell = document.createElement('td');
            standardSalaryTotalCell.textContent = formatMoney(salary.standardSalaryTotal) + '元';
            standardSalaryTotalCell.classList.add('font-weight-bold');
            row.appendChild(standardSalaryTotalCell);
            
            // 添加高定提成列
            const highEndCommissionCell = document.createElement('td');
            highEndCommissionCell.textContent = formatMoney(salary.highEndCommission) + '元';
            row.appendChild(highEndCommissionCell);
            
            // 添加团单提成列
            const groupCommissionCell = document.createElement('td');
            groupCommissionCell.textContent = formatMoney(salary.groupCommission) + '元';
            row.appendChild(groupCommissionCell);
            
            // 添加奖金列
            const bonusCell = document.createElement('td');
            bonusCell.textContent = formatMoney(salary.bonus) + '元';
            bonusCell.classList.add('auto-calculated');
            row.appendChild(bonusCell);
            
            // 添加提成合计列
            const commissionTotalCell = document.createElement('td');
            commissionTotalCell.textContent = formatMoney(salary.commissionTotal) + '元';
            commissionTotalCell.classList.add('font-weight-bold');
            row.appendChild(commissionTotalCell);
            
            // 添加应发工资列
            const totalSalaryCell = document.createElement('td');
            totalSalaryCell.textContent = formatMoney(salary.totalSalary) + '元';
            totalSalaryCell.classList.add('font-weight-bold', 'text-danger');
            row.appendChild(totalSalaryCell);
            
            // 添加操作列
            const operationCell = document.createElement('td');
            
            const editButton = document.createElement('button');
            editButton.className = 'btn btn-sm btn-primary me-1';
            editButton.innerHTML = '<i class="fas fa-edit"></i>';
            editButton.title = '编辑';
            editButton.addEventListener('click', () => editSalary(salary.id));
            operationCell.appendChild(editButton);
            
            const deleteButton = document.createElement('button');
            deleteButton.className = 'btn btn-sm btn-danger';
            deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
            deleteButton.title = '删除';
            deleteButton.addEventListener('click', () => {
                if (confirm(`确定要删除${salary.employeeName}的${salary.year}年${salary.month}月工资记录吗？`)) {
                    deleteSalary(salary.id);
                }
            });
            operationCell.appendChild(deleteButton);
            
            row.appendChild(operationCell);
            
            // 将行添加到表格
            tableBody.appendChild(row);
        });
        
        // 渲染分页
        renderSalaryPagination(page, totalPages);
        
    } catch (error) {
        console.error('渲染工资表格失败:', error);
        tableBody.innerHTML = `<tr><td colspan="22" class="text-center text-danger">渲染工资表格时出错: ${error.message}</td></tr>`;
    }
}

/**
 * 渲染分页控件
 * @param {number} currentPage - 当前页码
 * @param {number} totalPages - 总页数
 */
function renderSalaryPagination(currentPage, totalPages) {
    const paginationContainer = document.getElementById('salaryPagination');
    if (!paginationContainer) return;
    
    paginationContainer.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    const pagination = document.createElement('ul');
    pagination.className = 'pagination';
    
    // 上一页按钮
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    
    const prevLink = document.createElement('a');
    prevLink.className = 'page-link';
    prevLink.href = 'javascript:void(0);';
    prevLink.innerHTML = '&laquo;';
    prevLink.addEventListener('click', () => {
        if (currentPage > 1) {
            renderSalaryTable(currentPage - 1, filteredSalaries.length > 0);
        }
    });
    
    prevLi.appendChild(prevLink);
    pagination.appendChild(prevLi);
    
    // 页码按钮
    const maxPages = 5; // 最多显示5个页码
    const startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    const endPage = Math.min(totalPages, startPage + maxPages - 1);
    
    for (let i = startPage; i <= endPage; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
        
        const pageLink = document.createElement('a');
        pageLink.className = 'page-link';
        pageLink.href = 'javascript:void(0);';
        pageLink.textContent = i;
        pageLink.addEventListener('click', () => {
            renderSalaryTable(i, filteredSalaries.length > 0);
        });
        
        pageLi.appendChild(pageLink);
        pagination.appendChild(pageLi);
    }
    
    // 下一页按钮
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    
    const nextLink = document.createElement('a');
    nextLink.className = 'page-link';
    nextLink.href = 'javascript:void(0);';
    nextLink.innerHTML = '&raquo;';
    nextLink.addEventListener('click', () => {
        if (currentPage < totalPages) {
            renderSalaryTable(currentPage + 1, filteredSalaries.length > 0);
        }
    });
    
    nextLi.appendChild(nextLink);
    pagination.appendChild(nextLi);
    
    paginationContainer.appendChild(pagination);
}

/**
 * 初始化表单事件监听
 */
function initFormListeners() {
    // 自动计算基础工资合计
    document.querySelectorAll('#basicSalary, #performanceSalary, #positionSalary').forEach(input => {
        input.addEventListener('input', updateBaseSalaryTotal);
    });
    
    // 自动计算加班费
    document.querySelectorAll('#overtimeHours, #basicSalary, #performanceSalary, #positionSalary').forEach(input => {
        input.addEventListener('input', updateOvertimePay);
    });
    
    // 自动计算缺勤扣发
    document.getElementById('leaveDays').addEventListener('input', updateLeaveDeduction);
    
    // 自动计算迟到扣发
    document.getElementById('lateCount').addEventListener('input', updateLateDeduction);
    
    // 年份和月份变更时更新奖金
    document.querySelectorAll('#salaryYear, #salaryMonth').forEach(input => {
        input.addEventListener('change', updateBonus);
    });
    
    // 自动计算所有合计和应发工资
    document.querySelectorAll('#reimbursementAmount, #basicSalary, #performanceSalary, #positionSalary, #overtimeHours, #leaveDays, #lateCount, #highEndCommission, #groupCommission').forEach(input => {
        input.addEventListener('input', updateTotals);
    });
    
    // 保存按钮事件
    document.getElementById('saveSalaryBtn').addEventListener('click', saveSalaryRecord);
}

/**
 * 更新基础工资合计
 */
function updateBaseSalaryTotal() {
    const basicSalary = parseFloat(document.getElementById('basicSalary').value) || 0;
    const performanceSalary = parseFloat(document.getElementById('performanceSalary').value) || 0;
    const positionSalary = parseFloat(document.getElementById('positionSalary').value) || 0;
    
    const baseSalaryTotal = calculateBaseSalaryTotal(basicSalary, performanceSalary, positionSalary);
    document.getElementById('baseSalaryTotal').value = formatMoney(baseSalaryTotal);
}

/**
 * 更新加班费
 */
function updateOvertimePay() {
    const overtimeHours = parseFloat(document.getElementById('overtimeHours').value) || 0;
    const basicSalary = parseFloat(document.getElementById('basicSalary').value) || 0;
    const performanceSalary = parseFloat(document.getElementById('performanceSalary').value) || 0;
    const positionSalary = parseFloat(document.getElementById('positionSalary').value) || 0;
    
    const baseSalaryTotal = calculateBaseSalaryTotal(basicSalary, performanceSalary, positionSalary);
    const overtimePay = calculateOvertimePay(overtimeHours, baseSalaryTotal);
    
    document.getElementById('overtimePay').value = formatMoney(overtimePay);
}

/**
 * 更新缺勤扣发
 */
function updateLeaveDeduction() {
    const leaveDays = parseInt(document.getElementById('leaveDays').value) || 0;
    const leaveDeduction = calculateLeaveDeduction(leaveDays);
    
    document.getElementById('leaveDeduction').value = formatMoney(leaveDeduction);
}

/**
 * 更新迟到扣发
 */
function updateLateDeduction() {
    const lateCount = parseInt(document.getElementById('lateCount').value) || 0;
    const lateDeduction = calculateLateDeduction(lateCount);
    
    document.getElementById('lateDeduction').value = formatMoney(lateDeduction);
}

/**
 * 更新奖金
 */
function updateBonus() {
    const year = parseInt(document.getElementById('salaryYear').value);
    const month = parseInt(document.getElementById('salaryMonth').value);
    const bonus = calculateBonus(year, month);
    
    document.getElementById('bonus').value = formatMoney(bonus);
}

/**
 * 更新所有合计和应发工资
 */
function updateTotals() {
    // 先更新所有单项计算
    updateBaseSalaryTotal();
    updateOvertimePay();
    updateLeaveDeduction();
    updateLateDeduction();
    updateBonus();
    
    // 获取所有值
    const baseSalaryTotal = parseFloat(document.getElementById('baseSalaryTotal').value) || 0;
    const reimbursementAmount = parseFloat(document.getElementById('reimbursementAmount').value) || 0;
    const overtimePay = parseFloat(document.getElementById('overtimePay').value) || 0;
    const leaveDeduction = parseFloat(document.getElementById('leaveDeduction').value) || 0;
    const lateDeduction = parseFloat(document.getElementById('lateDeduction').value) || 0;
    const highEndCommission = parseFloat(document.getElementById('highEndCommission').value) || 0;
    const groupCommission = parseFloat(document.getElementById('groupCommission').value) || 0;
    const bonus = parseFloat(document.getElementById('bonus').value) || 0;
    
    // 计算标准工资合计
    const standardSalaryTotal = calculateStandardSalaryTotal(
        reimbursementAmount, overtimePay, leaveDeduction, lateDeduction
    );
    document.getElementById('standardSalaryTotal').value = formatMoney(standardSalaryTotal);
    
    // 计算提成合计
    const commissionTotal = calculateCommissionTotal(highEndCommission, groupCommission, bonus);
    document.getElementById('commissionTotal').value = formatMoney(commissionTotal);
    
    // 计算应发工资
    const totalSalary = calculateTotalSalary(baseSalaryTotal, standardSalaryTotal, commissionTotal);
    document.getElementById('totalSalary').value = formatMoney(totalSalary);
}

/**
 * 初始化按钮事件
 */
function initButtonEvents() {
    // 新增工资记录按钮
    document.getElementById('addSalaryBtn').addEventListener('click', () => {
        openSalaryModal();
    });
    
    // 复制记录按钮
    document.getElementById('copySalaryBtn').addEventListener('click', copySalary);
    
    // 删除选中按钮
    document.getElementById('deleteSalaryBtn').addEventListener('click', deleteSelectedSalaries);
    
    // 导出工资按钮
    document.getElementById('exportSalaryBtn').addEventListener('click', exportSalaryToExcel);
    
    // 全选复选框
    const selectAllCheckbox = document.getElementById('selectAllSalaries');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.salary-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
    }
    
    // 应用统计筛选按钮
    document.getElementById('applySalaryStatsFilter').addEventListener('click', refreshStatisticsCharts);
    
    // 统计时间范围切换
    document.getElementById('salaryStatsTimeRange').addEventListener('change', function() {
        const monthContainer = document.getElementById('salaryStatsMonthContainer');
        if (this.value === 'year') {
            monthContainer.style.display = 'none';
        } else {
            monthContainer.style.display = 'flex';
        }
    });
}

/**
 * 初始化筛选功能
 */
function initFilterFunctions() {
    // 筛选按钮
    document.getElementById('filterSalaryBtn').addEventListener('click', filterSalaries);
    
    // 重置筛选按钮
    document.getElementById('resetSalaryFilterBtn').addEventListener('click', resetSalaryFilter);
}

/**
 * 打开工资记录模态框
 * @param {Object} salaryData - 工资数据对象，如果是新增则为null
 */
function openSalaryModal(salaryData = null) {
    // 清空表单
    document.getElementById('salaryForm').reset();
    
    // 清空隐藏的ID字段
    editingSalaryId = null;
    document.getElementById('salaryId').value = '';
    
    // 设置模态框标题
    const modalTitle = document.getElementById('salaryModalTitle');
    
    if (salaryData) {
        // 编辑模式
        modalTitle.textContent = '编辑工资记录';
        editingSalaryId = salaryData.id;
        document.getElementById('salaryId').value = salaryData.id;
        
        // 填充表单数据
        document.getElementById('salaryYear').value = salaryData.year;
        document.getElementById('salaryMonth').value = salaryData.month;
        document.getElementById('employeeName').value = salaryData.employeeName;
        document.getElementById('basicSalary').value = salaryData.basicSalary;
        document.getElementById('performanceSalary').value = salaryData.performanceSalary;
        document.getElementById('positionSalary').value = salaryData.positionSalary;
        document.getElementById('baseSalaryTotal').value = salaryData.baseSalaryTotal;
        
        if (salaryData.reimbursementStartDate) {
            document.getElementById('reimbursementStartDate').value = salaryData.reimbursementStartDate;
        }
        
        if (salaryData.reimbursementEndDate) {
            document.getElementById('reimbursementEndDate').value = salaryData.reimbursementEndDate;
        }
        
        document.getElementById('reimbursementAmount').value = salaryData.reimbursementAmount;
        document.getElementById('overtimeHours').value = salaryData.overtimeHours;
        document.getElementById('overtimePay').value = salaryData.overtimePay;
        document.getElementById('leaveDays').value = salaryData.leaveDays;
        document.getElementById('leaveDeduction').value = salaryData.leaveDeduction;
        document.getElementById('lateCount').value = salaryData.lateCount;
        document.getElementById('lateDeduction').value = salaryData.lateDeduction;
        document.getElementById('standardSalaryTotal').value = salaryData.standardSalaryTotal;
        document.getElementById('highEndCommission').value = salaryData.highEndCommission;
        document.getElementById('groupCommission').value = salaryData.groupCommission;
        document.getElementById('bonus').value = salaryData.bonus;
        document.getElementById('commissionTotal').value = salaryData.commissionTotal;
        document.getElementById('totalSalary').value = salaryData.totalSalary;
    } else {
        // 新增模式
        modalTitle.textContent = '新增工资记录';
        
        // 设置默认值
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        
        document.getElementById('salaryYear').value = currentYear;
        document.getElementById('salaryMonth').value = currentMonth;
        document.getElementById('basicSalary').value = DEFAULT_BASIC_SALARY;
        document.getElementById('performanceSalary').value = DEFAULT_PERFORMANCE_SALARY;
        document.getElementById('positionSalary').value = DEFAULT_POSITION_SALARY;
        
        // 更新奖金（根据当前选择的年月自动计算）
        updateBonus();
        
        // 计算并设置默认的合计值
        updateTotals();
    }
    
    // 显示模态框
    salaryModal.show();
}

/**
 * 保存工资记录
 */
function saveSalaryRecord() {
    try {
        // 获取表单数据
        const year = parseInt(document.getElementById('salaryYear').value);
        const month = parseInt(document.getElementById('salaryMonth').value);
        
        const formData = {
            id: document.getElementById('salaryId').value || generateUniqueId(),
            year: year,
            month: month,
            employeeName: document.getElementById('employeeName').value.trim(),
            basicSalary: parseFloat(document.getElementById('basicSalary').value) || DEFAULT_BASIC_SALARY,
            performanceSalary: parseFloat(document.getElementById('performanceSalary').value) || DEFAULT_PERFORMANCE_SALARY,
            positionSalary: parseFloat(document.getElementById('positionSalary').value) || DEFAULT_POSITION_SALARY,
            baseSalaryTotal: parseFloat(document.getElementById('baseSalaryTotal').value),
            reimbursementStartDate: document.getElementById('reimbursementStartDate').value,
            reimbursementEndDate: document.getElementById('reimbursementEndDate').value,
            reimbursementAmount: parseFloat(document.getElementById('reimbursementAmount').value) || 0,
            overtimeHours: parseFloat(document.getElementById('overtimeHours').value) || 0,
            overtimePay: parseFloat(document.getElementById('overtimePay').value) || 0,
            leaveDays: parseInt(document.getElementById('leaveDays').value) || 0,
            leaveDeduction: parseFloat(document.getElementById('leaveDeduction').value) || 0,
            lateCount: parseInt(document.getElementById('lateCount').value) || 0,
            lateDeduction: parseFloat(document.getElementById('lateDeduction').value) || 0,
            standardSalaryTotal: parseFloat(document.getElementById('standardSalaryTotal').value) || 0,
            highEndCommission: parseFloat(document.getElementById('highEndCommission').value) || 0,
            groupCommission: parseFloat(document.getElementById('groupCommission').value) || 0,
            bonus: parseFloat(document.getElementById('bonus').value) || 0,
            commissionTotal: parseFloat(document.getElementById('commissionTotal').value) || 0,
            totalSalary: parseFloat(document.getElementById('totalSalary').value) || 0,
            createTime: new Date().toISOString()
        };
        
        // 表单验证
        if (!formData.employeeName) {
            alert('请输入员工姓名');
            return;
        }
        
        // 检查是否是编辑模式
        if (editingSalaryId) {
            // 更新现有记录
            const index = salaries.findIndex(item => item.id === editingSalaryId);
            if (index !== -1) {
                salaries[index] = { ...salaries[index], ...formData };
                console.log(`已更新ID为${editingSalaryId}的工资记录`);
            } else {
                console.warn(`找不到ID为${editingSalaryId}的工资记录，将添加为新记录`);
                salaries.push(formData);
            }
        } else {
            // 添加新记录
            salaries.push(formData);
            console.log('已添加新工资记录');
        }
        
        // 保存数据
        saveSalaryData();
        
        // 关闭模态框
        salaryModal.hide();
        
        // 刷新表格
        renderSalaryTable();
        
        // 成功提示
        alert(editingSalaryId ? '工资记录已更新' : '工资记录已添加');
        
    } catch (error) {
        console.error('保存工资记录时出错:', error);
        alert('保存工资记录失败: ' + error.message);
    }
}

/**
 * 编辑工资记录
 * @param {string} id - 工资记录ID
 */
function editSalary(id) {
    const salaryData = salaries.find(item => item.id === id);
    if (salaryData) {
        openSalaryModal(salaryData);
    } else {
        console.error(`找不到ID为${id}的工资记录`);
        alert('找不到要编辑的工资记录');
    }
}

/**
 * 删除工资记录
 * @param {string} id - 工资记录ID
 */
function deleteSalary(id) {
    try {
        // 从数组中移除记录
        salaries = salaries.filter(item => item.id !== id);
        
        // 保存数据
        saveSalaryData();
        
        // 刷新表格
        renderSalaryTable();
        
        console.log(`已删除ID为${id}的工资记录`);
    } catch (error) {
        console.error('删除工资记录时出错:', error);
        alert('删除工资记录失败: ' + error.message);
    }
}

/**
 * 复制工资记录
 */
function copySalary() {
    const selectedCheckboxes = document.querySelectorAll('.salary-checkbox:checked');
    if (selectedCheckboxes.length !== 1) {
        alert('请选择一条工资记录进行复制');
        return;
    }
    
    const selectedId = selectedCheckboxes[0].value;
    const salaryData = salaries.find(item => item.id === selectedId);
    
    if (!salaryData) {
        alert('找不到选中的工资记录');
        return;
    }
    
    // 创建复制的记录
    const copiedData = { ...salaryData };
    copiedData.id = generateUniqueId();
    copiedData.createTime = new Date().toISOString();
    
    // 打开编辑模态框
    openSalaryModal(copiedData);
}

/**
 * 删除选中的工资记录
 */
function deleteSelectedSalaries() {
    const selectedCheckboxes = document.querySelectorAll('.salary-checkbox:checked');
    if (selectedCheckboxes.length === 0) {
        alert('请选择要删除的工资记录');
        return;
    }
    
    if (!confirm(`确定要删除选中的 ${selectedCheckboxes.length} 条工资记录吗？`)) {
        return;
    }
    
    try {
        // 获取选中的ID
        const selectedIds = Array.from(selectedCheckboxes).map(checkbox => checkbox.value);
        
        // 从数组中移除记录
        salaries = salaries.filter(item => !selectedIds.includes(item.id));
        
        // 保存数据
        saveSalaryData();
        
        // 刷新表格
        renderSalaryTable();
        
        console.log(`已删除${selectedIds.length}条工资记录`);
        alert(`已成功删除${selectedIds.length}条工资记录`);
    } catch (error) {
        console.error('删除工资记录时出错:', error);
        alert('删除工资记录失败: ' + error.message);
    }
}

/**
 * 筛选工资记录
 */
function filterSalaries() {
    const yearValue = document.getElementById('salaryYearFilter').value;
    const monthValue = document.getElementById('salaryMonthFilter').value;
    const employeeValue = document.getElementById('salaryEmployeeFilter').value.trim().toLowerCase();
    
    // 应用筛选
    filteredSalaries = salaries.filter(salary => {
        // 年份筛选
        if (yearValue && parseInt(yearValue) !== salary.year) {
            return false;
        }
        
        // 月份筛选
        if (monthValue && parseInt(monthValue) !== salary.month) {
            return false;
        }
        
        // 员工姓名筛选
        if (employeeValue && !salary.employeeName.toLowerCase().includes(employeeValue)) {
            return false;
        }
        
        return true;
    });
    
    // 渲染筛选后的表格
    renderSalaryTable(1, true);
    
    console.log(`筛选后得到${filteredSalaries.length}条工资记录`);
}

/**
 * 重置工资筛选条件
 */
function resetSalaryFilter() {
    // 清空筛选条件
    document.getElementById('salaryYearFilter').value = '';
    document.getElementById('salaryMonthFilter').value = '';
    document.getElementById('salaryEmployeeFilter').value = '';
    
    // 清空筛选结果
    filteredSalaries = [];
    
    // 隐藏筛选结果计数
    const resultCount = document.getElementById('salaryFilterResultCount');
    if (resultCount) {
        resultCount.style.display = 'none';
    }
    
    // 重新渲染表格
    renderSalaryTable();
}

/**
 * 生成唯一ID
 * @returns {string} 唯一ID
 */
function generateUniqueId() {
    return 'salary_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}

/**
 * 导出工资数据到Excel
 */
function exportSalaryToExcel() {
    try {
        // 获取选中的复选框
        const selectedCheckboxes = document.querySelectorAll('.salary-checkbox:checked');
        
        // 准备导出数据
        let salariesToExport = [];
        
        if (selectedCheckboxes.length > 0) {
            // 导出选中记录
            console.log(`已选择${selectedCheckboxes.length}条工资记录进行导出`);
            const selectedIds = Array.from(selectedCheckboxes).map(checkbox => checkbox.value);
            salariesToExport = salaries.filter(salary => selectedIds.includes(salary.id));
        } else {
            // 导出当前筛选结果或全部数据
            salariesToExport = filteredSalaries.length > 0 ? filteredSalaries : salaries;
            console.log(`未选择特定记录，将导出所有${salariesToExport.length}条工资数据`);
        }
        
        if (salariesToExport.length === 0) {
            alert('没有可导出的工资数据');
            return;
        }
        
        // 格式化数据为Excel格式
        const formattedData = salariesToExport.map(salary => ({
            '年份': salary.year,
            '月份': salary.month,
            '员工姓名': salary.employeeName,
            '基本工资': formatMoney(salary.basicSalary) + '元',
            '绩效工资': formatMoney(salary.performanceSalary) + '元',
            '岗位工资': formatMoney(salary.positionSalary) + '元',
            '基础工资合计': formatMoney(salary.baseSalaryTotal) + '元',
            '报销金额': formatMoney(salary.reimbursementAmount) + '元',
            '加班小时': formatMoney(salary.overtimeHours) + '小时',
            '加班费': formatMoney(salary.overtimePay) + '元',
            '请假天数': salary.leaveDays + '天',
            '缺勤扣发': formatMoney(salary.leaveDeduction) + '元',
            '迟到次数': salary.lateCount + '次',
            '迟到扣发': formatMoney(salary.lateDeduction) + '元',
            '标准工资合计': formatMoney(salary.standardSalaryTotal) + '元',
            '高定提成': formatMoney(salary.highEndCommission) + '元',
            '团单提成': formatMoney(salary.groupCommission) + '元',
            '奖金': formatMoney(salary.bonus) + '元',
            '提成合计': formatMoney(salary.commissionTotal) + '元',
            '应发工资': formatMoney(salary.totalSalary) + '元'
        }));
        
        // 设置文件名
        const now = new Date();
        const fileName = `工资数据_${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}.xlsx`;
        
        // 导出Excel
        exportArrayToExcel(formattedData, fileName, '工资数据');
        
        console.log('工资数据导出成功:', fileName);
    } catch (error) {
        console.error('导出工资数据失败:', error);
        alert('导出工资数据失败: ' + error.message);
    }
}

/**
 * 导出数组到Excel文件
 * @param {Array} data - 要导出的数据数组
 * @param {string} fileName - 文件名
 * @param {string} sheetName - 工作表名称
 */
function exportArrayToExcel(data, fileName, sheetName) {
    try {
        // 创建工作簿
        const wb = XLSX.utils.book_new();
        
        // 创建工作表
        const ws = XLSX.utils.json_to_sheet(data);
        
        // 将工作表添加到工作簿
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
        
        // 导出文件
        XLSX.writeFile(wb, fileName);
        
        alert(`已成功导出到${fileName}`);
    } catch (error) {
        console.error('导出Excel文件失败:', error);
        throw error;
    }
}

/**
 * 将工资数据同步到成本管理模块
 */
function syncSalaryToCostModule() {
    try {
        // 获取当前成本数据
        let operatingCosts = [];
        const savedOperatingCosts = localStorage.getItem('operatingCosts');
        
        if (savedOperatingCosts) {
            operatingCosts = JSON.parse(savedOperatingCosts);
        }
        
        // 移除原有工资类型的成本记录
        operatingCosts = operatingCosts.filter(cost => cost.costType !== '运营成本' || cost.costItem !== '工资');
        
        // 按年份和月份对工资数据进行分组
        const salaryGroups = {};
        
        salaries.forEach(salary => {
            const key = `${salary.year}-${salary.month}`;
            if (!salaryGroups[key]) {
                salaryGroups[key] = {
                    year: salary.year,
                    month: salary.month,
                    totalSalary: 0,
                    count: 0
                };
            }
            salaryGroups[key].totalSalary += parseFloat(salary.totalSalary);
            salaryGroups[key].count += 1;
        });
        
        // 为每个分组创建一条成本记录
        for (const key in salaryGroups) {
            const group = salaryGroups[key];
            const date = `${group.year}-${group.month.toString().padStart(2, '0')}-01`;
            
            const costRecord = {
                id: `salary_cost_${group.year}_${group.month}`,
                date: date,
                costItem: '工资',
                amount: group.totalSalary,
                remark: `${group.year}年${group.month}月 ${group.count}名员工工资总额`,
                costType: '运营成本',
                createTime: new Date().toISOString()
            };
            
            operatingCosts.push(costRecord);
        }
        
        // 保存更新后的成本数据
        localStorage.setItem('operatingCosts', JSON.stringify(operatingCosts));
        
        // 同步到costs数组以兼容可能的旧版本代码
        const filteredCosts = operatingCosts.filter(cost => cost.costType === '运营成本');
        localStorage.setItem('costs', JSON.stringify(filteredCosts));
        
        console.log(`已将工资数据同步到成本管理模块，共${Object.keys(salaryGroups).length}条记录`);
    } catch (error) {
        console.error('同步工资数据到成本管理模块时出错:', error);
    }
}

/**
 * 初始化统计图表
 */
function initStatisticsCharts() {
    // 初始化工资趋势图表
    const trendCtx = document.getElementById('salaryTrendChart');
    if (trendCtx) {
        salaryTrendChart = new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: '工资总额',
                    data: [],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ¥' + formatMoney(context.raw) + '元';
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
        });
    } else {
        console.error('找不到工资趋势图表容器');
    }
    
    // 初始化工资组成分析图表
    const compositionCtx = document.getElementById('salaryCompositionChart');
    if (compositionCtx) {
        salaryCompositionChart = new Chart(compositionCtx, {
            type: 'doughnut',
            data: {
                labels: ['基础工资', '标准工资', '提成'],
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: [
                        'rgba(52, 152, 219, 0.7)',
                        'rgba(46, 204, 113, 0.7)',
                        'rgba(155, 89, 182, 0.7)'
                    ],
                    borderColor: [
                        'rgba(52, 152, 219, 1)',
                        'rgba(46, 204, 113, 1)',
                        'rgba(155, 89, 182, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                return label + ': ¥' + formatMoney(value) + '元 (' + percentage + '%)';
                            }
                        }
                    }
                }
            }
        });
    } else {
        console.error('找不到工资组成分析图表容器');
    }
    
    // 初始化员工工资对比图表
    const employeeCtx = document.getElementById('employeeSalaryChart');
    if (employeeCtx) {
        employeeSalaryChart = new Chart(employeeCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: '应发工资',
                    data: [],
                    backgroundColor: 'rgba(231, 76, 60, 0.7)',
                    borderColor: 'rgba(231, 76, 60, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ¥' + formatMoney(context.raw) + '元';
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
        });
    } else {
        console.error('找不到员工工资对比图表容器');
    }
    
    // 首次加载图表数据
    refreshStatisticsCharts();
}

/**
 * 刷新统计图表
 */
function refreshStatisticsCharts() {
    try {
        // 获取筛选条件
        const timeRange = document.getElementById('salaryStatsTimeRange').value;
        const yearValue = document.getElementById('salaryStatsYear').value;
        const monthValue = timeRange === 'month' ? document.getElementById('salaryStatsMonth').value : '';
        
        // 筛选数据
        let filteredData = [...salaries];
        
        if (yearValue) {
            filteredData = filteredData.filter(salary => salary.year == yearValue);
        }
        
        if (monthValue) {
            filteredData = filteredData.filter(salary => salary.month == monthValue);
        }
        
        // 如果没有数据，显示空图表
        if (filteredData.length === 0) {
            updateEmptyCharts();
            updateStatCards([], yearValue, monthValue);
            return;
        }
        
        console.log(`统计图表使用了${filteredData.length}条工资记录`);
        
        // 更新统计卡片
        updateStatCards(filteredData, yearValue, monthValue);
        
        // 更新工资趋势图表
        updateSalaryTrendChart(filteredData, timeRange);
        
        // 更新工资组成分析图表
        updateSalaryCompositionChart(filteredData);
        
        // 更新员工工资对比图表
        updateEmployeeSalaryChart(filteredData);
        
    } catch (error) {
        console.error('刷新统计图表时出错:', error);
    }
}

/**
 * 更新统计卡片
 * @param {Array} data - 筛选后的工资数据
 * @param {string} year - 筛选的年份
 * @param {string} month - 筛选的月份
 */
function updateStatCards(data, year, month) {
    // 计算工资总支出
    const totalSalary = data.reduce((sum, salary) => sum + parseFloat(salary.totalSalary), 0);
    document.getElementById('totalSalaryAmount').textContent = `¥${formatMoney(totalSalary)}元`;
    
    // 计算平均工资
    const avgSalary = data.length > 0 ? totalSalary / data.length : 0;
    document.getElementById('averageSalary').textContent = `¥${formatMoney(avgSalary)}元`;
    
    // 计算提成总额
    const totalCommission = data.reduce((sum, salary) => sum + parseFloat(salary.commissionTotal), 0);
    document.getElementById('totalCommission').textContent = `¥${formatMoney(totalCommission)}元`;
    
    // 计算员工人数（去重）
    const employeeSet = new Set();
    data.forEach(salary => employeeSet.add(salary.employeeName));
    document.getElementById('employeeCount').textContent = employeeSet.size;
}

/**
 * 更新工资趋势图表
 * @param {Array} data - 筛选后的工资数据
 * @param {string} timeRange - 时间范围类型：'year'或'month'
 */
function updateSalaryTrendChart(data, timeRange) {
    if (!salaryTrendChart) {
        console.error('工资趋势图表未初始化');
        return;
    }
    
    let labels = [];
    let datasets = [];
    
    if (timeRange === 'year') {
        // 按年份分组
        const yearlyData = {};
        
        data.forEach(salary => {
            const year = salary.year.toString();
            if (!yearlyData[year]) {
                yearlyData[year] = {
                    totalSalary: 0,
                    count: 0
                };
            }
            yearlyData[year].totalSalary += parseFloat(salary.totalSalary);
            yearlyData[year].count += 1;
        });
        
        // 排序年份
        const sortedYears = Object.keys(yearlyData).sort();
        
        // 准备图表数据
        labels = sortedYears.map(year => `${year}年`);
        const values = sortedYears.map(year => yearlyData[year].totalSalary);
        
        datasets = [{
            label: '工资总额',
            data: values,
            borderColor: '#3498db',
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
            borderWidth: 2,
            tension: 0.3,
            fill: true
        }];
        
    } else {
        // 按月份分组
        const monthlyData = {};
        
        data.forEach(salary => {
            const key = `${salary.year}-${salary.month.toString().padStart(2, '0')}`;
            if (!monthlyData[key]) {
                monthlyData[key] = {
                    year: salary.year,
                    month: salary.month,
                    totalSalary: 0,
                    count: 0
                };
            }
            monthlyData[key].totalSalary += parseFloat(salary.totalSalary);
            monthlyData[key].count += 1;
        });
        
        // 排序月份
        const sortedKeys = Object.keys(monthlyData).sort();
        
        // 准备图表数据
        labels = sortedKeys.map(key => {
            const data = monthlyData[key];
            return `${data.year}年${data.month}月`;
        });
        
        const values = sortedKeys.map(key => monthlyData[key].totalSalary);
        
        datasets = [{
            label: '工资总额',
            data: values,
            borderColor: '#3498db',
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
            borderWidth: 2,
            tension: 0.3,
            fill: true
        }];
    }
    
    // 更新图表
    salaryTrendChart.data.labels = labels;
    salaryTrendChart.data.datasets = datasets;
    salaryTrendChart.update();
}

/**
 * 更新工资组成分析图表
 * @param {Array} data - 筛选后的工资数据
 */
function updateSalaryCompositionChart(data) {
    if (!salaryCompositionChart) {
        console.error('工资组成分析图表未初始化');
        return;
    }
    
    // 计算各组成部分总额
    const baseSalaryTotal = data.reduce((sum, salary) => sum + parseFloat(salary.baseSalaryTotal), 0);
    const standardSalaryTotal = data.reduce((sum, salary) => sum + parseFloat(salary.standardSalaryTotal), 0);
    const commissionTotal = data.reduce((sum, salary) => sum + parseFloat(salary.commissionTotal), 0);
    
    // 更新图表数据
    salaryCompositionChart.data.datasets[0].data = [
        baseSalaryTotal,
        standardSalaryTotal,
        commissionTotal
    ];
    
    salaryCompositionChart.update();
}

/**
 * 更新员工工资对比图表
 * @param {Array} data - 筛选后的工资数据
 */
function updateEmployeeSalaryChart(data) {
    if (!employeeSalaryChart) {
        console.error('员工工资对比图表未初始化');
        return;
    }
    
    // 按员工分组
    const employeeData = {};
    
    data.forEach(salary => {
        const name = salary.employeeName;
        if (!employeeData[name]) {
            employeeData[name] = {
                totalSalary: 0,
                count: 0
            };
        }
        employeeData[name].totalSalary += parseFloat(salary.totalSalary);
        employeeData[name].count += 1;
    });
    
    // 计算每位员工的平均工资
    const employeeAvgSalary = {};
    for (const name in employeeData) {
        employeeAvgSalary[name] = employeeData[name].totalSalary / employeeData[name].count;
    }
    
    // 排序员工（按平均工资降序）
    const sortedEmployees = Object.keys(employeeAvgSalary).sort((a, b) => employeeAvgSalary[b] - employeeAvgSalary[a]);
    
    // 限制显示员工数量（最多显示10个）
    const displayEmployees = sortedEmployees.slice(0, 10);
    
    // 准备图表数据
    const labels = displayEmployees;
    const values = displayEmployees.map(name => employeeAvgSalary[name]);
    
    // 更新图表
    employeeSalaryChart.data.labels = labels;
    employeeSalaryChart.data.datasets[0].data = values;
    employeeSalaryChart.update();
}

/**
 * 更新空图表
 */
function updateEmptyCharts() {
    // 清空工资趋势图表
    if (salaryTrendChart) {
        salaryTrendChart.data.labels = [];
        salaryTrendChart.data.datasets[0].data = [];
        salaryTrendChart.update();
    }
    
    // 清空工资组成分析图表
    if (salaryCompositionChart) {
        salaryCompositionChart.data.datasets[0].data = [0, 0, 0];
        salaryCompositionChart.update();
    }
    
    // 清空员工工资对比图表
    if (employeeSalaryChart) {
        employeeSalaryChart.data.labels = [];
        employeeSalaryChart.data.datasets[0].data = [];
        employeeSalaryChart.update();
    }
} 