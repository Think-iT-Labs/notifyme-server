var https = require('https');

module.exports = {
  send: function (messageData, cb) {
    messageData.access_token = sails.config.parameters.pageAccessToken;
    var data = JSON.stringify(messageData);
    var options = {
      hostname: 'graph.facebook.com',
      port: 443,
      path: '/' + sails.config.parameters.fbApiVersion + '/me/messages',
      qs: { access_token: sails.config.parameters.pageAccessToken },
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(data)
      }
    };
    var req = https.request(options, function (res) {
      var body = '';
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        body += chunk;
      });
      res.on('end', function () {
        var message = JSON.parse(body);
        if (!message)
          return cb('error while parsing json response, response was : ' + body, null);
        if (message.error)
          return cb(message, null);
        return cb(null, message);
      });
    });
    req.on('error', function (err) {
      return sails.log.error(err);
    });
    req.write(data);
    req.end();
  },
  typingOn: function (recipientId, done) {
    var messageData = {
      recipient: {
        id: recipientId
      },
      sender_action: "typing_on"
    };
    this.send(messageData, done);
  },
  typingOff: function (user, done) {
    var messageData = {
      recipient: {
        id: user.fbId
      },
      sender_action: "typing_off"
    };
    this.send(messageData, done);
  },
  reportError: function (user, err, done) {
    var messageData = {
      recipient: {
        id: user.fbId
      },
      message: {
        text: "Ooops, Something went wrong :( , this accident was reported!\nplease try again later."
      }
    };
    this.send(messageData, done);
    if (sails.config.parameters.sendErrorsTo) {
      var messageDataAdmin = {
        recipient: {
          id: sails.config.parameters.sendErrorsTo
        },
        message: {
          text: JSON.stringify(err)
        }
      };
      this.send(messageDataAdmin, done);
    }
  },
  unreconizedCall: function(user, type, value, done){
    var messageData = {
      recipient: {
        id: user.fbId
      },
      message: {
        text: "Ooops, I was not built to understand this."
      }
    };
    this.send(messageData, done);
    if (sails.config.parameters.sendErrorsTo) {
      var messageDataAdmin = {
        recipient: {
          id: sails.config.parameters.sendErrorsTo
        },
        message: {
          text: "Recieved unkown `" + type + "`: " + value
        }
      };
      this.send(messageDataAdmin, done);
    }
  },
  welcome: function (user, done) {
    var messageData = {
      recipient: {
        id: user.fbId
      },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "button",
            text: sails.config.parameters.helloMessage || "Hello, and welcome",
            buttons: [{
              type: "postback",
              title: "Start",
              payload: "code"
            }]
          }
        }
      }
    };
    this.send(messageData, done);
  },
  notifySuccess: function (user, cmd, log, done) {
    var messageData = {
      recipient: {
        id: user.fbId
      },
      message: {
        text: message + "\n" + log
      }
    };
    this.send(messageData, done);
  },
  notifyFailure: function (user, cmd, log, done) {
    var messageData = {
      recipient: {
        id: user.fbId
      },
      message: {
        text: message + "\n" + log
      }
    };
    this.send(messageData, done);
  },
  sendCode: function(user, done) {
    var messageData = {
      recipient: {
        id: user.fbId
      },
      message: {
        text: "your token is:\n" + user.userToken
      }
    };
    this.send(messageData, done);
  },
  help: function(user, done) {
    var messageData = {
      recipient: {
        id: user.fbId
      },
      message: {
        text: "I do not quite understand you"
      }
    };
    this.send(messageData, done);
  }
}