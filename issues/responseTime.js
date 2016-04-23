var redux_data = require('./redux.json');
var c3_data = require('./c3.json');

var _ = require('lodash');

var printTimeDistribution = function(data) {
  var timeMap = {
    zero: 0,
    three: 0,
    seven: 0,
    more: 0
  };

  _.forEach(data, function(issue) {
    if (issue.timeToGetFirstComment < 1)
      timeMap.zero++;
    else if (issue.timeToGetFirstComment < 3)
      timeMap.three++;
    else if (issue.timeToGetFirstComment < 7)
      timeMap.seven++;
    else
      timeMap.more++;
  });

  console.log(timeMap);
};

printTimeDistribution(redux_data);
printTimeDistribution(c3_data);
