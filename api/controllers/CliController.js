/**
 * CliController
 *
 * @description :: Server-side logic for managing CLIs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var Convert = require('ansi-to-html');

module.exports = {
  display: function (req, res) {
    Cli.findOne({ id: req.param('id') }).populate('executer').exec(function (err, cli) {
      if (err)
        return res.serverError(err);
      if (!cli)
        return res.notFound();
      if(cli.tty) {
        var convert = new Convert();
        cli.logs = convert.toHtml(cli.logs);
      }
      res.view('display', {cli: cli, noFooter: true, title: cli.cmd});
    })
  },
  howto: function (req, res) {
    res.view('howto', {title: "How To", noFooter: true});
  },
  downloads: function(req, res) {
    return res.redirect("https://github.com/Think-iT-Labs/notifyme");
  },
  dist: function(req, res) {
    return res.redirect("https://github.com/Think-iT-Labs/notifyme");
  }
};

