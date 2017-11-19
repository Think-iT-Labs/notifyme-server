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
  unreconizedCall: function (user, type, value, done) {
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
          text: "Recieved unkown *`" + type + "`*: " + value
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
        text: "Hello developer, my name is notifyMe :)\n\nI provide you with realtime notifications about command line you execute 8)\nTo be able to use me you need first to follow some few steps at " + sails.config.parameters.serverURL + "\n\nDo not forget to check the menu 👇 for additional actions",
        quick_replies: [
          {
            content_type: "text",
            title: "🔑 Get a Token",
            payload: "code"
          }
        ]
      }
    };
    this.send(messageData, done);
  },
  text: function (user, text, done) {
    var messageData = {
      recipient: {
        id: user.fbId
      },
      message: {
        text: text
      }
    };
    this.send(messageData, done);
  },
  notifySuccess: function (user, cli, done) {
    var imageUrl = sails.config.parameters.serverURL + '/images/success.png';
    var messageData = {
      recipient: {
        id: user.fbId
      },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: [{
              title: cli.cmd,
              image_url: imageUrl,
              subtitle: cli.logs,
              default_action: {
                type: "web_url",
                url: sails.config.parameters.serverURL + '/cli/' + cli.id,
                messenger_extensions: true,
                webview_height_ratio: "tall",
                fallback_url: sails.config.parameters.serverURL + '/cli/' + cli.id
              }
            }]
          }
        }
      }
    };
    this.send(messageData, done);
  },
  notifyFailure: function (user, cli, done) {
    var imageUrl = sails.config.parameters.serverURL + '/images/error.png';
    var messageData = {
      recipient: {
        id: user.fbId
      },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: [{
              title: cli.cmd,
              image_url: imageUrl,
              subtitle: cli.logs,
              default_action: {
                type: "web_url",
                url: sails.config.parameters.serverURL + '/cli/' + cli.id,
                messenger_extensions: true,
                webview_height_ratio: "tall",
                fallback_url: sails.config.parameters.serverURL + '/cli/' + cli.id
              }
            }]
          }
        }
      }
    };
    this.send(messageData, done);
  },
  sendCode: function (user, done) {
    var messageData = {
      recipient: {
        id: user.fbId
      },
      message: {
        text: "Your token is:\n" + user.userToken
      }
    };
    this.send(messageData, done);
  },
  help: function (user, done) {
    var that = this;
    var messageData = {
      recipient: {
        id: user.fbId
      },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "button",
            text: "To use me, you need to get notifyme CLI at " + sails.config.parameters.serverURL + "/downloads\n\nTo display your token you can type *`token`*\n\nTo get a new token please type *`generate`*\n\nOr use the menu 👇 bellow",
            buttons: [{
              type: "web_url",
              url: sails.config.parameters.serverURL + "/howto",
              title: "More",
              webview_height_ratio: "compact",
              webview_share_button: "hide"
            }]
          }
        }
      }
    };
    this.send(messageData, function (err, sent) {
      if (err)
        return done(err, null)
      return that.helpQuick(user, done);
    });
  },
  helpQuick: function (user, done) {
    var messageData = {
      recipient: {
        id: user.fbId
      },
      message: {
        quick_replies: [
          {
            content_type: "text",
            title: "🔑 Get a Token",
            payload: "code"
          },
          {
            content_type: "text",
            title: "♻ Generate",
            payload: "generate"
          }
        ]
      }
    };
    this.send(messageData, done);
  }
}