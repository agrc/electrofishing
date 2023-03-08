import { describe, it, expect } from 'vitest';
import { getValidationMessage } from './NumericInputValidator';

describe('getValidationMessage', () => {
  it('checks for non-number values', () => {
    const result = getValidationMessage('abc', '', '', '');
    expect(result).toMatch(/must be a number/);
  });

  it('checks for whole numbers', () => {
    const result = getValidationMessage('1.5', 1, 2, 1);
    expect(result).toMatch(/must be a whole number/);

    const result2 = getValidationMessage('1.5', 1, 2, 0.1);
    expect(result2).toBeNull();
  });

  it('checks that value is within range', () => {
    const result = getValidationMessage('1', 2, 3, '');
    expect(result).toMatch(/must be greater than 2/);

    const result2 = getValidationMessage('1', 0, 3, 0.1);
    expect(result2).toBeNull();
  });

  it('can handle a single min or max', () => {
    const result = getValidationMessage('1', 2, '', '');
    expect(result).toMatch(/must be greater than 2/);

    const result2 = getValidationMessage('3', '', 2, '');
    expect(result2).toMatch(/must be less than 2/);
  });
});
