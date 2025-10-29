export default function AdminBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2l3 7 7 .5-5.5 4.6 1.7 7-6.2-3.9-6.2 3.9 1.7-7L2 9.5 9 9l3-7z"/>
      </svg>
      관리자
    </span>
  )
}