// Configuration for the Lodash transformation API

// Special constant for generator methods (when using _ as input)
export const LODASH_ROOT = Symbol("lodash-root");

// Methods that only accept simple arguments
export const SIMPLE_METHODS = [
  // String methods
  "camelCase",
  "capitalize",
  "deburr",
  "endsWith",
  "escape",
  "escapeRegExp",
  "kebabCase",
  "lowerCase",
  "lowerFirst",
  "pad",
  "padEnd",
  "padStart",
  "parseInt",
  "repeat",
  "removeEmojis",
  "replaceAll",
  "replace",
  "slice",
  "snakeCase",
  "split",
  "startCase",
  "startsWith",
  "toLower",
  "toUpper",
  "toLowerCase",
  "toUpperCase",
  "trim",
  "trimEnd",
  "trimStart",
  "truncate",
  "unescape",
  "upperCase",
  "upperFirst",
  "words",

  // Array methods
  "compact",
  "concat",
  "difference",
  "drop",
  "dropRight",
  "flatMap",
  "flatten",
  "flattenDeep",
  "head",
  "initial",
  "intersection",
  "join",
  "last",
  "reverse",
  "shuffle",
  "sort",
  "sortNumeric",
  "slice",
  "tail",
  "take",
  "takeRight",
  "union",
  "uniq",
  "uniqBy",
  "without",

  // Utility methods
  "get",
  "identity",
  "noop",
  "range",
  "renameKey",
  "stubArray",
  "stubFalse",
  "stubObject",
  "stubString",
  "stubTrue",
  "times",
  "toPath",
  "uniqueId",
];

// Methods that accept transformation chains as arrays
export const CHAIN_METHODS = [
  "map",
  "filter",
  "find",
  "sortBy", 
  "groupBy"
];

// All allowed methods (combination of simple and chain methods)
export const ALLOWED_METHODS = [...SIMPLE_METHODS, ...CHAIN_METHODS];
