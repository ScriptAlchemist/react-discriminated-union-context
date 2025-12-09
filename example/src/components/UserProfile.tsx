import { useAuthContext } from "../authContext";

// Component that only renders when authenticated (narrowed type)
export function UserProfile() {
  // This narrows the type - will throw if status !== 'authenticated'
  const auth = useAuthContext("authenticated");

  // TypeScript knows auth.user exists here!
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
      <p>
        <strong>Name:</strong> {auth.user.name}
      </p>
      <p>
        <strong>Email:</strong> {auth.user.email}
      </p>
      <p style={{ fontSize: "0.8rem", color: "#666" }}>
        This component uses <code>useAuthContext("authenticated")</code> which
        narrows the type and throws if the status doesn't match.
      </p>
    </div>
  );
}
