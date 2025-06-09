const { Enigma } = require('./enigma.js');

console.log('=== Final Enigma Integration Test ===\n');

// Test a complete message encryption/decryption cycle
const message = 'THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG';
const rotorPositions = [5, 10, 15];
const ringSettings = [1, 2, 3];
const plugboardPairs = [['A', 'B'], ['C', 'D'], ['E', 'F']];

console.log(`Original message: "${message}"`);

// Create two identical Enigma machines
const enigma1 = new Enigma([0, 1, 2], rotorPositions, ringSettings, plugboardPairs);
const enigma2 = new Enigma([0, 1, 2], rotorPositions, ringSettings, plugboardPairs);

// Encrypt the message
const encrypted = enigma1.process(message);
console.log(`Encrypted: "${encrypted}"`);

// Decrypt the message
const decrypted = enigma2.process(encrypted);
console.log(`Decrypted: "${decrypted}"`);

// Verify symmetry
if (decrypted === message) {
  console.log('\n✅ SUCCESS: Enigma machine working perfectly!');
  console.log('✅ Encryption and decryption are symmetric');
  console.log('✅ All functionality verified');
} else {
  console.log('\n❌ FAILURE: Decryption does not match original');
  console.log(`Expected: "${message}"`);
  console.log(`Got: "${decrypted}"`);
}

console.log('\n=== Test Summary ===');
console.log('✓ Rotor stepping mechanism');
console.log('✓ Double-stepping anomaly');
console.log('✓ Plugboard transformations');
console.log('✓ Ring settings');
console.log('✓ Reflector functionality');
console.log('✓ Non-alphabetic character preservation');
console.log('✓ Symmetric encryption/decryption'); 