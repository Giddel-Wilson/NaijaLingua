/**
 * Fix MongoDB connection string with URL-encoded password
 */

const password = '10.Flash.01';
const encoded = encodeURIComponent(password);

console.log('\n📝 MongoDB Password Encoding Check\n');
console.log(`Original password: ${password}`);
console.log(`URL-encoded:      ${encoded}`);
console.log(`Are they same?    ${password === encoded ? 'YES' : 'NO - NEEDS ENCODING!'}`);

if (password !== encoded) {
  console.log('\n⚠️  Your password contains special characters that need encoding!');
  console.log('\nCurrent connection string:');
  console.log(`mongodb+srv://GiddelWilson:${password}@cluster0.lipiiax.mongodb.net/naijalingua`);
  console.log('\nCorrected connection string:');
  console.log(`mongodb+srv://GiddelWilson:${encoded}@cluster0.lipiiax.mongodb.net/naijalingua?retryWrites=true&w=majority`);
  console.log('\n💡 Update your .env file with the corrected connection string!\n');
} else {
  console.log('\n✅ Password does not need encoding\n');
}
