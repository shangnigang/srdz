# 尚荣定制管理系统 - 生产环境部署指南

本文档详细介绍如何将尚荣定制管理系统从本地开发环境部署到生产服务器环境。

## 一、准备工作

### 1. 服务器要求

- 操作系统：推荐使用 Ubuntu 20.04 LTS 或更高版本
- CPU：至少2核心 
- 内存：至少4GB
- 硬盘：至少50GB SSD
- 网络：公网IP，域名(可选)

### 2. 所需软件

- Node.js (v14.x 或更高版本)
- MongoDB (v4.4 或更高版本)
- Nginx (最新稳定版)
- PM2 (进程管理工具)
- SSL证书 (推荐使用Let's Encrypt)

## 二、服务器环境搭建

### 1. 安装Node.js和npm

```bash
# 更新系统软件包
sudo apt update && sudo apt upgrade -y

# 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node -v  # 应显示v16.x.x
npm -v   # 应显示7.x.x或更高
```

### 2. 安装MongoDB

```bash
# 导入MongoDB公钥
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -

# 添加MongoDB源
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list

# 更新软件包列表
sudo apt-get update

# 安装MongoDB
sudo apt-get install -y mongodb-org

# 启动MongoDB并设置开机自启
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 3. 安装Nginx

```bash
# 安装Nginx
sudo apt install nginx -y

# 启动Nginx并设置开机自启
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 4. 安装PM2

```bash
# 全局安装PM2
sudo npm install -g pm2
```

## 三、应用部署

### 1. 部署后端服务

```bash
# 创建应用目录
sudo mkdir -p /var/www/shangrong
sudo chown -R $USER:$USER /var/www/shangrong

# 将后端代码复制到服务器
# (假设使用scp或其他方式已经上传到服务器)
cd /path/to/uploaded/code
cp -r . /var/www/shangrong

# 安装依赖
cd /var/www/shangrong/server
npm install --production

# 创建日志目录
mkdir -p logs
```

### 2. 配置环境变量

```bash
# 复制生产环境配置
cp .env.production .env

# 编辑环境变量文件，设置必要的参数
nano .env
```

### 3. 使用PM2启动应用

```bash
# 使用PM2配置文件启动应用
pm2 start ecosystem.config.js --env production

# 设置PM2开机自启
pm2 startup
pm2 save
```

### 4. 配置Nginx

```bash
# 复制Nginx配置
sudo cp /var/www/shangrong/nginx.conf /etc/nginx/sites-available/shangrong.conf

# 创建符号链接以启用站点
sudo ln -s /etc/nginx/sites-available/shangrong.conf /etc/nginx/sites-enabled/

# 测试Nginx配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

### 5. 配置SSL证书 (使用Let's Encrypt)

```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取并安装SSL证书
sudo certbot --nginx -d www.shangrong.com
```

## 四、数据库配置

### 1. 创建数据库用户

```bash
# 登录MongoDB
mongo

# 切换到管理数据库
use admin

# 创建管理员用户
db.createUser({
  user: "admin",
  pwd: "安全的密码", // 替换为安全密码
  roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
})

# 切换到应用数据库
use shangrong

# 创建应用用户
db.createUser({
  user: "shangrong_app",
  pwd: "应用密码", // 替换为应用密码
  roles: [ { role: "readWrite", db: "shangrong" } ]
})

# 退出
exit
```

### 2. 启用MongoDB认证

```bash
# 编辑MongoDB配置
sudo nano /etc/mongod.conf

# 添加或修改以下内容
security:
  authorization: enabled

# 重启MongoDB
sudo systemctl restart mongod
```

### 3. 更新环境变量中的数据库连接URI

```bash
# 编辑环境变量文件
nano /var/www/shangrong/server/.env

# 修改MongoDB URI为
MONGODB_URI=mongodb://shangrong_app:应用密码@localhost:27017/shangrong
```

## 五、防火墙配置

```bash
# 安装UFW
sudo apt install ufw

# 允许SSH连接
sudo ufw allow ssh

# 允许HTTP和HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 启用防火墙
sudo ufw enable
```

## 六、应用维护

### 1. 监控应用

```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs
```

### 2. 更新应用

```bash
# 进入应用目录
cd /var/www/shangrong

# 获取更新的代码(假设使用Git)
git pull

# 安装依赖
cd server
npm install --production

# 重启应用
pm2 restart all
```

### 3. 备份数据库

```bash
# 创建备份目录
mkdir -p /backup/mongodb

# 备份数据库
mongodump --authenticationDatabase admin --username shangrong_app --password "应用密码" --db shangrong --out /backup/mongodb/$(date +"%Y-%m-%d")

# 设置定时备份（每天凌晨3点）
crontab -e
# 添加以下行
0 3 * * * mongodump --authenticationDatabase admin --username shangrong_app --password "应用密码" --db shangrong --out /backup/mongodb/$(date +"\%Y-\%m-\%d")
```

## 七、故障排除

### 1. 应用无法启动

- 检查日志: `pm2 logs`
- 检查环境变量: `cat .env`
- 检查MongoDB连接: `mongo mongodb://shangrong_app:应用密码@localhost:27017/shangrong`

### 2. 网站无法访问

- 检查Nginx状态: `sudo systemctl status nginx`
- 检查Nginx错误日志: `sudo cat /var/log/nginx/error.log`
- 检查防火墙设置: `sudo ufw status`

### 3. 性能问题

- 检查服务器资源: `top` 或 `htop`
- 检查MongoDB性能: `mongostat`
- 检查PM2状态: `pm2 monit`

## 八、安全建议

1. 定期更新服务器操作系统和软件包
2. 使用强密码并定期更换
3. 限制SSH访问，最好使用密钥认证
4. 配置防火墙，只开放必要端口
5. 定期备份数据库和应用代码
6. 设置日志监控和安全警报
7. 使用HTTPS并保持SSL证书更新

如有更多部署问题，请联系技术支持团队。 