/**
 * CliController
 *
 * @description :: Server-side logic for managing CLIs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  display: function (req, res) {
    Cli.findOne({ id: req.param('id') }).exec(function (err, cli) {
      if (err)
        return res.serverError(err);
      if (!cli)
        return res.notFound();
      res.render('cli/display', {cli: cli});
    })
  }
};

