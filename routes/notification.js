'use strict';

var express = require('express');
var gcm = require('node-gcm');
var router = express.Router();

router.all('/*', function(req, res, next) {
  // This will be called for request with any HTTP method
  if (req.path == '/') {
    res.send('no token path found');
  } else {
    next();
  }
});

router.param('token', function(req, res, next, token) {
  if (token) {
    // check to see if valid token then move along
    console.log('token param was detected: ', token);
    next();
  } else {
    // respond with token not found
    res.send('no token found');
  }
});

// POST method route
router.post('/:token', function (req, res) {
  if (!req.body) return res.sendStatus(400);

  var message = new gcm.Message({
    collapseKey: 'demo',
    priority: 'high',
    // contentAvailable: true,
    // delayWhileIdle: true,
    timeToLive: 120,
    // restrictedPackageName: 'occddjchaiphpammejlkfmppjpkcjdhb',
    // dryRun: true,
    data: {
      order: req.body.order
    },
    notification: {
      title: "Hello, World",
      icon: "ic_launcher",
      body: "This is a notification that will be displayed ASAP."
    }
  });

  // Add the registration tokens of the devices you want to send to
  var regTokens = [req.params.token];

  // Set up the sender with you API key
  var sender = new gcm.Sender('');

  sender.send(message, { registrationIds: regTokens }, function (err, result) {
    if (err) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err
      });
    } else {
      res.send(result);
    }
  });
});

module.exports = router;