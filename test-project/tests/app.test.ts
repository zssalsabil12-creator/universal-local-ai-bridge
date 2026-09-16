// Application Tests
// Test suite for the main application

import { calculateSum, formatDate } from '../src/app';

describe('Application Tests', () => {
  test('calculateSum should add two numbers', () => {
    expect(calculateSum(2, 3)).toBe(5);
    expect(calculateSum(-1, 1)).toBe(0);
    expect(calculateSum(0, 0)).toBe(0);
  });

  test('formatDate should format date correctly', () => {
    const date = new Date('2024-01-15T12:00:00Z');
    expect(formatDate(date)).toBe('2024-01-15');
  });
});
