/**
 * Cli.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var Base64 = require('js-base64').Base64;

module.exports = {
  attributes: {
    executer: {
      model: 'user'
    },
    cmd: {
      type: "string",
      required: true
    },
    exitCode: {
      type: "integer",
      index: true
    },
    logs: {
      type: "string"
    }
  },
  fromEndpoint: function(user, data, cb) {
    Cli.create({
      executer: user,
      cmd: data.cmd,
      exitCode: data.exit_code,
      logs: Base64.decode(data.logs)
    }).exec(cb);
  }
};

