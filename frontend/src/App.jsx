import { useState } from "react";
import TicketInput from "./components/TicketInput.jsx";
import TicketStub from "./components/TicketStub.jsx";
import TicketStack from "./components/TicketStack.jsx";
import AnalyticsView from "./components/AnalyticsView.jsx";
import { createShortLink, ApiError } from "./api.js";

export default function App() {
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [trackingId, setTrackingId] = useState(null);

  async function handleIssue(url) {
    setBusy(true);
    setError("");
    try {
      const ticket = await createShortLink(url);
      setLatest(ticket);
      setHistory((prev) => [ticket, ...prev.filter((t) => t.shortId !== ticket.shortId)].slice(0, 8));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something jammed the printer.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <header className="masthead">
        <span className="eyebrow">Shortline</span>
        <h1 className="masthead__title">Ticket Counter for Links</h1>
        <p className="masthead__sub">
          Paste a long link, get a printed ticket for the short one, and track every visit
          that comes through the window.
        </p>
      </header>

      <main>
        <TicketInput onIssue={handleIssue} busy={busy} />

        {error && (
          <div className="void-stamp">
            <span className="void-stamp__label">Rejected</span>
            <p>{error}</p>
          </div>
        )}

        {latest && (
          <div className="ticket-wrap">
            <TicketStub ticket={latest} onTrack={setTrackingId} active />
          </div>
        )}

        <TicketStack
          tickets={history.filter((t) => t.shortId !== latest?.shortId)}
          onTrack={setTrackingId}
        />
      </main>

      <footer className="footer">
        <span className="eyebrow">Backend</span>
        Node.js · Express · MongoDB — issues real short links via <code>nanoid</code>
      </footer>

      {trackingId && <AnalyticsView shortId={trackingId} onClose={() => setTrackingId(null)} />}
    </div>
  );
}
