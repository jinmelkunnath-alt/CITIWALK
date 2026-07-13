import emblem from "@/assets/brand-emblem.svg";

export function PageLoader({ label = "Loading secure experience" }: { label?: string }) {
  return (
    <div className="grid min-h-[55vh] place-items-center" role="status" aria-label={label}>
      <div className="text-center">
        <div className="relative mx-auto size-20">
          <span className="absolute inset-[-8px] animate-spin rounded-[1.7rem] bg-[conic-gradient(from_0deg,transparent,#a779ff,#f98607,transparent)] opacity-70 blur-[1px] motion-reduce:animate-none" />
          <img src={emblem} alt="" width={80} height={80} className="relative size-20 rounded-[1.4rem]" />
        </div>
        <p className="mt-5 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-brand-200">CITIWALK</p>
        <div className="mx-auto mt-3 h-1 w-32 overflow-hidden rounded-full bg-white/[0.07]">
          <div className="h-full w-1/2 animate-[shimmer_1.3s_ease-in-out_infinite] rounded-full bg-brand-gradient bg-[length:200%_100%] motion-reduce:animate-none" />
        </div>
        <span className="sr-only">{label}</span>
      </div>
    </div>
  );
}
