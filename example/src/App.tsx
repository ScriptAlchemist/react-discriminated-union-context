import { useState } from "react";
import { AuthContext, AuthState } from "./authContext";
import { AuthStatus, UserProfile, ErrorDisplay } from "./components";

function App() {
  const [authState, setAuthState] = useState<AuthState>({
    status: "idle",
  });

  const simulateLogin = () => {
    setAuthState({
      status: "loading",
      message: "Checking credentials...",
    });
    setTimeout(() => {
      setAuthState({
        status: "authenticating",
        provider: "github",
      });
      setTimeout(() => {
        setAuthState({
          status: "authenticated",
          user: {
            id: "user-123",
            name: "John Doe",
            email: "john@example.com",
            avatar: "https://avatars.githubusercontent.com/u/1234567",
          },
          permissions: {
            canEdit: true,
            canDelete: false,
            canInvite: true,
          },
          session: {
            expiresAt: new Date(Date.now() + 3600000),
            refreshToken: "refresh-token-abc123",
            deviceId: "device-xyz789",
          },
        });
      }, 1000);
    }, 1500);
  };

  const simulateError = () => {
    setAuthState({ status: "loading", message: "Validating..." });
    setTimeout(() => {
      setAuthState({
        status: "error",
        error: "Invalid credentials",
        errorCode: 401,
        retryable: true,
      });
    }, 1500);
  };

  const simulateLocked = () => {
    setAuthState({
      status: "locked",
      reason: "Too many failed attempts",
      unlockAt: new Date(Date.now() + 300000), // 5 minutes
    });
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
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={simulateLogin}
            disabled={
              authState.status === "loading" ||
              authState.status === "authenticating"
            }
          >
            Simulate Login
          </button>
          <button
            onClick={simulateError}
            disabled={
              authState.status === "loading" ||
              authState.status === "authenticating"
            }
          >
            Simulate Error
          </button>
          <button onClick={simulateLocked}>Simulate Locked</button>
          <button onClick={logout}>Reset</button>
        </div>

        <AuthStatus />

        {/* Only render UserProfile when authenticated */}
        {authState.status === "authenticated" && <UserProfile />}

        {/* Only render ErrorDisplay when there's an error */}
        {authState.status === "error" && <ErrorDisplay />}

        {authState.status === "loading" && (
          <div style={{ marginTop: "1rem", textAlign: "center" }}>
            Loading: {authState.message || "Please wait..."}
          </div>
        )}

        {authState.status === "authenticating" && (
          <div style={{ marginTop: "1rem", textAlign: "center" }}>
            Authenticating with {authState.provider}...
          </div>
        )}

        {authState.status === "locked" && (
          <div
            style={{
              marginTop: "1rem",
              padding: "1rem",
              background: "#fff3cd",
              borderRadius: "8px",
            }}
          >
            <h3>🔒 Account Locked</h3>
            <p>
              <strong>Reason:</strong> {authState.reason}
            </p>
            <p>
              <strong>Unlock at:</strong>{" "}
              {authState.unlockAt.toLocaleString()}
            </p>
          </div>
        )}

        {authState.status === "refreshing" && (
          <div style={{ marginTop: "1rem", textAlign: "center" }}>
            Refreshing session for {authState.user.name}...
          </div>
        )}
      </div>
    </AuthContext.Provider>
  );
}

export default App;
