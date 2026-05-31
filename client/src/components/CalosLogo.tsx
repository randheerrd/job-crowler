interface Props { size?: number; className?: string }

export default function CalosLogo({ size = 20, className = '' }: Props) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 60 60" fill="none"
      className={className}
      aria-label="Calos"
    >
      <defs>
        <clipPath id="calos-clip">
          <circle cx="28" cy="30" r="24"/>
        </clipPath>
      </defs>
      <circle cx="28" cy="30" r="26" stroke="currentColor" strokeWidth="3.5"/>
      <circle cx="37" cy="30" r="19" stroke="currentColor" strokeWidth="3.5" clipPath="url(#calos-clip)"/>
      <circle cx="46" cy="30" r="11" stroke="currentColor" strokeWidth="3.5" clipPath="url(#calos-clip)"/>
    </svg>
  );
}
