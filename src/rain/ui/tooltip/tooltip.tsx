import type { ReactElement, ReactNode } from "react";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { rainCn } from "../utils/rain-class-names";

export type TooltipPlacement =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-start"
  | "top-end"
  | "bottom-start"
  | "bottom-end"
  | "left-start"
  | "left-end"
  | "right-start"
  | "right-end";

export interface TooltipProps {
  text: ReactNode;
  placement?: TooltipPlacement;
  portal?: boolean;
  openDelay?: number;
  closeDelay?: number;
  disabled?: boolean;
  className?: string;
  children: ReactElement;
}

function parsePlacement(placement: TooltipPlacement = "top"): {
  side: "top" | "bottom" | "left" | "right";
  align: "start" | "center" | "end";
} {
  const [side, align] = placement.split("-") as [
    "top" | "bottom" | "left" | "right",
    "start" | "end" | undefined,
  ];
  return { side, align: align ?? "center" };
}

export function Tooltip({
  text,
  placement = "top",
  portal = true,
  openDelay = 400,
  closeDelay = 0,
  disabled = false,
  className,
  children,
}: TooltipProps) {
  if (disabled || text === undefined || text === null || text === "") {
    return children;
  }

  const { side, align } = parsePlacement(placement);

  const content = (
    <BaseTooltip.Positioner
      side={side}
      align={align}
      sideOffset={6}
      collisionPadding={8}
      className="rain-tooltip-positioner z-50"
    >
      <BaseTooltip.Popup
        data-rain-id="ui-tooltip"
        data-slot="content"
        className={rainCn(
          "rain-tooltip box-border max-w-[var(--rain-tooltip-max-width,250px)] rounded-rain-6 px-rain-10 py-[var(--rain-tooltip-padding-block,7px)] bg-[var(--rain-tooltip-background,#2F3545)] text-[var(--rain-tooltip-foreground,#fff)] font-rain-ui text-rain-size-12 leading-rain-18 shadow-rain-overlay break-words",
          className,
        )}
      >
        {text}
      </BaseTooltip.Popup>
    </BaseTooltip.Positioner>
  );

  return (
    <BaseTooltip.Root disabled={disabled}>
      <BaseTooltip.Trigger
        delay={openDelay}
        closeDelay={closeDelay}
        render={children}
      />
      {portal ? <BaseTooltip.Portal>{content}</BaseTooltip.Portal> : content}
    </BaseTooltip.Root>
  );
}
