const _ = require('lodash');

// Extend Lodash with our custom methods using official mixin API
_.mixin({
  replaceAll: function(string, search, replacement) {
    return _.replace(string, new RegExp(search, 'g'), replacement);
  }
});

// Export the extended Lodash instance
module.exports = _;
