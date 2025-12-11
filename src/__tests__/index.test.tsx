import { describe, it } from "node:test";
import assert from "node:assert";
import React from "react";
import { renderHook } from "@testing-library/react";
import { createDiscriminatedContext } from "../index.js";

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
// Compile-time Type Tests
// These tests verify TypeScript type narrowing at compile time.
// If these fail, TypeScript compilation will fail.
// =============================================================================

function _compileTimeTypeTests() {
  const { Context, useContext } = createDiscriminatedContext<
    AuthState,
    "status"
  >("status");

  // Test: 'default' returns full union - can access status but not user directly
  const _testDefault = () => {
    const auth = useContext("default");
    const _status: "idle" | "loading" | "authenticated" | "error" =
      auth.status;

    // With default, optional properties from other variants are available but possibly undefined
    const _user: User | undefined = auth.user;
    const _error: string | undefined = auth.error;
    const _message: string | undefined = auth.message;
    const _retryable: boolean | undefined = auth.retryable;
  };

  // Test: 'authenticated' narrows to only authenticated variant
  const _testAuthenticated = () => {
    const auth = useContext("authenticated");
    const _status: "authenticated" = auth.status;
    const _user: User = auth.user; // Not undefined!
    const _name: string = auth.user.name;

    // @ts-expect-error - error property doesn't exist on authenticated variant
    const _error = auth.error;

    // @ts-expect-error - retryable property doesn't exist on authenticated variant
    const _retryable = auth.retryable;
  };

  // Test: 'error' narrows to only error variant
  const _testError = () => {
    const auth = useContext("error");
    const _status: "error" = auth.status;
    const _error: string = auth.error; // Not undefined!
    const _retryable: boolean = auth.retryable; // Not undefined!

    // @ts-expect-error - user property doesn't exist on error variant
    const _user = auth.user;
  };

  // Test: 'idle' narrows to only idle variant
  const _testIdle = () => {
    const auth = useContext("idle");
    const _status: "idle" = auth.status;

    // @ts-expect-error - user property doesn't exist on idle variant
    const _user = auth.user;

    // @ts-expect-error - error property doesn't exist on idle variant
    const _error = auth.error;
  };

  // Test: 'loading' narrows to only loading variant
  const _testLoading = () => {
    const auth = useContext("loading");
    const _status: "loading" = auth.status;
    const _message: string | undefined = auth.message; // Optional property

    // @ts-expect-error - user property doesn't exist on loading variant
    const _user = auth.user;
  };

  // Test: Destructuring works with narrowed types
  const _testDestructuring = () => {
    const { status, user } = useContext("authenticated");
    const _s: "authenticated" = status;
    const _u: User = user;
  };

  // Test: Destructuring works with default
  const _testDestructuringDefault = () => {
    const { status, user, error } = useContext("default");
    const _s: "idle" | "loading" | "authenticated" | "error" = status;
    const _u: User | undefined = user;
    const _e: string | undefined = error;
  };
}

// =============================================================================
// Runtime Tests
// =============================================================================

describe("createDiscriminatedContext", () => {
  describe("context creation", () => {
    it("should return an object with Context and useContext", () => {
      const result = createDiscriminatedContext<AuthState, "status">(
        "status",
      );

      assert.ok(result.Context, "Context should be defined");
      assert.ok(result.useContext, "useContext should be defined");
      assert.strictEqual(
        typeof result.useContext,
        "function",
        "useContext should be a function",
      );
      assert.ok(
        result.Context.Provider,
        "Context should have a Provider",
      );
    });
  });

  describe("useContext returns correct values", () => {
    it("should return the provided value when using 'default'", () => {
      const { Context, useContext } = createDiscriminatedContext<
        AuthState,
        "status"
      >("status");

      const testValue: AuthState = { status: "idle" };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Context.Provider value={testValue}>
          {children}
        </Context.Provider>
      );

      const { result } = renderHook(() => useContext("default"), {
        wrapper,
      });

      assert.deepStrictEqual(result.current, testValue);
    });

    it("should return the provided authenticated state", () => {
      const { Context, useContext } = createDiscriminatedContext<
        AuthState,
        "status"
      >("status");

      const testValue: AuthState = {
        status: "authenticated",
        user: { id: "1", name: "John", email: "john@example.com" },
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Context.Provider value={testValue}>
          {children}
        </Context.Provider>
      );

      const { result } = renderHook(() => useContext("authenticated"), {
        wrapper,
      });

      assert.strictEqual(result.current.status, "authenticated");
      assert.strictEqual(result.current.user.name, "John");
      assert.strictEqual(result.current.user.email, "john@example.com");
    });

    it("should return the provided error state", () => {
      const { Context, useContext } = createDiscriminatedContext<
        AuthState,
        "status"
      >("status");

      const testValue: AuthState = {
        status: "error",
        error: "Network failure",
        retryable: true,
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Context.Provider value={testValue}>
          {children}
        </Context.Provider>
      );

      const { result } = renderHook(() => useContext("error"), {
        wrapper,
      });

      assert.strictEqual(result.current.status, "error");
      assert.strictEqual(result.current.error, "Network failure");
      assert.strictEqual(result.current.retryable, true);
    });

    it("should return the provided loading state with optional message", () => {
      const { Context, useContext } = createDiscriminatedContext<
        AuthState,
        "status"
      >("status");

      const testValue: AuthState = {
        status: "loading",
        message: "Please wait...",
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Context.Provider value={testValue}>
          {children}
        </Context.Provider>
      );

      const { result } = renderHook(() => useContext("loading"), {
        wrapper,
      });

      assert.strictEqual(result.current.status, "loading");
      assert.strictEqual(result.current.message, "Please wait...");
    });

    it("should return the same object reference", () => {
      const { Context, useContext } = createDiscriminatedContext<
        AuthState,
        "status"
      >("status");

      const testValue: AuthState = {
        status: "authenticated",
        user: { id: "1", name: "Test", email: "test@test.com" },
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Context.Provider value={testValue}>
          {children}
        </Context.Provider>
      );

      const { result } = renderHook(() => useContext("authenticated"), {
        wrapper,
      });

      assert.strictEqual(
        result.current,
        testValue,
        "Should return the same object reference",
      );
    });
  });

  describe("'default' does not validate discriminant", () => {
    it("should not throw when status is idle but using 'default'", () => {
      const { Context, useContext } = createDiscriminatedContext<
        AuthState,
        "status"
      >("status");

      const testValue: AuthState = { status: "idle" };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Context.Provider value={testValue}>
          {children}
        </Context.Provider>
      );

      assert.doesNotThrow(() => {
        renderHook(() => useContext("default"), { wrapper });
      });
    });

    it("should not throw when status is error but using 'default'", () => {
      const { Context, useContext } = createDiscriminatedContext<
        AuthState,
        "status"
      >("status");

      const testValue: AuthState = {
        status: "error",
        error: "fail",
        retryable: false,
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Context.Provider value={testValue}>
          {children}
        </Context.Provider>
      );

      assert.doesNotThrow(() => {
        renderHook(() => useContext("default"), { wrapper });
      });
    });
  });

  describe("throws when used outside Provider", () => {
    it("should throw descriptive error when no Provider exists", () => {
      const { useContext } = createDiscriminatedContext<
        AuthState,
        "status"
      >("status");

      assert.throws(
        () => {
          renderHook(() => useContext("default"));
        },
        {
          message:
            "useContext must be used within a Provider. Wrap your component tree with <Context.Provider>.",
        },
      );
    });
  });

  describe("throws when discriminant does not match", () => {
    it("should throw when expecting 'authenticated' but got 'idle'", () => {
      const { Context, useContext } = createDiscriminatedContext<
        AuthState,
        "status"
      >("status");

      const testValue: AuthState = { status: "idle" };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Context.Provider value={testValue}>
          {children}
        </Context.Provider>
      );

      assert.throws(
        () => {
          renderHook(() => useContext("authenticated"), { wrapper });
        },
        {
          message: "Expected status=authenticated, got idle",
        },
      );
    });

    it("should throw when expecting 'loading' but got 'error'", () => {
      const { Context, useContext } = createDiscriminatedContext<
        AuthState,
        "status"
      >("status");

      const testValue: AuthState = {
        status: "error",
        error: "Something went wrong",
        retryable: false,
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Context.Provider value={testValue}>
          {children}
        </Context.Provider>
      );

      assert.throws(
        () => {
          renderHook(() => useContext("loading"), { wrapper });
        },
        {
          message: "Expected status=loading, got error",
        },
      );
    });

    it("should throw when expecting 'idle' but got 'authenticated'", () => {
      const { Context, useContext } = createDiscriminatedContext<
        AuthState,
        "status"
      >("status");

      const testValue: AuthState = {
        status: "authenticated",
        user: { id: "1", name: "Test", email: "test@test.com" },
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Context.Provider value={testValue}>
          {children}
        </Context.Provider>
      );

      assert.throws(
        () => {
          renderHook(() => useContext("idle"), { wrapper });
        },
        {
          message: "Expected status=idle, got authenticated",
        },
      );
    });
  });

  describe("different discriminant keys", () => {
    type RequestState =
      | { type: "pending" }
      | { type: "success"; data: string }
      | { type: "failure"; reason: string };

    it("should work with 'type' as discriminant key", () => {
      const { Context, useContext } = createDiscriminatedContext<
        RequestState,
        "type"
      >("type");

      const testValue: RequestState = {
        type: "success",
        data: "Hello World",
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Context.Provider value={testValue}>
          {children}
        </Context.Provider>
      );

      const { result } = renderHook(() => useContext("success"), {
        wrapper,
      });

      assert.strictEqual(result.current.type, "success");
      assert.strictEqual(result.current.data, "Hello World");
    });

    type StepState =
      | { step: 1; name: string }
      | { step: 2; email: string }
      | { step: 3; password: string };

    it("should work with numeric discriminant values", () => {
      const { Context, useContext } = createDiscriminatedContext<
        StepState,
        "step"
      >("step");

      const testValue: StepState = {
        step: 2,
        email: "test@example.com",
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Context.Provider value={testValue}>
          {children}
        </Context.Provider>
      );

      const { result } = renderHook(() => useContext(2), { wrapper });

      assert.strictEqual(result.current.step, 2);
      assert.strictEqual(result.current.email, "test@example.com");
    });

    it("should throw for numeric discriminant mismatch", () => {
      const { Context, useContext } = createDiscriminatedContext<
        StepState,
        "step"
      >("step");

      const testValue: StepState = { step: 1, name: "John" };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Context.Provider value={testValue}>
          {children}
        </Context.Provider>
      );

      assert.throws(
        () => {
          renderHook(() => useContext(3), { wrapper });
        },
        {
          message: "Expected step=3, got 1",
        },
      );
    });

    type BooleanDiscriminant =
      | { active: true; data: string }
      | { active: false; reason: string };

    it("should work with boolean discriminant values", () => {
      const { Context, useContext } = createDiscriminatedContext<
        BooleanDiscriminant,
        "active"
      >("active");

      const testValue: BooleanDiscriminant = {
        active: true,
        data: "test",
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Context.Provider value={testValue}>
          {children}
        </Context.Provider>
      );

      const { result } = renderHook(() => useContext(true), {
        wrapper,
      });

      assert.strictEqual(result.current.active, true);
      assert.strictEqual(result.current.data, "test");
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

    it("should handle deeply nested objects", () => {
      const { Context, useContext } = createDiscriminatedContext<
        ComplexState,
        "kind"
      >("kind");

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

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Context.Provider value={testValue}>
          {children}
        </Context.Provider>
      );

      const { result } = renderHook(() => useContext("loaded"), {
        wrapper,
      });

      assert.strictEqual(result.current.kind, "loaded");
      assert.strictEqual(result.current.data.items.length, 2);
      assert.strictEqual(result.current.data.items[0]?.name, "Item 1");
      assert.strictEqual(result.current.data.metadata.total, 2);
    });
  });

  describe("multiple independent contexts", () => {
    it("should allow creating and using multiple contexts independently", () => {
      type ThemeState =
        | { mode: "light" }
        | { mode: "dark"; accent: string };

      const authContext = createDiscriminatedContext<
        AuthState,
        "status"
      >("status");
      const themeContext = createDiscriminatedContext<
        ThemeState,
        "mode"
      >("mode");

      const authValue: AuthState = { status: "idle" };
      const themeValue: ThemeState = {
        mode: "dark",
        accent: "#ff0000",
      };

      const authWrapper = ({
        children,
      }: {
        children: React.ReactNode;
      }) => (
        <authContext.Context.Provider value={authValue}>
          {children}
        </authContext.Context.Provider>
      );

      const themeWrapper = ({
        children,
      }: {
        children: React.ReactNode;
      }) => (
        <themeContext.Context.Provider value={themeValue}>
          {children}
        </themeContext.Context.Provider>
      );

      const { result: authResult } = renderHook(
        () => authContext.useContext("idle"),
        { wrapper: authWrapper },
      );

      const { result: themeResult } = renderHook(
        () => themeContext.useContext("dark"),
        { wrapper: themeWrapper },
      );

      assert.strictEqual(authResult.current.status, "idle");
      assert.strictEqual(themeResult.current.mode, "dark");
      assert.strictEqual(themeResult.current.accent, "#ff0000");
    });
  });

  describe("nested providers", () => {
    it("should use the closest provider value", () => {
      const { Context, useContext } = createDiscriminatedContext<
        AuthState,
        "status"
      >("status");

      const outerValue: AuthState = { status: "idle" };
      const innerValue: AuthState = {
        status: "authenticated",
        user: { id: "1", name: "Inner User", email: "inner@test.com" },
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Context.Provider value={outerValue}>
          <Context.Provider value={innerValue}>
            {children}
          </Context.Provider>
        </Context.Provider>
      );

      const { result } = renderHook(() => useContext("authenticated"), {
        wrapper,
      });

      assert.strictEqual(result.current.status, "authenticated");
      assert.strictEqual(result.current.user.name, "Inner User");
    });
  });

  describe("edge cases", () => {
    it("should handle undefined optional properties", () => {
      const { Context, useContext } = createDiscriminatedContext<
        AuthState,
        "status"
      >("status");

      const testValue: AuthState = { status: "loading" }; // message is undefined

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Context.Provider value={testValue}>
          {children}
        </Context.Provider>
      );

      const { result } = renderHook(() => useContext("loading"), {
        wrapper,
      });

      assert.strictEqual(result.current.status, "loading");
      assert.strictEqual(result.current.message, undefined);
    });

    it("should handle empty string values", () => {
      const { Context, useContext } = createDiscriminatedContext<
        AuthState,
        "status"
      >("status");

      const testValue: AuthState = {
        status: "error",
        error: "",
        retryable: false,
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Context.Provider value={testValue}>
          {children}
        </Context.Provider>
      );

      const { result } = renderHook(() => useContext("error"), {
        wrapper,
      });

      assert.strictEqual(result.current.error, "");
      assert.strictEqual(result.current.retryable, false);
    });
  });
});
