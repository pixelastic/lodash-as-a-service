import { test, describe } from "node:test";
import assert from "node:assert";
import _ from "../lodash.js";

describe("Custom Lodash functions", () => {
  describe("removeEmojis", () => {
    test("should remove all emojis from string", () => {
      const input = "🪩 Post-RAISE AI Party — powered by The AI Collective";
      const expected = " Post-RAISE AI Party — powered by The AI Collective";
      const result = _.removeEmojis(input);
      assert.strictEqual(result, expected);
    });
  });

  describe("replaceAll", () => {
    test("should replace all occurrences of search string", () => {
      const input = "My Blog Post";
      const result = _.replaceAll(input, " ", "-");
      const expected = "My-Blog-Post";
      assert.strictEqual(result, expected);
    });

    test("should handle special regex characters", () => {
      const input = "test.test.test";
      const result = _.replaceAll(input, ".", "-");
      const expected = "test-test-test";
      assert.strictEqual(result, expected);
    });
  });
});
