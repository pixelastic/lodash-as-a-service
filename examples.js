// Examples of using Lodash as a Service with new URL structure

const BASE_URL = 'http://localhost:3000';

// Example 1: Simple camelCase transformation (GET)
async function example1() {
  const url = `${BASE_URL}/camelCase?input=hello_world`;
  const response = await fetch(url);
  const data = await response.json();
  console.log('Example 1 - Simple camelCase:', data);
  // Result: { success: true, input: 'hello_world', chain: ['camelCase'], result: 'helloWorld' }
}

// Example 2: Chain multiple transformations (GET)
async function example2() {
  const url = `${BASE_URL}/trim/toLower/camelCase/upperFirst?input=  HELLO_WORLD  `;
  const response = await fetch(url);
  const data = await response.json();
  console.log('Example 2 - Chain transformations:', data);
  // Result: { success: true, ..., result: 'HelloWorld' }
}

// Example 3: Array operations (GET)
async function example3() {
  const input = encodeURIComponent('[1,2,null,3,"",4,undefined,5]');
  const url = `${BASE_URL}/compact?input=${input}`;
  const response = await fetch(url);
  const data = await response.json();
  console.log('Example 3 - Array compact:', data);
  // Result: { success: true, ..., result: [1, 2, 3, 4, 5] }
}

// Example 4: String cleaning chain (GET)
async function example4() {
  const input = encodeURIComponent('  Hello World  ');
  const url = `${BASE_URL}/trim/kebabCase/toUpper?input=${input}`;
  const response = await fetch(url);
  const data = await response.json();
  console.log('Example 4 - String cleaning:', data);
  // Result: { success: true, ..., result: 'HELLO-WORLD' }
}

// Example 5: POST with arguments - replace method
async function example5() {
  const response = await fetch(`${BASE_URL}/replace/toUpper`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: 'hello world',
      args: [[' ', '-'], []]  // First arg for replace, empty arg for toUpper
    })
  });
  const data = await response.json();
  console.log('Example 5 - POST with args:', data);
  // Result: { success: true, ..., result: 'HELLO-WORLD' }
}

// Example 6: POST with multiple args - padStart and truncate
async function example6() {
  const response = await fetch(`${BASE_URL}/padStart/truncate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: 'hello',
      args: [[10, '0'], [7]]  // padStart with 10 chars and '0', then truncate to 7
    })
  });
  const data = await response.json();
  console.log('Example 6 - Complex POST:', data);
  // Result: { success: true, ..., result: '0000hel' }
}

// Example 7: Unique values from array (GET)
async function example7() {
  const input = encodeURIComponent('[1,1,2,3,3,4,4,5]');
  const url = `${BASE_URL}/uniq?input=${input}`;
  const response = await fetch(url);
  const data = await response.json();
  console.log('Example 7 - Unique values:', data);
  // Result: { success: true, ..., result: [1,2,3,4,5] }
}

// Run examples
if (require.main === module) {
  (async () => {
    console.log('Running Lodash as a Service examples with new URL structure...\n');
    
    try {
      await example1();
      await example2();
      await example3();
      await example4();
      await example5();
      await example6();
      await example7();
    } catch (error) {
      console.error('Error running examples:', error.message);
      console.log('Make sure the server is running: node server.js');
    }
  })();
}