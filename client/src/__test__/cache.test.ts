import { clearCache, getCache, setCache } from "../utils/cache";

// Use fake timers
beforeAll(() => {
  jest.useFakeTimers();
});

describe("Cache Functionality", () => {
  beforeEach(() => {
    clearCache();
  });

  test("should set and get cached data correctly", () => {
    const key = "testKey";
    const value = { foo: "bar" };

    setCache(key, value);
    const result = getCache(key);

    expect(result).toEqual(value);
  });

  test("should return null if cache has expired", () => {
    const key = "testKey";
    const value = { foo: "bar" };

    setCache(key, value);
    jest.advanceTimersByTime(3600001); // Simulate passage of time (1 hour + 1ms)

    const result = getCache(key);
    expect(result).toBeNull();
  });

  test("should return null if cache key does not exist", () => {
    const result = getCache("nonExistentKey");
    expect(result).toBeNull();
  });
});

// Restore real timers after all tests
afterAll(() => {
  jest.useRealTimers();
});
