/**
 * 自动初始化脚本
 * 用于设置本地用户数据，使权限系统能够正常工作
 */

(function() {
    // 默认用户数据 - 管理员账户
    const defaultUserData = {
        "id": "local_user",
        "username": "admin",
        "name": "管理员",
        "role": "admin",
        "shopId": "local_shop"
    };

    // 默认令牌
    const defaultToken = "local_dev_token_2023";

    // 检查是否是登录页面 - 登录页面不自动设置用户数据
    const isLoginPage = window.location.href.includes('login.html') || window.isLoginPage;
    
    if (isLoginPage) {
        console.log('登录页面，跳过自动初始化用户数据');
        return;
    }

    // 检查是否已有用户数据
    if (!localStorage.getItem('user_info')) {
        console.log('设置默认用户数据...');
        localStorage.setItem('user_info', JSON.stringify(defaultUserData));
    }

    // 检查是否已有认证令牌
    if (!localStorage.getItem('auth_token')) {
        console.log('设置默认认证令牌...');
        localStorage.setItem('auth_token', defaultToken);
    }

    console.log('自动初始化完成！');
    console.log('当前用户:', JSON.parse(localStorage.getItem('user_info')));
})(); 