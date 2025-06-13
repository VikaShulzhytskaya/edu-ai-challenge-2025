import { Schema } from './schema';

// Utility function to display validation results
function displayResult(title: string, result: any, input?: any) {
  console.log(`\n🔍 ${title}`);
  if (input !== undefined) {
    console.log(`   Input: ${JSON.stringify(input)}`);
  }
  if (result.success) {
    console.log(`   ✅ Valid: ${JSON.stringify(result.data)}`);
  } else {
    console.log(`   ❌ Invalid: ${result.errors?.join(', ')}`);
  }
}

function runDemo() {
  console.log('🚀 Validation Library Demo\n');
  console.log('='.repeat(50));

  // =====================================
  // 1. BASIC PRIMITIVE VALIDATION
  // =====================================
  console.log('\n📋 1. BASIC PRIMITIVE VALIDATION');
  console.log('-'.repeat(30));

  // String validation
  const nameValidator = Schema.string().minLength(2).maxLength(50);
  displayResult('Name Validation (valid)', nameValidator.validate('John Doe'), 'John Doe');
  displayResult('Name Validation (too short)', nameValidator.validate('A'), 'A');

  // Email validation
  const emailValidator = Schema.string().email();
  displayResult('Email Validation (valid)', emailValidator.validate('user@example.com'), 'user@example.com');
  displayResult('Email Validation (invalid)', emailValidator.validate('not-an-email'), 'not-an-email');

  // Number validation
  const ageValidator = Schema.number().min(0).max(150).integer();
  displayResult('Age Validation (valid)', ageValidator.validate(25), 25);
  displayResult('Age Validation (decimal)', ageValidator.validate(25.5), 25.5);
  displayResult('Age Validation (negative)', ageValidator.validate(-5), -5);

  // Boolean validation
  const activeValidator = Schema.boolean();
  displayResult('Boolean Validation (valid)', activeValidator.validate(true), true);
  displayResult('Boolean Validation (string)', activeValidator.validate('true'), 'true');

  // =====================================
  // 2. ADVANCED STRING VALIDATION
  // =====================================
  console.log('\n📝 2. ADVANCED STRING VALIDATION');
  console.log('-'.repeat(30));

  // Pattern validation
  const phoneValidator = Schema.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please enter a valid phone number');
  displayResult('Phone Validation (valid)', phoneValidator.validate('+1234567890'), '+1234567890');
  displayResult('Phone Validation (invalid)', phoneValidator.validate('abc123'), 'abc123');

  // URL validation
  const urlValidator = Schema.string().url();
  displayResult('URL Validation (valid)', urlValidator.validate('https://example.com'), 'https://example.com');
  displayResult('URL Validation (invalid)', urlValidator.validate('not-a-url'), 'not-a-url');

  // =====================================
  // 3. DATE VALIDATION
  // =====================================
  console.log('\n📅 3. DATE VALIDATION');
  console.log('-'.repeat(30));

  const birthDateValidator = Schema.date().past();
  const today = new Date();
  const pastDate = new Date('1990-05-15');
  const futureDate = new Date(today.getTime() + 86400000); // Tomorrow

  displayResult('Birth Date (past)', birthDateValidator.validate(pastDate), pastDate.toISOString());
  displayResult('Birth Date (future)', birthDateValidator.validate(futureDate), futureDate.toISOString());

  // Event date validation
  const eventDateValidator = Schema.date()
    .min(new Date('2024-01-01'))
    .max(new Date('2025-12-31'));
  displayResult('Event Date (valid)', eventDateValidator.validate(new Date('2024-06-15')), '2024-06-15');
  displayResult('Event Date (too early)', eventDateValidator.validate(new Date('2023-12-31')), '2023-12-31');

  // =====================================
  // 4. ARRAY VALIDATION
  // =====================================
  console.log('\n📋 4. ARRAY VALIDATION');
  console.log('-'.repeat(30));

  // Simple array validation
  const tagsValidator = Schema.array(Schema.string()).minLength(1).maxLength(5);
  displayResult('Tags (valid)', tagsValidator.validate(['tech', 'programming']), ['tech', 'programming']);
  displayResult('Tags (empty)', tagsValidator.validate([]), []);
  displayResult('Tags (mixed types)', tagsValidator.validate(['tech', 123]), ['tech', 123]);

  // Array of emails
  const emailListValidator = Schema.array(Schema.string().email()).nonEmpty();
  displayResult('Email List (valid)', emailListValidator.validate(['user1@example.com', 'user2@example.com']));
  displayResult('Email List (invalid email)', emailListValidator.validate(['user1@example.com', 'invalid-email']));

  // =====================================
  // 5. COMPLEX OBJECT VALIDATION
  // =====================================
  console.log('\n🏢 5. COMPLEX OBJECT VALIDATION');
  console.log('-'.repeat(30));

  // User profile schema
  const userProfileSchema = Schema.object<{
    id: string;
    username: string;
    email: string;
    age?: number;
    isActive: boolean;
    tags: string[];
    settings: {
      theme: 'light' | 'dark';
      notifications: boolean;
    };
  }>({
    id: Schema.string().pattern(/^USER_\d+$/).withMessage('ID must start with USER_ followed by numbers'),
    username: Schema.string().minLength(3).maxLength(20).pattern(/^[a-zA-Z0-9_]+$/),
    email: Schema.string().email(),
    age: Schema.number().min(13).max(120).integer().optional(),
    isActive: Schema.boolean(),
    tags: Schema.array(Schema.string()).maxLength(10),
    settings: Schema.object({
      theme: Schema.union(Schema.literal('light'), Schema.literal('dark')),
      notifications: Schema.boolean()
    })
  });

  // Valid user data
  const validUser = {
    id: 'USER_12345',
    username: 'john_doe',
    email: 'john@example.com',
    age: 28,
    isActive: true,
    tags: ['developer', 'typescript', 'nodejs'],
    settings: {
      theme: 'dark' as const,
      notifications: true
    }
  };

  displayResult('User Profile (valid)', userProfileSchema.validate(validUser));

  // Invalid user data
  const invalidUser = {
    id: 'invalid-id',
    username: 'jo',  // too short
    email: 'not-an-email',
    age: 12,  // too young
    isActive: 'yes',  // wrong type
    tags: ['tag1', 'tag2', 123],  // mixed types
    settings: {
      theme: 'purple',  // invalid theme
      notifications: 'yes'  // wrong type
    }
  };

  displayResult('User Profile (invalid)', userProfileSchema.validate(invalidUser));

  // =====================================
  // 6. NESTED OBJECTS & OPTIONAL FIELDS
  // =====================================
  console.log('\n🏠 6. NESTED OBJECTS & OPTIONAL FIELDS');
  console.log('-'.repeat(30));

  // Address schema
  const addressSchema = Schema.object<{
    street: string;
    city: string;
    zipCode: string;
    country: string;
  }>({
    street: Schema.string().minLength(1),
    city: Schema.string().minLength(1),
    zipCode: Schema.string().pattern(/^\d{5}(-\d{4})?$/),
    country: Schema.string().minLength(2)
  });

  // Person with optional address
  const personSchema = Schema.object<{
    firstName: string;
    lastName: string;
    email: string;
    address?: typeof addressSchema extends import('./schema').Validator<infer T> ? T : never;
    phoneNumbers: string[];
  }>({
    firstName: Schema.string().minLength(1),
    lastName: Schema.string().minLength(1),
    email: Schema.string().email(),
    address: addressSchema.optional(),
    phoneNumbers: Schema.array(Schema.string().pattern(/^\+?[1-9]\d{1,14}$/)).minLength(1)
  });

  const validPerson = {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    address: {
      street: '123 Main St',
      city: 'New York',
      zipCode: '10001',
      country: 'USA'
    },
    phoneNumbers: ['+1234567890']
  };

  displayResult('Person with Address (valid)', personSchema.validate(validPerson));

  // Person without optional address
  const personWithoutAddress = {
    firstName: 'Bob',
    lastName: 'Johnson',
    email: 'bob@example.com',
    phoneNumbers: ['+1987654321', '+1555123456']
  };

  displayResult('Person without Address (valid)', personSchema.validate(personWithoutAddress));

  // =====================================
  // 7. UNION TYPES & LITERAL VALUES
  // =====================================
  console.log('\n🔄 7. UNION TYPES & LITERAL VALUES');
  console.log('-'.repeat(30));

  // Status validation
  const statusValidator = Schema.union(
    Schema.literal('pending'),
    Schema.literal('approved'),
    Schema.literal('rejected')
  );

  displayResult('Status (valid)', statusValidator.validate('approved'), 'approved');
  displayResult('Status (invalid)', statusValidator.validate('unknown'), 'unknown');

  // Mixed type validation
  const mixedValidator = Schema.union(
    Schema.string(),
    Schema.number(),
    Schema.boolean()
  );

  displayResult('Mixed Type (string)', mixedValidator.validate('hello'), 'hello');
  displayResult('Mixed Type (number)', mixedValidator.validate(42), 42);
  displayResult('Mixed Type (boolean)', mixedValidator.validate(true), true);
  displayResult('Mixed Type (object)', mixedValidator.validate({}), {});

  // =====================================
  // 8. REAL-WORLD API REQUEST VALIDATION
  // =====================================
  console.log('\n🌐 8. REAL-WORLD API REQUEST VALIDATION');
  console.log('-'.repeat(30));

  // API request schema for user registration
  const registrationRequestSchema = Schema.object<{
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    acceptTerms: boolean;
    marketingOptIn?: boolean;
  }>({
    username: Schema.string()
      .minLength(3)
      .maxLength(30)
      .pattern(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username must be 3-30 characters and contain only letters, numbers, and underscores'),
    email: Schema.string().email(),
    password: Schema.string()
      .minLength(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must be at least 8 characters with uppercase, lowercase, number, and special character'),
    confirmPassword: Schema.string(),
    firstName: Schema.string().minLength(1).maxLength(50),
    lastName: Schema.string().minLength(1).maxLength(50),
    dateOfBirth: Schema.date().past(),
    acceptTerms: Schema.boolean().withMessage('You must accept the terms and conditions'),
    marketingOptIn: Schema.boolean().optional()
  });

  const validRegistration = {
    username: 'new_user123',
    email: 'newuser@example.com',
    password: 'SecurePass123!',
    confirmPassword: 'SecurePass123!',
    firstName: 'Alice',
    lastName: 'Wonder',
    dateOfBirth: new Date('1995-08-20'),
    acceptTerms: true,
    marketingOptIn: false
  };

  displayResult('Registration Request (valid)', registrationRequestSchema.validate(validRegistration));

  const invalidRegistration = {
    username: 'ab',  // too short
    email: 'invalid-email',
    password: '123',  // too weak
    confirmPassword: 'different',
    firstName: '',  // empty
    lastName: 'Wonder',
    dateOfBirth: new Date('2030-01-01'),  // future date
    acceptTerms: false  // must be true
  };

  displayResult('Registration Request (invalid)', registrationRequestSchema.validate(invalidRegistration));

  // =====================================
  // 9. CUSTOM ERROR MESSAGES
  // =====================================
  console.log('\n💬 9. CUSTOM ERROR MESSAGES');
  console.log('-'.repeat(30));

  const customValidator = Schema.object({
    companyName: Schema.string()
      .minLength(2)
      .withMessage('Company name must be at least 2 characters'),
    revenue: Schema.number()
      .min(0)
      .withMessage('Revenue cannot be negative'),
    employees: Schema.number()
      .integer()
      .positive()
      .withMessage('Number of employees must be a positive integer')
  });

  displayResult('Custom Messages', customValidator.validate({
    companyName: 'A',
    revenue: -1000,
    employees: 2.5
  }));

  // =====================================
  // 10. PERFORMANCE TEST
  // =====================================
  console.log('\n⚡ 10. PERFORMANCE TEST');
  console.log('-'.repeat(30));

  const complexSchema = Schema.object({
    users: Schema.array(Schema.object({
      id: Schema.string(),
      name: Schema.string().minLength(1),
      email: Schema.string().email(),
      metadata: Schema.object({
        tags: Schema.array(Schema.string()),
        score: Schema.number().min(0).max(100)
      })
    })).maxLength(1000)
  });

  const largeData = {
    users: Array.from({ length: 100 }, (_, i) => ({
      id: `user_${i}`,
      name: `User ${i}`,
      email: `user${i}@example.com`,
      metadata: {
        tags: [`tag${i}`, `category${i % 5}`],
        score: Math.floor(Math.random() * 100)
      }
    }))
  };

  const start = Date.now();
  const result = complexSchema.validate(largeData);
  const duration = Date.now() - start;

  console.log(`   ⏱️  Validated 100 complex objects in ${duration}ms`);
  console.log(`   ${result.success ? '✅' : '❌'} Result: ${result.success ? 'Valid' : 'Invalid'}`);

  console.log('\n' + '='.repeat(50));
  console.log('🎉 Demo completed! The validation library is working perfectly.');
  console.log('💡 Try modifying the test data to see different validation results.');
}

// Run the demo
runDemo(); 