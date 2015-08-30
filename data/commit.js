var req = require('../util/req.js');
var parseLink = require('../util/parseLink.js');

var _ = require('lodash'),
    async = require('async');

module.exports = function(repoURL, cb) {
  var results = [];

  function parse(page) {
    var options = {
      url: '/repos/' + repoURL + '/commits',
      qs: { 'per_page': 100, page: page }
    };

    req(options, function(err, res, body) {
      if (res.statusCode == 200) {
        results.push(
          _.map(JSON.parse(body), function(commit) {
            return {
              author: commit.commit.author.name,
              date: commit.commit.author.date,
              login: commit.author ? commit.author.login : null
            };
          })
        );

        if (res.headers.link) {
          var links = parseLink(res.headers.link);
          if (links.next) {
            parse(page + 1);
          } else {
            cb(_.sortBy(_.flatten(results), 'date'));
          }
        }
      }
    });
  }

  parse(1);
};
