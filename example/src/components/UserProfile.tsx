import { useAuthContext } from "../authContext";

// Component that only renders when authenticated (narrowed type)
export function UserProfile() {
  // This narrows the type - will throw if status !== 'authenticated'
  const { user, permissions, session } =
    useAuthContext("authenticated");

  // TypeScript knows all these properties exist here!
  return (
    <div
      style={{
        padding: "1rem",
        background: "#d4edda",
        borderRadius: "8px",
        marginTop: "1rem",
      }}
    >
      <h3>User Profile (narrowed type)</h3>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ margin: "0.5rem 0" }}>User Info</h4>
        {user.avatar && (
          <img
            src={user.avatar}
            alt={user.name}
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              marginBottom: "0.5rem",
            }}
          />
        )}
        <p>
          <strong>ID:</strong> {user.id}
        </p>
        <p>
          <strong>Name:</strong> {user.name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ margin: "0.5rem 0" }}>Permissions</h4>
        <ul style={{ margin: 0, paddingLeft: "1.5rem" }}>
          <li>Can Edit: {permissions.canEdit ? "✅" : "❌"}</li>
          <li>Can Delete: {permissions.canDelete ? "✅" : "❌"}</li>
          <li>Can Invite: {permissions.canInvite ? "✅" : "❌"}</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ margin: "0.5rem 0" }}>Session</h4>
        <p>
          <strong>Device ID:</strong> {session.deviceId}
        </p>
        <p>
          <strong>Expires:</strong> {session.expiresAt.toLocaleString()}
        </p>
        <p style={{ fontSize: "0.75rem", color: "#666" }}>
          <strong>Refresh Token:</strong>{" "}
          {session.refreshToken.slice(0, 10)}...
        </p>
      </div>

      <p style={{ fontSize: "0.8rem", color: "#666" }}>
        This component uses <code>useAuthContext("authenticated")</code>{" "}
        which narrows the type and throws if the status doesn't match.
      </p>
    </div>
  );
}
