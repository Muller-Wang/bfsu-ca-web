interface BauhausMarkProps {
  size?: number;
  invertColors?: boolean;
}

export function BauhausMark({ size = 320, invertColors = false }: BauhausMarkProps) {
  const u = size / 4;
  const indigo = invertColors ? "#fff" : "#282270";
  const gold = invertColors ? "rgba(255,255,255,0.6)" : "#F4B81E";
  const red = invertColors ? "rgba(255,255,255,0.4)" : "#C0392B";
  const ink = invertColors ? "rgba(255,255,255,0.8)" : "#1B1A18";

  return (
    <div style={{ position: "relative", width: size, height: size }} aria-hidden>
      <div style={{ position: "absolute", left: 0, top: u, width: u * 2, height: u * 2, background: indigo }} />
      <div style={{ position: "absolute", left: u * 1.5, top: 0, width: u * 2, height: u * 2, borderRadius: 999, background: gold }} />
      <div style={{ position: "absolute", right: 0, bottom: u * 0.5, width: u * 2, height: u * 2, background: red, borderTopLeftRadius: u * 2 }} />
      <div style={{ position: "absolute", left: u * 0.5, bottom: u * 0.25, width: u * 3, height: 2, background: ink }} />
      <div style={{ position: "absolute", right: u * 0.4, top: u * 0.2, width: u * 0.9, height: u * 0.9, borderRadius: 999, border: `2px solid ${ink}` }} />
    </div>
  );
}
