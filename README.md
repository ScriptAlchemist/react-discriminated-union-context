# @bender-tools/react-discriminated-union-context

A TypeScript library for creating type-safe React contexts with discriminated unions. This library provides full type narrowing support when accessing context values based on their discriminant.

## Installation

```bash
npm install @bender-tools/react-discriminated-union-context
```

## Features

- 🔒 **Type-safe**: Full TypeScript support with automatic type narrowing
- 🎯 **Discriminated Unions**: Perfect for state machines and multi-state contexts
- ⚡ **Lightweight**: Zero dependencies (besides React peer dependency)
- 📦 **ESM Only**: Modern ES modules support

## Usage

### Basic Example

```tsx
import { createDiscriminatedContext } from "@bender-tools/react-discriminated-union-context";

// Define your discriminated union type
type AuthState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "authenticated"; user: { name: string; email: string } }
  | { status: "error"; error: string };

// Create the context with the discriminant key
const { Context: AuthContext, useContext: useAuthContext } =
  createDiscriminatedContext<AuthState, "status">("status", {
    status: "idle",
  });

// Use in a provider
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({ status: "idle" });

  return (
    <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
  );
}

// Use in components - type is automatically narrowed!
function UserProfile() {
  // When you pass the expected discriminant value, the type is narrowed
  const auth = useAuthContext("authenticated");
  // auth is typed as: { status: 'authenticated'; user: { name: string; email: string } }

  return <div>Welcome, {auth.user.name}!</div>;
}

// Use 'default' to get the full union type without narrowing
function AuthStatus() {
  const auth = useAuthContext("default");
  // auth is typed as: AuthState (the full union)

  switch (auth.status) {
    case "idle":
      return <div>Not started</div>;
    case "loading":
      return <div>Loading...</div>;
    case "authenticated":
      return <div>Logged in as {auth.user.name}</div>;
    case "error":
      return <div>Error: {auth.error}</div>;
  }
}

// With 'default', you can also destructure properties from any union member
function AuthStatusWithDestructuring() {
  const auth = useAuthContext("default");
  // Destructure all possible properties - hover over 'user' or 'error'
  // to see hints like: `Use useContext("authenticated") to access "user"`
  const { status, user, error } = auth;

  // Note: 'user' and 'error' may be undefined depending on current state
  return (
    <div>
      <p>Status: {status}</p>
      {status === "authenticated" && user && <p>User: {user.name}</p>}
      {status === "error" && error && <p>Error: {error}</p>}
    </div>
  );
}
```

### Runtime Validation

When you specify an expected discriminant value, the hook will throw an error at runtime if the actual value doesn't match:

```tsx
function UserProfile() {
  // This will throw if auth.status !== 'authenticated'
  const auth = useAuthContext("authenticated");

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
- `useContext`: A hook to consume the context with required type narrowing. Pass a discriminant value to narrow the type, or `'default'` to get the full union type.

### `DiscriminantValues<TUnion, TKey>`

A utility type that extracts all possible values of the discriminant key from a union type.

```tsx
type AuthState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "authenticated"; user: User };

type StatusValues = DiscriminantValues<AuthState, "status">;
// Result: 'idle' | 'loading' | 'authenticated'
```

## Example Application

The repository includes a full example React application demonstrating the library in action.

### Running the Example

```bash
# Clone the repository
git clone https://github.com/ScriptAlchemist/react-discriminated-union-context.git
cd react-discriminated-union-context

# Build the library
npm install
npm run build

# Run the example app
cd example
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

### Example Structure

The example demonstrates an authentication state machine:

```
example/src/
├── authContext.ts          # Context and types definition
├── components/
│   ├── AuthStatus.tsx      # Uses full union type
│   ├── UserProfile.tsx     # Narrowed to "authenticated"
│   └── ErrorDisplay.tsx    # Narrowed to "error"
├── App.tsx                 # Main app with provider
└── main.tsx                # Entry point
```

### Key Patterns Demonstrated

1. **Shared Context Module** (`authContext.ts`):

   ```tsx
   import { createDiscriminatedContext } from "@bender-tools/react-discriminated-union-context";

   export type AuthState =
     | { status: "idle" }
     | { status: "loading" }
     | {
         status: "authenticated";
         user: { name: string; email: string };
       }
     | { status: "error"; error: string };

   export const { Context: AuthContext, useContext: useAuthContext } =
     createDiscriminatedContext<AuthState, "status">("status", {
       status: "idle",
     });
   ```

2. **Full Union Type Usage** (`AuthStatus.tsx`):

   ```tsx
   export function AuthStatus() {
     const auth = useAuthContext("default"); // Type: AuthState
     // Handle all cases manually
   }
   ```

3. **Destructuring with 'default'** - Access all possible properties:

   ```tsx
   export function AuthStatus() {
     const auth = useAuthContext("default");
     // Destructure properties from any union member
     // Hover over 'user' or 'error' to see narrowing hints
     const { status, user, error } = auth;

     // TypeScript hints: `Use useContext("authenticated") to access "user"`
     console.log("status:", status);
     console.log("user:", user); // May be undefined
     console.log("error:", error); // May be undefined
   }
   ```

4. **Type Narrowing** (`UserProfile.tsx`):

   ```tsx
   export function UserProfile() {
     const auth = useAuthContext("authenticated");
     // Type: { status: "authenticated"; user: { name: string; email: string } }
     return <div>{auth.user.name}</div>; // TypeScript knows auth.user exists!
   }
   ```

5. **Required Parameter**:

   ```tsx
   // ❌ Error - empty () not allowed, must specify a value
   const auth = useAuthContext();

   // ✅ Use 'default' to get full union type
   const auth = useAuthContext("default");

   // ✅ Use a discriminant value to narrow the type
   const auth = useAuthContext("authenticated");
   ```

## Requirements

- React 18.0.0 or higher (including React 19)
- TypeScript 5.0 or higher (for best type inference)

## License

MIT
