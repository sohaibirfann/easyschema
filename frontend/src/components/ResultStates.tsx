import { BrandMark } from "@/components/BrandMark";

function Spinner() {
  return (
    <div
      className="flex-none w-[38px] h-[38px] rounded-full"
      style={{ border: "2.5px solid rgba(14,143,126,0.15)", borderTopColor: "#0e8f7e", animation: "es-spin 1.1s linear infinite" }}
    />
  );
}

export function EmptyState() {
  return (
    <div className="bg-surface border border-dashed border-[rgba(16,20,19,0.18)] rounded-[11px] px-6 py-[34px] flex flex-col items-center text-center gap-2.5">
      <span className="text-[rgba(16,20,19,0.2)]"><BrandMark size={40} /></span>
      <div className="text-[15px] font-semibold">No schema yet</div>
      <div className="text-[13px] text-ink-soft max-w-[300px] leading-[1.5]">
        Describe a database above — tables, diagram and SQL will appear here.
      </div>
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="bg-surface border border-[rgba(16,20,19,0.1)] rounded-[11px] px-6 py-[22px] flex gap-4 items-center">
      <Spinner />
      <div className="text-[14.5px] font-semibold">Compiling your schema…</div>
    </div>
  );
}

export function WakingState() {
  return (
    <div className="bg-surface border border-accent/30 rounded-[11px] px-6 py-[22px] flex gap-4 items-center">
      <Spinner />
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[14.5px] font-semibold">Waking the server</span>
          <span className="font-mono text-[10px] text-accent bg-accent/[0.09] px-[7px] py-0.5 rounded">FREE TIER</span>
        </div>
        <div className="text-[12.5px] text-ink-soft leading-[1.5]">
          Free hosting sleeps between visits — first request can take up to 30s. Almost there.
        </div>
        <div className="mt-[9px] h-1 rounded-[2px] bg-[rgba(16,20,19,0.07)] overflow-hidden">
          <div className="w-[62%] h-full rounded-[2px] bg-accent" />
        </div>
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="bg-surface border border-error/35 rounded-[11px] px-[22px] py-[18px] flex gap-3 items-start">
      <span className="flex-none w-[22px] h-[22px] rounded-full bg-error/10 text-error text-[13px] font-semibold flex items-center justify-center">!</span>
      <div>
        <div className="text-[14px] font-semibold mb-[3px] text-error">Generation failed</div>
        <div className="text-[12.5px] text-ink-soft leading-[1.5]">{message}</div>
        <button
          onClick={onRetry}
          className="mt-[9px] font-mono text-[11.5px] text-ink border border-[rgba(16,20,19,0.14)] px-[13px] py-[5px] rounded-[7px] hover:bg-[rgba(16,20,19,0.04)] transition-colors cursor-pointer"
        >
          retry
        </button>
      </div>
    </div>
  );
}
