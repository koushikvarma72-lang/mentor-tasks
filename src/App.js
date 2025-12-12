import React from "react";

export default function App() {
  const [symbol, setSymbol] = React.useState("");
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState("");

  const API_KEY = "D7QQ4UWF9VRI4Y79";

  // Load last stored quote from localStorage when app mounts
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("lastStockQuote");
      if (saved) {
        const parsed = JSON.parse(saved);
        setData(parsed);
        setSymbol(parsed["01. symbol"] || "");
      }
    } catch (e) {
      console.error("Error reading from localStorage", e);
    }
  }, []);

  async function fetchStock() {
    if (!symbol.trim()) return;
    
    const trimmed = symbol.trim().toUpperCase();
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${trimmed}&apikey=${API_KEY}`;

    try {
      setError("");
      setData(null);

      const response = await fetch(url);
      const json = await response.json();

      const quote = json["Global Quote"];

      if (!quote || Object.keys(quote).length === 0) {
        setError("No data found. Try another symbol.");
        return;
      }

      // Normalize symbol in state
      quote["01. symbol"] = trimmed;

      setData(quote);

      // Save quote in localStorage
      localStorage.setItem("lastStockQuote", JSON.stringify(quote));
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data");
    }
  }

  const isPositive =
    data && Number.parseFloat(data["09. change"] || "0") >= 0;

  return (
    <div style={styles.app}>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>Stock Dashboard</h1>
          <p style={styles.subtitle}>Live quote viewer (Alpha Vantage)</p>
        </header>

        <div style={styles.searchWrapper}>
          <input
            type="text"
            placeholder="Enter symbol (e.g. AAPL, MSFT, TSLA)"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            style={styles.input}
          />
          <button onClick={fetchStock} style={styles.button}>
            Get Quote
          </button>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.cardWrapper}>
          {!data && (
            <div style={styles.placeholder}>
              <p style={styles.placeholderText}>
                No data yet. Search for a stock symbol.
              </p>
              <p style={styles.helperText}>
                Last quote will be remembered even after refresh.
              </p>
            </div>
          )}

          {data && (
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <div style={styles.badge}>Live Quote</div>
                  <h2 style={styles.symbol}>{data["01. symbol"]}</h2>
                  <p style={styles.company}>
                    {/* Alpha Vantage free GLOBAL_QUOTE doesn’t return company name.
                        You could replace this with a separate lookup if needed. */}
                    {`Symbol: ${data["01. symbol"]}`}
                  </p>
                </div>
                <div style={styles.priceBlock}>
                  <p style={styles.price}>
                    ${Number.parseFloat(data["05. price"] || 0).toFixed(2)}
                  </p>
                  <p
                    style={{
                      ...styles.change,
                      color: isPositive ? "#22c55e" : "#f97373",
                    }}
                  >
                    {isPositive ? "▲ " : "▼ "}
                    {Number.parseFloat(data["09. change"] || 0).toFixed(2)} (
                    {data["10. change percent"] || "0.00%"})
                  </p>
                </div>
              </div>

              <div style={styles.cardFooter}>
                <div style={styles.metric}>
                  <span style={styles.metricLabel}>Open</span>
                  <span style={styles.metricValue}>
                    ${Number.parseFloat(data["02. open"] || 0).toFixed(2)}
                  </span>
                </div>
                <div style={styles.metric}>
                  <span style={styles.metricLabel}>High</span>
                  <span style={styles.metricValue}>
                    ${Number.parseFloat(data["03. high"] || 0).toFixed(2)}
                  </span>
                </div>
                <div style={styles.metric}>
                  <span style={styles.metricLabel}>Low</span>
                  <span style={styles.metricValue}>
                    ${Number.parseFloat(data["04. low"] || 0).toFixed(2)}
                  </span>
                </div>
                <div style={styles.metric}>
                  <span style={styles.metricLabel}>Volume</span>
                  <span style={styles.metricValue}>
                    {Number.parseInt(data["06. volume"] || 0, 10).toLocaleString()}
                  </span>
                </div>
              </div>

              <p style={styles.rememberNote}>
                This quote is saved in your browser (localStorage).
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  app: {
    minHeight: "100vh",
    margin: 0,
    padding: "2rem 1rem",
    background:
      "radial-gradient(circle at top left, #1e293b 0, #020617 45%, #000 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    fontFamily:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#e5e7eb",
  },
  container: {
    width: "100%",
    maxWidth: "640px",
  },
  header: {
    marginBottom: "1.5rem",
  },
  title: {
    margin: 0,
    fontSize: "2rem",
    letterSpacing: "0.05em",
  },
  subtitle: {
    margin: "0.25rem 0 0",
    color: "#9ca3af",
    fontSize: "0.95rem",
  },
  searchWrapper: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "1rem",
  },
  input: {
    flex: 1,
    padding: "0.6rem 0.75rem",
    borderRadius: "999px",
    border: "1px solid #4b5563",
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    color: "#e5e7eb",
    outline: "none",
    fontSize: "0.95rem",
  },
  button: {
    padding: "0.6rem 1.2rem",
    borderRadius: "999px",
    border: "none",
    background:
      "linear-gradient(135deg, #4f46e5 0%, #3b82f6 50%, #22c55e 100%)",
    color: "white",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "0.95rem",
    boxShadow: "0 8px 20px rgba(37, 99, 235, 0.45)",
    transition: "transform 0.1s ease, box-shadow 0.1s ease",
  },
  error: {
    color: "#f97316",
    fontSize: "0.9rem",
    marginBottom: "0.75rem",
  },
  cardWrapper: {
    marginTop: "0.5rem",
  },
  placeholder: {
    padding: "1.25rem 1.5rem",
    borderRadius: "16px",
    border: "1px dashed rgba(148, 163, 184, 0.6)",
    background:
      "linear-gradient(135deg, rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.9))",
  },
  placeholderText: {
    margin: 0,
    fontSize: "0.95rem",
    color: "#cbd5f5",
  },
  helperText: {
    marginTop: "0.35rem",
    fontSize: "0.8rem",
    color: "#9ca3af",
  },
  card: {
    padding: "1.5rem 1.7rem",
    borderRadius: "18px",
    background:
      "linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(30, 64, 175, 0.75))",
    boxShadow:
      "0 20px 40px rgba(15, 23, 42, 0.8), 0 0 0 1px rgba(148, 163, 184, 0.15)",
    backdropFilter: "blur(12px)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem",
    alignItems: "flex-start",
    marginBottom: "1rem",
  },
  badge: {
    display: "inline-block",
    fontSize: "0.75rem",
    padding: "0.1rem 0.5rem",
    borderRadius: "999px",
    background: "rgba(34, 197, 94, 0.2)",
    color: "#bbf7d0",
    border: "1px solid rgba(34, 197, 94, 0.4)",
    marginBottom: "0.5rem",
  },
  symbol: {
    margin: 0,
    fontSize: "1.8rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  company: {
    margin: "0.2rem 0 0",
    fontSize: "0.9rem",
    color: "#cbd5f5",
  },
  priceBlock: {
    textAlign: "right",
  },
  price: {
    margin: 0,
    fontSize: "1.9rem",
    fontWeight: 700,
  },
  change: {
    marginTop: "0.2rem",
    fontSize: "0.95rem",
    fontWeight: 500,
  },
  cardFooter: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "0.75rem",
    marginTop: "1.2rem",
  },
  metric: {
    padding: "0.5rem 0.6rem",
    borderRadius: "10px",
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    border: "1px solid rgba(148, 163, 184, 0.3)",
  },
  metricLabel: {
    display: "block",
    fontSize: "0.7rem",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#9ca3af",
    marginBottom: "0.15rem",
  },
  metricValue: {
    fontSize: "0.95rem",
    fontWeight: 600,
  },
  rememberNote: {
    marginTop: "1rem",
    fontSize: "0.8rem",
    color: "#9ca3af",
  },
};
