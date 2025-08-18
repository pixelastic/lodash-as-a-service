const _ = require('lodash');

// Custom Lodash extensions for our service
const customMethods = {

  /**
   * Replace all occurrences of a search string with a replacement string
   * @param {string} string - The string to modify
   * @param {string} search - The string to search for
   * @param {string} replacement - The string to replace with
   * @returns {string} The modified string
   */
  replaceAll: function(string, search, replacement) {
    return _.replace(string, new RegExp(search, 'g'), replacement);
  }
  
  // Future potential additions:
  // - toObject: Parse string to object (JSON or key:value format)
  // - toArray: Parse string to array (JSON or delimiter-based)
  // These would enable Object methods (keys, values, pick, omit, etc.)
};

// Extend Lodash with our custom methods using official mixin API
_.mixin(customMethods);

// Export the extended Lodash instance
module.exports = _;
