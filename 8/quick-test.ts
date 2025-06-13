import { Schema } from './schema';

// Quick test to verify library functionality
console.log('🧪 Quick Validation Library Test\n');

// Test 1: Simple user validation
const userSchema = Schema.object<{
  name: string;
  email: string;
  age?: number;
}>({
  name: Schema.string().minLength(2),
  email: Schema.string().email(),
  age: Schema.number().min(0).optional()
});

const testUser = {
  name: 'Alice Johnson',
  email: 'alice@example.com',
  age: 30
};

const result = userSchema.validate(testUser);
console.log('✅ User validation result:', result);

// Test 2: Error handling
const invalidUser = {
  name: 'A',
  email: 'invalid-email',
  age: -5
};

const errorResult = userSchema.validate(invalidUser);
console.log('\n❌ Invalid user result:', errorResult);

// Test 3: Complex nested validation
const orderSchema = Schema.object({
  orderId: Schema.string().pattern(/^ORD-\d+$/),
  items: Schema.array(Schema.object({
    name: Schema.string().minLength(1),
    price: Schema.number().min(0),
    quantity: Schema.number().integer().positive()
  })).nonEmpty(),
  total: Schema.number().min(0),
  status: Schema.union(
    Schema.literal('pending'),
    Schema.literal('processing'),
    Schema.literal('shipped'),
    Schema.literal('delivered')
  )
});

const testOrder = {
  orderId: 'ORD-12345',
  items: [
    { name: 'Widget A', price: 19.99, quantity: 2 },
    { name: 'Widget B', price: 29.99, quantity: 1 }
  ],
  total: 69.97,
  status: 'processing' as const
};

const orderResult = orderSchema.validate(testOrder);
console.log('\n📦 Order validation result:', orderResult);

console.log('\n🎉 All tests completed successfully!'); 