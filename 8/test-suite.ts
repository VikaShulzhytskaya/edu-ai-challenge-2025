import { Schema, ValidationResult } from './schema';

// Test framework utilities
class TestSuite {
  private tests: Test[] = [];
  private passed = 0;
  private failed = 0;

  test(name: string, testFn: () => void) {
    this.tests.push(new Test(name, testFn));
  }

  run() {
    console.log('🧪 COMPREHENSIVE VALIDATION LIBRARY TEST SUITE');
    console.log('='.repeat(80));

    for (const test of this.tests) {
      try {
        test.run();
        this.passed++;
        console.log(`✅ ${test.name}`);
      } catch (error) {
        this.failed++;
        console.log(`❌ ${test.name}`);
        console.log(`   Error: ${error}`);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log(`📊 TEST RESULTS: ${this.passed} passed, ${this.failed} failed`);
    
    if (this.failed === 0) {
      console.log('🎉 ALL TESTS PASSED!');
    } else {
      console.log('⚠️  Some tests failed. Please review the errors above.');
    }
  }
}

class Test {
  constructor(public name: string, private testFn: () => void) {}

  run() {
    this.testFn();
  }
}

// Assertion utilities
function assertTrue(condition: boolean, message: string = 'Assertion failed') {
  if (!condition) {
    throw new Error(message);
  }
}

function assertFalse(condition: boolean, message: string = 'Assertion failed') {
  if (condition) {
    throw new Error(message);
  }
}

function assertEquals<T>(actual: T, expected: T, message: string = 'Values are not equal') {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}. Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`);
  }
}

function assertContains(array: any[], item: any, message: string = 'Array does not contain item') {
  if (!array.includes(item)) {
    throw new Error(`${message}. Array: ${JSON.stringify(array)}, Item: ${JSON.stringify(item)}`);
  }
}

function assertValidationSuccess<T>(result: ValidationResult<T>, expectedData?: T) {
  assertTrue(result.success, `Expected validation to succeed but got errors: ${result.errors?.join(', ')}`);
  if (expectedData !== undefined) {
    assertEquals(result.data, expectedData, 'Validation data does not match expected');
  }
}

function assertValidationError<T>(result: ValidationResult<T>, expectedErrors?: string[]) {
  assertFalse(result.success, 'Expected validation to fail but it succeeded');
  assertTrue(result.errors !== undefined, 'Expected errors array to be present');
  
  if (expectedErrors) {
    for (const expectedError of expectedErrors) {
      const found = result.errors!.some(error => error.includes(expectedError));
      assertTrue(found, `Expected error containing "${expectedError}" but got: ${result.errors!.join(', ')}`);
    }
  }
}

// Create test suite instance
const testSuite = new TestSuite();

// =============================================================================
// STRING VALIDATOR TESTS
// =============================================================================

testSuite.test('String Validator - Valid strings', () => {
  const validator = Schema.string();
  
  assertValidationSuccess(validator.validate('hello'), 'hello');
  assertValidationSuccess(validator.validate(''), '');
  assertValidationSuccess(validator.validate('123'), '123');
  assertValidationSuccess(validator.validate('special chars: !@#$%^&*()'), 'special chars: !@#$%^&*()');
});

testSuite.test('String Validator - Invalid types', () => {
  const validator = Schema.string();
  
  assertValidationError(validator.validate(123), ['Value must be a string']);
  assertValidationError(validator.validate(true), ['Value must be a string']);
  assertValidationError(validator.validate({}), ['Value must be a string']);
  assertValidationError(validator.validate([]), ['Value must be a string']);
  assertValidationError(validator.validate(null), ['Value is required']);
  assertValidationError(validator.validate(undefined), ['Value is required']);
});

testSuite.test('String Validator - Length constraints', () => {
  const validator = Schema.string().minLength(3).maxLength(10);
  
  assertValidationSuccess(validator.validate('abc'), 'abc');
  assertValidationSuccess(validator.validate('abcdefghij'), 'abcdefghij');
  assertValidationSuccess(validator.validate('12345'), '12345');
  
  assertValidationError(validator.validate('ab'), ['String must have at least 3 characters long']);
  assertValidationError(validator.validate('abcdefghijk'), ['String must have no more than 10 characters long']);
  assertValidationError(validator.validate(''), ['String must have at least 3 characters long']);
});

testSuite.test('String Validator - Pattern validation', () => {
  const alphaValidator = Schema.string().pattern(/^[a-zA-Z]+$/);
  
  assertValidationSuccess(alphaValidator.validate('hello'), 'hello');
  assertValidationSuccess(alphaValidator.validate('WORLD'), 'WORLD');
  assertValidationSuccess(alphaValidator.validate('MixedCase'), 'MixedCase');
  
  assertValidationError(alphaValidator.validate('hello123'), ['Value does not match the required pattern']);
  assertValidationError(alphaValidator.validate('hello world'), ['Value does not match the required pattern']);
  assertValidationError(alphaValidator.validate('hello!'), ['Value does not match the required pattern']);
  
  // Phone number pattern
  const phoneValidator = Schema.string().pattern(/^\+?[1-9]\d{1,14}$/);
  assertValidationSuccess(phoneValidator.validate('+1234567890'), '+1234567890');
  assertValidationSuccess(phoneValidator.validate('1234567890'), '1234567890');
  assertValidationError(phoneValidator.validate('abc123'), ['Value does not match the required pattern']);
});

testSuite.test('String Validator - Email validation', () => {
  const emailValidator = Schema.string().email();
  
  assertValidationSuccess(emailValidator.validate('user@example.com'), 'user@example.com');
  assertValidationSuccess(emailValidator.validate('test.email+tag@example.org'), 'test.email+tag@example.org');
  assertValidationSuccess(emailValidator.validate('user123@sub.domain.com'), 'user123@sub.domain.com');
  
  assertValidationError(emailValidator.validate('invalid-email'), ['Must be a valid email address']);
  assertValidationError(emailValidator.validate('user@'), ['Must be a valid email address']);
  assertValidationError(emailValidator.validate('@example.com'), ['Must be a valid email address']);
  assertValidationError(emailValidator.validate('user space@example.com'), ['Must be a valid email address']);
});

testSuite.test('String Validator - URL validation', () => {
  const urlValidator = Schema.string().url();
  
  assertValidationSuccess(urlValidator.validate('https://example.com'), 'https://example.com');
  assertValidationSuccess(urlValidator.validate('http://subdomain.example.org/path'), 'http://subdomain.example.org/path');
  assertValidationSuccess(urlValidator.validate('https://example.com:8080/path?query=value'), 'https://example.com:8080/path?query=value');
  
  assertValidationError(urlValidator.validate('ftp://example.com'), ['Must be a valid URL']);
  assertValidationError(urlValidator.validate('not-a-url'), ['Must be a valid URL']);
  assertValidationError(urlValidator.validate('example.com'), ['Must be a valid URL']);
});

testSuite.test('String Validator - Optional fields', () => {
  const optionalValidator = Schema.string().optional();
  
  assertValidationSuccess(optionalValidator.validate('hello'), 'hello');
  assertValidationSuccess(optionalValidator.validate(undefined), undefined);
  assertValidationSuccess(optionalValidator.validate(null), undefined);
  
  assertValidationError(optionalValidator.validate(123), ['Value must be a string']);
});

testSuite.test('String Validator - Custom error messages', () => {
  const customValidator = Schema.string().withMessage('Custom string error');
  
  assertValidationError(customValidator.validate(123), ['Custom string error']);
  assertValidationError(customValidator.validate(null), ['Custom string error']);
});

// =============================================================================
// NUMBER VALIDATOR TESTS
// =============================================================================

testSuite.test('Number Validator - Valid numbers', () => {
  const validator = Schema.number();
  
  assertValidationSuccess(validator.validate(0), 0);
  assertValidationSuccess(validator.validate(42), 42);
  assertValidationSuccess(validator.validate(-5), -5);
  assertValidationSuccess(validator.validate(3.14), 3.14);
  assertValidationSuccess(validator.validate(-99.99), -99.99);
});

testSuite.test('Number Validator - Invalid types', () => {
  const validator = Schema.number();
  
  assertValidationError(validator.validate('123'), ['Value must be a number']);
  assertValidationError(validator.validate(true), ['Value must be a number']);
  assertValidationError(validator.validate({}), ['Value must be a number']);
  assertValidationError(validator.validate([]), ['Value must be a number']);
  assertValidationError(validator.validate(NaN), ['Value must be a number']);
  assertValidationError(validator.validate(null), ['Value is required']);
  assertValidationError(validator.validate(undefined), ['Value is required']);
});

testSuite.test('Number Validator - Range constraints', () => {
  const validator = Schema.number().min(0).max(100);
  
  assertValidationSuccess(validator.validate(0), 0);
  assertValidationSuccess(validator.validate(50), 50);
  assertValidationSuccess(validator.validate(100), 100);
  assertValidationSuccess(validator.validate(99.99), 99.99);
  
  assertValidationError(validator.validate(-1), ['Number must be at least 0']);
  assertValidationError(validator.validate(101), ['Number must be no more than 100']);
  assertValidationError(validator.validate(-999), ['Number must be at least 0']);
});

testSuite.test('Number Validator - Integer constraint', () => {
  const validator = Schema.number().integer();
  
  assertValidationSuccess(validator.validate(0), 0);
  assertValidationSuccess(validator.validate(42), 42);
  assertValidationSuccess(validator.validate(-5), -5);
  
  assertValidationError(validator.validate(3.14), ['Number must be an integer']);
  assertValidationError(validator.validate(0.1), ['Number must be an integer']);
  assertValidationError(validator.validate(-2.5), ['Number must be an integer']);
});

testSuite.test('Number Validator - Positive constraint', () => {
  const validator = Schema.number().positive();
  
  assertValidationSuccess(validator.validate(1), 1);
  assertValidationSuccess(validator.validate(42), 42);
  assertValidationSuccess(validator.validate(0.1), 0.1);
  
  assertValidationError(validator.validate(0), ['Number must be positive']);
  assertValidationError(validator.validate(-1), ['Number must be positive']);
  assertValidationError(validator.validate(-0.1), ['Number must be positive']);
});

testSuite.test('Number Validator - Combined constraints', () => {
  const validator = Schema.number().min(1).max(10).integer().positive();
  
  assertValidationSuccess(validator.validate(1), 1);
  assertValidationSuccess(validator.validate(5), 5);
  assertValidationSuccess(validator.validate(10), 10);
  
  assertValidationError(validator.validate(0), ['Number must be at least 1']);
  assertValidationError(validator.validate(11), ['Number must be no more than 10']);
  assertValidationError(validator.validate(5.5), ['Number must be an integer']);
  assertValidationError(validator.validate(-5), ['Number must be at least 1']);
});

// =============================================================================
// BOOLEAN VALIDATOR TESTS
// =============================================================================

testSuite.test('Boolean Validator - Valid booleans', () => {
  const validator = Schema.boolean();
  
  assertValidationSuccess(validator.validate(true), true);
  assertValidationSuccess(validator.validate(false), false);
});

testSuite.test('Boolean Validator - Invalid types', () => {
  const validator = Schema.boolean();
  
  assertValidationError(validator.validate('true'), ['Value must be a boolean']);
  assertValidationError(validator.validate('false'), ['Value must be a boolean']);
  assertValidationError(validator.validate(1), ['Value must be a boolean']);
  assertValidationError(validator.validate(0), ['Value must be a boolean']);
  assertValidationError(validator.validate({}), ['Value must be a boolean']);
  assertValidationError(validator.validate([]), ['Value must be a boolean']);
  assertValidationError(validator.validate(null), ['Value is required']);
  assertValidationError(validator.validate(undefined), ['Value is required']);
});

testSuite.test('Boolean Validator - Optional', () => {
  const validator = Schema.boolean().optional();
  
  assertValidationSuccess(validator.validate(true), true);
  assertValidationSuccess(validator.validate(false), false);
  assertValidationSuccess(validator.validate(undefined), undefined);
  assertValidationSuccess(validator.validate(null), undefined);
  
  assertValidationError(validator.validate('true'), ['Value must be a boolean']);
});

// =============================================================================
// DATE VALIDATOR TESTS
// =============================================================================

testSuite.test('Date Validator - Valid dates', () => {
  const validator = Schema.date();
  const testDate = new Date('2023-01-01');
  
  assertValidationSuccess(validator.validate(testDate), testDate);
  assertValidationSuccess(validator.validate('2023-01-01'));
  assertValidationSuccess(validator.validate('2023-01-01T12:00:00Z'));
  assertValidationSuccess(validator.validate(1672531200000)); // timestamp
});

testSuite.test('Date Validator - Invalid dates', () => {
  const validator = Schema.date();
  
  assertValidationError(validator.validate('invalid-date'), ['Value must be a valid date']);
  assertValidationError(validator.validate('2023-13-01'), ['Value must be a valid date']);
  assertValidationError(validator.validate('not-a-date'), ['Value must be a valid date']);
  assertValidationError(validator.validate({}), ['Value must be a Date, string, or number']);
  assertValidationError(validator.validate([]), ['Value must be a Date, string, or number']);
  assertValidationError(validator.validate(true), ['Value must be a Date, string, or number']);
  assertValidationError(validator.validate(null), ['Value is required']);
  assertValidationError(validator.validate(undefined), ['Value is required']);
});

testSuite.test('Date Validator - Range constraints', () => {
  const minDate = new Date('2020-01-01');
  const maxDate = new Date('2025-12-31');
  const validator = Schema.date().min(minDate).max(maxDate);
  
  assertValidationSuccess(validator.validate(new Date('2022-06-15')));
  assertValidationSuccess(validator.validate(new Date('2020-01-01')));
  assertValidationSuccess(validator.validate(new Date('2025-12-31')));
  
  assertValidationError(validator.validate(new Date('2019-12-31')), ['Date must be after']);
  assertValidationError(validator.validate(new Date('2026-01-01')), ['Date must be before']);
});

testSuite.test('Date Validator - Future constraint', () => {
  const validator = Schema.date().future();
  const futureDate = new Date(Date.now() + 86400000); // Tomorrow
  const pastDate = new Date(Date.now() - 86400000); // Yesterday
  
  assertValidationSuccess(validator.validate(futureDate));
  assertValidationError(validator.validate(pastDate), ['Date must be in the future']);
});

testSuite.test('Date Validator - Past constraint', () => {
  const validator = Schema.date().past();
  const futureDate = new Date(Date.now() + 86400000); // Tomorrow
  const pastDate = new Date(Date.now() - 86400000); // Yesterday
  
  assertValidationSuccess(validator.validate(pastDate));
  assertValidationError(validator.validate(futureDate), ['Date must be in the past']);
});

// =============================================================================
// ARRAY VALIDATOR TESTS
// =============================================================================

testSuite.test('Array Validator - Valid arrays', () => {
  const validator = Schema.array(Schema.string());
  
  assertValidationSuccess(validator.validate(['hello', 'world']), ['hello', 'world']);
  assertValidationSuccess(validator.validate([]), []);
  assertValidationSuccess(validator.validate(['single']), ['single']);
});

testSuite.test('Array Validator - Invalid types', () => {
  const validator = Schema.array(Schema.string());
  
  assertValidationError(validator.validate('not-array'), ['Value must be an array']);
  assertValidationError(validator.validate(123), ['Value must be an array']);
  assertValidationError(validator.validate({}), ['Value must be an array']);
  assertValidationError(validator.validate(true), ['Value must be an array']);
  assertValidationError(validator.validate(null), ['Value is required']);
  assertValidationError(validator.validate(undefined), ['Value is required']);
});

testSuite.test('Array Validator - Item validation', () => {
  const validator = Schema.array(Schema.string());
  
  assertValidationSuccess(validator.validate(['hello', 'world']), ['hello', 'world']);
  
  assertValidationError(validator.validate(['hello', 123]), ['Item at index 1: Value must be a string']);
  assertValidationError(validator.validate([123, 'world']), ['Item at index 0: Value must be a string']);
  assertValidationError(validator.validate(['hello', 123, true]), ['Item at index 1: Value must be a string', 'Item at index 2: Value must be a string']);
});

testSuite.test('Array Validator - Length constraints', () => {
  const validator = Schema.array(Schema.string()).minLength(2).maxLength(4);
  
  assertValidationSuccess(validator.validate(['a', 'b']), ['a', 'b']);
  assertValidationSuccess(validator.validate(['a', 'b', 'c']), ['a', 'b', 'c']);
  assertValidationSuccess(validator.validate(['a', 'b', 'c', 'd']), ['a', 'b', 'c', 'd']);
  
  assertValidationError(validator.validate(['a']), ['Array must have at least 2 items']);
  assertValidationError(validator.validate([]), ['Array must have at least 2 items']);
  assertValidationError(validator.validate(['a', 'b', 'c', 'd', 'e']), ['Array must have no more than 4 items']);
});

testSuite.test('Array Validator - NonEmpty constraint', () => {
  const validator = Schema.array(Schema.string()).nonEmpty();
  
  assertValidationSuccess(validator.validate(['hello']), ['hello']);
  assertValidationSuccess(validator.validate(['a', 'b', 'c']), ['a', 'b', 'c']);
  
  assertValidationError(validator.validate([]), ['Array cannot be empty']);
});

testSuite.test('Array Validator - Complex item validation', () => {
  const validator = Schema.array(Schema.number().min(0).max(100));
  
  assertValidationSuccess(validator.validate([0, 50, 100]), [0, 50, 100]);
  
  assertValidationError(validator.validate([0, -1, 50]), ['Item at index 1: Number must be at least 0']);
  assertValidationError(validator.validate([0, 50, 101]), ['Item at index 2: Number must be no more than 100']);
});

// =============================================================================
// OBJECT VALIDATOR TESTS
// =============================================================================

testSuite.test('Object Validator - Valid objects', () => {
  const validator = Schema.object({
    name: Schema.string(),
    age: Schema.number()
  });
  
  const testData = { name: 'John', age: 30 };
  assertValidationSuccess(validator.validate(testData), testData);
});

testSuite.test('Object Validator - Invalid types', () => {
  const validator = Schema.object({
    name: Schema.string()
  });
  
  assertValidationError(validator.validate('not-object'), ['Value must be an object']);
  assertValidationError(validator.validate(123), ['Value must be an object']);
  assertValidationError(validator.validate([]), ['Value must be an object']);
  assertValidationError(validator.validate(true), ['Value must be an object']);
  assertValidationError(validator.validate(null), ['Value is required']);
  assertValidationError(validator.validate(undefined), ['Value is required']);
});

testSuite.test('Object Validator - Field validation errors', () => {
  const validator = Schema.object({
    name: Schema.string().minLength(2),
    age: Schema.number().min(0),
    email: Schema.string().email()
  });
  
  const invalidData = {
    name: 'A', // too short
    age: -5, // negative
    email: 'invalid-email' // invalid format
  };
  
  const result = validator.validate(invalidData);
  assertValidationError(result);
  assertTrue(result.errors!.some(e => e.includes("Field 'name'")));
  assertTrue(result.errors!.some(e => e.includes("Field 'age'")));
  assertTrue(result.errors!.some(e => e.includes("Field 'email'")));
});

testSuite.test('Object Validator - Optional fields', () => {
  const validator = Schema.object({
    name: Schema.string(),
    age: Schema.number().optional(),
    email: Schema.string().email().optional()
  });
  
  assertValidationSuccess(validator.validate({ name: 'John' }));
  assertValidationSuccess(validator.validate({ name: 'John', age: 30 }));
  assertValidationSuccess(validator.validate({ name: 'John', email: 'john@example.com' }));
  assertValidationSuccess(validator.validate({ name: 'John', age: 30, email: 'john@example.com' }));
});

testSuite.test('Object Validator - Nested objects', () => {
  const addressValidator = Schema.object({
    street: Schema.string(),
    city: Schema.string(),
    zipCode: Schema.string().pattern(/^\d{5}$/)
  });
  
  const personValidator = Schema.object({
    name: Schema.string(),
    address: addressValidator
  });
  
  const validPerson = {
    name: 'John',
    address: {
      street: '123 Main St',
      city: 'Anytown',
      zipCode: '12345'
    }
  };
  
  assertValidationSuccess(personValidator.validate(validPerson), validPerson);
  
  const invalidPerson = {
    name: 'John',
    address: {
      street: '123 Main St',
      city: 'Anytown',
      zipCode: 'invalid'
    }
  };
  
  assertValidationError(personValidator.validate(invalidPerson), ["Field 'address'"]);
});

// =============================================================================
// UNION VALIDATOR TESTS
// =============================================================================

testSuite.test('Union Validator - Valid union types', () => {
  const validator = Schema.union(
    Schema.string(),
    Schema.number(),
    Schema.boolean()
  );
  
  assertValidationSuccess(validator.validate('hello'), 'hello');
  assertValidationSuccess(validator.validate(42), 42);
  assertValidationSuccess(validator.validate(true), true);
  assertValidationSuccess(validator.validate(false), false);
});

testSuite.test('Union Validator - Invalid union types', () => {
  const validator = Schema.union(
    Schema.string(),
    Schema.number()
  );
  
  assertValidationError(validator.validate({}), ['Value does not match any of the allowed types']);
  assertValidationError(validator.validate([]), ['Value does not match any of the allowed types']);
  assertValidationError(validator.validate(true), ['Value does not match any of the allowed types']);
  assertValidationError(validator.validate(null), ['Value is required']);
  assertValidationError(validator.validate(undefined), ['Value is required']);
});

testSuite.test('Union Validator - Complex union with constraints', () => {
  const validator = Schema.union(
    Schema.string().email(),
    Schema.number().min(0).max(100)
  );
  
  assertValidationSuccess(validator.validate('user@example.com'), 'user@example.com');
  assertValidationSuccess(validator.validate(50), 50);
  
  assertValidationError(validator.validate('invalid-email'), ['Value does not match any of the allowed types']);
  assertValidationError(validator.validate(150), ['Value does not match any of the allowed types']);
});

// =============================================================================
// LITERAL VALIDATOR TESTS
// =============================================================================

testSuite.test('Literal Validator - String literals', () => {
  const validator = Schema.literal('active');
  
  assertValidationSuccess(validator.validate('active'), 'active');
  
  assertValidationError(validator.validate('inactive'), ['Value must be exactly active']);
  assertValidationError(validator.validate('ACTIVE'), ['Value must be exactly active']);
  assertValidationError(validator.validate(''), ['Value must be exactly active']);
});

testSuite.test('Literal Validator - Number literals', () => {
  const validator = Schema.literal(42);
  
  assertValidationSuccess(validator.validate(42), 42);
  
  assertValidationError(validator.validate(41), ['Value must be exactly 42']);
  assertValidationError(validator.validate(43), ['Value must be exactly 42']);
  assertValidationError(validator.validate('42'), ['Value must be exactly 42']);
});

testSuite.test('Literal Validator - Boolean literals', () => {
  const validator = Schema.literal(true);
  
  assertValidationSuccess(validator.validate(true), true);
  
  assertValidationError(validator.validate(false), ['Value must be exactly true']);
  assertValidationError(validator.validate('true'), ['Value must be exactly true']);
  assertValidationError(validator.validate(1), ['Value must be exactly true']);
});

testSuite.test('Literal Validator - Union of literals', () => {
  const statusValidator = Schema.union(
    Schema.literal('pending'),
    Schema.literal('approved'),
    Schema.literal('rejected')
  );
  
  assertValidationSuccess(statusValidator.validate('pending'), 'pending');
  assertValidationSuccess(statusValidator.validate('approved'), 'approved');
  assertValidationSuccess(statusValidator.validate('rejected'), 'rejected');
  
  assertValidationError(statusValidator.validate('unknown'), ['Value does not match any of the allowed types']);
  assertValidationError(statusValidator.validate('PENDING'), ['Value does not match any of the allowed types']);
});

// =============================================================================
// COMPLEX INTEGRATION TESTS
// =============================================================================

testSuite.test('Complex Schema - User Profile', () => {
  const userSchema = Schema.object({
    id: Schema.string().pattern(/^USER_\d+$/),
    username: Schema.string().minLength(3).maxLength(20).pattern(/^[a-zA-Z0-9_]+$/),
    email: Schema.string().email(),
    age: Schema.number().min(13).max(120).integer().optional(),
    isActive: Schema.boolean(),
    roles: Schema.array(Schema.union(
      Schema.literal('admin'),
      Schema.literal('user'),
      Schema.literal('moderator')
    )).nonEmpty(),
    profile: Schema.object({
      firstName: Schema.string().minLength(1),
      lastName: Schema.string().minLength(1),
      bio: Schema.string().maxLength(500).optional(),
      avatar: Schema.string().url().optional()
    }),
    preferences: Schema.object({
      theme: Schema.union(Schema.literal('light'), Schema.literal('dark')),
      notifications: Schema.boolean(),
      language: Schema.string().pattern(/^[a-z]{2}$/)
    }).optional()
  });
  
  const validUser = {
    id: 'USER_12345',
    username: 'john_doe',
    email: 'john@example.com',
    age: 28,
    isActive: true,
    roles: ['user', 'moderator'],
    profile: {
      firstName: 'John',
      lastName: 'Doe',
      bio: 'Software developer with 5 years of experience.',
      avatar: 'https://example.com/avatar.jpg'
    },
    preferences: {
      theme: 'dark',
      notifications: true,
      language: 'en'
    }
  };
  
  assertValidationSuccess(userSchema.validate(validUser));
  
  const invalidUser = {
    id: 'invalid-id',
    username: 'jo',
    email: 'not-an-email',
    age: 12,
    isActive: 'yes',
    roles: ['invalid-role'],
    profile: {
      firstName: '',
      lastName: 'Doe',
      avatar: 'not-a-url'
    },
    preferences: {
      theme: 'purple',
      notifications: 'yes',
      language: 'english'
    }
  };
  
  assertValidationError(userSchema.validate(invalidUser));
});

testSuite.test('Complex Schema - E-commerce Order', () => {
  const orderSchema = Schema.object({
    orderId: Schema.string().pattern(/^ORD-\d{8}$/),
    customerId: Schema.string().pattern(/^CUST-\d{6}$/),
    items: Schema.array(Schema.object({
      productId: Schema.string(),
      name: Schema.string().minLength(1),
      price: Schema.number().min(0),
      quantity: Schema.number().integer().positive(),
      category: Schema.union(
        Schema.literal('electronics'),
        Schema.literal('clothing'),
        Schema.literal('books'),
        Schema.literal('home')
      )
    })).minLength(1).maxLength(50),
    shipping: Schema.object({
      address: Schema.object({
        street: Schema.string().minLength(1),
        city: Schema.string().minLength(1),
        state: Schema.string().pattern(/^[A-Z]{2}$/),
        zipCode: Schema.string().pattern(/^\d{5}(-\d{4})?$/),
        country: Schema.string().pattern(/^[A-Z]{2}$/)
      }),
      method: Schema.union(
        Schema.literal('standard'),
        Schema.literal('express'),
        Schema.literal('overnight')
      ),
      cost: Schema.number().min(0)
    }),
    payment: Schema.object({
      method: Schema.union(
        Schema.literal('credit_card'),
        Schema.literal('paypal'),
        Schema.literal('bank_transfer')
      ),
      amount: Schema.number().min(0),
      currency: Schema.string().pattern(/^[A-Z]{3}$/),
      status: Schema.union(
        Schema.literal('pending'),
        Schema.literal('completed'),
        Schema.literal('failed')
      )
    }),
    orderDate: Schema.date(),
    estimatedDelivery: Schema.date().optional(),
    status: Schema.union(
      Schema.literal('pending'),
      Schema.literal('processing'),
      Schema.literal('shipped'),
      Schema.literal('delivered'),
      Schema.literal('cancelled')
    )
  });
  
  const validOrder = {
    orderId: 'ORD-12345678',
    customerId: 'CUST-123456',
    items: [
      {
        productId: 'PROD-001',
        name: 'Laptop',
        price: 999.99,
        quantity: 1,
        category: 'electronics'
      },
      {
        productId: 'PROD-002',
        name: 'Mouse',
        price: 29.99,
        quantity: 2,
        category: 'electronics'
      }
    ],
    shipping: {
      address: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '90210',
        country: 'US'
      },
      method: 'standard',
      cost: 9.99
    },
    payment: {
      method: 'credit_card',
      amount: 1069.97,
      currency: 'USD',
      status: 'completed'
    },
    orderDate: new Date('2023-01-01'),
    estimatedDelivery: new Date('2023-01-07'),
    status: 'processing'
  };
  
  assertValidationSuccess(orderSchema.validate(validOrder));
});

// =============================================================================
// COMPREHENSIVE INVALID DATA SCENARIOS
// =============================================================================

testSuite.test('Invalid Data - Extreme String Cases', () => {
  const validator = Schema.string();
  
  // Function as input
  assertValidationError(validator.validate(() => {}), ['Value must be a string']);
  // Symbol as input
  assertValidationError(validator.validate(Symbol('test')), ['Value must be a string']);
  // BigInt as input
  assertValidationError(validator.validate(BigInt(123)), ['Value must be a string']);
  // Circular object
  const circular: any = {};
  circular.self = circular;
  assertValidationError(validator.validate(circular), ['Value must be a string']);
});

testSuite.test('Invalid Data - Extreme Number Cases', () => {
  const validator = Schema.number();
  
  // String numbers that should fail
  assertValidationError(validator.validate('123.45'), ['Value must be a number']);
  assertValidationError(validator.validate('0'), ['Value must be a number']);
  assertValidationError(validator.validate('NaN'), ['Value must be a number']);
  assertValidationError(validator.validate('Infinity'), ['Value must be a number']);
  
  // Date objects
  assertValidationError(validator.validate(new Date()), ['Value must be a number']);
  
  // Array with numbers
  assertValidationError(validator.validate([123]), ['Value must be a number']);
  
  // Object with valueOf returning number
  assertValidationError(validator.validate({ valueOf: () => 42 }), ['Value must be a number']);
});

testSuite.test('Invalid Data - Malformed Objects', () => {
  const validator = Schema.object({
    name: Schema.string(),
    age: Schema.number(),
    email: Schema.string().email()
  });
  
  // Missing multiple required fields
  assertValidationError(validator.validate({}));
  
  // Partial object with some invalid fields
  assertValidationError(validator.validate({
    name: 123, // wrong type
    age: 'thirty', // wrong type
    email: 'invalid'
  }));
  
  // Object with extra properties (though not strict mode)
  const result = validator.validate({
    name: 'John',
    age: 30,
    email: 'john@example.com',
    extraField: 'should be ignored'
  });
  assertValidationSuccess(result); // Should pass since we're not in strict mode
  
  // Nested object as wrong field type
  assertValidationError(validator.validate({
    name: { first: 'John', last: 'Doe' }, // object instead of string
    age: 30,
    email: 'john@example.com'
  }));
});

testSuite.test('Invalid Data - Array Edge Cases', () => {
  const stringArrayValidator = Schema.array(Schema.string());
  
  // Array-like objects that aren't real arrays
  assertValidationError(stringArrayValidator.validate({ 0: 'a', 1: 'b', length: 2 }), ['Value must be an array']);
  
  // Sparse arrays with undefined elements
  const sparseArray = ['a', , 'c']; // Has undefined at index 1
  assertValidationError(stringArrayValidator.validate(sparseArray), ['Item at index 1: Value is required']);
  
  // Array with null values
  assertValidationError(stringArrayValidator.validate(['hello', null, 'world']), ['Item at index 1: Value is required']);
  
  // Deeply nested arrays when expecting flat array
  assertValidationError(stringArrayValidator.validate([['nested', 'array']]), ['Item at index 0: Value must be a string']);
});

testSuite.test('Invalid Data - Complex Nested Failures', () => {
  const complexValidator = Schema.object({
    users: Schema.array(Schema.object({
      id: Schema.string().pattern(/^USER_\d+$/),
      profile: Schema.object({
        name: Schema.string().minLength(2),
        contacts: Schema.object({
          email: Schema.string().email(),
          phone: Schema.string().pattern(/^\+?[1-9]\d{1,14}$/)
        })
      })
    }))
  });
  
  const invalidNestedData = {
    users: [
      {
        id: 'invalid-id', // pattern violation
        profile: {
          name: 'A', // too short
          contacts: {
            email: 'not-email', // invalid email
            phone: 'abc123' // invalid phone
          }
        }
      },
      {
        id: 'USER_123',
        profile: {
          name: 'Valid Name',
          contacts: {
            email: 'valid@email.com',
            phone: null // wrong type
          }
        }
      }
    ]
  };
  
  const result = complexValidator.validate(invalidNestedData);
  assertValidationError(result);
  
  // Should have errors (array collects all field errors)
  assertTrue(result.errors!.length >= 1, 'Should have validation errors');
});

testSuite.test('Invalid Data - Union Type Edge Cases', () => {
  const strictUnionValidator = Schema.union(
    Schema.string().email(),
    Schema.number().integer().positive(),
    Schema.literal('special')
  );
  
  // Values that are correct type but fail constraints
  assertValidationError(strictUnionValidator.validate('not-an-email'), ['Value does not match any of the allowed types']);
  assertValidationError(strictUnionValidator.validate(-5), ['Value does not match any of the allowed types']);
  assertValidationError(strictUnionValidator.validate(3.14), ['Value does not match any of the allowed types']);
  assertValidationError(strictUnionValidator.validate('SPECIAL'), ['Value does not match any of the allowed types']);
  
  // Types not in union
  assertValidationError(strictUnionValidator.validate(true), ['Value does not match any of the allowed types']);
  assertValidationError(strictUnionValidator.validate([]), ['Value does not match any of the allowed types']);
  assertValidationError(strictUnionValidator.validate({}), ['Value does not match any of the allowed types']);
});

testSuite.test('Invalid Data - Date Edge Cases', () => {
  const dateValidator = Schema.date();
  
  // Invalid date strings that JavaScript actually considers invalid
  assertValidationError(dateValidator.validate('invalid-date'), ['Value must be a valid date']);
  assertValidationError(dateValidator.validate('not-a-date'), ['Value must be a valid date']);
  assertValidationError(dateValidator.validate('today'), ['Value must be a valid date']);
  assertValidationError(dateValidator.validate(''), ['Value must be a valid date']);
  assertValidationError(dateValidator.validate('abc123'), ['Value must be a valid date']);
  
  // Non-date types  
  assertValidationError(dateValidator.validate('not-a-number'), ['Value must be a valid date']);
  
  // Objects that look like dates but aren't
  assertValidationError(dateValidator.validate({ year: 2023, month: 1, day: 1 }), ['Value must be a Date, string, or number']);
  
  // Note: JavaScript Date constructor is quite permissive, so many seemingly invalid dates
  // like '2023-02-30' actually get parsed and adjusted to valid dates
});

testSuite.test('Invalid Data - Security and Injection Attempts', () => {
  const validator = Schema.string();
  
  // Potential XSS attempts - these are valid strings, so they should pass string validation
  assertValidationSuccess(validator.validate('<script>alert("xss")</script>'), '<script>alert("xss")</script>');
  assertValidationSuccess(validator.validate('javascript:alert(1)'), 'javascript:alert(1)');
  
  // SQL injection attempts - these are also valid strings
  assertValidationSuccess(validator.validate("'; DROP TABLE users; --"), "'; DROP TABLE users; --");
  assertValidationSuccess(validator.validate("1' OR '1'='1"), "1' OR '1'='1");
  
  // Note: These pass because string validator just checks if it's a string
  // The application layer should handle sanitization and escaping
  
  const emailValidator = Schema.string().email();
  // Email validation should fail for patterns that don't match our regex
  assertValidationError(emailValidator.validate('test@'), ['Must be a valid email address']);
  assertValidationError(emailValidator.validate('@example.com'), ['Must be a valid email address']);
  assertValidationError(emailValidator.validate('test user@example.com'), ['Must be a valid email address']); // space in local part
  assertValidationError(emailValidator.validate('test@example com'), ['Must be a valid email address']); // space in domain
  
  // URL validation should catch patterns that don't match http/https format
  const urlValidator = Schema.string().url();
  assertValidationError(urlValidator.validate('javascript:alert(1)'), ['Must be a valid URL']);
  assertValidationError(urlValidator.validate('file:///etc/passwd'), ['Must be a valid URL']);
});

testSuite.test('Invalid Data - Performance Edge Cases', () => {
  // Very long strings
  const longStringValidator = Schema.string().maxLength(100);
  const veryLongString = 'a'.repeat(1000);
  assertValidationError(longStringValidator.validate(veryLongString), ['String must have no more than 100 characters long']);
  
  // Very large arrays
  const largeArrayValidator = Schema.array(Schema.string()).maxLength(10);
  const largeArray = Array(100).fill('item');
  assertValidationError(largeArrayValidator.validate(largeArray), ['Array must have no more than 10 items']);
  
  // Deep nesting that should fail
  const maxDepthValidator = Schema.object({
    level1: Schema.object({
      level2: Schema.object({
        level3: Schema.string()
      })
    })
  });
  
  assertValidationError(maxDepthValidator.validate({
    level1: {
      level2: {
        level3: 123 // wrong type at deep level
      }
    }
  }));
});

// =============================================================================
// EDGE CASES AND ERROR SCENARIOS
// =============================================================================

testSuite.test('Edge Cases - Empty values', () => {
  // Empty string validation
  const stringValidator = Schema.string().minLength(1);
  assertValidationError(stringValidator.validate(''), ['String must have at least 1 characters long']);
  
  // Empty array validation
  const arrayValidator = Schema.array(Schema.string()).nonEmpty();
  assertValidationError(arrayValidator.validate([]), ['Array cannot be empty']);
  
  // Empty object validation
  const objectValidator = Schema.object({
    required: Schema.string()
  });
  assertValidationError(objectValidator.validate({}), ["Field 'required': Value is required"]);
});

testSuite.test('Edge Cases - Large numbers', () => {
  const validator = Schema.number();
  
  assertValidationSuccess(validator.validate(Number.MAX_SAFE_INTEGER), Number.MAX_SAFE_INTEGER);
  assertValidationSuccess(validator.validate(Number.MIN_SAFE_INTEGER), Number.MIN_SAFE_INTEGER);
  assertValidationSuccess(validator.validate(Infinity), Infinity);
  assertValidationSuccess(validator.validate(-Infinity), -Infinity);
});

testSuite.test('Edge Cases - Special characters in strings', () => {
  const validator = Schema.string();
  
  assertValidationSuccess(validator.validate('🚀🎉✨'), '🚀🎉✨');
  assertValidationSuccess(validator.validate('line1\nline2'), 'line1\nline2');
  assertValidationSuccess(validator.validate('tab\there'), 'tab\there');
  assertValidationSuccess(validator.validate('quote"here'), 'quote"here');
  assertValidationSuccess(validator.validate("apostrophe'here"), "apostrophe'here");
});

testSuite.test('Edge Cases - Zero values', () => {
  const numberValidator = Schema.number().min(0);
  assertValidationSuccess(numberValidator.validate(0), 0);
  
  const positiveValidator = Schema.number().positive();
  assertValidationError(positiveValidator.validate(0), ['Number must be positive']);
  
  const stringValidator = Schema.string().minLength(0);
  assertValidationSuccess(stringValidator.validate(''), '');
});

testSuite.test('Performance - Large nested object', () => {
  const itemSchema = Schema.object({
    id: Schema.string(),
    name: Schema.string(),
    value: Schema.number()
  });
  
  const largeArraySchema = Schema.object({
    items: Schema.array(itemSchema).maxLength(1000)
  });
  
  const largeData = {
    items: Array.from({ length: 500 }, (_, i) => ({
      id: `item_${i}`,
      name: `Item ${i}`,
      value: i * 10
    }))
  };
  
  const start = Date.now();
  const result = largeArraySchema.validate(largeData);
  const duration = Date.now() - start;
  
  assertValidationSuccess(result);
  assertTrue(duration < 100, `Validation took too long: ${duration}ms`);
});

testSuite.test('Custom Error Messages - Chain validation', () => {
  const validator = Schema.string()
    .minLength(5)
    .maxLength(10)
    .pattern(/^[a-zA-Z]+$/)
    .withMessage('Username must be 5-10 letters only');
  
  assertValidationError(validator.validate('abc'), ['Username must be 5-10 letters only']);
  assertValidationError(validator.validate('abcdefghijk'), ['Username must be 5-10 letters only']);
  assertValidationError(validator.validate('abc123'), ['Username must be 5-10 letters only']);
});

// =============================================================================
// RUN ALL TESTS
// =============================================================================

// Export the test runner function
export function runTests() {
  testSuite.run();
}

// Auto-run tests if this file is executed directly
runTests(); 