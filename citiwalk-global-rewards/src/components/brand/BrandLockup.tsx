import { Link } from "react-router-dom";
import emblem from "@/assets/brand-emblem.svg";
import { routePaths } from "@/routes/paths";
import { cn } from "@/utils/cn";

type BrandLockupProps = {
  compact?: boolean;
  className?: string;
  linked?: boolean;
};

export function BrandLockup({ compact = false, className, linked = true }: BrandLockupProps) {
  const content = (
    <>
      <img src={emblem} alt="" className="size-10 shrink-0" width={40} height={40} />
      {!compact && (
        <span className="leading-none">
          <span className="block text-sm font-extrabold tracking-[0.06em] text-white">CITIWALK</span>
          <span className="mt-1 block text-[0.53rem] font-bold tracking-[0.24em] text-brand-300">GLOBAL REWARDS</span>
        </span>
      )}
    </>
  );

  const classes = cn("inline-flex items-center gap-3 rounded-xl", className);

  return linked ? (
    <Link to={routePaths.home} className={classes} aria-label="CITIWALK Global Rewards home">
      {content}
    </Link>
  ) : (
    <div className={classes}>{content}</div>
  );
}
