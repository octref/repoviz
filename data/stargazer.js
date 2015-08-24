var req = require('../util/req.js');
var parseLink = require('../util/parseLink.js');

var fs = require('fs');

var qs = require('query-string'),
    _ = require('lodash'),
    async = require('async');

var stars = {};

module.exports = function stargazer(repoURL, cb) {
  var options = {
    url: '/repos/' + repoURL + '/stargazers',
    headers: { 'Accept': 'application/vnd.github.v3.star+json' },
    qs: { 'per_page': 100 }
  };

  req(options, function(err, res, body) {
    var links = parseLink(res.headers.link);
    var lastPage = parseInt(qs.parse(links.last).page, 10);
    var pages = _.range(1, lastPage + 1);

    var iterator = function(page, done) {
      var options = {
        url: '/repos/' + repoURL + '/stargazers',
        headers: { 'Accept': 'application/vnd.github.v3.star+json' },
        qs: { 'per_page': 100, page: page }
      };

      req(options, function(err, res, body) {
        _.forEach(JSON.parse(body), function(star) {
          if (!star.user) {
            console.log('error');
            console.log(JSON.parse(body));
            console.log(star);
          }
          stars[star.user.login] = star.starred_at;
        });
        console.log('Done with page ' + page);
        console.log('Total star length: ' + Object.keys(stars).length);
        done();
      });
    };

    async.eachLimit(pages, 3, iterator, function(err) {
      console.log('All done');
      cb(stars);
    });
  });
};
