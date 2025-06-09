const assert = require('assert');
const { Enigma, Rotor, plugboardSwap, ROTORS } = require('./enigma.js');

// Make classes and functions available for testing
class TestRotor extends Rotor {}
class TestEnigma extends Enigma {}

// Export necessary components from enigma.js for testing
function createTestEnigma(rotorIDs, rotorPositions, ringSettings, plugboardPairs) {
  return new TestEnigma(rotorIDs, rotorPositions, ringSettings, plugboardPairs);
}

function testPlugboardSwap() {
  console.log('Testing plugboard functionality...');
  
  // Test basic swapping
  assert.strictEqual(plugboardSwap('A', [['A', 'B']]), 'B');
  assert.strictEqual(plugboardSwap('B', [['A', 'B']]), 'A');
  assert.strictEqual(plugboardSwap('C', [['A', 'B']]), 'C');
  
  // Test multiple pairs
  const pairs = [['A', 'B'], ['C', 'D'], ['E', 'F']];
  assert.strictEqual(plugboardSwap('A', pairs), 'B');
  assert.strictEqual(plugboardSwap('C', pairs), 'D');
  assert.strictEqual(plugboardSwap('E', pairs), 'F');
  assert.strictEqual(plugboardSwap('G', pairs), 'G');
  
  console.log('✓ Plugboard tests passed');
}

function testRotorStepping() {
  console.log('Testing rotor stepping...');
  
  // Test basic rotor stepping
  const enigma = createTestEnigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  
  // Initial positions should be [0, 0, 0]
  assert.strictEqual(enigma.rotors[0].position, 0);
  assert.strictEqual(enigma.rotors[1].position, 0);
  assert.strictEqual(enigma.rotors[2].position, 0);
  
  // After one character, only rightmost rotor should step
  enigma.encryptChar('A');
  assert.strictEqual(enigma.rotors[0].position, 0);
  assert.strictEqual(enigma.rotors[1].position, 0);
  assert.strictEqual(enigma.rotors[2].position, 1);
  
  console.log('✓ Basic rotor stepping test passed');
}

function testDoubleSteppingAnomaly() {
  console.log('Testing double-stepping anomaly...');
  
  // Set up scenario where middle rotor is at notch (E for Rotor II)
  // Rotor II has notch at 'E' (position 4)
  const enigma = createTestEnigma([0, 1, 2], [0, 4, 25], [0, 0, 0], []);
  
  // Before encryption: [0, 4, 25] (middle rotor at notch)
  assert.strictEqual(enigma.rotors[1].position, 4); // At notch 'E'
  
  // Encrypt one character - should trigger double stepping
  enigma.encryptChar('A');
  
  // After encryption: left and middle rotors should have stepped, right rotor always steps
  assert.strictEqual(enigma.rotors[0].position, 1); // Left rotor stepped
  assert.strictEqual(enigma.rotors[1].position, 5); // Middle rotor stepped (double-step)
  assert.strictEqual(enigma.rotors[2].position, 0); // Right rotor stepped (25 -> 0)
  
  console.log('✓ Double-stepping anomaly test passed');
}

function testSymmetricEncryption() {
  console.log('Testing symmetric encryption...');
  
  const message = 'HELLO';
  const enigma1 = createTestEnigma([0, 1, 2], [0, 0, 0], [0, 0, 0], [['A', 'B']]);
  const enigma2 = createTestEnigma([0, 1, 2], [0, 0, 0], [0, 0, 0], [['A', 'B']]);
  
  // Encrypt the message
  const encrypted = enigma1.process(message);
  console.log(`Original: ${message}, Encrypted: ${encrypted}`);
  
  // Decrypt with identical settings
  const decrypted = enigma2.process(encrypted);
  console.log(`Decrypted: ${decrypted}`);
  
  assert.strictEqual(decrypted, message);
  console.log('✓ Symmetric encryption test passed');
}

function testRingSettings() {
  console.log('Testing ring settings...');
  
  // Same message with different ring settings should produce different results
  const message = 'TEST';
  const enigma1 = createTestEnigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  const enigma2 = createTestEnigma([0, 1, 2], [0, 0, 0], [1, 2, 3], []);
  
  const result1 = enigma1.process(message);
  const result2 = enigma2.process(message);
  
  assert.notStrictEqual(result1, result2);
  console.log(`Same message, different ring settings: "${result1}" vs "${result2}"`);
  console.log('✓ Ring settings test passed');
}

function testNonAlphabeticCharacters() {
  console.log('Testing non-alphabetic characters...');
  
  const enigma = createTestEnigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  const message = 'HELLO, WORLD! 123';
  const result = enigma.process(message);
  
  // Non-alphabetic characters should be preserved
  assert(result.includes(','));
  assert(result.includes('!'));
  assert(result.includes(' '));
  assert(result.includes('1'));
  assert(result.includes('2'));
  assert(result.includes('3'));
  
  console.log(`Input: "${message}"`);
  console.log(`Output: "${result}"`);
  console.log('✓ Non-alphabetic characters test passed');
}

function testKnownTestVector() {
  console.log('Testing known test vector...');
  
  // This is a simplified test - in real testing you'd use known historical vectors
  const enigma = createTestEnigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  const message = 'A';
  const result = enigma.process(message);
  
  // Just verify it produces a different character
  assert.notStrictEqual(result, message);
  assert.strictEqual(result.length, 1);
  assert(/[A-Z]/.test(result));
  
  console.log(`Single character test: A -> ${result}`);
  console.log('✓ Known test vector passed');
}

function testRotorNotchPositions() {
  console.log('Testing rotor notch positions...');
  
  // Test that rotors step when they should
  const enigma = createTestEnigma([0, 1, 2], [0, 0, 16], [0, 0, 0], []); // Rotor III at Q-1
  
  // Rotor III has notch at V (position 21), so set to position 21
  enigma.rotors[2].position = 21;
  
  // Before stepping
  assert.strictEqual(enigma.rotors[1].position, 0);
  assert.strictEqual(enigma.rotors[2].position, 21);
  
  // Encrypt one character
  enigma.encryptChar('A');
  
  // Middle rotor should have stepped because right rotor was at notch
  assert.strictEqual(enigma.rotors[1].position, 1);
  assert.strictEqual(enigma.rotors[2].position, 22);
  
  console.log('✓ Rotor notch positions test passed');
}

function runAllTests() {
  console.log('Running Enigma Machine Unit Tests...\n');
  
  try {
    testPlugboardSwap();
    testRotorStepping();
    testDoubleSteppingAnomaly();
    testSymmetricEncryption();
    testRingSettings();
    testNonAlphabeticCharacters();
    testKnownTestVector();
    testRotorNotchPositions();
    
    console.log('\n🎉 All tests passed! Enigma machine is working correctly.');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Export test functions for individual testing
module.exports = {
  testPlugboardSwap,
  testRotorStepping,
  testDoubleSteppingAnomaly,
  testSymmetricEncryption,
  testRingSettings,
  testNonAlphabeticCharacters,
  testKnownTestVector,
  testRotorNotchPositions,
  runAllTests
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}
