import { forwardRef } from "react";
import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { cva, type VariantProps } from "class-variance-authority";
import { rainCn } from "../utils/rain-class-names";

export const toggleVariants = cva(
  "rain-toggle inline-flex items-center justify-center rounded-rain-6 font-rain-ui text-rain-size-13 font-rain-medium transition-colors select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-transparent text-[var(--rain-category-text-neutral-2)] hover:bg-[var(--rain-category-fill-neutral-alpha-5)] data-[pressed]:bg-[var(--rain-category-fill-brand-alpha-4)] data-[pressed]:text-[var(--rain-category-text-brand-1)]",
        outline:
          "border border-[var(--rain-category-border-neutral-3)] bg-transparent text-[var(--rain-category-text-neutral-2)] hover:bg-[var(--rain-category-fill-neutral-alpha-5)] data-[pressed]:border-[var(--rain-category-border-brand-1)] data-[pressed]:bg-[var(--rain-category-fill-brand-alpha-4)] data-[pressed]:text-[var(--rain-category-text-brand-1)]",
      },
      size: {
        sm: "h-[24px] px-rain-8",
        default: "h-[28px] px-rain-12",
        lg: "h-[32px] px-rain-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ToggleProps = Omit<BaseToggle.Props<string>, "className"> &
  VariantProps<typeof toggleVariants> & {
    className?: string;
  };

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  { className, variant, size, ...props },
  ref,
) {
  return (
    <BaseToggle
      {...props}
      ref={ref}
      data-rain-id="ui-toggle"
      data-slot="toggle"
      className={rainCn(toggleVariants({ variant, size }), className)}
    />
  );
});

Toggle.displayName = "Toggle";
