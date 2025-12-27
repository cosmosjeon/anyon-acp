import { expect, test, describe } from 'bun:test';
import { extractResultContent } from './extractResultContent';

describe('extractResultContent', () => {
  test('returns empty string for null or undefined result', () => {
    expect(extractResultContent(undefined)).toBe('');
    expect(extractResultContent({})).toBe('');
  });

  test('extracts string content directly', () => {
    const result = { content: 'test content' };
    expect(extractResultContent(result)).toBe('test content');
  });

  test('extracts content from text property', () => {
    const result = { content: { text: 'text content' } };
    expect(extractResultContent(result)).toBe('text content');
  });

  test('extracts content from array', () => {
    const result = {
      content: ['item1', { text: 'item2' }, { other: 'item3' }],
    };
    expect(extractResultContent(result)).toBe('item1\nitem2\n{"other":"item3"}');
  });

  test('stringifies other objects', () => {
    const result = { content: { foo: 'bar', baz: 42 } };
    const extracted = extractResultContent(result);
    const parsed = JSON.parse(extracted);
    expect(parsed).toEqual({ foo: 'bar', baz: 42 });
  });
});
