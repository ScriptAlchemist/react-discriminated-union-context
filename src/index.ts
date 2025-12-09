import { createContext, useContext } from "react";

/**
 * Extracts all possible values of a discriminant key from a union type.
 *
 * @example
 * type AuthState =
 *   | { status: 'idle' }
 *   | { status: 'loading' }
 *   | { status: 'authenticated'; user: User };
 *
 * type StatusValues = DiscriminantValues<AuthState, 'status'>;
 * // Result: 'idle' | 'loading' | 'authenticated'
 */
export type DiscriminantValues<TUnion, TKey extends keyof TUnion> =
  TUnion extends unknown ? TUnion[TKey] : never;

/**
 * Creates a type-safe React context for discriminated union types.
 *
 * This function creates a context and a custom hook that supports automatic
 * type narrowing based on the discriminant value.
 *
 * @param discriminantKey - The key used as the discriminant in the union type
 * @param defaultValue - The default value for the context
 * @returns An object containing the Context and a useContext hook
 *
 * @example
 * type AuthState =
 *   | { status: 'idle' }
 *   | { status: 'loading' }
 *   | { status: 'authenticated'; user: { name: string } }
 *   | { status: 'error'; error: string };
 *
 * const { Context, useContext } = createDiscriminatedContext<AuthState, 'status'>(
 *   'status',
 *   { status: 'idle' }
 * );
 *
 * // In a component:
 * const auth = useContext('authenticated');
 * // auth is typed as: { status: 'authenticated'; user: { name: string } }
 */
export function createDiscriminatedContext<
  TUnion,
  TDiscriminant extends keyof TUnion & string,
>(discriminantKey: TDiscriminant, defaultValue: TUnion) {
  const Ctx = createContext<TUnion>(defaultValue);

  // Use the helper type for clearer parameter typing
  type ValidValues = DiscriminantValues<TUnion, TDiscriminant>;

  /**
   * Hook to consume the discriminated context.
   *
   * @overload When called without arguments, returns the full union type
   * @overload When called with an expected discriminant value, returns the narrowed type
   *
   * @param expected - Optional discriminant value to narrow the type
   * @returns The context value, narrowed if an expected value was provided
   * @throws Error if expected value is provided but doesn't match the actual discriminant
   */
  function useDiscriminatedContext(): TUnion;
  function useDiscriminatedContext<TValue extends ValidValues>(
    expected: TValue
  ): Extract<TUnion, { [K in TDiscriminant]: TValue }>;
  function useDiscriminatedContext(expected?: ValidValues) {
    const value = useContext(Ctx);

    if (expected !== undefined && value[discriminantKey] !== expected) {
      throw new Error(
        `Expected ${discriminantKey}=${String(expected)}, got ${String(value[discriminantKey])}`
      );
    }

    return value;
  }

  return {
    /**
     * The React Context object. Use with Context.Provider to provide values.
     */
    Context: Ctx,
    /**
     * Hook to consume the discriminated context with optional type narrowing.
     */
    useContext: useDiscriminatedContext,
  } as const;
}
