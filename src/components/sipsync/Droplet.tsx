interface DropletProps {
  size?: number;
  className?: string;
  pulse?: boolean;
}

export function Droplet({ size = 16, className = "", pulse = false }: DropletProps) {
  return (
    <span className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {pulse && (
        <span
          className="absolute inset-0 rounded-full bg-water/25 animate-ping"
          style={{ animationDuration: "2.4s" }}
          aria-hidden
        />
      )}
      <span
        aria-hidden
        className="relative bg-water"
        style={{
          width: size * 0.85,
          height: size * 0.85,
          borderRadius: "50% 50% 50% 0",
          transform: "rotate(-45deg)",
          boxShadow: "0 4px 12px rgba(92, 156, 230, 0.45)",
        }}
      />
    </span>
  );
}
