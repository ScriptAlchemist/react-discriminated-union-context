import { useAuthContext } from "../authContext";

// Component that only renders when there's an error (narrowed type)
export function ErrorDisplay() {
  const { error, errorCode, retryable } = useAuthContext("error");

  return (
    <div
      style={{
        padding: "1rem",
        background: "#f8d7da",
        borderRadius: "8px",
        marginTop: "1rem",
      }}
    >
      <h3>Error Display (narrowed type)</h3>
      <p>
        <strong>Error:</strong> {error}
      </p>
      <p>
        <strong>Error Code:</strong> {errorCode}
      </p>
      <p>
        <strong>Retryable:</strong> {retryable ? "Yes ✅" : "No ❌"}
      </p>
      {retryable && (
        <p style={{ fontSize: "0.8rem", color: "#856404" }}>
          💡 This error can be retried. Please try again.
        </p>
      )}
      <p
        style={{ fontSize: "0.8rem", color: "#666", marginTop: "1rem" }}
      >
        This component uses <code>useAuthContext("error")</code> which
        narrows the type and throws if the status doesn't match.
      </p>
    </div>
  );
}
