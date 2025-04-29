/**
 * 身份验证检查脚本
 * 确保用户在访问系统页面前已经登录
 * 
 * 更新说明：
 * 1. 增强安全验证机制
 * 2. 添加token有效期检查
 * 3. 增加权限检查功能
 */

// 立即执行函数，避免变量污染全局作用域
(function() {
    // 获取当前页面路径
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // 不需要登录验证的页面白名单
    const whiteList = ['login.html'];
    
    // 如果当前页面在白名单中，不需要验证
    if (whiteList.includes(currentPage)) {
        console.log('当前页面不需要登录验证');
        return;
    }
    
    console.log('执行身份验证检查...');
    
    // 检查用户是否已登录
    const userInfoStr = localStorage.getItem('user_info');
    const authToken = localStorage.getItem('auth_token');
    
    // 检查Token有效期
    const tokenExpiry = localStorage.getItem('token_expiry');
    const isTokenExpired = tokenExpiry && new Date(tokenExpiry) < new Date();
    
    // 如果用户信息或认证令牌不存在，或令牌已过期，重定向到登录页面
    if (!userInfoStr || !authToken || isTokenExpired) {
        console.log('用户未登录或会话已过期，重定向到登录页面');
        // 清除所有登录信息
        localStorage.removeItem('user_info');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('token_expiry');
        
        // 保存当前页面URL，以便登录后可以返回
        sessionStorage.setItem('redirect_after_login', window.location.href);
        
        // 重定向到登录页面
        window.location.href = 'login.html';
        
        // 阻止页面继续加载
        document.body.innerHTML = '正在检查登录状态，请稍候...';
        return;
    }
    
    try {
        // 解析用户信息，确保格式正确
        const userInfo = JSON.parse(userInfoStr);
        if (!userInfo.username || !userInfo.role) {
            // 用户信息不完整，视为未登录
            console.log('用户信息不完整，重定向到登录页面');
            localStorage.removeItem('user_info');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('token_expiry');
            window.location.href = 'login.html';
            return;
        }
        
        // 验证Token的完整性
        if (!validateToken(authToken, userInfo.username)) {
            console.log('认证令牌无效，重定向到登录页面');
            localStorage.removeItem('user_info');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('token_expiry');
            window.location.href = 'login.html';
            return;
        }
        
        console.log('身份验证通过，用户:', userInfo.username);
        
        // 记录最后访问时间
        localStorage.setItem('last_login_time', new Date().toISOString());
        
        // 全局暴露登录状态
        window.isUserLoggedIn = function() {
            return true;
        };
        
        // 全局暴露当前用户角色检查
        window.hasRole = function(role) {
            try {
                const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
                return userInfo.role === role;
            } catch (e) {
                return false;
            }
        };
        
        // 全局暴露权限检查
        window.hasPermission = function(permission) {
            try {
                const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
                return userInfo.permissions && userInfo.permissions.includes(permission);
            } catch (e) {
                return false;
            }
        };
        
    } catch (e) {
        // 解析用户信息出错，视为未登录
        console.error('解析用户信息出错:', e);
        localStorage.removeItem('user_info');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('token_expiry');
        window.location.href = 'login.html';
        return;
    }
    
    // 简单的令牌验证函数（实际项目中可能需要更复杂的验证）
    function validateToken(token, username) {
        // 至少要确保token存在且包含用户名
        if (!token) return false;
        
        // 检查token是否包含用户名信息
        // 这里简化处理，实际项目中应使用更安全的验证方式
        return token.includes(username);
    }
})(); 