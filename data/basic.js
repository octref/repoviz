// Basic info, including
// - Stars, watchers, forks

var req = require('../util/req.js');

var _ = require('lodash');

module.exports = function(repoURL, cb) {
  var options = {
    url: '/repos/' + repoURL
  };

  req(options, function(err, res, body) {
    cb(
      _.pick(JSON.parse(body), ['stargazers_count', 'subscribers_count', 'forks_count'])
    );
  });
};
