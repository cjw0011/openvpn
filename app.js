const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const vpnRoutes = require('./routes/vpn');
const app = express();
const PORT = 3000;

app.use(session({
  secret: 'openvpn-webui-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3600000 }
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(fileUpload());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === '123456') {
    req.session.authenticated = true;
    res.redirect('/');
  } else {
    res.render('login', { error: '用户名或密码错误' });
  }
});

app.use((req, res, next) => {
  if (req.session.authenticated) {
    next();
  } else {
    res.redirect('/login');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('退出登录出错:', err);
    }
    res.redirect('/login');
  });
});

app.use('/', vpnRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`OpenVPN WebUI 运行中`);
});
