/**
 * CliController
 *
 * @description :: Server-side logic for managing CLIs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  display: function (req, res) {
    Cli.findOne({ id: req.param('id') }).populate('executer').exec(function (err, cli) {
      if (err)
        return res.serverError(err);
      if (!cli)
        return res.notFound();
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

