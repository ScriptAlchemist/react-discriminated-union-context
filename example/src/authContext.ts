import { createDiscriminatedContext } from "@bender-tools/react-discriminated-union-context";

type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
};

type Permissions = {
  canEdit: boolean;
  canDelete: boolean;
  canInvite: boolean;
};

type SessionInfo = {
  expiresAt: Date;
  refreshToken: string;
  deviceId: string;
};

// Define the discriminated union type for auth state
export type AuthState =
  | { status: "idle" }
  | { status: "loading"; message?: string }
  | {
      status: "authenticating";
      provider: "google" | "github" | "email";
    }
  | {
      status: "authenticated";
      user: User;
      permissions: Permissions;
      session: SessionInfo;
    }
  | { status: "refreshing"; user: User; session: SessionInfo }
  | {
      status: "error";
      error: string;
      errorCode: number;
      retryable: boolean;
    }
  | { status: "locked"; reason: string; unlockAt: Date };

// Create the discriminated context
export const { Context: AuthContext, useContext: useAuthContext } =
  createDiscriminatedContext<AuthState, "status">("status");
