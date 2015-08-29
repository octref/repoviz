// Basic info, including
// - Stars, watchers, forks

var req = require('../util/req.js');

var _ = require('lodash'),
    async = require('async');

module.exports = function(repoURL, cb) {
  var options = {
    url: '/repos/' + repoURL,
    headers: { 'Accept': 'application/vnd.github.v3.star+json' },
    qs: { 'per_page': 100 }
  };

  req(options, function(err, res, body) {
    cb(
      _.pick(JSON.parse(body), ['stargazers_count', 'subscribers_count', 'forks_count'])
    );
  });
};
