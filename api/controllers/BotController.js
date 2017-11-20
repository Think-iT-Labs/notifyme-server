/**
 * BotController
 *
 * @description :: Server-side logic for managing bots
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var sendAPI = require('../utils/sendAPI');
var getPhrase = require('../utils/phrases');

var fallback = function (err, info) {
  sails.log.info(new Date());
  if (err)
    return sails.log.error(err);
  return sails.log.info(info);
};
var reportError = function (user, err) {
  if (err) {
    sails.log.error(err);
    return sendAPI.reportError(user, err, fallback);
  }
};

var unreconizedCall = function (user, type, value) {
  sails.log.warn("Recieved unkown `" + type + "`:");
  sails.log.info(value);
};

var messageRead = function (user, read) {
  sails.log.info("Message read by: " + user.first_name + " " + user.last_name + " at " + new Date().toDateString());
};

var messageDelivery = function (user, delivery) {
  sails.log.info("Message delivered to: " + user.first_name + " " + user.last_name + " at " + new Date().toDateString());
};

module.exports = {
  subscribe: function (req, res) {
    if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === sails.config.parameters.validationToken) {
      sails.log.info("Validating webhook");
      res.ok(req.query['hub.challenge']);
    } else {
      sails.log.error("Failed validation. Make sure the validation tokens match.");
      res.forbidden({ err: "Failed validation. Make sure the validation tokens match." });
    }
  },
  handleMessage: function (req, res) {
    var data = req.allParams();
    data.entry.forEach(function (entry) {
      entry.messaging.forEach(function (messaging) {
        getUser(messaging.sender, function (err, user) {
          if (err)
            return sails.log.error(err);
          if (messaging.message) {
            var message = messaging.message;
            if (message.quick_reply) {
              var payload = message.quick_reply.payload;
              return handlePayload(user, payload);
            } else if (message.text) {
              return guessMessage(user, message.text)
            } else if (message.attachement) {
              return sendAPI.text(user, 'I can not handle Media, well not yet :p', fallback);
            } else {
              return unreconizedCall(user, "messaging.message", messaging.message);
            }
          } else if (messaging.postback) {
            var payload = messaging.postback.payload;
            return handlePayload(user, payload);
          } else if (messaging.delivery) {
            return messageDelivery(user, messaging.delivery);
          } else if (messaging.read) {
            return messageRead(user, messaging.read);
          } else {
            return unreconizedCall(user, "messaging", messaging);
          }
        });
      });
    });
    res.ok();
  },
  cliHandler: function (req, res) {
    var data = req.allParams();
    sails.log.info(data);
    var missing = data.cmd ? data.token ? null : "param token is missing" : "param cmd is missing";
    if (missing)
      return res.badRequest({ status: "error", when: "Recieving data", message: missing })
    User.getUserByToken(data.token, function (err, user) {
      if (err)
        return res.serverError({ status: "error", when: "Fetching user", message: err });
      if (!user)
        return res.notFound({ status: "error", when: "Fetching user", message: 'user not found' });
      Cli.fromEndpoint(user, data, function (err, cli) {
        if (err)
          return res.serverError({ status: "error", when: "Persisting the Command", message: err });
        if (cli.exitCode === 0) {
          return sendAPI.notifySuccess(user, cli, function (err, info) {
            if (err)
              return res.serverError({ status: "error", when: "Sending to facebook", message: err });
            return res.ok({ status: "success", when: "Sending to facebook", message: info });
          });
        } else {
          sendAPI.notifyFailure(user, cli, function (err, info) {
            if (err)
              return res.serverError({ status: "error", when: "Sending to facebook", message: err });
            return res.ok({ status: "success", when: "Sending to facebook", message: info });
          });
        }
      })
    })
  },
  authorize: function (req, res) {
    var accountLinkingToken = req.query.account_linking_token;
    var redirectURI = req.query.redirect_uri;
    // authCode must be a generated unique string
    var authCode = "1234567890";
    var redirectURISuccess = redirectURI + "&authorization_code=" + authCode;

    res.render('authorize', {
      accountLinkingToken: accountLinkingToken,
      redirectURI: redirectURI,
      redirectURISuccess: redirectURISuccess
    });
  }
};
guessMessage = function (user, text) {
  if (text.match(/^(code)|(token)/i)) {
    return sendAPI.sendCode(user, fallback);
  } else if(text.match(/^(hi)|(hello)/i)){
    return sendAPI.text(user, getPhrase('greeting'), fallback);
  } else if(text.match(/(ma[d|k]e)|(buil[t|d]) you/i)){
    return sendAPI.text(user, getPhrase('maker'), fallback);
  } else if(text.match(/^(help)|(aide)/i)){
    return sendAPI.help(user, fallback)
  } else if(text.match(/^(about)|(more)/i)){
    return sendAPI.text(user, getPhrase('about'), fallback);
  } else {
    return sendAPI.text(user, getPhrase('unreconized'), fallback);
  }
};
handlePayload = function (user, payload) {
  if (payload === "code") {
    return sendAPI.sendCode(user, fallback);
  } else if (payload === "generate") {
    User.generateCode(user, reportError, function (user) {
      return sendAPI.sendCode(user, fallback);
    });
  } else if (payload.match(/^history/)) {
    var page = parseInt(payload.split(':')[1]);
    Cli.history(user, page, reportError, function (clis) {
      return sendAPI.history(user, clis, page, fallback);
    });
  } else {
    return sendAPI.help(user, fallback);
  }
};
getUser = function (sender, cb) {
  if (!sender)
    cb('can not find sender', null);
  User.findOne({ fbId: sender.id })
    .exec(function (err, user) {
      if (err)
        cb(err, null);
      if (!user) {
        User.createFromFb(sender.id, function (err, user) {
          if (!err)
            sendAPI.welcome(user, function (message) {
              sendAPI.typingOff(user, function (message) {
                cb(err, user);
              });
            });
        });
      } else {
        cb(null, user);
      }
    });
};