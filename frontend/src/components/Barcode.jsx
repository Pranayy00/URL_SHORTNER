// Turns a shortId into a deterministic set of bars — same shortId always
// draws the same "barcode", so every ticket has a unique but stable stamp.
export default function Barcode({ value, height = 34 }) {
  const bars = [];
  let x = 0;

  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    const width = (code % 3) + 1.5; // 1.5–3.5
    const gap = ((code * 7) % 4) + 2; // 2–5
    bars.push({ x, width });
    x += width + gap;
  }

  return (
    <svg
      viewBox={`0 0 ${x} ${height}`}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      role="img"
      aria-label={`Barcode for ${value}`}
    >
      {bars.map((bar, i) => (
        <rect
          key={i}
          x={bar.x}
          y={0}
          width={bar.width}
          height={height}
          fill="currentColor"
        />
      ))}
    </svg>
  );
}
