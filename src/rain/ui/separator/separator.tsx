import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { rainCn } from "../utils/rain-class-names";

export interface SeparatorProps extends ComponentPropsWithoutRef<"div"> {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
}

export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(
  function Separator(
    { orientation = "horizontal", decorative = false, className, ...props },
    ref,
  ) {
    return (
      <div
        {...props}
        ref={ref}
        role={decorative ? "none" : "separator"}
        aria-orientation={decorative ? undefined : orientation}
        data-rain-id="ui-separator"
        data-slot="separator"
        data-orientation={orientation}
        className={rainCn(
          "rain-separator shrink-0 bg-[var(--rain-category-border-neutral-3)]",
          orientation === "horizontal" ? "h-[1px] w-full" : "w-[1px] self-stretch",
          className,
        )}
      />
    );
  },
);

Separator.displayName = "Separator";
