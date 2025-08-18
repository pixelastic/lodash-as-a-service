# Lodash as a Service - Usage Guide

Transform data using Lodash methods via simple URLs.
Perfect for no-code scenarios where you need simple data transformations without writing code.

## API Syntax

    GET /{input}/{method1:arg1:arg2}/{method2}/...

- First segment: Your input string (URL-encoded if needed)
- Following segments: Lodash methods with optional arguments
- Arguments: Separated by colons (:)
- Special characters: Must be URL-encoded

## Quick Examples

### Simple transformations

    /hello_world/camelCase
    → "helloWorld"

    /user_first_name/replace:_: /camelCase
    → "userFirstName"  

    /hello world/trim/camelCase/upperFirst
    → "HelloWorld"

### With arguments

    /hello/padStart:10:*/slice:0:8
    → "*****hel"

    /user name/replaceAll: :_/camelCase
    → "userName"

### Array operations

    /1,2,null,3,,4/split:,/compact/join:,
    → "1,2,null,3,4"

## URL Encoding Reference

    Space    →  %20
    Colon    →  %3A (if part of data)
    Slash    →  %2F (if part of data)
    Comma    →  %2C (if part of data)

## HTTPie Examples

    # Basic camelCase
    http GET localhost:3000/hello_world/camelCase

    # Replace and transform
    http GET localhost:3000/user%20name/replaceAll:%20:_/camelCase

    # Array operations
    http GET localhost:3000/1,2,3,1,2/split:,/uniq/join:,

## curl Examples

    # Basic transformation
    curl 'localhost:3000/hello_world/camelCase'

    # With URL encoding
    curl 'localhost:3000/user%20name/replaceAll:%20:_/camelCase'

    # Complex chain
    curl 'localhost:3000/hello/padStart:10:*/slice:0:8'

## Available Methods

### String Methods
camelCase, capitalize, deburr, endsWith, escape, escapeRegExp, kebabCase,
lowerCase, lowerFirst, pad, padEnd, padStart, parseInt, repeat, replace,
replaceAll*, slice, snakeCase, split, startCase, startsWith, toLower,
toUpper, toLowerCase, toUpperCase, trim, trimEnd, trimStart, truncate,
unescape, upperCase, upperFirst, words

### Array Methods  
compact, concat, difference, drop, dropRight, flatten, flattenDeep, head,
initial, intersection, join, last, reverse, slice, tail, take, takeRight,
union, uniq, uniqBy, without

### Utility Methods
identity, noop, stubArray, stubFalse, stubObject, stubString, stubTrue,
times, toPath, uniqueId

*Custom method: replaceAll replaces ALL occurrences (not just first)

## Common Use Cases

### API Field Names
    /First Name/replaceAll: :/camelCase
    → "firstName"

### Generate URL Slugs  
    /My Blog Post Title/replaceAll: :-/toLowerCase
    → "my-blog-post-title"

### Clean User Input
    /   messy   text   /trim/replaceAll: :_/upperCase
    → "MESSY_TEXT"

### Extract from CSV-like data
    /john,doe,30,engineer/split:,/slice:0:2/join: 
    → "john doe"

## Rate Limiting

- 100 requests per minute per IP address
- Returns 429 status when exceeded

## Endpoints

    GET /{input}/{methods...}  - Transform input
    GET /health                 - Health check  
    GET /                       - This documentation

---
Version 2.0.0 | github.com/your-username/lodash-as-a-service