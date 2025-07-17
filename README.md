# 🌐 OpenVPN Web UI 管理界面

这是一个基于 Node.js 和 Shell 的 OpenVPN 用户管理系统，提供图形化界面用于：
<img width="1414" height="907" alt="image" src="https://github.com/user-attachments/assets/2fc70356-14f6-45d6-a768-46d6b9bab80b" />

* 添加 & 吊销用户
* 一键生成 .ovpn 和 .p12 文件
* 实时查看连接用户和流量
* 一键下线功能
## 📆 安装前提
  * 已安装openvpn,或使用本项目中脚本安装
  * 已安装nodejs 18 以上环境,或使用以下命令安装
```
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```
  * 本项目默认安装路径为opt目录下，git 下本项目后请将openvpn 目录移动到opt目录下
```
mv openvpn /opt
```

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
    Description=OpenVPN WebUI 后台服务
    After=network.target
    
    [Service]
    Type=simple
    ExecStart=/usr/bin/node /opt/openvpn/app.js
    WorkingDirectory=/opt/openvpn
    Restart=always
    RestartSec=5
    User=root
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
* 此项目中ubuntu-22.04-lts-vpn-server.sh脚本来自 https://github.com/angristan/openvpn-install 项目；但是在此基础上做了优化便于管理平台调用和功能增加

