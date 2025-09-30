import _ from "lodash";
import EMOJI_REGEX from "emojibase-regex";

// Extend Lodash with our custom methods
_.mixin({
  replaceAll: function (string, search, replacement) {
    // Escape special regex characters in the search string
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return _.replace(string, new RegExp(escapedSearch, "g"), replacement);
  },
  removeEmojis: function (string) {
    // Use emojibase-regex for comprehensive emoji detection
    return string.replace(EMOJI_REGEX, "");
  },
  sortNumeric: function (array) {
    return array.slice().sort((a, b) => {
      // Si les deux sont des nombres, tri numérique
      if (typeof a === 'number' && typeof b === 'number') {
        return a - b;
      }
      // Sinon tri lexicographique standard
      return String(a).localeCompare(String(b));
    });
  },
  renameKey: function(obj, oldKey, newKey) {
    if (!obj || typeof obj !== 'object') return obj;
    const {[oldKey]: value, ...rest} = obj;
    return {...rest, [newKey]: value};
  },
});

// Export the extended Lodash instance
export default _;
