var request = require('request');

var token = require('./token');

module.exports = request.defaults({
  headers: {
    'Authorization': token,
    'User-Agent': 'octref'
  },
  baseUrl: 'https://api.github.com/'
});
