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

var REPO = 'rackt/redux';
var FILE= 'redux.json';

var ISSUE_TAKE_NUM = 30;

var options = {
  url: '/repos/' + REPO + '/issues',
  qs: {
    per_page: 100,
    state: "open"
  }
};

module.exports = function(repo, cb) {

  req(options, function(err, res, body) {
    // Reject PRs
    var filteredIssues = _.reject(JSON.parse(body), function(issue) {
      return issue.pull_request;
    });

    // Only take a few most current issues to reflect activeness
    var takenIssues = _.take(filteredIssues, ISSUE_TAKE_NUM);

    // Simplify issue structure
    var processedIssues = _.map(takenIssues, function(issue) {
      var result = _.pick(issue, ['id', 'number', 'title', 'comments', 'comments_url', 'created_at']);
      return _.assign(result, { login: issue.user.login });
    });

    var hasCommentIssues = _.reject(processedIssues, function(issue) {
      return issue.comments == 0;
    });

    // Add a `timeToGetFirstComment` to each issue in `hasCommentIssues`
    var addTimeToGetFirstComment = function(issue, done) {
      var path = url.parse(issue.comments_url).pathname;
      req({ url: path }, function(err, res, body) {
        var comments = JSON.parse(body);
        var issueCreated = moment(issue.created_at);
        var firstCommentCreated = moment(comments[0].created_at);
        issue.timeToGetFirstComment = {
          days: firstCommentCreated.diff(issueCreated, 'days'),
          hours: firstCommentCreated.diff(issueCreated, 'hours'),
          minutes: firstCommentCreated.diff(issueCreated, 'minutes')
        };
        done();
      });
    };

    async.eachLimit(hasCommentIssues, 3, addTimeToGetFirstComment, function(err) {
      cb(hasCommentIssues);
    });
  });

}
