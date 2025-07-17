const express = require('express');
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');
const net = require('net');

const router = express.Router();
const SCRIPT_PATH = '/opt/openvpn/ubuntu-22.04-lts-vpn-server.sh';
const OVPN_DIR = '/opt/openvpn/clients';
const STATUS_FILE = '/var/log/openvpn/status.log';
const MGMT_HOST = '127.0.0.1';
const MGMT_PORT = 7505;

// 主页面：用户列表 + 在线状态
router.get('/', (req, res) => {
  const issuedDir = '/etc/openvpn/easy-rsa/pki/issued';
  let certs = [];
  let onlineUsers = [];

  if (fs.existsSync(issuedDir)) {
    certs = fs.readdirSync(issuedDir)
      .filter(f => f.endsWith('.crt'))
      .map(f => f.replace('.crt', ''))
      .filter(name => !name.startsWith('server_'));
  }

  if (fs.existsSync(STATUS_FILE)) {
    const content = fs.readFileSync(STATUS_FILE, 'utf-8');
    const lines = content.split('\n');

    const clientHeaderIndex = lines.findIndex(line => line.startsWith('Common Name'));
    const routingTableIndex = lines.findIndex(line => line.startsWith('ROUTING TABLE'));
    const globalStatsIndex = lines.findIndex(line => line.startsWith('GLOBAL STATS'));

    const clientLines = lines.slice(clientHeaderIndex + 1, routingTableIndex);
    const routingLines = lines.slice(routingTableIndex + 1, globalStatsIndex);

    const ipMap = {};
    routingLines.forEach(line => {
      const parts = line.split(',');
      if (parts.length >= 2) {
        ipMap[parts[1]] = parts[0]; // CommonName -> Virtual IP
      }
    });

    onlineUsers = clientLines.map(line => {
      const parts = line.split(',');
      const name = parts[0];
      return {
        name,
        realIP: parts[1],
        bytesReceived: Number(parts[2] || 0),
        bytesSent: Number(parts[3] || 0),
        connectedAt: parts[4],
        virtualIP: ipMap[name] || '未分配'
      };
    });
  }

  res.render('index', { certs, onlineUsers });
});

// 添加用户
router.post('/add', (req, res) => {
  const name = req.body.name;
  const password = req.body.p12password || '';
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
	  return res.status(400).send('用户名不合法，只允许英文、数字、下划线、短横线');
  }

  try {
    execSync(`${SCRIPT_PATH} --new-client ${name} '${password}'`, { stdio: 'inherit' });
    res.redirect('/');
  } catch (e) {
    res.send('添加失败: ' + e.message);
  }
});

// 吊销用户
router.post('/revoke', (req, res) => {
  const name = req.body.name;
  try {
    execSync(`${SCRIPT_PATH} --revoke-client ${name}`, { stdio: 'inherit' });
    res.redirect('/');
  } catch (e) {
    res.send('吊销失败: ' + e.message);
  }
});

// 踢人下线
router.post('/kick/:name', (req, res) => {
  const name = req.params.name;

  const client = new net.Socket();
  client.connect(MGMT_PORT, MGMT_HOST, () => {
    client.write(`kill ${name}\n`);
    setTimeout(() => {
      client.end();
      res.redirect('/');
    }, 300);
  });

  client.on('error', (err) => {
    console.error('管理端口连接失败:', err.message);
    res.status(500).send('❌ 踢人失败：OpenVPN 未开启 management 接口');
  });
});

// 下载文件
router.get('/download/:name/:type', (req, res) => {
  const { name, type } = req.params;
  const file = path.join(OVPN_DIR, `${name}.${type}`);
  if (fs.existsSync(file)) {
    res.download(file);
  } else {
    res.status(404).send('❌ 文件不存在: ' + file);
  }
});

module.exports = router;

