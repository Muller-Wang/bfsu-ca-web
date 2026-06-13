"use client";

interface PillGroupProps<T extends string> {
  options: { key: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

/** Apple-style segmented control: gray track with a raised white active card. */
export function PillGroup<T extends string>({ options, value, onChange }: PillGroupProps<T>) {
  return (
    <div
      style={{
        display: "inline-flex",
        gap: 2,
        padding: 3,
        background: "var(--paper-sunken)",
        borderRadius: 999,
        border: "1px solid var(--line-faint)",
      }}
    >
      {options.map(({ key, label }) => {
        const active = value === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              padding: "4px 12px",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              background: active ? "var(--surface)" : "transparent",
              color: active ? "var(--ink)" : "var(--ink-mute)",
              fontWeight: active ? 500 : 400,
              boxShadow: active ? "var(--shadow-xs)" : "none",
              transition: "background 120ms var(--ease-out), color 120ms var(--ease-out)",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
