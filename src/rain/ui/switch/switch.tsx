import {
  forwardRef,
  useState,
  type ButtonHTMLAttributes,
  type MouseEvent,
} from "react";
import { useDensity } from "@rain-next/foundations";
import { rainCn } from "../utils/rain-class-names";

export type SwitchSize = "small" | "default" | "large";

export interface SwitchProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "children" | "onChange" | "type" | "role"
  > {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  size?: SwitchSize;
  loading?: boolean;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  {
    checked,
    defaultChecked = false,
    onCheckedChange,
    size = "default",
    disabled = false,
    loading = false,
    className,
    onClick,
    ...props
  },
  ref,
) {
  const density = useDensity();
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const controlled = checked !== undefined;
  const isChecked = controlled ? checked : internalChecked;
  const isBlocked = disabled || loading;

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (event.defaultPrevented || isBlocked) return;
    const next = !isChecked;
    if (!controlled) {
      setInternalChecked(next);
    }
    onCheckedChange?.(next);
  }

  return (
    <button
      {...props}
      ref={ref}
      type="button"
      role="switch"
      aria-checked={isChecked}
      aria-busy={loading || undefined}
      disabled={disabled}
      data-rain-id="ui-switch"
      data-slot="root"
      data-size={size}
      data-density={density}
      data-state={isChecked ? "checked" : "unchecked"}
      data-disabled={disabled ? "true" : undefined}
      data-loading={loading ? "true" : undefined}
      onClick={handleClick}
      className={rainCn("rain-switch", className)}
    >
      <span data-slot="track" aria-hidden="true">
        <span data-slot="indicator">
          {loading ? <span data-slot="loading-indicator" /> : null}
        </span>
      </span>
    </button>
  );
});

Switch.displayName = "Switch";
