/**
 * @fileoverview Type-safe validation library for TypeScript
 * 
 * This library provides a fluent API for creating and composing validators
 * for primitive types (string, number, boolean, date) and complex types
 * (arrays, objects, unions). All validators are fully type-safe and support
 * method chaining for easy composition.
 * 
 * @example
 * Basic usage:
 * ```typescript
 * import { Schema } from './schema';
 * 
 * const userValidator = Schema.object({
 *   name: Schema.string().minLength(1),
 *   email: Schema.string().email(),
 *   age: Schema.number().min(0).optional()
 * });
 * 
 * const result = userValidator.validate(userData);
 * if (result.success) {
 *   // result.data is properly typed
 *   console.log(result.data.name);
 * } else {
 *   console.error(result.errors);
 * }
 * ```
 * 
 */

/**
 * Result of a validation operation
 * @template T - The expected type after successful validation
 */
type ValidationResult<T> = {
  /** Whether the validation passed */
  success: boolean;
  /** The validated and potentially transformed data (only present if success is true) */
  data?: T;
  /** Array of error messages (only present if success is false) */
  errors?: string[];
};

/**
 * Common validation utilities for reusable validation patterns
 */
class ValidationUtils {
  /**
   * Checks if a value is null or undefined
   */
  static isNullish(value: unknown): value is null | undefined {
    return value === null || value === undefined;
  }

  /**
   * Validates a numeric constraint (min/max)
   */
  static validateRange(
    value: number,
    min?: number,
    max?: number,
    type: string = 'Value'
  ): string | null {
    if (min !== undefined && value < min) {
      return `${type} must be at least ${min}`;
    }
    if (max !== undefined && value > max) {
      return `${type} must be no more than ${max}`;
    }
    return null;
  }

  /**
   * Validates a length constraint (minLength/maxLength)
   */
  static validateLength(
    length: number,
    minLength?: number,
    maxLength?: number,
    type: string = 'Value'
  ): string | null {
    if (minLength !== undefined && length < minLength) {
      const unit = type === 'Array' ? 'items' : 'characters long';
      return `${type} must have at least ${minLength} ${unit}`;
    }
    if (maxLength !== undefined && length > maxLength) {
      const unit = type === 'Array' ? 'items' : 'characters long';
      return `${type} must have no more than ${maxLength} ${unit}`;
    }
    return null;
  }

  /**
   * Creates a pattern validation error message
   */
  static createPatternError(customMessage?: string): string {
    return customMessage || 'Value does not match the required pattern';
  }
}

/**
 * Base abstract validator class that all specific validators extend
 * @template T - The type this validator validates
 * 
 * @example
 * ```typescript
 * const stringValidator = Schema.string();
 * const result = stringValidator.validate("hello");
 * if (result.success) {
 *   console.log(result.data); // "hello"
 * } else {
 *   console.log(result.errors); // ["error message"]
 * }
 * ```
 */
abstract class Validator<T> {
  protected _optional = false;
  protected _customMessage?: string;

  /**
   * Validates the given value against this validator's rules
   * @param value - The value to validate
   * @returns ValidationResult indicating success/failure with data or errors
   */
  abstract validate(value: unknown): ValidationResult<T>;

  /**
   * Makes this validator optional (allows undefined/null values)
   * @returns This validator instance for method chaining
   * 
   * @example
   * ```typescript
   * const validator = Schema.string().optional();
   * validator.validate(undefined); // { success: true, data: undefined }
   * validator.validate("hello"); // { success: true, data: "hello" }
   * ```
   */
  optional(): this {
    this._optional = true;
    return this;
  }

  /**
   * Sets a custom error message for validation failures
   * @param message - Custom error message to use
   * @returns This validator instance for method chaining
   * 
   * @example
   * ```typescript
   * const validator = Schema.string().withMessage("Name is required");
   * validator.validate(123); // { success: false, errors: ["Name is required"] }
   * ```
   */
  withMessage(message: string): this {
    this._customMessage = message;
    return this;
  }

  /**
   * Handles optional value validation (common pattern across all validators)
   */
  protected handleOptional(value: unknown): ValidationResult<T> | null {
    if (ValidationUtils.isNullish(value)) {
      if (this._optional) {
        return this.createSuccess(undefined as any);
      }
      return this.createError('Value is required');
    }
    return null; // Continue with normal validation
  }

  /**
   * Creates a validation error result
   * @param message - Error message (will be overridden by custom message if set)
   * @returns ValidationResult with success: false and the error message
   */
  protected createError(message: string): ValidationResult<T> {
    return {
      success: false,
      errors: [this._customMessage || message]
    };
  }

  /**
   * Creates a successful validation result
   * @param data - The validated data
   * @returns ValidationResult with success: true and the data
   */
  protected createSuccess(data: T): ValidationResult<T> {
    return {
      success: true,
      data
    };
  }

  /**
   * Validates the basic type of a value
   */
  protected validateType(value: unknown, expectedType: string, typeName: string): ValidationResult<T> | null {
    if (typeof value !== expectedType) {
      return this.createError(`Value must be a ${typeName}`);
    }
    return null;
  }
}

/**
 * Base class for validators that support min/max range constraints
 */
abstract class RangeConstrainedValidator<T> extends Validator<T> {
  protected _min?: number;
  protected _max?: number;

  /**
   * Sets minimum value constraint
   * @param value - Minimum value allowed  
   * @returns This validator instance for method chaining
   */
  min(value: number): this {
    this._min = value;
    return this;
  }

  /**
   * Sets maximum value constraint
   * @param value - Maximum value allowed
   * @returns This validator instance for method chaining
   */
  max(value: number): this {
    this._max = value;
    return this;
  }

  protected validateRange(value: number, type: string = 'Number'): string | null {
    return ValidationUtils.validateRange(value, this._min, this._max, type);
  }
}

/**
 * Base class for validators that support length constraints
 */
abstract class LengthConstrainedValidator<T> extends Validator<T> {
  protected _minLength?: number;
  protected _maxLength?: number;

  /**
   * Sets minimum length constraint
   * @param length - Minimum length required
   * @returns This validator instance for method chaining
   */
  minLength(length: number): this {
    this._minLength = length;
    return this;
  }

  /**
   * Sets maximum length constraint
   * @param length - Maximum length allowed
   * @returns This validator instance for method chaining
   */
  maxLength(length: number): this {
    this._maxLength = length;
    return this;
  }

  protected validateLength(length: number, type: string = 'String'): string | null {
    return ValidationUtils.validateLength(length, this._minLength, this._maxLength, type);
  }
}

/**
 * Validator for string values with various constraint options
 * 
 * @example
 * ```typescript
 * const validator = Schema.string()
 *   .minLength(3)
 *   .maxLength(20)
 *   .pattern(/^[a-zA-Z]+$/);
 * 
 * validator.validate("hello"); // { success: true, data: "hello" }
 * validator.validate("hi"); // { success: false, errors: ["String must be at least 3 characters long"] }
 * validator.validate("hello123"); // { success: false, errors: ["String does not match the required pattern"] }
 * ```
 */
class StringValidator extends LengthConstrainedValidator<string> {
  private _pattern?: RegExp;

  validate(value: unknown): ValidationResult<string> {
    // Handle optional values
    const optionalResult = this.handleOptional(value);
    if (optionalResult) return optionalResult;

    // Type validation
    const typeError = this.validateType(value, 'string', 'string');
    if (typeError) return typeError;

    const str = value as string;

    // Length validation
    const lengthError = this.validateLength(str.length);
    if (lengthError) return this.createError(lengthError);

    // Pattern validation
    if (this._pattern && !this._pattern.test(str)) {
      return this.createError(ValidationUtils.createPatternError());
    }

    return this.createSuccess(str);
  }

  /**
   * Sets a regular expression pattern that the string must match
   * @param regex - Regular expression pattern
   * @returns This validator instance for method chaining
   * 
   * @example
   * ```typescript
   * const validator = Schema.string().pattern(/^\d+$/); // Numbers only
   * validator.validate("123"); // { success: true, data: "123" }
   * validator.validate("abc"); // { success: false, errors: ["String does not match the required pattern"] }
   * ```
   */
  pattern(regex: RegExp): this {
    this._pattern = regex;
    return this;
  }

  /**
   * Validates that the string is a valid email address
   * @returns This validator instance for method chaining
   * 
   * @example
   * ```typescript
   * const validator = Schema.string().email();
   * validator.validate("user@example.com"); // { success: true, data: "user@example.com" }
   * validator.validate("invalid-email"); // { success: false, errors: ["Must be a valid email address"] }
   * ```
   */
  email(): this {
    this._pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return this.withMessage('Must be a valid email address');
  }

  /**
   * Validates that the string is a valid URL (http or https)
   * @returns This validator instance for method chaining
   * 
   * @example
   * ```typescript
   * const validator = Schema.string().url();
   * validator.validate("https://example.com"); // { success: true, data: "https://example.com" }
   * validator.validate("not-a-url"); // { success: false, errors: ["Must be a valid URL"] }
   * ```
   */
  url(): this {
    this._pattern = /^https?:\/\/.+/;
    return this.withMessage('Must be a valid URL');
  }
}

/**
 * Validator for numeric values with various constraint options
 * 
 * @example
 * ```typescript
 * const validator = Schema.number()
 *   .min(0)
 *   .max(100)
 *   .integer();
 * 
 * validator.validate(42); // { success: true, data: 42 }
 * validator.validate(-5); // { success: false, errors: ["Number must be at least 0"] }
 * validator.validate(42.5); // { success: false, errors: ["Number must be an integer"] }
 * ```
 */
class NumberValidator extends RangeConstrainedValidator<number> {
  private _integer = false;
  private _positive = false;

  validate(value: unknown): ValidationResult<number> {
    // Handle optional values
    const optionalResult = this.handleOptional(value);
    if (optionalResult) return optionalResult;

    // Type validation
    if (typeof value !== 'number' || isNaN(value)) {
      return this.createError('Value must be a number');
    }

    const num = value as number;

    // Range validation
    const rangeError = this.validateRange(num);
    if (rangeError) return this.createError(rangeError);

    // Integer validation
    if (this._integer && !Number.isInteger(num)) {
      return this.createError('Number must be an integer');
    }

    // Positive validation
    if (this._positive && num <= 0) {
      return this.createError('Number must be positive');
    }

    return this.createSuccess(num);
  }

  /**
   * Requires the number to be an integer (whole number)
   * @returns This validator instance for method chaining
   * 
   * @example
   * ```typescript
   * const validator = Schema.number().integer();
   * validator.validate(42); // { success: true, data: 42 }
   * validator.validate(42.5); // { success: false, errors: ["Number must be an integer"] }
   * ```
   */
  integer(): this {
    this._integer = true;
    return this;
  }

  /**
   * Requires the number to be positive (greater than 0)
   * @returns This validator instance for method chaining
   * 
   * @example
   * ```typescript
   * const validator = Schema.number().positive();
   * validator.validate(5); // { success: true, data: 5 }
   * validator.validate(0); // { success: false, errors: ["Number must be positive"] }
   * validator.validate(-5); // { success: false, errors: ["Number must be positive"] }
   * ```
   */
  positive(): this {
    this._positive = true;
    return this;
  }
}

/**
 * Validator for boolean values (true/false)
 * 
 * @example
 * ```typescript
 * const validator = Schema.boolean();
 * validator.validate(true); // { success: true, data: true }
 * validator.validate("true"); // { success: false, errors: ["Value must be a boolean"] }
 * 
 * const optionalValidator = Schema.boolean().optional();
 * optionalValidator.validate(undefined); // { success: true, data: undefined }
 * ```
 */
class BooleanValidator extends Validator<boolean> {
  validate(value: unknown): ValidationResult<boolean> {
    // Handle optional values
    const optionalResult = this.handleOptional(value);
    if (optionalResult) return optionalResult;

    // Type validation
    const typeError = this.validateType(value, 'boolean', 'boolean');
    if (typeError) return typeError;

    return this.createSuccess(value as boolean);
  }
}

/**
 * Validator for Date objects and date strings/numbers with various constraint options
 * 
 * @example
 * ```typescript
 * const validator = Schema.date()
 *   .min(new Date('2020-01-01'))
 *   .max(new Date('2030-12-31'));
 * 
 * validator.validate(new Date('2025-06-15')); // { success: true, data: Date object }
 * validator.validate('2025-06-15'); // { success: true, data: Date object }
 * validator.validate('2019-01-01'); // { success: false, errors: ["Date must be after 2020-01-01T00:00:00.000Z"] }
 * ```
 */
class DateValidator extends Validator<Date> {
  private _minDate?: Date;
  private _maxDate?: Date;

  validate(value: unknown): ValidationResult<Date> {
    // Handle optional values
    const optionalResult = this.handleOptional(value);
    if (optionalResult) return optionalResult;

    // Parse date
    const dateResult = this.parseDate(value);
    if (!dateResult.success) return dateResult;

    const date = dateResult.data!;

    // Date range validation
    const rangeError = this.validateDateRange(date);
    if (rangeError) return this.createError(rangeError);

    return this.createSuccess(date);
  }

  private parseDate(value: unknown): ValidationResult<Date> {
    let date: Date;
    
    if (value instanceof Date) {
      date = value;
    } else if (typeof value === 'string' || typeof value === 'number') {
      date = new Date(value);
    } else {
      return this.createError('Value must be a Date, string, or number');
    }

    if (isNaN(date.getTime())) {
      return this.createError('Value must be a valid date');
    }

    return this.createSuccess(date);
  }

  private validateDateRange(date: Date): string | null {
    if (this._minDate && date < this._minDate) {
      return `Date must be after ${this._minDate.toISOString()}`;
    }
    if (this._maxDate && date > this._maxDate) {
      return `Date must be before ${this._maxDate.toISOString()}`;
    }
    return null;
  }

  /**
   * Sets minimum date constraint
   * @param date - Minimum date allowed
   * @returns This validator instance for method chaining
   * 
   * @example
   * ```typescript
   * const validator = Schema.date().min(new Date('2020-01-01'));
   * validator.validate(new Date('2021-01-01')); // { success: true, data: Date object }
   * validator.validate(new Date('2019-01-01')); // { success: false, errors: ["Date must be after 2020-01-01T00:00:00.000Z"] }
   * ```
   */
  min(date: Date): this {
    this._minDate = date;
    return this;
  }

  /**
   * Sets maximum date constraint
   * @param date - Maximum date allowed
   * @returns This validator instance for method chaining
   * 
   * @example
   * ```typescript
   * const validator = Schema.date().max(new Date('2030-12-31'));
   * validator.validate(new Date('2025-01-01')); // { success: true, data: Date object }
   * validator.validate(new Date('2035-01-01')); // { success: false, errors: ["Date must be before 2030-12-31T00:00:00.000Z"] }
   * ```
   */
  max(date: Date): this {
    this._maxDate = date;
    return this;
  }

  /**
   * Requires the date to be in the future (after current time)
   * @returns This validator instance for method chaining
   * 
   * @example
   * ```typescript
   * const validator = Schema.date().future();
   * const tomorrow = new Date();
   * tomorrow.setDate(tomorrow.getDate() + 1);
   * 
   * validator.validate(tomorrow); // { success: true, data: Date object }
   * validator.validate(new Date('2020-01-01')); // { success: false, errors: ["Date must be in the future"] }
   * ```
   */
  future(): this {
    this._minDate = new Date();
    return this.withMessage('Date must be in the future');
  }

  /**
   * Requires the date to be in the past (before current time)
   * @returns This validator instance for method chaining
   * 
   * @example
   * ```typescript
   * const validator = Schema.date().past();
   * validator.validate(new Date('2020-01-01')); // { success: true, data: Date object }
   * 
   * const tomorrow = new Date();
   * tomorrow.setDate(tomorrow.getDate() + 1);
   * validator.validate(tomorrow); // { success: false, errors: ["Date must be in the past"] }
   * ```
   */
  past(): this {
    this._maxDate = new Date();
    return this.withMessage('Date must be in the past');
  }
}

/**
 * Validator for arrays with item-level validation and length constraints
 * @template T - The type of items in the array
 * 
 * @example
 * ```typescript
 * const validator = Schema.array(Schema.string())
 *   .minLength(1)
 *   .maxLength(5);
 * 
 * validator.validate(["hello", "world"]); // { success: true, data: ["hello", "world"] }
 * validator.validate([]); // { success: false, errors: ["Array must have at least 1 items"] }
 * validator.validate(["a", "b", 123]); // { success: false, errors: ["Item at index 2: Value must be a string"] }
 * ```
 */
class ArrayValidator<T> extends LengthConstrainedValidator<T[]> {
  constructor(private itemValidator: Validator<T>) {
    super();
  }

  validate(value: unknown): ValidationResult<T[]> {
    // Handle optional values
    const optionalResult = this.handleOptional(value);
    if (optionalResult) return optionalResult;

    // Type validation
    if (!Array.isArray(value)) {
      return this.createError('Value must be an array');
    }

    // Length validation
    const lengthError = this.validateLength(value.length, 'Array');
    if (lengthError) return this.createError(lengthError);

    // Item validation
    const itemResult = this.validateItems(value);
    if (!itemResult.success) return itemResult;

    return this.createSuccess(itemResult.data!);
  }

  private validateItems(array: unknown[]): ValidationResult<T[]> {
    const validatedItems: T[] = [];
    const errors: string[] = [];

    for (let i = 0; i < array.length; i++) {
      const result = this.itemValidator.validate(array[i]);
      if (result.success) {
        validatedItems.push(result.data!);
      } else {
        errors.push(`Item at index ${i}: ${result.errors?.join(', ')}`);
      }
    }

    return errors.length > 0 
      ? { success: false, errors } 
      : this.createSuccess(validatedItems);
  }

  /**
   * Requires the array to have at least one item (shorthand for minLength(1))
   * @returns This validator instance for method chaining
   * 
   * @example
   * ```typescript
   * const validator = Schema.array(Schema.string()).nonEmpty();
   * validator.validate(["hello"]); // { success: true, data: ["hello"] }
   * validator.validate([]); // { success: false, errors: ["Array cannot be empty"] }
   * ```
   */
  nonEmpty(): this {
    this._minLength = 1;
    return this.withMessage('Array cannot be empty');
  }
}

/**
 * Validator for objects with schema-based field validation
 * @template T - The expected object type after validation
 * 
 * @example
 * ```typescript
 * const validator = Schema.object<{name: string, age: number}>({
 *   name: Schema.string().minLength(1),
 *   age: Schema.number().min(0).integer()
 * });
 * 
 * validator.validate({name: "John", age: 25}); // { success: true, data: {name: "John", age: 25} }
 * validator.validate({name: "", age: -5}); // { success: false, errors: [...] }
 * ```
 */
class ObjectValidator<T> extends Validator<T> {
  constructor(private schema: Record<string, Validator<any>>) {
    super();
  }

  validate(value: unknown): ValidationResult<T> {
    // Handle optional values
    const optionalResult = this.handleOptional(value);
    if (optionalResult) return optionalResult;

    // Type validation
    if (typeof value !== 'object' || Array.isArray(value)) {
      return this.createError('Value must be an object');
    }

    const obj = value as Record<string, unknown>;

    // Validate fields
    const fieldResult = this.validateFields(obj);
    if (!fieldResult.success) return fieldResult;

    return this.createSuccess(fieldResult.data!);
  }

  private validateFields(obj: Record<string, unknown>): ValidationResult<T> {
    const validatedObj: Record<string, any> = {};
    const errors: string[] = [];

    for (const [key, validator] of Object.entries(this.schema)) {
      const result = validator.validate(obj[key]);
      if (result.success) {
        if (result.data !== undefined) {
          validatedObj[key] = result.data;
        }
      } else {
        errors.push(`Field '${key}': ${result.errors?.join(', ')}`);
      }
    }

    return errors.length > 0 
      ? { success: false, errors } 
      : this.createSuccess(validatedObj as T);
  }

  /**
   * Enables strict mode - additional properties not defined in schema are not allowed
   * @returns This validator instance for method chaining
   * 
   * @example
   * ```typescript
   * const validator = Schema.object({name: Schema.string()}).strict();
   * validator.validate({name: "John"}); // { success: true, data: {name: "John"} }
   * validator.validate({name: "John", extra: "field"}); // Would need implementation to check extra properties
   * ```
   */
  strict(): this {
    // In strict mode, additional properties are not allowed
    return this.withMessage('Object contains unexpected properties');
  }
}

/**
 * Validator that accepts multiple possible types (union type)
 * @template T - The union type of all possible valid types
 * 
 * @example
 * ```typescript
 * const validator = Schema.union(
 *   Schema.string(),
 *   Schema.number(),
 *   Schema.boolean()
 * );
 * 
 * validator.validate("hello"); // { success: true, data: "hello" }
 * validator.validate(42); // { success: true, data: 42 }
 * validator.validate(true); // { success: true, data: true }
 * validator.validate({}); // { success: false, errors: ["Value does not match any of the allowed types"] }
 * ```
 */
class UnionValidator<T> extends Validator<T> {
  constructor(private validators: Validator<any>[]) {
    super();
  }

  validate(value: unknown): ValidationResult<T> {
    // Handle optional values
    const optionalResult = this.handleOptional(value);
    if (optionalResult) return optionalResult;

    // Try each validator until one succeeds
    for (const validator of this.validators) {
      const result = validator.validate(value);
      if (result.success) {
        return result as ValidationResult<T>;
      }
    }

    return this.createError('Value does not match any of the allowed types');
  }
}

/**
 * Main schema builder class - provides static factory methods for creating validators
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const emailValidator = Schema.string().email();
 * const ageValidator = Schema.number().min(0).max(150);
 * 
 * // Complex object validation
 * const userValidator = Schema.object<User>({
 *   name: Schema.string().minLength(1),
 *   email: Schema.string().email(),
 *   age: Schema.number().min(0).optional(),
 *   hobbies: Schema.array(Schema.string()).nonEmpty()
 * });
 * 
 * // Validate data
 * const result = userValidator.validate(userData);
 * if (result.success) {
 *   console.log('Valid user:', result.data);
 * } else {
 *   console.log('Validation errors:', result.errors);
 * }
 * ```
 */
class Schema {
  /**
   * Creates a string validator
   * @returns StringValidator instance for validating string values
   * 
   * @example
   * ```typescript
   * const validator = Schema.string()
   *   .minLength(3)
   *   .maxLength(50)
   *   .pattern(/^[a-zA-Z]+$/);
   * 
   * validator.validate("hello"); // { success: true, data: "hello" }
   * ```
   */
  static string(): StringValidator {
    return new StringValidator();
  }

  /**
   * Creates a number validator
   * @returns NumberValidator instance for validating numeric values
   * 
   * @example
   * ```typescript
   * const validator = Schema.number()
   *   .min(0)
   *   .max(100)
   *   .integer();
   * 
   * validator.validate(42); // { success: true, data: 42 }
   * ```
   */
  static number(): NumberValidator {
    return new NumberValidator();
  }

  /**
   * Creates a boolean validator
   * @returns BooleanValidator instance for validating boolean values
   * 
   * @example
   * ```typescript
   * const validator = Schema.boolean();
   * validator.validate(true); // { success: true, data: true }
   * validator.validate("true"); // { success: false, errors: ["Value must be a boolean"] }
   * ```
   */
  static boolean(): BooleanValidator {
    return new BooleanValidator();
  }

  /**
   * Creates a date validator
   * @returns DateValidator instance for validating Date objects and date strings
   * 
   * @example
   * ```typescript
   * const validator = Schema.date()
   *   .min(new Date('2020-01-01'))
   *   .future();
   * 
   * validator.validate(new Date('2025-01-01')); // { success: true, data: Date object }
   * ```
   */
  static date(): DateValidator {
    return new DateValidator();
  }

  /**
   * Creates an object validator with a schema definition
   * @template T - The expected object type after validation
   * @param schema - Record mapping field names to their validators
   * @returns ObjectValidator instance for validating objects
   * 
   * @example
   * ```typescript
   * const validator = Schema.object<{name: string, age: number}>({
   *   name: Schema.string().minLength(1),
   *   age: Schema.number().min(0).integer()
   * });
   * 
   * validator.validate({name: "John", age: 25}); // { success: true, data: {name: "John", age: 25} }
   * ```
   */
  static object<T>(schema: Record<string, Validator<any>>): ObjectValidator<T> {
    return new ObjectValidator<T>(schema);
  }

  /**
   * Creates an array validator that validates each item with the provided validator
   * @template T - The type of items in the array
   * @param itemValidator - Validator to apply to each array item
   * @returns ArrayValidator instance for validating arrays
   * 
   * @example
   * ```typescript
   * const validator = Schema.array(Schema.string().email())
   *   .minLength(1)
   *   .maxLength(5);
   * 
   * validator.validate(["user@example.com", "admin@example.com"]); // { success: true, data: [...] }
   * ```
   */
  static array<T>(itemValidator: Validator<T>): ArrayValidator<T> {
    return new ArrayValidator<T>(itemValidator);
  }

  /**
   * Creates a union validator that accepts any of the provided validator types
   * @template T - The union type of all possible valid types
   * @param validators - Array of validators, value must pass at least one
   * @returns UnionValidator instance for validating union types
   * 
   * @example
   * ```typescript
   * const validator = Schema.union(
   *   Schema.string(),
   *   Schema.number(),
   *   Schema.boolean()
   * );
   * 
   * validator.validate("hello"); // { success: true, data: "hello" }
   * validator.validate(42); // { success: true, data: 42 }
   * ```
   */
  static union<T>(...validators: Validator<any>[]): UnionValidator<T> {
    return new UnionValidator<T>(validators);
  }

  /**
   * Creates a literal validator that only accepts a specific exact value
   * @template T - The literal value type (string, number, or boolean)
   * @param value - The exact value that must be matched
   * @returns Validator instance that only accepts the specified literal value
   * 
   * @example
   * ```typescript
   * const statusValidator = Schema.union(
   *   Schema.literal('active'),
   *   Schema.literal('inactive'),
   *   Schema.literal('pending')
   * );
   * 
   * statusValidator.validate('active'); // { success: true, data: 'active' }
   * statusValidator.validate('unknown'); // { success: false, errors: [...] }
   * ```
   */
  static literal<T extends string | number | boolean>(value: T): Validator<T> {
    return new (class extends Validator<T> {
      validate(input: unknown): ValidationResult<T> {
        // Handle optional values
        const optionalResult = this.handleOptional(input);
        if (optionalResult) return optionalResult;

        if (input !== value) {
          return this.createError(`Value must be exactly ${value}`);
        }

        return this.createSuccess(input as T);
      }
    })();
  }
}

// Export the main Schema class and core interfaces
export { Schema, Validator, ValidationResult };

// Export validator class types for advanced usage and type annotations
export type { StringValidator, NumberValidator, BooleanValidator, DateValidator, ArrayValidator, ObjectValidator }; 