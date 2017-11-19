/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var suid = require('rand-token').suid;

var languages = require('../utils/languages').map(function (lang) {
  return lang.fb;
});

module.exports = {
  attributes: {
    fbId: {
      type: "string",
      required: true,
      unique: true,
      index: true
    },
    userToken: {
      type: "string",
      required: true,
      unique: true,
      index: true
    },
    first_name: {
      type: "string",
      required: true
    },
    last_name: {
      type: "string",
      required: true
    },
    profile_pic: {
      type: "string",
      required: true
    },
    locale: {
      type: "string",
      enum: languages
    },
    timezone: {
      type: "integer"
    },
    gender: {
      type: "string"
    },
    messages: {
      collection: 'message',
      via: 'sender'
    }
  },
  generateCode: function (user, error, success) {
    User.update({ id: user.id }, { userToken: suid(16, 1451602800000, 10) }).exec(function (err, users) {
      if (err)
        return error(user, err);
      if (!users.length)
        return error(user, new Error('User not found'))
      return success(users[0])
    })
  },
  getUserByToken: function (token, cb) {
    User.findOne({ userToken: token }).exec(cb)
  },
  createFromFb: function (id, cb) {
    https = require('https');
    var options = {
      hostname: 'graph.facebook.com',
      port: 443,
      path: '/' + sails.config.parameters.fbApiVersion + '/' + id + '?access_token=' + sails.config.parameters.pageAccessToken,
      method: 'GET'
    };

    var req = https.request(options, function (res) {
      var body = '';
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        body += chunk;
      });
      res.on('end', function () {
        var fbUser = JSON.parse(body);
        fbUser.fbId = id;
        fbUser.userToken = suid(16, 1451602800000, 10);
        User.create(fbUser)
          .exec(function (err, user) {
            if (err)
              return cb(err, null);
            cb(null, user);
          });
      });
    });
    req.on('error', function (err) {
      return cb(err, null);
    });
    req.end();
  }
};

