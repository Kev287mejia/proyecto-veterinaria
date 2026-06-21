const https = require('https');

const domains = [
  'proyecto-veterinaria-kev287mejias-projects.vercel.app',
  'proyecto-veterinaria-git-main-kev287mejias-projects.vercel.app',
  'proyecto-veterinaria.vercel.app',
  'proyecto-veterinaria-three.vercel.app',
  'proyecto-veterinaria-two.vercel.app'
];

function checkDomain(domain) {
  return new Promise((resolve) => {
    const options = {
      hostname: domain,
      port: 443,
      path: '/login',
      method: 'GET',
      timeout: 5000
    };

    const req = https.request(options, (res) => {
      resolve({ domain, status: res.statusCode });
    });

    req.on('error', (err) => {
      resolve({ domain, error: err.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ domain, error: 'Timeout' });
    });

    req.end();
  });
}

async function main() {
  console.log("Checking domains...");
  const results = await Promise.all(domains.map(checkDomain));
  console.log("Results:", results);
}

main();
