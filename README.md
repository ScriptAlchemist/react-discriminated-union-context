# react-discriminated-context

A TypeScript library for creating type-safe React contexts with discriminated unions. This library provides full type narrowing support when accessing context values based on their discriminant.

## Installation

```bash
npm install react-discriminated-context
```

## Features

- 🔒 **Type-safe**: Full TypeScript support with automatic type narrowing
- 🎯 **Discriminated Unions**: Perfect for state machines and multi-state contexts
- ⚡ **Lightweight**: Zero dependencies (besides React peer dependency)
- 📦 **ESM Only**: Modern ES modules support

## Usage

### Basic Example

```tsx
import { createDiscriminatedContext } from 'react-discriminated-context';

// Define your discriminated union type
type AuthState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'authenticated'; user: { name: string; email: string } }
  | { status: 'error'; error: string };

// Create the context with the discriminant key
const { Context: AuthContext, useContext: useAuthContext } = createDiscriminatedContext<AuthState, 'status'>(
  'status',
  { status: 'idle' }
);

// Use in a provider
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({ status: 'idle' });
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

// Use in components - type is automatically narrowed!
function UserProfile() {
  // When you pass the expected discriminant value, the type is narrowed
  const auth = useAuthContext('authenticated');
  // auth is typed as: { status: 'authenticated'; user: { name: string; email: string } }
  
  return <div>Welcome, {auth.user.name}!</div>;
}

// Use without narrowing
function AuthStatus() {
  const auth = useAuthContext();
  // auth is typed as: AuthState (the full union)
  
  switch (auth.status) {
    case 'idle':
      return <div>Not started</div>;
    case 'loading':
      return <div>Loading...</div>;
    case 'authenticated':
      return <div>Logged in as {auth.user.name}</div>;
    case 'error':
      return <div>Error: {auth.error}</div>;
  }
}
```

### Runtime Validation

When you specify an expected discriminant value, the hook will throw an error at runtime if the actual value doesn't match:

```tsx
function UserProfile() {
  // This will throw if auth.status !== 'authenticated'
  const auth = useAuthContext('authenticated');
  
  return <div>Welcome, {auth.user.name}!</div>;
}
```

This is useful for components that should only render in specific states, catching bugs early in development.

## API

### `createDiscriminatedContext<TUnion, TDiscriminant>(discriminantKey, defaultValue)`

Creates a discriminated context with type-safe narrowing support.

#### Parameters

- `discriminantKey`: The key used as the discriminant in your union type
- `defaultValue`: The default value for the context

#### Returns

- `Context`: The React Context object (for use with `Context.Provider`)
- `useContext`: A hook to consume the context with optional type narrowing

### `DiscriminantValues<TUnion, TKey>`

A utility type that extracts all possible values of the discriminant key from a union type.

```tsx
type AuthState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'authenticated'; user: User };

type StatusValues = DiscriminantValues<AuthState, 'status'>;
// Result: 'idle' | 'loading' | 'authenticated'
```

## Requirements

- React 18.0.0 or higher
- TypeScript 5.0 or higher (for best type inference)

## License

MIT
