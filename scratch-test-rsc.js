const http = require('http');

http.get('http://localhost:3000', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    if (data.includes('An error occurred in the Server Components render')) {
      console.log('Error found on /');
    } else {
      console.log('/ is OK');
    }
  });
}).on('error', (err) => console.log('Error hitting /:', err.message));

http.get('http://localhost:3000/dashboard', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    if (data.includes('An error occurred in the Server Components render')) {
      console.log('Error found on /dashboard');
    } else {
      console.log('/dashboard is OK');
    }
  });
}).on('error', (err) => console.log('Error hitting /dashboard:', err.message));

http.get('http://localhost:3000/login', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    if (data.includes('An error occurred in the Server Components render')) {
      console.log('Error found on /login');
    } else {
      console.log('/login is OK');
    }
  });
}).on('error', (err) => console.log('Error hitting /login:', err.message));
