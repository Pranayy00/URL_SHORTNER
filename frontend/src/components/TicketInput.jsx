import { useState } from "react";

export default function TicketInput({ onIssue, busy }) {
  const [value, setValue] = useState("");
  const [localError, setLocalError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setLocalError("Paste a link first — the slot's empty.");
      return;
    }
    setLocalError("");
    onIssue(trimmed);
  }

  return (
    <form className="counter" onSubmit={handleSubmit}>
      <label className="counter__label" htmlFor="url-slot">
        <span className="eyebrow">Window 1 — Drop-off</span>
        Paste the long one
      </label>
      <div className="counter__row">
        <input
          id="url-slot"
          className="counter__input"
          type="text"
          inputMode="url"
          autoComplete="off"
          spellCheck="false"
          placeholder="https://example.com/a/very/long/path?with=params"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (localError) setLocalError("");
          }}
          disabled={busy}
        />
        <button className="stamp-button" type="submit" disabled={busy}>
          {busy ? "Printing…" : "Issue Ticket"}
        </button>
      </div>
      {localError && <p className="counter__hint counter__hint--error">{localError}</p>}
    </form>
  );
}
