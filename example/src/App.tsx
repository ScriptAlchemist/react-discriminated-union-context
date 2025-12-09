import { useState } from "react";
import { AuthContext, AuthState } from "./authContext";
import { AuthStatus, UserProfile, ErrorDisplay } from "./components";

function App() {
  const [authState, setAuthState] = useState<AuthState>({
    status: "idle",
  });

  const simulateLogin = () => {
    setAuthState({ status: "loading" });
    setTimeout(() => {
      setAuthState({
        status: "authenticated",
        user: { name: "John Doe", email: "john@example.com" },
      });
    }, 1500);
  };

  const simulateError = () => {
    setAuthState({ status: "loading" });
    setTimeout(() => {
      setAuthState({ status: "error", error: "Invalid credentials" });
    }, 1500);
  };

  const logout = () => {
    setAuthState({ status: "idle" });
  };

  return (
    <AuthContext.Provider value={authState}>
      <div
        style={{
          maxWidth: "600px",
          margin: "2rem auto",
          padding: "1rem",
        }}
      >
        <h1>React Discriminated Union Context</h1>
        <p>
          This example demonstrates type-safe context with discriminated
          unions.
        </p>

        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "1rem",
          }}
        >
          <button
            onClick={simulateLogin}
            disabled={authState.status === "loading"}
          >
            Simulate Login
          </button>
          <button
            onClick={simulateError}
            disabled={authState.status === "loading"}
          >
            Simulate Error
          </button>
          <button onClick={logout}>Reset</button>
        </div>

        <AuthStatus />

        {/* Only render UserProfile when authenticated */}
        {authState.status === "authenticated" && <UserProfile />}

        {/* Only render ErrorDisplay when there's an error */}
        {authState.status === "error" && <ErrorDisplay />}

        {authState.status === "loading" && (
          <div style={{ marginTop: "1rem", textAlign: "center" }}>
            Loading...
          </div>
        )}
      </div>
    </AuthContext.Provider>
  );
}

export default App;
