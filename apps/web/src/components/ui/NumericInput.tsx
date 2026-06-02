"use client";
import * as React from "react";

interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export const NumericInput: React.FC<Props> = ({
  value,
  onChange,
  min,
  max,
  onBlur,
  ...props
}) => {
  const [raw, setRaw] = React.useState(String(value));

  React.useEffect(() => {
    setRaw(String(value));
  }, [value]);

  const commit = (str: string) => {
    const parsed = parseFloat(str);
    if (Number.isNaN(parsed)) {
      setRaw(String(value));
      return;
    }
    const clamped =
      min !== undefined && max !== undefined
        ? Math.min(max, Math.max(min, parsed))
        : min !== undefined
          ? Math.max(min, parsed)
          : max !== undefined
            ? Math.min(max, parsed)
            : parsed;
    setRaw(String(clamped));
    onChange(clamped);
  };

  return (
    <input
      {...props}
      type="text"
      inputMode="decimal"
      value={raw}
      onChange={(e) => setRaw(e.target.value)}
      onBlur={(e) => {
        commit(raw);
        onBlur?.(e);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit(raw);
      }}
    />
  );
};
