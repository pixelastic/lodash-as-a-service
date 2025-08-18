// Examples of using Lodash as a Service

const API_URL = 'http://localhost:3000/api/transform';

// Example 1: Simple camelCase transformation (GET)
async function example1() {
  const url = `${API_URL}?input=hello_world&chain=camelCase`;
  const response = await fetch(url);
  const data = await response.json();
  console.log('Example 1:', data);
  // Result: { success: true, input: 'hello_world', chain: ['camelCase'], result: 'helloWorld' }
}

// Example 2: Chain multiple transformations (POST)
async function example2() {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: '  hello WORLD  ',
      chain: ['trim', 'toLower', 'camelCase', 'upperFirst']
    })
  });
  const data = await response.json();
  console.log('Example 2:', data);
  // Result: { success: true, ..., result: 'HelloWorld' }
}

// Example 3: Array operations
async function example3() {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: [1, 2, null, 3, '', 4, undefined, 5],
      chain: ['compact']
    })
  });
  const data = await response.json();
  console.log('Example 3:', data);
  // Result: { success: true, ..., result: [1, 2, 3, 4, 5] }
}

// Example 4: Object operations with arguments
async function example4() {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: { name: 'John', age: 30, email: 'john@example.com', password: 'secret' },
      chain: [
        { method: 'pick', args: ['name', 'email'] }
      ]
    })
  });
  const data = await response.json();
  console.log('Example 4:', data);
  // Result: { success: true, ..., result: { name: 'John', email: 'john@example.com' } }
}

// Example 5: Using colon syntax for arguments in GET
async function example5() {
  const url = `${API_URL}?input=hello%20world%20test&chain=split:%20,join:-`;
  const response = await fetch(url);
  const data = await response.json();
  console.log('Example 5:', data);
  // Result: { success: true, ..., result: 'hello-world-test' }
}

// Example 6: Complex chain for no-code scenarios
async function example6() {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: ['user_name', 'user_email', 'user_phone'],
      chain: [
        { method: 'join', args: [','] },
        { method: 'replace', args: ['user_', ''] },
        { method: 'split', args: [','] }
      ]
    })
  });
  const data = await response.json();
  console.log('Example 6:', data);
  // Result: { success: true, ..., result: ['name', 'email', 'phone'] }
}

// Run examples
if (require.main === module) {
  (async () => {
    console.log('Running Lodash as a Service examples...\n');
    
    try {
      await example1();
      await example2();
      await example3();
      await example4();
      await example5();
      await example6();
    } catch (error) {
      console.error('Error running examples:', error.message);
      console.log('Make sure the server is running: node server.js');
    }
  })();
}