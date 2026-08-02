const http = require('http');

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          resolve({ status: res.statusCode, data: JSON.parse(data || '{}') });
        });
      }
    );
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting Dual Memory Independence Verification ---');

  // Test 1: Save key "x" in normal Search mode
  const t1 = await request('POST', '/api/docs/normal/x', { content: 'Normal Editable Content for Key X' });
  console.log('1. POST /api/docs/normal/x ->', t1.data);

  // Test 2: Save key "x" in Sticky Search mode
  const t2 = await request('POST', '/api/docs/sticky/x', { content: 'Sticky Read-Only Content for Key X', isSticky: true });
  console.log('2. POST /api/docs/sticky/x ->', t2.data);

  // Test 3: Fetch normal mode for key "x" (verify independent)
  const t3 = await request('GET', '/api/docs/normal/x');
  console.log('3. GET /api/docs/normal/x ->', t3.data);

  // Test 4: Fetch sticky mode for key "x" (verify independent)
  const t4 = await request('GET', '/api/docs/sticky/x');
  console.log('4. GET /api/docs/sticky/x ->', t4.data);

  // Verification assertions
  if (
    t3.data.content === 'Normal Editable Content for Key X' &&
    t4.data.content === 'Sticky Read-Only Content for Key X' &&
    t3.data.isSticky === false &&
    t4.data.isSticky === true
  ) {
    console.log('\nSUCCESS: Normal search memory and Sticky search memory for key "x" are completely independent!');
  } else {
    console.error('\nFAILURE: Memory spaces are not properly separated.');
  }

  console.log('--- All Dual Memory Verification Completed ---');
}

runTests();
