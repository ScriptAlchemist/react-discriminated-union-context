import { createContext, useContext } from "react";

/**
 * Forces TypeScript to expand/resolve a type for better hover display.
 * This makes nested mapped types show their actual structure.
 */
type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

/**
 * Recursively expands/resolves types for better hover display.
 * Expands nested object types so you see the full structure.
 * Distributes over unions to handle discriminated unions correctly.
 */
type DeepPrettify<T> = T extends (...args: infer A) => infer R
  ? (...args: DeepPrettify<A>) => DeepPrettify<R>
  : T extends Date
    ? Date
    : T extends object
      ? { [K in keyof T]: DeepPrettify<T[K]> }
      : T;

/**
 * Gets all keys from all members of a union type.
 */
type AllKeysOfUnion<T> = T extends unknown ? keyof T : never;

/**
 * Extracts the keys (excluding the discriminant) for a specific discriminant value.
 */
type KeysForDiscriminantValue<
  TUnion,
  TDiscriminant extends keyof TUnion,
  TValue,
> = TUnion extends unknown
  ? TUnion[TDiscriminant] extends TValue
    ? Exclude<keyof TUnion, TDiscriminant>
    : never
  : never;

/**
 * Maps each discriminant value to its available keys (excluding the discriminant itself).
 *
 * @example
 * type AuthState =
 *   | { status: 'idle' }
 *   | { status: 'loading' }
 *   | { status: 'authenticated'; user: User }
 *   | { status: 'error'; error: string };
 *
 * type KeyMap = KeysByDiscriminantValue<AuthState, 'status'>;
 * // Result: {
 * //   idle: never;
 * //   loading: never;
 * //   authenticated: "user";
 * //   error: "error";
 * // }
 */
export type KeysByDiscriminantValue<
  TUnion,
  TDiscriminant extends keyof TUnion,
> = Prettify<{
  [V in TUnion[TDiscriminant] &
    (string | number | symbol)]: KeysForDiscriminantValue<
    TUnion,
    TDiscriminant,
    V
  >;
}>;

/**
 * Maps each key to the discriminant value(s) that contain it.
 *
 * @example
 * type AuthState =
 *   | { status: 'idle' }
 *   | { status: 'loading' }
 *   | { status: 'authenticated'; user: User }
 *   | { status: 'error'; error: string };
 *
 * type DiscriminantMap = DiscriminantsByKey<AuthState, 'status'>;
 * // Result: {
 * //   user: "authenticated";
 * //   error: "error";
 * // }
 */
export type DiscriminantsByKey<
  TUnion,
  TDiscriminant extends keyof TUnion,
> = Prettify<{
  [K in Exclude<
    AllKeysOfUnion<TUnion>,
    TDiscriminant
  >]: DiscriminantForKey<TUnion, TDiscriminant, K>;
}>;

/**
 * Extracts all keys available for a specific discriminant value.
 *
 * @example
 * type AuthState =
 *   | { status: 'idle' }
 *   | { status: 'authenticated'; user: User };
 *
 * type AuthKeys = KeysForValue<AuthState, 'status', 'authenticated'>;
 * // Result: "status" | "user"
 */
export type KeysForValue<
  TUnion,
  TDiscriminant extends keyof TUnion,
  TValue extends TUnion[TDiscriminant],
> = keyof Extract<TUnion, { [K in TDiscriminant]: TValue }>;

/**
 * Gets the discriminant value(s) required to access a specific key.
 *
 * @example
 * type AuthState =
 *   | { status: 'idle' }
 *   | { status: 'authenticated'; user: User };
 *
 * type UserDiscriminant = DiscriminantForKeyAccess<AuthState, 'status', 'user'>;
 * // Result: "authenticated"
 */
export type DiscriminantForKeyAccess<
  TUnion,
  TDiscriminant extends keyof TUnion,
  TKey extends AllKeysOfUnion<TUnion>,
> = DiscriminantForKey<TUnion, TDiscriminant, TKey>;

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
 * Extracts the type of a property from union members that contain it.
 * Returns never for union members that don't have the property.
 *
 * @example
 * type AuthState =
 *   | { status: 'idle' }
 *   | { status: 'error'; error: string };
 *
 * type ErrorType = PropertyTypeFromUnion<AuthState, 'error'>;
 * // Result: string (from the error state)
 */
type PropertyTypeFromUnion<
  TUnion,
  K extends PropertyKey,
> = TUnion extends unknown
  ? K extends keyof TUnion
    ? TUnion[K]
    : never
  : never;

/**
 * Creates a return type for narrowed context.
 * Returns only the exact narrowed type without hint properties,
 * so IDE autocomplete shows only the properties that actually exist.
 */
type NarrowedReturnType<
  TUnion,
  TDiscriminant extends keyof TUnion & string,
  TValue extends TUnion[TDiscriminant],
> = DeepPrettify<Extract<TUnion, { [K in TDiscriminant]: TValue }>>;

/**
 * Creates a type for the 'default' return value that includes all properties
 * from all union members, with properties not common to all members marked as optional.
 */
type DefaultReturnType<
  TUnion,
  TDiscriminant extends keyof TUnion & string,
> = DeepPrettify<
  TUnion & {
    [K in Exclude<
      AllKeysOfUnion<TUnion>,
      keyof TUnion
    >]?: PropertyTypeFromUnion<TUnion, K>;
  }
>;

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
 * Full introspection type containing all key/discriminant mappings.
 * Useful for debugging and understanding the union structure.
 *
 * @example
 * type AuthState =
 *   | { status: 'idle' }
 *   | { status: 'authenticated'; user: User }
 *   | { status: 'error'; error: string };
 *
 * type Info = UnionIntrospection<AuthState, 'status'>;
 * // Hover over Info to see:
 * // {
 * //   discriminant: "status";
 * //   values: "idle" | "authenticated" | "error";
 * //   keysByValue: { idle: never; authenticated: "user"; error: "error" };
 * //   valuesByKey: { user: "authenticated"; error: "error" };
 * // }
 */
export type UnionIntrospection<
  TUnion,
  TDiscriminant extends keyof TUnion & string,
> = Prettify<{
  discriminant: TDiscriminant;
  values: DiscriminantValues<TUnion, TDiscriminant>;
  keysByValue: KeysByDiscriminantValue<TUnion, TDiscriminant>;
  valuesByKey: DiscriminantsByKey<TUnion, TDiscriminant>;
}>;

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
  ): NarrowedReturnType<TUnion, TDiscriminant, TValue>;
  function useDiscriminatedContext(
    expected: ValidValues | DefaultValue,
  ):
    | DefaultReturnType<TUnion, TDiscriminant>
    | NarrowedReturnType<TUnion, TDiscriminant, ValidValues> {
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

    return value as
      | DefaultReturnType<TUnion, TDiscriminant>
      | NarrowedReturnType<TUnion, TDiscriminant, ValidValues>;
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
