const http = require('http');

function req(method, path, body) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const r = http.request({
      hostname: 'localhost', port: 5000, path, method,
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) },
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(d || '{}') }));
    });
    r.on('error', reject);
    if (postData) r.write(postData);
    r.end();
  });
}

async function run() {
  let pass = 0, fail = 0;
  const check = (label, got, expected) => {
    const ok = got === expected;
    console.log(`  ${ok ? '✓' : '✗'} ${label}: "${got}" ${ok ? '' : '(expected: "' + expected + '")'}`);
    ok ? pass++ : fail++;
  };

  console.log('\n=== Case A: Same key in both systems ===');
  await req('POST', '/api/docs/normal/test', { content: 'Normal Memory' });
  await req('POST', '/api/docs/sticky/test', { content: 'Sticky Memory', isSticky: true });
  const a1 = await req('GET', '/api/docs/normal/test');
  const a2 = await req('GET', '/api/docs/sticky/test');
  check('Search "test" content',        a1.data.content,  'Normal Memory');
  check('Search "test" isSticky',       String(a1.data.isSticky), 'false');
  check('Sticky "test" content',        a2.data.content,  'Sticky Memory');
  check('Sticky "test" isSticky',       String(a2.data.isSticky), 'true');

  console.log('\n=== Case B: Different keys ===');
  await req('POST', '/api/docs/normal/abc', { content: 'Normal ABC' });
  await req('POST', '/api/docs/sticky/xyz', { content: 'Sticky XYZ', isSticky: true });
  const b1 = await req('GET', '/api/docs/normal/abc');
  const b2 = await req('GET', '/api/docs/sticky/xyz');
  check('Search "abc" content',  b1.data.content, 'Normal ABC');
  check('Sticky "xyz" content',  b2.data.content, 'Sticky XYZ');

  console.log('\n=== Case C: Sticky read-only enforcement ===');
  const c1 = await req('POST', '/api/docs/sticky/test', { content: 'Try overwrite' });
  check('Attempt to edit stuck doc returns 403', String(c1.status), '403');

  console.log('\n=== Case D: Normal search UNAFFECTED by sticky ===');
  const d1 = await req('GET', '/api/docs/normal/test');
  check('Normal "test" still "Normal Memory"', d1.data.content, 'Normal Memory');

  console.log('\n=== Case E: Sticky write BEFORE sticking (editable) ===');
  await req('POST', '/api/docs/sticky/draft', { content: 'Draft v1' });       // no isSticky
  const e1 = await req('GET', '/api/docs/sticky/draft');
  check('Sticky draft can be saved without locking', String(e1.data.isSticky), 'false');
  await req('POST', '/api/docs/sticky/draft', { content: 'Draft v2' });       // update before stick
  const e2 = await req('GET', '/api/docs/sticky/draft');
  check('Sticky draft updated to Draft v2', e2.data.content, 'Draft v2');
  await req('POST', '/api/docs/sticky/draft', { content: 'Final', isSticky: true }); // now stick
  const e3 = await req('GET', '/api/docs/sticky/draft');
  check('Sticky draft is now locked', String(e3.data.isSticky), 'true');
  check('Sticky draft final content',  e3.data.content, 'Final');

  console.log(`\n════════════════════════════════`);
  console.log(`  PASS: ${pass}   FAIL: ${fail}`);
  console.log(`════════════════════════════════\n`);
}

run();
