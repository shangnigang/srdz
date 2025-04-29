/**
 * 尚荣定制管理系统 - 统一权限管理模块
 * 
 * 此文件整合了系统中所有的权限控制逻辑，包括：
 * 1. 用户身份认证
 * 2. 权限检查
 * 3. 管理员权限覆盖
 * 4. 页面路由保护
 * 5. 元素可见性控制
 */

// 全局权限状态
const permissionState = {
    // 当前用户信息
    currentUser: null,
    // 是否已初始化
    initialized: false,
    // 权限映射表
    permissionMap: {
        // 普通用户权限
        user: [
            'view_dashboard',
            'view_orders',
            'view_personal_profile',
            'view_guide'
        ],
        // 销售员权限
        sales: [
            'view_dashboard',
            'view_orders',
            'edit_orders',
            'create_orders',
            'manage_salaries',
            'view_personal_profile',
            'view_guide'
        ],
        // 管理员权限（此处省略，因为管理员拥有所有权限）
        admin: []
    }
};

/**
 * 初始化权限系统
 * @returns {Object} 当前用户信息
 */
function initPermissions() {
    console.log('初始化权限系统...');
    
    // 如果是登录页面，不进行初始化
    if (window.isLoginPage || window.location.href.includes('login.html')) {
        console.log('登录页面，跳过权限系统初始化');
        return null;
    }
    
    if (permissionState.initialized) {
        console.log('权限系统已初始化');
        return permissionState.currentUser;
    }
    
    try {
        // 获取用户信息
        const userInfoStr = localStorage.getItem('user_info');
        if (userInfoStr) {
            permissionState.currentUser = JSON.parse(userInfoStr);
            console.log('当前用户:', permissionState.currentUser);
        } else {
            console.warn('未找到用户信息，请先登录');
            redirectToLogin();
            return null;
        }
        
        // 验证登录状态
        const authToken = localStorage.getItem('auth_token');
        if (!authToken) {
            console.warn('未找到认证令牌，请先登录');
            redirectToLogin();
            return null;
        }
        
        // 如果是管理员，应用管理员权限覆盖
        if (isAdmin()) {
            applyAdminOverride();
        }
        
        // 初始化完成
        permissionState.initialized = true;
        
        // 运行页面级权限控制
        applyPageLevelPermissions();
        
        return permissionState.currentUser;
    } catch (error) {
        console.error('初始化权限系统失败:', error);
        return null;
    }
}

/**
 * 检查用户是否拥有特定权限
 * @param {string} permission 权限名称
 * @returns {boolean} 是否拥有权限
 */
function hasPermission(permission) {
    // 确保已初始化
    if (!permissionState.initialized) {
        initPermissions();
    }
    
    // 未登录用户没有任何权限
    if (!permissionState.currentUser) {
        return false;
    }
    
    // 管理员拥有所有权限
    // 直接检查用户角色，避免函数调用循环
    if (permissionState.currentUser.role === 'admin') {
        return true;
    }
    
    // 用户具体信息
    const username = permissionState.currentUser.username;
    
    // 检查是否有特定权限配置
    const savedPermissions = localStorage.getItem(`user_permissions_${username}`);
    if (savedPermissions) {
        try {
            const userPermissions = JSON.parse(savedPermissions);
            
            // 映射sidebar data-permission属性与用户权限配置的对应关系
            if (permission === 'manage_salaries' && userPermissions.salaryEntry && userPermissions.salaryEntry.view) {
                return true;
            }
            
            if (permission === 'manage_costs' && userPermissions.costManagement && userPermissions.costManagement.view) {
                return true;
            }
            
            if (permission === 'view_analysis' && userPermissions.analysis && userPermissions.analysis.view) {
                return true;
            }
            
            if (permission === 'manage_data' && userPermissions.dataManagement && 
                (userPermissions.dataManagement.backup || userPermissions.dataManagement.restore || userPermissions.dataManagement.check)) {
                return true;
            }
        } catch (e) {
            console.error('解析用户权限失败:', e);
        }
    }
    
    // 检查用户角色的权限列表
    const userRole = permissionState.currentUser.role || 'user';
    const userPermissions = permissionState.permissionMap[userRole] || [];
    
    return userPermissions.includes(permission);
}

/**
 * 检查当前用户是否为管理员
 * @returns {boolean} 是否为管理员
 */
function isAdmin() {
    if (!permissionState.currentUser) {
        return false;
    }
    return permissionState.currentUser.role === 'admin';
}

/**
 * 应用管理员权限覆盖
 */
function applyAdminOverride() {
    console.log('应用管理员权限覆盖');
    
    // 标记全局管理员状态
    window.isAdmin = true;
    window.adminPermissionsEnabled = true;
    
    // 启用所有已禁用的元素
    setTimeout(enableAllDisabledElements, 100);
    
    // 观察DOM变化，处理动态加载的元素
    observeDOMChanges();
}

/**
 * 启用所有禁用的元素
 */
function enableAllDisabledElements() {
    // 直接检查用户角色，避免函数调用循环
    if (!permissionState.currentUser || permissionState.currentUser.role !== 'admin') return;
    
    console.log('启用所有禁用的元素');
    
    // 启用所有禁用的按钮和输入框
    document.querySelectorAll('button[disabled], input[disabled], select[disabled], textarea[disabled], .disabled, [style*="display: none"], [style*="visibility: hidden"]').forEach(element => {
        // 移除disabled属性
        element.disabled = false;
        
        // 移除disabled类
        element.classList.remove('disabled');
        
        // 恢复显示
        if (element.style.display === 'none') {
            element.style.display = '';
        }
        
        // 恢复可见性
        if (element.style.visibility === 'hidden') {
            element.style.visibility = '';
        }
    });
    
    // 显示管理员专属元素
    document.querySelectorAll('.admin-only').forEach(element => {
        element.style.display = '';
    });
}

/**
 * 观察DOM变化，处理动态加载的元素
 */
function observeDOMChanges() {
    // 直接检查用户角色，避免函数调用循环
    if (!permissionState.currentUser || permissionState.currentUser.role !== 'admin') return;
    
    // 创建DOM观察器
    const observer = new MutationObserver((mutations) => {
        let shouldEnableElements = false;
        
        // 检查是否有元素被添加或修改
        mutations.forEach(mutation => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                shouldEnableElements = true;
            } else if (mutation.type === 'attributes' && 
                      (mutation.attributeName === 'disabled' || 
                       mutation.attributeName === 'class' || 
                       mutation.attributeName === 'style')) {
                shouldEnableElements = true;
            }
        });
        
        // 如果有元素变化，重新启用禁用的元素
        if (shouldEnableElements) {
            enableAllDisabledElements();
        }
    });
    
    // 配置观察器
    const observerConfig = {
        childList: true,     // 观察子节点变化
        attributes: true,    // 观察属性变化
        subtree: true        // 观察所有后代节点
    };
    
    // 开始观察整个文档
    observer.observe(document.body, observerConfig);
    console.log('已启动DOM变化观察器');
}

/**
 * 应用页面级权限控制
 */
function applyPageLevelPermissions() {
    // 获取当前页面
    const currentPage = getCurrentPage();
    console.log('应用页面级权限控制:', currentPage);
    
    // 直接检查用户角色，避免函数调用循环
    if (permissionState.currentUser && permissionState.currentUser.role === 'admin') {
        console.log('管理员用户，跳过页面级权限控制');
        return;
    }
    
    // 根据页面类型应用特定的权限控制
    switch(currentPage) {
        case 'order':
            applyOrderPagePermissions();
            break;
        case 'cost':
            applyCostPagePermissions();
            break;
        case 'salary':
            applySalaryPagePermissions();
            break;
        case 'analysis':
            applyAnalysisPagePermissions();
            break;
        case 'data-management':
            applyDataManagementPagePermissions();
            break;
        case 'user':
            applyUserPagePermissions();
            break;
    }
}

/**
 * 获取当前页面类型
 * @returns {string} 当前页面类型
 */
function getCurrentPage() {
    const pathname = window.location.pathname;
    const filename = pathname.split('/').pop();
    
    if (filename.includes('order')) {
        return 'order';
    } else if (filename.includes('cost')) {
        return 'cost';
    } else if (filename.includes('salary')) {
        return 'salary';
    } else if (filename.includes('analysis')) {
        return 'analysis';
    } else if (filename.includes('data-management')) {
        return 'data-management';
    } else if (filename.includes('user')) {
        return 'user';
    } else if (filename.includes('index') || pathname.endsWith('/')) {
        return 'dashboard';
    } else if (filename.includes('profile')) {
        return 'profile';
    } else if (filename.includes('guide')) {
        return 'guide';
    } else if (filename.includes('login')) {
        return 'login';
    }
    
    return 'unknown';
}

/**
 * 订单页面权限控制
 */
function applyOrderPagePermissions() {
    const canEditOrders = hasPermission('edit_orders');
    const canCreateOrders = hasPermission('create_orders');
    
    // 控制编辑按钮
    document.querySelectorAll('.order-edit-btn, .edit-order-btn').forEach(btn => {
        btn.style.display = canEditOrders ? '' : 'none';
    });
    
    // 控制创建按钮
    document.querySelectorAll('#addOrderBtn, .add-order-btn').forEach(btn => {
        btn.style.display = canCreateOrders ? '' : 'none';
    });
}

/**
 * 成本页面权限控制
 */
function applyCostPagePermissions() {
    const canManageCosts = hasPermission('manage_costs');
    
    if (!canManageCosts) {
        // 隐藏编辑和删除按钮
        document.querySelectorAll('.cost-edit-btn, .cost-delete-btn').forEach(btn => {
            btn.style.display = 'none';
        });
        
        // 禁用编辑表单
        document.querySelectorAll('#costForm input, #costForm select, #costForm textarea').forEach(input => {
            input.disabled = true;
        });
        
        // 隐藏提交按钮
        document.querySelectorAll('#saveCostBtn, #addCostBtn').forEach(btn => {
            btn.style.display = 'none';
        });
    }
}

/**
 * 薪资页面权限控制
 */
function applySalaryPagePermissions() {
    const canManageSalaries = hasPermission('manage_salaries');
    
    if (!canManageSalaries) {
        // 隐藏编辑和删除按钮
        document.querySelectorAll('.salary-edit-btn, .salary-delete-btn').forEach(btn => {
            btn.style.display = 'none';
        });
        
        // 禁用编辑表单
        document.querySelectorAll('#salaryForm input, #salaryForm select').forEach(input => {
            input.disabled = true;
        });
        
        // 隐藏提交按钮
        document.querySelectorAll('#saveSalaryBtn, #addSalaryBtn').forEach(btn => {
            btn.style.display = 'none';
        });
    }
}

/**
 * 分析页面权限控制
 */
function applyAnalysisPagePermissions() {
    const canViewAnalysis = hasPermission('view_analysis');
    
    if (!canViewAnalysis) {
        // 显示权限不足提示
        showPermissionDeniedMessage('经营分析');
    }
}

/**
 * 数据管理页面权限控制
 */
function applyDataManagementPagePermissions() {
    const canManageData = hasPermission('manage_data');
    
    if (!canManageData) {
        // 显示权限不足提示
        showPermissionDeniedMessage('数据管理');
    }
}

/**
 * 用户管理页面权限控制
 */
function applyUserPagePermissions() {
    const canManageUsers = hasPermission('manage_users');
    
    if (!canManageUsers) {
        // 显示权限不足提示
        showPermissionDeniedMessage('用户管理');
    }
}

/**
 * 显示权限不足提示
 * @param {string} moduleName 模块名称
 */
function showPermissionDeniedMessage(moduleName) {
    // 创建提示元素
    const container = document.createElement('div');
    container.className = 'container mt-5';
    container.innerHTML = `
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header bg-danger text-white">
                        <i class="fas fa-exclamation-triangle me-2"></i>权限不足
                    </div>
                    <div class="card-body text-center py-5">
                        <h4 class="mb-4">您没有访问【${moduleName}】模块的权限</h4>
                        <p class="mb-4">请联系系统管理员获取相应权限，或返回首页查看您可访问的功能。</p>
                        <a href="index.html" class="btn btn-primary">
                            <i class="fas fa-home me-2"></i>返回首页
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 清空并添加到页面
    document.body.innerHTML = '';
    document.body.appendChild(container);
}

/**
 * 路由保护 - 检查当前页面是否有权限访问
 * 这个函数应该在页面加载时立即调用
 */
function protectRoute() {
    // 如果是登录页面，不进行路由保护
    if (window.isLoginPage) {
        console.log('登录页面，跳过路由保护');
        return;
    }
    
    // 确保已初始化
    if (!permissionState.initialized) {
        initPermissions();
    }
    
    // 获取当前页面
    const currentPage = getCurrentPage();
    console.log('保护路由:', currentPage);
    
    // 登录页面无需权限
    if (currentPage === 'login') {
        return;
    }
    
    // 如果没有用户信息，重定向到登录页面
    if (!permissionState.currentUser) {
        redirectToLogin();
        return;
    }
    
    // 管理员拥有所有页面的访问权限
    if (isAdmin()) {
        return;
    }
    
    // 检查特定页面权限
    let hasAccess = false;
    
    switch(currentPage) {
        case 'dashboard':
            hasAccess = hasPermission('view_dashboard');
            break;
        case 'order':
            hasAccess = hasPermission('view_orders');
            break;
        case 'cost':
            hasAccess = hasPermission('manage_costs');
            break;
        case 'salary':
            hasAccess = hasPermission('manage_salaries');
            break;
        case 'analysis':
            hasAccess = hasPermission('view_analysis');
            break;
        case 'data-management':
            hasAccess = hasPermission('manage_data');
            break;
        case 'user':
            hasAccess = hasPermission('manage_users');
            break;
        case 'profile':
            hasAccess = hasPermission('view_personal_profile');
            break;
        case 'guide':
            hasAccess = hasPermission('view_guide');
            break;
        default:
            hasAccess = false;
    }
    
    // 如果没有访问权限，重定向或显示权限不足
    if (!hasAccess) {
        // 对于敏感页面直接重定向到首页
        if (['cost', 'salary', 'analysis', 'data-management', 'user'].includes(currentPage)) {
            window.location.href = 'index.html';
        } else {
            // 在页面显示权限不足提示
            showPermissionDeniedMessage(getModuleName(currentPage));
        }
    }
}

/**
 * 根据页面类型获取模块名称
 * @param {string} pageType 页面类型
 * @returns {string} 模块名称
 */
function getModuleName(pageType) {
    const moduleNames = {
        'order': '订单管理',
        'cost': '成本管理',
        'salary': '工资录入',
        'analysis': '经营分析',
        'data-management': '数据管理',
        'user': '用户管理',
        'profile': '个人设置',
        'guide': '使用指南',
        'dashboard': '系统首页'
    };
    
    return moduleNames[pageType] || '未知模块';
}

/**
 * 重定向到登录页面
 */
function redirectToLogin() {
    // 防止重定向循环
    if (window.location.href.includes('login.html')) {
        console.log('已在登录页面，跳过重定向');
        return;
    }
    
    // 将当前URL保存到会话存储，便于登录后返回
    const currentUrl = window.location.href;
    if (!currentUrl.includes('login.html')) {
        sessionStorage.setItem('redirectAfterLogin', currentUrl);
    }
    
    // 重定向到登录页面
    window.location.href = 'login.html';
}

/**
 * 登出系统
 */
function logout() {
    // 清除本地存储的身份信息
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    
    // 清除会话存储中的信息
    sessionStorage.clear();
    
    // 重定向到登录页面
    window.location.href = 'login.html';
}

// 将关键函数导出到全局window对象
window.isAdmin = isAdmin;
window.hasPermission = hasPermission;
window.initPermissions = initPermissions;
window.logout = logout;

// 创建权限系统对象并导出到window
window.permissionSystem = {
    init: initPermissions,
    hasPermission: hasPermission,
    isAdmin: isAdmin,
    logout: logout
};

// 在页面加载完成后自动初始化权限系统
document.addEventListener('DOMContentLoaded', function() {
    // 如果是登录页面，不执行路由保护
    if (window.isLoginPage) {
        console.log('登录页面，跳过权限检查');
        return;
    }
    
    // 保护路由
    protectRoute();
}); 