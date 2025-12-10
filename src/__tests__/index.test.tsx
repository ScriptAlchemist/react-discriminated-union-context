import { describe, it } from "node:test";
import assert from "node:assert";

// =============================================================================
// Test Types
// =============================================================================

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthState =
  | { status: "idle" }
  | { status: "loading"; message?: string }
  | { status: "authenticated"; user: User }
  | { status: "error"; error: string; retryable: boolean };

// =============================================================================
// Core validation logic extracted for testing
// This mirrors the validation in createDiscriminatedContext
// =============================================================================

function validateDiscriminant<T extends Record<string, unknown>>(
  value: T,
  discriminantKey: string,
  expected: string | number | boolean | symbol,
): void {
  const DEFAULT_VALUE = "default";

  if (
    expected !== DEFAULT_VALUE &&
    value[discriminantKey] !== expected
  ) {
    throw new Error(
      `Expected ${discriminantKey}=${String(expected)}, got ${String(value[discriminantKey])}`,
    );
  }
}

function validateContextNotNull<T>(
  value: T | null,
): asserts value is T {
  if (value === null) {
    throw new Error(
      "useContext must be used within a Provider. Wrap your component tree with <Context.Provider>.",
    );
  }
}

// =============================================================================
// Tests
// =============================================================================

describe("Discriminated Context Validation Logic", () => {
  describe("validateContextNotNull", () => {
    it("should throw when value is null", () => {
      assert.throws(
        () => {
          validateContextNotNull(null);
        },
        {
          message:
            "useContext must be used within a Provider. Wrap your component tree with <Context.Provider>.",
        },
      );
    });

    it("should not throw when value is defined", () => {
      const testValue: AuthState = { status: "idle" };

      assert.doesNotThrow(() => {
        validateContextNotNull(testValue);
      });
    });

    it("should not throw for objects", () => {
      const testValue = { status: "authenticated", user: { id: "1" } };

      assert.doesNotThrow(() => {
        validateContextNotNull(testValue);
      });
    });

    it("should not throw for empty objects", () => {
      assert.doesNotThrow(() => {
        validateContextNotNull({});
      });
    });
  });

  describe("validateDiscriminant with 'default'", () => {
    it("should not throw when using 'default' with idle status", () => {
      const testValue: AuthState = { status: "idle" };

      assert.doesNotThrow(() => {
        validateDiscriminant(testValue, "status", "default");
      });
    });

    it("should not throw when using 'default' with authenticated status", () => {
      const testValue: AuthState = {
        status: "authenticated",
        user: { id: "1", name: "John", email: "john@example.com" },
      };

      assert.doesNotThrow(() => {
        validateDiscriminant(testValue, "status", "default");
      });
    });

    it("should not throw when using 'default' with error status", () => {
      const testValue: AuthState = {
        status: "error",
        error: "Something went wrong",
        retryable: true,
      };

      assert.doesNotThrow(() => {
        validateDiscriminant(testValue, "status", "default");
      });
    });

    it("should not throw when using 'default' with loading status", () => {
      const testValue: AuthState = {
        status: "loading",
        message: "Please wait...",
      };

      assert.doesNotThrow(() => {
        validateDiscriminant(testValue, "status", "default");
      });
    });
  });

  describe("validateDiscriminant with narrowed types", () => {
    it("should not throw when expected discriminant matches - idle", () => {
      const testValue: AuthState = { status: "idle" };

      assert.doesNotThrow(() => {
        validateDiscriminant(testValue, "status", "idle");
      });
    });

    it("should not throw when expected discriminant matches - authenticated", () => {
      const testValue: AuthState = {
        status: "authenticated",
        user: { id: "123", name: "Jane", email: "jane@example.com" },
      };

      assert.doesNotThrow(() => {
        validateDiscriminant(testValue, "status", "authenticated");
      });
    });

    it("should not throw when expected discriminant matches - error", () => {
      const testValue: AuthState = {
        status: "error",
        error: "Network failure",
        retryable: true,
      };

      assert.doesNotThrow(() => {
        validateDiscriminant(testValue, "status", "error");
      });
    });

    it("should not throw when expected discriminant matches - loading", () => {
      const testValue: AuthState = {
        status: "loading",
        message: "Please wait...",
      };

      assert.doesNotThrow(() => {
        validateDiscriminant(testValue, "status", "loading");
      });
    });

    it("should not throw for loading without optional message", () => {
      const testValue: AuthState = { status: "loading" };

      assert.doesNotThrow(() => {
        validateDiscriminant(testValue, "status", "loading");
      });
    });
  });

  describe("validateDiscriminant error handling", () => {
    it("should throw when expected authenticated but got idle", () => {
      const testValue: AuthState = { status: "idle" };

      assert.throws(
        () => {
          validateDiscriminant(testValue, "status", "authenticated");
        },
        {
          message: "Expected status=authenticated, got idle",
        },
      );
    });

    it("should throw when expected loading but got error", () => {
      const testValue: AuthState = {
        status: "error",
        error: "Something went wrong",
        retryable: false,
      };

      assert.throws(
        () => {
          validateDiscriminant(testValue, "status", "loading");
        },
        {
          message: "Expected status=loading, got error",
        },
      );
    });

    it("should throw when expected idle but got authenticated", () => {
      const testValue: AuthState = {
        status: "authenticated",
        user: { id: "1", name: "Test", email: "test@test.com" },
      };

      assert.throws(
        () => {
          validateDiscriminant(testValue, "status", "idle");
        },
        {
          message: "Expected status=idle, got authenticated",
        },
      );
    });

    it("should throw when expected error but got loading", () => {
      const testValue: AuthState = {
        status: "loading",
        message: "Working...",
      };

      assert.throws(
        () => {
          validateDiscriminant(testValue, "status", "error");
        },
        {
          message: "Expected status=error, got loading",
        },
      );
    });
  });

  describe("different discriminant keys", () => {
    type RequestState =
      | { type: "pending" }
      | { type: "success"; data: string }
      | { type: "failure"; reason: string };

    it("should work with 'type' as discriminant key - success", () => {
      const testValue: RequestState = {
        type: "success",
        data: "Hello World",
      };

      assert.doesNotThrow(() => {
        validateDiscriminant(testValue, "type", "success");
      });
    });

    it("should work with 'type' as discriminant key - failure", () => {
      const testValue: RequestState = {
        type: "failure",
        reason: "Network error",
      };

      assert.doesNotThrow(() => {
        validateDiscriminant(testValue, "type", "failure");
      });
    });

    it("should work with 'type' as discriminant key - pending", () => {
      const testValue: RequestState = { type: "pending" };

      assert.doesNotThrow(() => {
        validateDiscriminant(testValue, "type", "pending");
      });
    });

    it("should throw for type mismatch with 'type' key", () => {
      const testValue: RequestState = { type: "pending" };

      assert.throws(
        () => {
          validateDiscriminant(testValue, "type", "success");
        },
        {
          message: "Expected type=success, got pending",
        },
      );
    });

    type StepState =
      | { step: 1; name: string }
      | { step: 2; email: string }
      | { step: 3; password: string };

    it("should work with numeric discriminant values", () => {
      const testValue: StepState = {
        step: 2,
        email: "test@example.com",
      };

      assert.doesNotThrow(() => {
        validateDiscriminant(testValue, "step", 2);
      });
    });

    it("should throw for numeric discriminant mismatch", () => {
      const testValue: StepState = { step: 1, name: "John" };

      assert.throws(
        () => {
          validateDiscriminant(testValue, "step", 3);
        },
        {
          message: "Expected step=3, got 1",
        },
      );
    });

    it("should work with step 1", () => {
      const testValue: StepState = { step: 1, name: "Alice" };

      assert.doesNotThrow(() => {
        validateDiscriminant(testValue, "step", 1);
      });
    });

    it("should work with step 3", () => {
      const testValue: StepState = { step: 3, password: "secret123" };

      assert.doesNotThrow(() => {
        validateDiscriminant(testValue, "step", 3);
      });
    });
  });

  describe("boolean discriminant values", () => {
    type BooleanDiscriminant =
      | { active: true; data: string }
      | { active: false; reason: string };

    it("should work with true boolean discriminant", () => {
      const testValue: BooleanDiscriminant = {
        active: true,
        data: "test",
      };

      assert.doesNotThrow(() => {
        validateDiscriminant(testValue, "active", true);
      });
    });

    it("should work with false boolean discriminant", () => {
      const testValue: BooleanDiscriminant = {
        active: false,
        reason: "disabled",
      };

      assert.doesNotThrow(() => {
        validateDiscriminant(testValue, "active", false);
      });
    });

    it("should throw for boolean mismatch - expected true got false", () => {
      const testValue: BooleanDiscriminant = {
        active: false,
        reason: "disabled",
      };

      assert.throws(
        () => {
          validateDiscriminant(testValue, "active", true);
        },
        {
          message: "Expected active=true, got false",
        },
      );
    });

    it("should throw for boolean mismatch - expected false got true", () => {
      const testValue: BooleanDiscriminant = {
        active: true,
        data: "active data",
      };

      assert.throws(
        () => {
          validateDiscriminant(testValue, "active", false);
        },
        {
          message: "Expected active=false, got true",
        },
      );
    });
  });

  describe("complex nested types", () => {
    type ComplexState =
      | { kind: "empty" }
      | {
          kind: "loaded";
          data: {
            items: Array<{ id: number; name: string }>;
            metadata: { total: number; page: number };
          };
        };

    it("should handle deeply nested objects - loaded", () => {
      const testValue: ComplexState = {
        kind: "loaded",
        data: {
          items: [
            { id: 1, name: "Item 1" },
            { id: 2, name: "Item 2" },
          ],
          metadata: { total: 2, page: 1 },
        },
      };

      assert.doesNotThrow(() => {
        validateDiscriminant(testValue, "kind", "loaded");
      });
    });

    it("should handle empty state", () => {
      const testValue: ComplexState = { kind: "empty" };

      assert.doesNotThrow(() => {
        validateDiscriminant(testValue, "kind", "empty");
      });
    });

    it("should throw for complex type mismatch", () => {
      const testValue: ComplexState = { kind: "empty" };

      assert.throws(
        () => {
          validateDiscriminant(testValue, "kind", "loaded");
        },
        {
          message: "Expected kind=loaded, got empty",
        },
      );
    });
  });

  describe("edge cases", () => {
    it("should handle empty string values in data", () => {
      const testValue: AuthState = {
        status: "error",
        error: "",
        retryable: false,
      };

      assert.doesNotThrow(() => {
        validateDiscriminant(testValue, "status", "error");
      });
    });

    it("should handle undefined optional properties", () => {
      const testValue: AuthState = { status: "loading" };

      assert.doesNotThrow(() => {
        validateDiscriminant(testValue, "status", "loading");
      });

      // Verify the message is undefined
      assert.strictEqual(
        (testValue as { status: "loading"; message?: string }).message,
        undefined,
      );
    });

    it("should handle objects with extra properties", () => {
      const testValue = {
        status: "idle",
        extraProp: "should be ignored",
      };

      assert.doesNotThrow(() => {
        validateDiscriminant(testValue, "status", "idle");
      });
    });

    it("should work with symbol discriminant values", () => {
      const ACTIVE = Symbol("active");
      const INACTIVE = Symbol("inactive");

      type SymbolState =
        | { state: typeof ACTIVE; data: string }
        | { state: typeof INACTIVE };

      const testValue: SymbolState = { state: ACTIVE, data: "test" };

      assert.doesNotThrow(() => {
        validateDiscriminant(
          testValue as Record<string, unknown>,
          "state",
          ACTIVE,
        );
      });
    });
  });

  describe("multiple validations", () => {
    it("should handle sequential validations on same value", () => {
      const testValue: AuthState = { status: "idle" };

      // First validation passes
      assert.doesNotThrow(() => {
        validateDiscriminant(testValue, "status", "idle");
      });

      // Second validation with same expected value passes
      assert.doesNotThrow(() => {
        validateDiscriminant(testValue, "status", "idle");
      });

      // Third validation with default passes
      assert.doesNotThrow(() => {
        validateDiscriminant(testValue, "status", "default");
      });
    });

    it("should handle validations on different values", () => {
      const idleValue: AuthState = { status: "idle" };
      const authValue: AuthState = {
        status: "authenticated",
        user: { id: "1", name: "Test", email: "test@test.com" },
      };

      assert.doesNotThrow(() => {
        validateDiscriminant(idleValue, "status", "idle");
      });

      assert.doesNotThrow(() => {
        validateDiscriminant(authValue, "status", "authenticated");
      });
    });
  });

  describe("error message format", () => {
    it("should include discriminant key name in error", () => {
      const testValue: AuthState = { status: "idle" };

      try {
        validateDiscriminant(testValue, "status", "error");
        assert.fail("Should have thrown");
      } catch (e) {
        assert.ok(e instanceof Error);
        assert.ok(
          e.message.includes("status"),
          "Error should mention discriminant key",
        );
      }
    });

    it("should include expected value in error", () => {
      const testValue: AuthState = { status: "idle" };

      try {
        validateDiscriminant(testValue, "status", "authenticated");
        assert.fail("Should have thrown");
      } catch (e) {
        assert.ok(e instanceof Error);
        assert.ok(
          e.message.includes("authenticated"),
          "Error should mention expected value",
        );
      }
    });

    it("should include actual value in error", () => {
      const testValue: AuthState = { status: "idle" };

      try {
        validateDiscriminant(testValue, "status", "error");
        assert.fail("Should have thrown");
      } catch (e) {
        assert.ok(e instanceof Error);
        assert.ok(
          e.message.includes("idle"),
          "Error should mention actual value",
        );
      }
    });
  });
});
