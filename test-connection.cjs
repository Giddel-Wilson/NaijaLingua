const { testConnection } = require('./src/lib/db.ts');

console.log('Testing database connection with retry logic...');

testConnection()
  .then(result => {
    console.log('Connection test result:', result);
    process.exit(result ? 0 : 1);
  })
  .catch(err => {
    console.error('Connection test failed:', err);
    process.exit(1);
  });
