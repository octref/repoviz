var req = require('../util/req.js');
var parseLink = require('../util/parseLink.js');

var fs = require('fs');

var qs = require('query-string'),
    _ = require('lodash'),
    async = require('async');

var stars = [];

function addStars(body) {
  _.forEach(JSON.parse(body), function(star) {
    stars.push({
      user: star.user.login,
      time: star.starred_at
    });
  });
}

module.exports = function stargazer(repoURL, cb) {
  var options = {
    url: '/repos/' + repoURL + '/stargazers',
    headers: { 'Accept': 'application/vnd.github.v3.star+json' },
    qs: { 'per_page': 100 }
  };

  req(options, function(err, res, body) {
    // Multiple pages
    if (res.headers.link) {
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
          addStars(body);
          console.log('Done with page ' + page);
          console.log('Total star length: ' + stars.length);
          done();
        });
      };

      async.eachLimit(pages, 3, iterator, function(err) {
        console.log('All done');

        var sorted = _.sortBy(stars, function(star) {
          return star.time;
        });

        if (cb) cb(sorted);
      });
    }
    // Single page
    else {
      addStars(body);

      var sorted = _.sortBy(stars, function(star) {
        return star.time;
      });

      if (cb) cb(sorted);
    }
  });
};
