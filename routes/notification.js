'use strict';

var express = require('express');
var gcm = require('node-gcm');
var config = require('../config');

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

  console.log(req);

  var message = new gcm.Message({
    collapseKey: 'demo',
    priority: 'high',
    // contentAvailable: true,
    // delayWhileIdle: true,
    timeToLive: 120,
    // restrictedPackageName: 'occddjchaiphpammejlkfmppjpkcjdhb',
    // dryRun: true,
    data: {
      order: req.body.order,
      webhook_topic: req.headers.x-wc-webhook-topic,
      webhook_resource: req.headers.x-wc-webhook-resource,
      webhook_event: req.headers.x-wc-webhook-event,
      webhook_signature: req.headers.x-wc-webhook-signature,
      webhook_id: req.headers.x-wc-webhook-id,
      webhook_delivery_id: req.headers.x-wc-delivery-id
    }
  });

  // Add the registration tokens of the devices you want to send to
  var regTokens = [req.params.token];

  // Set up the sender with you API key
  var sender = new gcm.Sender(config.gcm_server_key);

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
