const path = require('path');
const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const Pusher = require('pusher');

const app = express();
const router = express.Router();

// Body parser middleware
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({secret: 'mano1234', saveUninitialized: true, resave: true}));

// Create an instance of Pusher
const pusher = new Pusher({
  appId: '1413466',
  key: '5fac8a3813e9263926e4',
  secret: '8622d38acc4badf7c023',
  cluster: 'ap1',
  encrypted: true,
});

router.get('/', (req, res) => {
  res.json({
    hello: 'hi!',
  });
});

router.post('/login', (req, res) => {
  req.session.username = req.body.username;
  req.session.save();
  return res.json(req.body.username);
});

router.get('/user', (req, res) => {
  const sessionUser = req.session.username;
  console.log('/user', req.session);
  return res.send(sessionUser);
});

router.post('/pusher/auth', (req, res) => {
  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;
  const presenceData = {
    user_id: req.session.username,
  };
  const auth = pusher.authenticate(socketId, channel, presenceData);
  return res.send(auth);
});

router.post('/send-message', (req, res) => {
  pusher.trigger('presence-groupChat', 'message_sent', {
    username: req.body.username,
    message: req.body.message,
  });
  return res.send('Message sent');
});

app.use(`/.netlify/functions/api`, router);

module.exports = app;
module.exports.handler = serverless(app);
