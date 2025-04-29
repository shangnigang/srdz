// 用户权限控制脚本
// 实现根据用户角色限制功能访问

// 全局标志，用于标记是否已经启用管理员权限
window.adminPermissionsEnabled = false;

// 定义各角色的默认权限
const DEFAULT_PERMISSIONS = {
    // 管理员拥有所有权限
    admin: {
        orderManagement: { view: true, add: true, edit: true, delete: true },
        salaryEntry: { view: true, add: true, edit: true },
        costManagement: { view: true, edit: true },
        analysis: { view: true },
        dataManagement: { backup: true, restore: true, check: true }
    },
    // 销售人员有限权限
    sales: {
        orderManagement: { view: true, add: true, edit: true, delete: false },
        salaryEntry: { view: true, add: true, edit: false },
        costManagement: { view: false, edit: false },
        analysis: { view: false },
        dataManagement: { backup: false, restore: false, check: false }
    },
    // 普通用户最低权限
    user: {
        orderManagement: { view: true, add: false, edit: false, delete: false },
        salaryEntry: { view: true, add: false, edit: false },
        costManagement: { view: false, edit: false },
        analysis: { view: false },
        dataManagement: { backup: false, restore: false, check: false }
    }
};

// 检查认证Token是否有效
function isTokenValid() {
    // 检查Token是否存在
    const authToken = localStorage.getItem('auth_token');
    if (!authToken) {
        return false;
    }
    
    // 检查Token是否过期
    const tokenExpiry = localStorage.getItem('token_expiry');
    if (tokenExpiry && new Date(tokenExpiry) < new Date()) {
        console.log('认证令牌已过期');
        return false;
    }
    
    // 检查是否有用户信息
    const userInfoStr = localStorage.getItem('user_info');
    if (!userInfoStr) {
        return false;
    }
    
    try {
        // 尝试解析用户信息
        const userInfo = JSON.parse(userInfoStr);
        if (!userInfo.username) {
            return false;
        }
        
        // 简单验证Token的有效性
        return authToken.includes(userInfo.username);
    } catch (e) {
        console.error('解析用户信息失败:', e);
        return false;
    }
}

// 检查用户是否已登录
window.isUserLoggedIn = function() {
    // 优先检查admin权限覆盖
    if (window._adminEmergencyOverride || window.adminPermissionsEnabled || window.isAdmin) {
        return true;
    }
    
    // 检查Token是否有效
    return isTokenValid();
};

// 获取当前用户信息
function getCurrentUser() {
    // 优先检查管理员紧急覆盖标志
    if (window._adminEmergencyOverride || window.adminPermissionsEnabled || window.isAdmin) {
        // 返回管理员信息
        return { username: 'admin', role: 'admin' };
    }

    // 检查Token是否有效
    if (!isTokenValid()) {
        console.warn('认证令牌无效，可能未登录或会话已过期');
        // 清除本地存储的登录信息
        localStorage.removeItem('user_info');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('token_expiry');
        return null;
    }

    const userInfoStr = localStorage.getItem('user_info');
    try {
        return JSON.parse(userInfoStr);
    } catch (e) {
        console.error('解析用户信息失败:', e);
        return null;
    }
}

// 获取用户角色
function getUserRole(userInfo) {
    // 检查紧急覆盖
    if (window._adminEmergencyOverride || window.adminPermissionsEnabled || window.isAdmin) {
        return 'admin';
    }

    if (!userInfo) return 'user'; // 默认最低权限
    
    // 根据角色字段返回角色，默认为普通用户
    return userInfo.role || 'user';
}

// 获取用户权限
function getUserPermissions(username, role) {
    // 对管理员用户强制返回完全权限
    if (window._adminEmergencyOverride || window.adminPermissionsEnabled || window.isAdmin || role === 'admin') {
        return DEFAULT_PERMISSIONS.admin;
    }

    // 先检查是否有保存的用户特定权限
    const savedPermissions = localStorage.getItem(`user_permissions_${username}`);
    if (savedPermissions) {
        try {
            return JSON.parse(savedPermissions);
        } catch (e) {
            console.error(`解析用户 ${username} 的权限设置失败:`, e);
        }
    }
    
    // 如果没有特定保存的权限，返回角色默认权限
    return DEFAULT_PERMISSIONS[role] || DEFAULT_PERMISSIONS.user;
}

// 检查当前页面是否允许当前用户访问
function checkPageAccess() {
    console.log('[权限检查] 开始检查页面访问权限...');

    // 检查紧急覆盖
    if (window._adminEmergencyOverride || window.adminPermissionsEnabled || window.isAdmin) {
        console.log('[权限检查] 检测到管理员权限覆盖，允许访问所有页面');
        window.adminPermissionsEnabled = true; // 确保管理员标记被设置
        window.isAdmin = true;
        return true;
    }

    // 获取当前页面名称
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // 首页和登录页允许所有用户访问
    if (currentPage === 'index.html' || currentPage === 'login.html' || currentPage === '') {
        return true;
    }
    
    // 获取当前用户信息
    const userInfo = getCurrentUser();
    if (!userInfo) {
        // 未登录时重定向到登录页
        window.location.href = 'login.html';
        return false;
    }
    
    // 获取用户角色
    const role = getUserRole(userInfo);
    
    // 管理员可以访问所有页面
    if (role === 'admin') {
        // 设置全局管理员权限标志
        window.adminPermissionsEnabled = true;
        window.isAdmin = true;
        console.log('[权限检查] 管理员权限已全局启用');
        return true;
    }
    
    // 获取用户权限
    const permissions = getUserPermissions(userInfo.username, role);
    
    // 根据页面名称检查权限
    let hasAccess = false;
    
    if (currentPage.includes('order') && permissions.orderManagement.view) {
        hasAccess = true;
    } else if (currentPage.includes('salary') && permissions.salaryEntry.view) {
        hasAccess = true;
    } else if (currentPage.includes('cost') && permissions.costManagement.view) {
        hasAccess = true;
    } else if (currentPage.includes('analysis') && permissions.analysis.view) {
        hasAccess = true;
    } else if (currentPage.includes('data-management') && (permissions.dataManagement.backup || permissions.dataManagement.restore || permissions.dataManagement.check)) {
        hasAccess = true;
    } else if (currentPage === 'profile.html') {
        // 个人设置页面所有用户都可访问
        hasAccess = true;
    } else if (currentPage === 'guide.html') {
        // 使用指南所有用户都可访问
        hasAccess = true;
    }
    
    if (!hasAccess) {
        console.log('[权限检查] 用户无权访问此页面');
        alert('您没有访问此页面的权限');
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

// 总是允许管理员访问的函数 - 用于外部调用
window.hasPermission = function(permission, module) {
    if (window._adminEmergencyOverride || window.adminPermissionsEnabled || window.isAdmin) {
        return true;
    }
    
    const userInfo = getCurrentUser();
    if (!userInfo) return false;
    
    const role = getUserRole(userInfo);
    if (role === 'admin') {
        window.adminPermissionsEnabled = true;
        window.isAdmin = true;
        return true;
    }
    
    const permissions = getUserPermissions(userInfo.username, role);
    return permissions[module] && permissions[module][permission];
};

// 页面加载时执行访问控制检查
document.addEventListener('DOMContentLoaded', function() {
    console.log('[权限检查] 执行用户权限检查...');
    
    // 首先检查紧急覆盖是否已启用
    if (window._adminEmergencyOverride || window.adminPermissionsEnabled || window.isAdmin) {
        console.log('[权限检查] 检测到管理员权限覆盖已启用，跳过权限检查');
        return;
    }
    
    try {
        // 首先检查当前用户是否为管理员
        const userInfo = getCurrentUser();
        if (userInfo && userInfo.role === 'admin') {
            console.log('[权限检查] 检测到管理员用户，设置权限覆盖');
            window.adminPermissionsEnabled = true;
            window.isAdmin = true;
            return;
        }
    } catch (e) {
        console.error('[权限检查] 检查管理员状态出错:', e);
    }
    
    // 检查页面访问权限
    if (!checkPageAccess()) {
        return;
    }
    
    // 添加延迟处理，确保所有DOM元素都已加载完成
    setTimeout(function() {
        // 禁用无权限的功能按钮
        disableUnauthorizedButtons();
        
        // 对于管理员，再次确保所有功能都可用
        const userInfo = getCurrentUser();
        if (userInfo && (getUserRole(userInfo) === 'admin' || window.adminPermissionsEnabled || window.isAdmin)) {
            console.log('[权限检查] 确保管理员权限已完全应用...');
            enableAllButtons();
        }
        
        // 针对特定页面的权限处理
        handleSpecificPagePermissions();
    }, 500);
    
    // 再次检查权限，处理动态加载的元素
    setTimeout(function() {
        // 对于管理员，确保权限正确应用
        const userInfo = getCurrentUser();
        if (userInfo && (getUserRole(userInfo) === 'admin' || window.adminPermissionsEnabled || window.isAdmin)) {
            enableAllButtons();
        }
    }, 1500);
});

// 处理特定页面的权限问题
function handleSpecificPagePermissions() {
    // 获取当前页面名称
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // 检查是否为管理员
    const userInfo = getCurrentUser();
    const isAdmin = userInfo && (getUserRole(userInfo) === 'admin' || window.adminPermissionsEnabled || window.isAdmin);
    
    if (!isAdmin) return; // 非管理员不需要特殊处理
    
    console.log('[权限检查] 对页面应用管理员特殊权限处理:', currentPage);
    
    // 特定页面处理
    if (currentPage.includes('cost')) {
        // 成本管理页面
        enableButtons('input[name="cost"]');
        enableButtons('textarea[name="cost"]');
        enableButtons('button[type="submit"]');
        enableButtons('.cost-control button');
        enableButtons('#addCostBtn, #addNewCostBtn, .cost-edit-btn, .cost-delete-btn');
    }
    else if (currentPage.includes('data-management')) {
        // 数据管理页面
        enableButtons('.data-operation button');
        enableButtons('[onclick^="deleteUser"]');
        enableButtons('[onclick^="viewPermissions"]');
        enableButtons('#backupDataBtn, #restoreDataBtn, #checkDataBtn');
    }
    else if (currentPage.includes('analysis')) {
        // 经营分析页面
        enableButtons('.analysis-control button');
        enableButtons('.chart-control button');
        enableButtons('.submodule-btn, #applyAnalysisFilter, #resetAnalysisFilter');
    }
    else if (currentPage.includes('salary')) {
        // 薪资管理页面
        enableButtons('#addSalaryBtn, #addNewSalaryBtn, .salary-edit-btn, .salary-delete-btn');
        enableButtons('input[name="salary"]');
        enableButtons('select[name="salary"]');
    }
}

// 禁用无权限按钮
function disableUnauthorizedButtons() {
    // 获取当前用户信息
    const userInfo = getCurrentUser();
    if (!userInfo) return;
    
    // 获取用户角色和权限
    const role = getUserRole(userInfo);
    
    // 如果是管理员或已设置管理员权限标志，启用所有按钮
    if (role === 'admin' || window.adminPermissionsEnabled === true || window.isAdmin) {
        console.log('[权限检查] 当前用户是管理员，拥有所有权限');
        // 确保管理员有所有按钮权限（解除可能被误禁用的按钮）
        enableAllButtons();
        return; // 管理员有所有权限，无需继续检查
    }
    
    const permissions = getUserPermissions(userInfo.username, role);
    console.log('[权限检查] 当前用户权限:', JSON.stringify(permissions));
    
    // 禁用订单管理功能
    if (!permissions.orderManagement.add) {
        disableButtons('[data-action="add-order"]');
    }
    
    if (!permissions.orderManagement.edit) {
        disableButtons('[data-action="edit-order"]');
    }
    
    if (!permissions.orderManagement.delete) {
        disableButtons('[data-action="delete-order"]');
    }
    
    // 禁用成本管理功能
    if (!permissions.costManagement.edit) {
        disableButtons('[data-action="edit-cost"]');
        disableButtons('input[name="cost"], textarea[name="cost"]');
    }
    
    // 禁用薪资管理功能
    if (!permissions.salaryEntry.add) {
        disableButtons('[data-action="add-salary"]');
    }
    
    if (!permissions.salaryEntry.edit) {
        disableButtons('[data-action="edit-salary"]');
    }
    
    // 禁用数据管理功能
    if (!permissions.dataManagement.backup) {
        disableButtons('[data-action="backup-data"]');
    }
    
    if (!permissions.dataManagement.restore) {
        disableButtons('[data-action="restore-data"]');
    }
}

// 启用所有按钮
function enableAllButtons() {
    console.log('[权限检查] 启用所有功能按钮');
    
    // 启用所有可能被禁用的元素
    document.querySelectorAll('button:disabled, input:disabled, textarea:disabled, select:disabled, a.disabled, [data-bs-toggle].disabled, .btn.disabled, .nav-link.disabled, .dropdown-item.disabled').forEach(el => {
        el.disabled = false;
        el.classList.remove('disabled');
        
        // 恢复点击事件
        el.removeEventListener('click', preventClick);
        
        // 恢复样式
        el.style.pointerEvents = '';
        el.style.opacity = '';
        
        // 移除aria属性
        if (el.getAttribute('aria-disabled') === 'true') {
            el.setAttribute('aria-disabled', 'false');
        }
    });
}

// 启用特定按钮
function enableButtons(selector) {
    try {
        document.querySelectorAll(selector).forEach(el => {
            el.disabled = false;
            el.classList.remove('disabled');
            
            // 恢复点击事件
            el.removeEventListener('click', preventClick);
            
            // 恢复样式
            el.style.pointerEvents = '';
            el.style.opacity = '';
            
            // 移除aria属性
            if (el.getAttribute('aria-disabled') === 'true') {
                el.setAttribute('aria-disabled', 'false');
            }
        });
    } catch (e) {
        console.error('[权限检查] 启用按钮错误:', e);
    }
}

// 阻止点击事件的处理函数
function preventClick(e) {
    e.preventDefault();
    e.stopPropagation();
    alert('您没有权限执行此操作');
    return false;
}

// 禁用特定按钮
function disableButtons(selector) {
    try {
        document.querySelectorAll(selector).forEach(el => {
            el.disabled = true;
            el.classList.add('disabled');
            
            // 添加点击事件阻止函数
            el.addEventListener('click', preventClick);
            
            // 通过CSS样式强化禁用状态
            el.style.pointerEvents = 'none';
            el.style.opacity = '0.5';
            
            // 添加aria属性
            el.setAttribute('aria-disabled', 'true');
        });
    } catch (e) {
        console.error('[权限检查] 禁用按钮错误:', e);
    }
} 