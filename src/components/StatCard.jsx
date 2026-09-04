const THEMES = {
  blue: { bg: 'bg-blue-50', ring: 'ring-blue-100', icon: 'bg-blue-600', text: 'text-blue-700' },
  emerald: { bg: 'bg-emerald-50', ring: 'ring-emerald-100', icon: 'bg-emerald-600', text: 'text-emerald-700' },
  violet: { bg: 'bg-violet-50', ring: 'ring-violet-100', icon: 'bg-violet-600', text: 'text-violet-700' },
  amber: { bg: 'bg-amber-50', ring: 'ring-amber-100', icon: 'bg-amber-600', text: 'text-amber-700' },
  rose: { bg: 'bg-rose-50', ring: 'ring-rose-100', icon: 'bg-rose-600', text: 'text-rose-700' },
  cyan: { bg: 'bg-cyan-50', ring: 'ring-cyan-100', icon: 'bg-cyan-600', text: 'text-cyan-700' },
};

/**
 * A single stat tile: label, big number, optional sub-line, and an icon in a
 * colored badge. Used at the top of every directory/list page for a
 * consistent, scannable overview instead of jumping straight into a table.
 */
export default function StatCard({ label, value, sub, theme = 'blue', icon: Icon, onClick }) {
  const t = THEMES[theme] || THEMES.blue;
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper
      onClick={onClick}
      className={`text-left rounded-2xl ${t.bg} ring-1 ${t.ring} p-4 sm:p-5 transition ${onClick ? 'hover:shadow-md hover:-translate-y-0.5 duration-150 w-full' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-500 truncate">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold mt-1 text-gray-900">{value ?? '—'}</p>
          {sub && <p className={`text-xs mt-1 font-medium ${t.text} truncate`}>{sub}</p>}
        </div>
        {Icon && (
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${t.icon} flex items-center justify-center shrink-0`}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={2} />
          </div>
        )}
      </div>
    </Wrapper>
  );
}
