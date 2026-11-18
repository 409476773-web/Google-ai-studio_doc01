import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { rainCn } from "../utils/rain-class-names";

export interface SpinnerProps extends ComponentPropsWithoutRef<"span"> {
  size?: number;
  label?: string;
}

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size = 16, label = "加载中", className, style, ...props },
  ref,
) {
  return (
    <span
      {...props}
      ref={ref}
      role="status"
      aria-label={label}
      data-rain-id="ui-spinner"
      data-slot="spinner"
      style={{ width: size, height: size, ...style }}
      className={rainCn(
        "rain-spinner inline-block shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent",
        className,
      )}
    />
  );
});

Spinner.displayName = "Spinner";

export interface SkeletonProps extends ComponentPropsWithoutRef<"div"> {
  animated?: boolean;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  function Skeleton({ animated = true, className, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        aria-hidden="true"
        data-rain-id="ui-skeleton"
        data-slot="skeleton"
        className={rainCn(
          "rain-skeleton rounded-rain-6 bg-[var(--rain-category-fill-neutral-alpha-5)]",
          animated && "animate-pulse",
          className,
        )}
      />
    );
  },
);

Skeleton.displayName = "Skeleton";
