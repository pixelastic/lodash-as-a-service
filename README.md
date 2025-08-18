# 🔧 Lodash as a Service

A simple web service that allows you to execute Lodash transformations via HTTP requests. This service is designed for no-code scenarios where you need to perform simple data transformations without writing code.

## 🎯 Why This Service Exists

Lodash provides powerful utility functions for common programming tasks. This service makes those functions accessible via simple HTTP requests, enabling:

- **No-code data transformations** : Perfect for automation tools like Zapier, Make, etc.
- **Quick manipulations** : String/array/object operations without a development environment
- **Easy integration** : Via HTTP with any service or platform
- **Simplified data processing** : In automation workflows and API integrations

## ⚡ How It Works

The service uses an intuitive URL structure where everything is in the path. No query parameters or POST bodies needed!

### 🎯 New Clean Syntax

```bash
GET /{input}/{method1:arg1:arg2}/{method2}/...
```

**Key Rules:**
- **First segment**: Your input string (URL-encoded if needed)
- **Following segments**: Lodash methods with optional arguments  
- **Arguments**: Separated by colons (`:`)
- **Special characters**: URL-encode them (`%20` for space, etc.)

### 🔗 Simple Transformations

Most common use case - just input and method:

```bash
# Convert to camelCase (your main use case!)
GET /hello_world/camelCase
→ Result: "helloWorld"

# Chain multiple methods
GET /user_first_name/replace:_:%20/camelCase
→ Result: "userFirstName"

# Text with spaces (URL-encoded)
GET /hello%20world/trim/camelCase/upperFirst
→ Result: "HelloWorld"
```

### 🚀 Advanced Transformations

Methods with arguments - just add colons:

```bash
# String manipulation with arguments
GET /hello/padStart:10:*/truncate:8
→ Result: "*****hel"

# Search and replace  
GET /user%20name/replace:%20:_/camelCase
→ Result: "userName"

# Array operations (via split)
GET /1,2,null,3,,4/split:,/compact/join:,
→ Result: "1,2,null,3,4"
```

## 🛠 Local Setup

### Prerequisites

- Node.js (v18 or later)
- npm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/lodash-as-a-service.git
   cd lodash-as-a-service
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

The service will be available at `http://localhost:3000`

### 🐳 With Docker

```bash
docker build -t lodash-service .
docker run -p 3000:3000 lodash-service
```

## 📖 Usage Examples

### With HTTPie

**Simple transformations:**
```bash
# Basic camelCase
http GET localhost:3000/hello_world/camelCase

# Chain methods  
http GET localhost:3000/user%20name/replace:%20:_/camelCase

# Array operations
http GET localhost:3000/1,2,3,1,2/split:,/uniq/join:,
```

### With curl

**Simple transformations:**
```bash
# Basic camelCase (your main use case!)
curl 'localhost:3000/hello_world/camelCase'

# Search and replace then camelCase
curl 'localhost:3000/user%20name/replace:%20:_/camelCase'

# String padding and truncation
curl 'localhost:3000/hello/padStart:10:*/truncate:8'
```

### Real-world examples

```bash
# Clean up user input for API field names
curl 'localhost:3000/First%20Name/replace:%20:/camelCase'
→ "firstName"

# Generate slug from title
curl 'localhost:3000/My%20Blog%20Post%20Title/replace:%20:-/toLowerCase' 
→ "my-blog-post-title"

# Clean and format data
curl 'localhost:3000/%20%20messy%20text%20%20/trim/replace:%20:_/upperCase'
→ "MESSY_TEXT"
```

## 🔒 Security

- **Strict whitelist** : Only safe Lodash methods are allowed
- **Rate limiting** : Protection against abuse (100 requests/minute)
- **Input validation** : Prevention of code injection
- **Timeout protection** : 1 second max per operation
- **No code execution** : Only predefined method calls

### Allowed Methods

The following methods are available:

**String:** camelCase, capitalize, deburr, kebabCase, lowerCase, snakeCase, startCase, trim, truncate, upperCase, upperFirst, etc.

**Array:** compact, concat, difference, drop, flatten, head, intersection, join, last, reverse, slice, uniq, without, etc.

**Object:** keys, values, entries, omit, pick, invert

[See complete list at `/`]

## 🚀 Deploy to Fly.io

1. **Install Fly CLI:**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login:**
   ```bash
   fly auth login
   ```

3. **Launch app:**
   ```bash
   fly launch
   ```

4. **Deploy updates:**
   ```bash
   fly deploy
   ```

## 🎨 Use Cases

### No-code automation
- Zapier/Make workflows
- Data transformation between services
- Real-time data cleaning

### API integration
- Transformation middleware
- Data normalization
- Custom output formatting

### Rapid prototyping
- Testing transformations
- Data validation
- Utility scripts

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|---------|-------------|
| `/` | GET | Interactive documentation |
| `/{input}/{methods...}` | GET | Transform input using chained methods |
| `/health` | GET | Health check |

### URL Encoding Reference

| Character | Encoded | Use Case |
|-----------|---------|----------|
| Space | `%20` | Text with spaces |
| Colon | `%3A` | If colon appears in your data |
| Slash | `%2F` | If slash appears in your data |
| Comma | `%2C` | If comma appears in your data |

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## ⚠️ Important Notes

- **Process crashes** : On Fly.io, if a process crashes (impossible with our whitelist), it automatically restarts
- **Performance** : Each operation has a 1-second timeout
- **Limits** : 100 requests per minute per IP
- **Security** : No arbitrary code execution allowed
