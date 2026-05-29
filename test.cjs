const http = require('http');

const data = JSON.stringify({ messages: 'hello' });
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/v1/messages',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
    console.log('chunk:', chunk.toString());
  });
  res.on('end', () => {
    console.log('full body:', body);
  });
});

req.on('error', (e) => console.error(e));
req.write(data);
req.end();