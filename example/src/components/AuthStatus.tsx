import { useAuthContext } from "../authContext";

// Component that shows the full auth state (no narrowing)
// Using 'default' allows destructuring all possible properties from any union member.
// TypeScript provides hints for properties that require narrowing - hover over
// 'user' or 'error' to see which useContext value gives access to that property.
export function AuthStatus() {
  const auth = useAuthContext("default");

  // With 'default', you can destructure properties from any union member.
  // Hover over 'user' or 'error' to see the narrowing hint:
  // e.g., `Use useContext("authenticated") to access "user" (requires status="authenticated")`
  const { status, user, error } = auth;

  // Note: 'user' and 'error' may be undefined depending on the current state,
  // so you should check the status before using them (or use narrowed contexts).
  console.log("status:", status);
  console.log("user:", user); // Hint type suggests useContext("authenticated")
  console.log("error:", error); // Hint type suggests useContext("error")

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
      {status === "authenticated" && user && <p>User: {user.name}</p>}
      {status === "error" && error && (
        <p style={{ color: "red" }}>Error: {error}</p>
      )}
    </div>
  );
}
