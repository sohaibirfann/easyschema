interface WakingUpNoticeProps {
  active?: boolean;
}

export function WakingUpNotice({ active }: WakingUpNoticeProps) {
  if (active) {
    return (
      <div className="border border-amber-200 bg-amber-50 text-amber-700 rounded-lg p-4 text-xs font-sans flex items-start gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <div className="flex flex-col gap-1">
          <span className="font-semibold uppercase tracking-wider">Waking Up</span>
          <span>Free hosting takes up to 30s to wake on the first request. Almost there.</span>
        </div>
      </div>
    );
  }

  return (
    <p className="flex items-center gap-1.5 text-[11px] text-neutral-400">
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z"/></svg>
      Hosted free — first request may take a few extra seconds to wake the server.
    </p>
  );
}
