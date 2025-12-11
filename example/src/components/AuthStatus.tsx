import { useAuthContext } from "../authContext";

// Component that shows the full auth state (no narrowing)
// Using 'default' allows destructuring all possible properties from any union member.
export function AuthStatus() {
  const auth = useAuthContext("default");

  // With 'default', you can destructure properties from any union member.
  // These will be typed as `T | undefined` since they don't exist on all variants.
  const {
    status,
    user,
    error,
    errorCode,
    retryable,
    permissions,
    session,
    message,
    provider,
    reason,
    unlockAt,
  } = auth;

  return (
    <div
      style={{
        padding: "1rem",
        background: "#f0f0f0",
        borderRadius: "8px",
      }}
    >
      <h3>Auth Status (full union type with destructuring)</h3>
      <p>
        Current status: <strong>{status}</strong>
      </p>

      {/* Show loading message if present */}
      {status === "loading" && message && (
        <p style={{ color: "#666", fontStyle: "italic" }}>{message}</p>
      )}

      {/* Show authenticating provider */}
      {status === "authenticating" && provider && (
        <p>
          Authenticating with: <strong>{provider}</strong>
        </p>
      )}

      {/* Show user info if authenticated */}
      {status === "authenticated" && user && (
        <div>
          <p>
            User: <strong>{user.name}</strong> ({user.email})
          </p>
          {permissions && (
            <p style={{ fontSize: "0.8rem", color: "#666" }}>
              Permissions: Edit={permissions.canEdit ? "✅" : "❌"},
              Delete=
              {permissions.canDelete ? "✅" : "❌"}, Invite=
              {permissions.canInvite ? "✅" : "❌"}
            </p>
          )}
          {session && (
            <p style={{ fontSize: "0.8rem", color: "#666" }}>
              Session expires: {session.expiresAt.toLocaleString()}
            </p>
          )}
        </div>
      )}

      {/* Show refreshing state */}
      {status === "refreshing" && user && (
        <p>
          Refreshing session for: <strong>{user.name}</strong>
        </p>
      )}

      {/* Show error info */}
      {status === "error" && error && (
        <div style={{ color: "#721c24" }}>
          <p>
            Error: {error} (code: {errorCode})
          </p>
          {retryable && (
            <p style={{ fontSize: "0.8rem" }}>
              This error can be retried.
            </p>
          )}
        </div>
      )}

      {/* Show locked info */}
      {status === "locked" && reason && unlockAt && (
        <div style={{ color: "#856404" }}>
          <p>Locked: {reason}</p>
          <p style={{ fontSize: "0.8rem" }}>
            Unlock at: {unlockAt.toLocaleString()}
          </p>
        </div>
      )}

      <p
        style={{
          fontSize: "0.75rem",
          color: "#999",
          marginTop: "1rem",
          borderTop: "1px solid #ddd",
          paddingTop: "0.5rem",
        }}
      >
        This component uses <code>useAuthContext("default")</code> to
        get the full union type. All non-common properties are typed as{" "}
        <code>T | undefined</code>.
      </p>
    </div>
  );
}
