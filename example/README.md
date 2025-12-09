# React Discriminated Union Context - Example

This is an example React application demonstrating the usage of `@bender-tools/react-discriminated-union-context`.

## Getting Started

1. First, build the main library (from the root directory):

```bash
cd ..
npm install
npm run build
```

2. Install the example dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

## What This Example Shows

This example demonstrates an authentication state machine using a discriminated union:

```typescript
type AuthState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "authenticated"; user: { name: string; email: string } }
  | { status: "error"; error: string };
```

### Key Features Demonstrated

1. **Creating a Discriminated Context**

   ```typescript
   const { Context: AuthContext, useContext: useAuthContext } =
     createDiscriminatedContext<AuthState, "status">("status", { status: "idle" });
   ```

2. **Using the Full Union Type**

   ```typescript
   function AuthStatus() {
     const auth = useAuthContext(); // Type: AuthState
     // Handle all cases with a switch or conditionals
   }
   ```

3. **Type Narrowing with Expected Values**

   ```typescript
   function UserProfile() {
     const auth = useAuthContext("authenticated");
     // Type is narrowed to: { status: "authenticated"; user: { name: string; email: string } }
     // Throws at runtime if status !== "authenticated"

     return <div>{auth.user.name}</div>; // TypeScript knows auth.user exists!
   }
   ```

## Try It Out

- Click "Simulate Login" to see a successful authentication flow
- Click "Simulate Error" to see the error state
- Click "Reset" to return to the idle state

Notice how the `UserProfile` component only renders when authenticated, and the `ErrorDisplay` component only renders when there's an error. Both use type narrowing for full type safety.
