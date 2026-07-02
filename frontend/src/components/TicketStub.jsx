import { useState } from "react";
import Barcode from "./Barcode.jsx";
import { redirectUrlFor } from "../api.js";

function formatTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shortDisplayUrl(shortId) {
  const origin = window.location.origin;
  return `${origin}/${shortId}`;
}

export default function TicketStub({ ticket, onTrack, active, compact = false }) {
  const [copied, setCopied] = useState(false);
  const displayUrl = shortDisplayUrl(ticket.shortId);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(displayUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard blocked — fall back silently, the value is still selectable.
    }
  }

  return (
    <article className={`ticket ${compact ? "ticket--compact" : ""} ${active ? "ticket--active" : ""}`}>
      <div className="ticket__perf ticket__perf--top" aria-hidden="true" />

      <div className="ticket__body">
        <div className="ticket__row ticket__row--top">
          <span className="eyebrow">Ticket</span>
          <span className="ticket__issued">{formatTime(ticket.createdAt)}</span>
        </div>

        <div className="ticket__shortid">{ticket.shortId}</div>

        <div className="ticket__urlline">
          <span className="ticket__urlline-value" title={displayUrl}>
            {displayUrl}
          </span>
          <button type="button" className="ghost-button" onClick={handleCopy}>
            {copied ? "Copied ✓" : "Copy"}
          </button>
        </div>

        <div className="ticket__barcode">
          <Barcode value={ticket.shortId} />
        </div>

        <div className="ticket__origin" title={ticket.redirectURL}>
          <span className="eyebrow">Destination</span>
          {ticket.redirectURL}
        </div>

        <div className="ticket__actions">
          <a
            className="ghost-button"
            href={redirectUrlFor(ticket.shortId)}
            target="_blank"
            rel="noreferrer"
          >
            Open →
          </a>
          <button type="button" className="ghost-button" onClick={() => onTrack(ticket.shortId)}>
            Track visits
          </button>
        </div>
      </div>

      <div className="ticket__perf ticket__perf--bottom" aria-hidden="true" />
    </article>
  );
}
