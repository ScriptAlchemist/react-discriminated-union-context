import { useAuthContext } from "../authContext";

// Component that only renders when there's an error (narrowed type)
export function ErrorDisplay() {
  const { error } = useAuthContext("error");

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
    </div>
  );
}
