import { capitalizeWords } from "../utils/sharedFunctions";

describe("capitalizeWords Function", () => {
  test("should capitalize the first letter of each word", () => {
    const input = "hello world";
    const expectedOutput = "Hello World";
    expect(capitalizeWords(input)).toBe(expectedOutput);
  });

  test("should handle a single word", () => {
    const input = "javascript";
    const expectedOutput = "Javascript";
    expect(capitalizeWords(input)).toBe(expectedOutput);
  });

  test("should handle an empty string", () => {
    const input = "";
    const expectedOutput = "";
    expect(capitalizeWords(input)).toBe(expectedOutput);
  });

  test("should handle words with mixed casing", () => {
    const input = "hELLo wOrLD";
    const expectedOutput = "Hello World";
    expect(capitalizeWords(input)).toBe(expectedOutput);
  });

  test("should handle a word with numbers and special characters", () => {
    const input = "hello123 world!";
    const expectedOutput = "Hello123 World!";
    expect(capitalizeWords(input)).toBe(expectedOutput);
  });
});
