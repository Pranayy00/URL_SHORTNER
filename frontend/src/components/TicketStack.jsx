import TicketStub from "./TicketStub.jsx";

export default function TicketStack({ tickets, onTrack }) {
  if (tickets.length === 0) return null;

  return (
    <section className="stack">
      <span className="eyebrow">Counter Log — this session</span>
      <div className="stack__list">
        {tickets.map((t) => (
          <TicketStub key={t.shortId} ticket={t} onTrack={onTrack} compact />
        ))}
      </div>
    </section>
  );
}
