# 🌐 OpenVPN Web UI 管理界面

这是一个基于 Node.js 和 Shell 的 OpenVPN 用户管理系统，提供图形化界面用于：

* 添加 & 吊销用户
* 一键生成 .ovpn 和 .p12 文件
* 实时查看连接用户和流量
* 踩人下线功能

## 📆 安装依赖

```bash
npm install
```

## 🚀 启动服务

```bash
node app.js
```

默认端口：3000
访问地址：[http://服务器IP:3000](http://服务器IP:3000)

## 🔐 登录

默认用户：`admin`
默认密码：`123456`
（可在 `app.js` 中修改）

## 💠 开机自启配置

使用systemd新建启动服务，并设置开机自启动：

```bash
sudo nano /etc/systemd/system/openvpn-webui.service
    [Unit]
    Description=OpenVPN Web UI Service
    After=network.target
    
    [Service]
    Type=simple
    WorkingDirectory=/root/openvpn-webui
    ExecStart=/usr/bin/node app.js
    Restart=on-failure
    Environment=NODE_ENV=production
    
    [Install]
    WantedBy=multi-user.target

sudo systemctl daemon-reload
sudo systemctl enable openvpn-webui
sudo systemctl start openvpn-webui
```

## 📜 用户命令支持

使用优化后的脚本 `ubuntu-22.04-lts-vpn-server.sh` 可支持：

```bash
# 添加用户 + p12 密码
./ubuntu-22.04-lts-vpn-server.sh --new-client 用户名 p12密码

# 吊销用户
./ubuntu-22.04-lts-vpn-server.sh --revoke-client 用户名
```

## 🧰 注意事项

* 用户名仅允许：英文、数字、下划线、短横线
* 禁止中文或特殊符号（已在前端 + Node + Shell 三层校验）

