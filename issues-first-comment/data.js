// Get a list of issues with their closing time, like this:
// [{
//   number: 256,
//   title: "Need to add this feature",
//   closeLength: Date object
// }, {
//   ...
// }]
//
// And save them to a json to feed to d3 later

var url = require('url'),
    fs = require('fs');

var _ = require('lodash'),
    async = require('async'),
    moment = require('moment');

var req = require('../util/req.js');

var repo = 'masayuki0812/c3';

var options = {
  url: '/repos/' + repo + '/issues',
  qs: {
    per_page: 100,
    state: "all"
  }
};

req(options, function(err, res, body) {
  console.log(res.headers);

  var issuesAndPRs = _.map(JSON.parse(body), function(issue) {
    var result = _.pick(issue, ['id', 'number', 'title', 'comments', 'comments_url', 'created_at']);
    return _.assign(result, { login: issue.user.login });
  });
  var issues = _.reject(issuesAndPRs, 'pull_request');
  var issuesWithComments = _.reject(issues, function(issue) {
    return issue.comments == 0;
  });

  var addTimeToGetFirstComment = function(issue, done) {
    var path = url.parse(issue.comments_url).pathname;
    req({ url: path }, function(err, res, body) {
      var comments = JSON.parse(body);
      var issueCreated = moment(issue.created_at);
      var firstCommentCreated = moment(comments[0].created_at);
      issue.timeToGetFirstComment = firstCommentCreated.diff(issueCreated, 'days');
      done();
    });
  };

  async.eachLimit(issuesWithComments, 3, addTimeToGetFirstComment, function(err) {
    fs.writeFileSync('c3.json', JSON.stringify(issuesWithComments, null, 2), 'utf8');
  });
});
