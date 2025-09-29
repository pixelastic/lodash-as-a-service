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
});

// Export the extended Lodash instance
export default _;
