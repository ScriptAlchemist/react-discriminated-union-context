import { createContext, useContext } from "react";

/**
 * Gets all keys from all members of a union type.
 */
type AllKeysOfUnion<T> = T extends unknown ? keyof T : never;

/**
 * Gets the discriminant value(s) for union members that contain a specific key.
 */
type DiscriminantForKey<
  TUnion,
  TDiscriminant extends keyof TUnion,
  TKey extends PropertyKey,
> = TUnion extends unknown
  ? TKey extends keyof TUnion
    ? TUnion[TDiscriminant]
    : never
  : never;

/**
 * A hint type that suggests which discriminant value to use for a property.
 */
type NarrowingHint<
  TDiscriminant extends string,
  TKey extends PropertyKey,
  TValue,
> = TValue extends string | number
  ? `Use useContext("${TValue}") to access "${TKey & string}" (requires ${TDiscriminant}="${TValue}")`
  : never;

/**
 * Creates a type for the 'default' return value that provides helpful hints
 * for properties that require narrowing.
 */
type DefaultReturnType<
  TUnion,
  TDiscriminant extends keyof TUnion & string,
> = TUnion & {
  readonly [K in Exclude<
    AllKeysOfUnion<TUnion>,
    keyof TUnion
  >]?: NarrowingHint<
    TDiscriminant,
    K,
    DiscriminantForKey<TUnion, TDiscriminant, K>
  >;
};

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
export type DiscriminantValues<
  TUnion,
  TKey extends keyof TUnion,
> = TUnion extends unknown ? TUnion[TKey] : never;

/**
 * Creates a type-safe React context for discriminated union types.
 *
 * This function creates a context and a custom hook that supports automatic
 * type narrowing based on the discriminant value.
 *
 * @param discriminantKey - The key used as the discriminant in the union type
 * @returns An object containing the Context and a useContext hook
 * @throws Error if useContext is called outside of a Provider
 *
 * @example
 * type AuthState =
 *   | { status: 'idle' }
 *   | { status: 'loading' }
 *   | { status: 'authenticated'; user: { name: string } }
 *   | { status: 'error'; error: string };
 *
 * const { Context, useContext } = createDiscriminatedContext<AuthState, 'status'>(
 *   'status'
 * );
 *
 * // In a component:
 * const auth = useContext('authenticated');
 * // auth is typed as: { status: 'authenticated'; user: { name: string } }
 */
export function createDiscriminatedContext<
  TUnion,
  TDiscriminant extends keyof TUnion & string,
>(discriminantKey: TDiscriminant) {
  const Ctx = createContext<TUnion | null>(null);

  // Use the helper type for clearer parameter typing
  type ValidValues = DiscriminantValues<TUnion, TDiscriminant>;

  // Special value to get the full union without narrowing
  const DEFAULT_VALUE = "default" as const;
  type DefaultValue = typeof DEFAULT_VALUE;

  /**
   * Hook to consume the discriminated context with type narrowing.
   *
   * @param expected - The discriminant value to narrow the type. Must be one of the valid
   *                   discriminant values from the union type (e.g., 'idle' | 'loading' | 'error'),
   *                   or 'default' to get the full union type without narrowing.
   * @returns The context value, narrowed to the specific union member matching the expected value,
   *          or the full union type if 'default' is passed.
   * @throws Error if expected value (other than 'default') doesn't match the actual discriminant
   *
   * @example
   * // For a union with status: 'idle' | 'loading' | 'authenticated' | 'error'
   * const auth = useContext('authenticated');
   * // auth is narrowed to: { status: 'authenticated'; user: { name: string } }
   *
   * // To get the full union type without narrowing:
   * const auth = useContext('default');
   * // auth is the full union: AuthState
   */
  function useDiscriminatedContext(
    expected: DefaultValue,
  ): DefaultReturnType<TUnion, TDiscriminant>;
  function useDiscriminatedContext<TValue extends ValidValues>(
    expected: TValue,
  ): Extract<TUnion, { [K in TDiscriminant]: TValue }>;
  function useDiscriminatedContext(
    expected: ValidValues | DefaultValue,
  ) {
    const contextValue = useContext(Ctx);

    if (contextValue === null) {
      throw new Error(
        "useContext must be used within a Provider. Wrap your component tree with <Context.Provider>.",
      );
    }

    const value: TUnion = contextValue;

    if (
      expected !== DEFAULT_VALUE &&
      value[discriminantKey] !== expected
    ) {
      throw new Error(
        `Expected ${discriminantKey}=${String(expected)}, got ${String(value[discriminantKey])}`,
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
     * Hook to consume the discriminated context with required type narrowing.
     * You must specify a discriminant value to narrow the type.
     */
    useContext: useDiscriminatedContext,
  } as const;
}
