// Examples of using Lodash as a Service with new URL syntax
// Syntax: /{input}/{method1:arg1:arg2}/{method2}/...

const BASE_URL = 'http://localhost:3000';

// Example 1: Simple camelCase transformation
async function example1() {
  const url = `${BASE_URL}/hello_world/camelCase`;
  const response = await fetch(url);
  const data = await response.json();
  console.log('Example 1 - Simple camelCase:', data);
  // Result: { success: true, input: 'hello_world', result: 'helloWorld' }
}

// Example 2: Chain multiple transformations
async function example2() {
  const url = `${BASE_URL}/user_first_name/replace:_:%20/camelCase`;
  const response = await fetch(url);
  const data = await response.json();
  console.log('Example 2 - Chain with replace:', data);
  // Result: { success: true, result: 'userFirstName' }
}

// Example 3: Text with spaces (URL-encoded)
async function example3() {
  const url = `${BASE_URL}/hello%20world/trim/camelCase/upperFirst`;
  const response = await fetch(url);
  const data = await response.json();
  console.log('Example 3 - Spaces handling:', data);
  // Result: { success: true, result: 'HelloWorld' }
}

// Example 4: String manipulation with arguments
async function example4() {
  const url = `${BASE_URL}/hello/padStart:10:*/truncate:8`;
  const response = await fetch(url);
  const data = await response.json();
  console.log('Example 4 - Padding and truncate:', data);
  // Result: { success: true, result: '*****hel' }
}

// Example 5: Array operations via split
async function example5() {
  const url = `${BASE_URL}/1,2,null,3,,4/split:,/compact/join:,`;
  const response = await fetch(url);
  const data = await response.json();
  console.log('Example 5 - Array operations:', data);
  // Result: { success: true, result: '1,2,null,3,4' }
}

// Example 6: Complex string transformation
async function example6() {
  const url = `${BASE_URL}/user%20email%20address/replace:%20:_/toLowerCase/camelCase`;
  const response = await fetch(url);
  const data = await response.json();
  console.log('Example 6 - Complex transformation:', data);
  // Result: { success: true, result: 'userEmailAddress' }
}

// Example 7: Text cleaning and formatting
async function example7() {
  const url = `${BASE_URL}/%20%20%20messy%20text%20%20%20/trim/replace:%20:-/toUpperCase`;
  const response = await fetch(url);
  const data = await response.json();
  console.log('Example 7 - Text cleaning:', data);
  // Result: { success: true, result: 'MESSY-TEXT' }
}

// Run examples
if (require.main === module) {
  (async () => {
    console.log('Running Lodash as a Service examples with clean URL structure...\n');
    
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