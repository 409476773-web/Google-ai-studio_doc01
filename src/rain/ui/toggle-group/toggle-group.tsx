import { forwardRef, type CSSProperties } from "react";
import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import { rainCn } from "../utils/rain-class-names";

export interface ToggleGroupProps
  extends Omit<BaseToggleGroup.Props<string>, "className" | "style"> {
  className?: string;
  style?: CSSProperties;
  spacing?: number;
}

export const ToggleGroup = forwardRef<HTMLDivElement, ToggleGroupProps>(
  function ToggleGroup({ className, spacing, style, ...props }, ref) {
    return (
      <BaseToggleGroup
        {...props}
        ref={ref}
        data-rain-id="ui-toggle-group"
        data-slot="toggle-group"
        data-spacing={spacing}
        style={
          spacing !== undefined && spacing > 0
            ? { gap: spacing, ...style }
            : style
        }
        className={rainCn("rain-toggle-group inline-flex items-center", className)}
      />
    );
  },
);

ToggleGroup.displayName = "ToggleGroup";

export type ToggleGroupItemProps = Omit<BaseToggle.Props<string>, "className"> & {
  className?: string;
};

export const ToggleGroupItem = forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  function ToggleGroupItem({ className, ...props }, ref) {
    return (
      <BaseToggle
        {...props}
        ref={ref}
        data-rain-id="ui-toggle-group-item"
        data-slot="toggle-group-item"
        className={rainCn(
          "rain-toggle-group-item inline-flex items-center justify-center cursor-pointer select-none",
          className,
        )}
      />
    );
  },
);

ToggleGroupItem.displayName = "ToggleGroupItem";
