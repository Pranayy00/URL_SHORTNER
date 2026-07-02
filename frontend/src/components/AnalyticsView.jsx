import { useEffect, useState } from "react";
import { getAnalytics, ApiError } from "../api.js";

function formatTimestamp(ts) {
  const d = new Date(Number(ts));
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function AnalyticsView({ shortId, onClose }) {
  const [state, setState] = useState({ status: "loading", data: null, error: "" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading", data: null, error: "" });

    getAnalytics(shortId)
      .then((data) => {
        if (!cancelled) setState({ status: "ready", data, error: "" });
      })
      .catch((err) => {
        if (!cancelled) {
          setState({
            status: "error",
            data: null,
            error: err instanceof ApiError ? err.message : "Something jammed the printer.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [shortId]);

  return (
    <div className="receipt-overlay" role="dialog" aria-label={`Visit log for ${shortId}`}>
      <div className="receipt">
        <div className="ticket__perf ticket__perf--top" aria-hidden="true" />
        <div className="receipt__head">
          <span className="eyebrow">Visit Log</span>
          <h2 className="receipt__title">{shortId}</h2>
          <button type="button" className="ghost-button" onClick={onClose}>
            Close
          </button>
        </div>

        {state.status === "loading" && <p className="receipt__status">Tallying clicks…</p>}

        {state.status === "error" && (
          <p className="receipt__status receipt__status--error">{state.error}</p>
        )}

        {state.status === "ready" && (
          <>
            <div className="receipt__total">
              <span className="receipt__total-number">{state.data.totalClicks}</span>
              <span className="eyebrow">Total clicks</span>
            </div>

            {state.data.analytics.length === 0 ? (
              <p className="receipt__status">
                No visits yet — send the link out and check back. The counter starts at zero
                until someone opens it.
              </p>
            ) : (
              <ol className="receipt__list">
                {state.data.analytics
                  .slice()
                  .reverse()
                  .map((entry, i) => (
                    <li key={i} className="receipt__line">
                      <span className="receipt__line-index">
                        {String(state.data.analytics.length - i).padStart(3, "0")}
                      </span>
                      <span className="receipt__line-time">{formatTimestamp(entry.timestamp)}</span>
                    </li>
                  ))}
              </ol>
            )}
          </>
        )}

        <div className="ticket__perf ticket__perf--bottom" aria-hidden="true" />
      </div>
    </div>
  );
}
