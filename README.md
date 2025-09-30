# ▂ Lodash as a Service

[https://lodash-as-a-service.fly.dev/](https://lodash-as-a-service.fly.dev/)

Simple API to run chain of Lodash commands from a URL.

I built this out of the need for simple text formatting in no-code workflows.

## API Syntax

`GET /{input}/{method1}/{method2:arg1:arg2}/...`

- First directory is your input, as a string (you need to URL-encode if needed)
- Each following folder is a Lodash method applied, in turn, to the input
- Arguments to the methods can be passed through colons (`truncate:8`)

## Quick Examples

[https://lodash-as-a-service.fly.dev/hello_world/camelCase](https://lodash-as-a-service.fly.dev/hello_world/camelCase)

`{"result":"helloWorld"}`

[https://lodash-as-a-service.fly.dev/1,2,5,3,,4/split:,/compact/sort/join:,](https://lodash-as-a-service.fly.dev/1,2,5,3,,4/split:,/compact/sort/join:,)

`{"result":"12345"}`

[https://lodash-as-a-service.fly.dev/My%20Blog%20Post%20Title/replaceAll:%20:-/camelCase](https://lodash-as-a-service.fly.dev/My%20Blog%20Post%20Title/replaceAll:%20:-/camelCase)

`{"result": "myBlogPostTitle"}`

[https://lodash-as-a-service.fly.dev/john,doe,30,engineer/split:,/slice:0:2/join:%20/startCase](https://lodash-as-a-service.fly.dev/john,doe,30,engineer/split:,/slice:0:2/join:%20/startCase)

`{"result":"John Doe"}`

## URL Encoding Reference

- Space    →  %20
- Colon    →  %3A
- Slash    →  %2F

## POST API

You can also send JSON data via POST for more complex transformations:

```bash
curl -X POST https://lodash-as-a-service.fly.dev/ \
  -H "Content-Type: application/json" \
  -d '{"input": "hello_world", "methods": ["camelCase"]}'
```

### Simple Transformations

Same as GET requests but with JSON:
```json
{"input": "hello_world", "methods": ["camelCase"]}
// Result: "helloWorld"
```

### Property Extraction

Use shorthand for object property access:
```json
{"input": [{"name": "Alice"}, {"name": "Bob"}], "methods": ["map:name"]}
// Result: ["Alice", "Bob"]
```

### Function Application with @ Syntax

Use `@` prefix to apply Lodash functions:
```json
{"input": ["hello", "world"], "methods": ["map:@upperCase"]}
// Result: ["HELLO", "WORLD"]
```

### Complex Transformation Chains

Use arrays for multi-step transformations on each item:
```json
{
  "input": "user_name|john;user_email|test",
  "methods": [
    "split:;",
    ["map", ["@split:|", "@head", "@replace:user_:", "@upperCase"]]
  ]
}
// Result: ["NAME", "EMAIL"]
```

### Function with Arguments

Pass arguments using colon syntax:
```json
{"input": [{"content": "Hello"}], "methods": [["map", ["@renameKey:content:text"]]]}
// Result: [{"text": "Hello"}]
```

## Available Methods

### String Methods
`camelCase`, `capitalize`, `deburr`, `endsWith`, `escape`, `escapeRegExp`, `kebabCase`,
`lowerCase`, `lowerFirst`, `pad`, `padEnd`, `padStart`, `parseInt`, `repeat`, `replace`,
`slice`, `snakeCase`, `split`, `startCase`, `startsWith`, `toLower`,
`toUpper`, `toLowerCase`, `toUpperCase`, `trim`, `trimEnd`, `trimStart`, `truncate`,
`unescape`, `upperCase`, `upperFirst`, `words`

**New methods:**
- `replaceAll` replaces ALL occurrences (not just first)
- `removeEmojis` replaces emojis from input string

### Array Methods
`compact`, `concat`, `difference`, `drop`, `dropRight`, `flatten`, `flattenDeep`, `head`,
`initial`, `intersection`, `join`, `last`, `reverse`, `sort`, `sortNumeric`, `slice`, `tail`, `take`, `takeRight`,
`union`, `uniq`, `uniqBy`, `without`

**New methods:**
- `sortNumeric` sorts numbers correctly (1, 2, 10 vs 1, 10, 2)

### Utility Methods
`get`, `identity`, `noop`, `range`, `renameKey`, `stubArray`, `stubFalse`, `stubObject`, `stubString`, `stubTrue`,
`times`, `toPath`, `uniqueId`

**New methods:**
- `renameKey(oldKey, newKey)` renames an object property from oldKey to newKey

## Credits

Made by [@pixelastic](https://bsky.app/profile/pixelastic.bsky.social).
Hosted on [fly.io](https://fly.io/).
Code [available on GitHub](https://github.com/pixelastic/lodash-as-a-service).
