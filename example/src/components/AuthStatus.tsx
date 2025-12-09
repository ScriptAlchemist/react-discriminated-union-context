import { useAuthContext } from "../authContext";

// Component that shows the full auth state (no narrowing)
export function AuthStatus() {
  const auth = useAuthContext();

  return (
    <div style={{ padding: "1rem", background: "#f0f0f0", borderRadius: "8px" }}>
      <h3>Auth Status (full union type)</h3>
      <p>
        Current status: <strong>{auth.status}</strong>
      </p>
      {auth.status === "authenticated" && <p>User: {auth.user.name}</p>}
      {auth.status === "error" && (
        <p style={{ color: "red" }}>Error: {auth.error}</p>
      )}
    </div>
  );
}
