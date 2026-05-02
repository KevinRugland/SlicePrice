export default function Logo({ size = 32 }) {
  return (
    <div className="flex items-center gap-2.5">
      {/* Logomark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Dark background */}
        <rect width="40" height="40" rx="12" fill="#0F172A" />

        {/* Stacked layer rects (3D slice effect) */}
        <rect x="8" y="26" width="24" height="4" rx="1.5" fill="#F97316" opacity="0.45" />
        <rect x="8" y="20" width="24" height="4" rx="1.5" fill="#F97316" opacity="0.72" />
        <rect x="8" y="14" width="24" height="4" rx="1.5" fill="#F97316" />

        {/* Small arrow pointing right */}
        <path
          d="M27 16.5 L30.5 18 L27 19.5"
          stroke="#F8FAFC"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Wordmark */}
      <span className="text-xl font-bold tracking-tight text-ink select-none">
        SlicePrice
      </span>
    </div>
  )
}
