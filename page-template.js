/**
 * 尚荣定制管理系统 - 页面模板脚本
 * 
 * 此文件提供页面初始化和权限检查的功能，统一集成到系统中的各个页面
 * 使用此文件替代原来分散的权限控制代码
 */

// 初始化页面
function initPage() {
    // 确保权限系统已加载
    if (typeof permissionSystem === 'undefined') {
        console.error('权限系统未加载，请确保permissions.js已正确引入');
        return;
    }
    
    // 初始化权限系统
    permissionSystem.init();
    
    // 保护当前页面路由
    permissionSystem.protectRoute();
    
    // 加载侧边栏模板
    loadSidebar();
}

// 加载侧边栏
function loadSidebar() {
    // 检查是否存在侧边栏容器
    const sidebarContainer = document.getElementById('sidebar-container');
    if (!sidebarContainer) {
        console.error('未找到侧边栏容器元素，请确保页面包含id为sidebar-container的元素');
        return;
    }
    
    // 加载侧边栏模板
    fetch('header-template.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('无法加载侧边栏模板');
            }
            return response.text();
        })
        .then(html => {
            sidebarContainer.innerHTML = html;
            
            // 初始化页面头部
            if (typeof initPageHeader === 'function') {
                initPageHeader();
            } else {
                console.warn('未找到initPageHeader函数，侧边栏功能可能不完整');
            }
        })
        .catch(error => {
            console.error('加载侧边栏模板失败:', error);
            
            // 显示一个简单的后备侧边栏
            sidebarContainer.innerHTML = `
                <aside class="sidebar">
                    <div class="sidebar-header">
                        <div class="d-flex align-items-center">
                            <i class="fas fa-tshirt fa-2x me-2"></i>
                            <h5 class="mb-0">尚荣定制管理系统</h5>
                        </div>
                    </div>
                    <ul class="sidebar-menu">
                        <li class="sidebar-item"><a href="index.html" class="sidebar-link"><i class="fas fa-home"></i> <span>首页</span></a></li>
                        <li class="sidebar-item"><a href="order.html" class="sidebar-link"><i class="fas fa-clipboard-list"></i> <span>订单管理</span></a></li>
                    </ul>
                    <div class="sidebar-user mt-auto">
                        <button class="btn btn-outline-light btn-sm w-100" onclick="logout()">
                            <i class="fas fa-sign-out-alt me-2"></i>退出登录
                        </button>
                    </div>
                </aside>
            `;
        });
}

// 检查权限并应用到界面元素
function applyPermissionsToElements() {
    // 处理有权限要求的元素
    document.querySelectorAll('[data-permission]').forEach(element => {
        const permission = element.getAttribute('data-permission');
        if (!window.hasPermission(permission)) {
            // 不显示没有权限的元素
            element.style.display = 'none';
        }
    });
}

// 在DOM加载完成后自动初始化页面
document.addEventListener('DOMContentLoaded', function() {
    initPage();
    
    // 检查权限并应用到界面元素
    setTimeout(applyPermissionsToElements, 100);
}); 