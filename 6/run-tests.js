const tests = require('./enigma.test.js');

console.log('=== Individual Test Verification ===\n');

try {
  tests.testPlugboardSwap();
  tests.testRotorStepping();
  tests.testDoubleSteppingAnomaly();
  tests.testSymmetricEncryption();
  tests.testRingSettings();
  tests.testNonAlphabeticCharacters();
  tests.testKnownTestVector();
  tests.testRotorNotchPositions();
  
  console.log('\n=== All Individual Tests Completed Successfully! ===');
} catch (error) {
  console.error('Test failed:', error.message);
  console.error(error.stack);
} 