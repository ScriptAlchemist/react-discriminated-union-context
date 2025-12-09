import { createDiscriminatedContext } from "@bender-tools/react-discriminated-union-context";

// Define the discriminated union type for auth state
export type AuthState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "authenticated"; user: { name: string; email: string } }
  | { status: "error"; error: string };

// Create the discriminated context
export const { Context: AuthContext, useContext: useAuthContext } =
  createDiscriminatedContext<AuthState, "status">("status", {
    status: "idle",
  });
