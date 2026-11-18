import {
  forwardRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { Checkbox, type CheckboxProps } from "../checkbox/checkbox";
import { Input, type InputProps } from "../input/input";
import { ArrowDownIcon } from "../icons/arrow-down";
import { rainCn } from "../utils/rain-class-names";

export type TableRowCheckboxProps = CheckboxProps extends unknown
  ? Omit<CheckboxProps, "localRecipe">
  : never;

export const TableRowCheckbox = forwardRef<
  HTMLInputElement,
  TableRowCheckboxProps
>(function TableRowCheckbox({ className, ...props }, ref) {
  return (
    <Checkbox
      {...(props as CheckboxProps)}
      ref={ref}
      className={rainCn("rain-table-row-checkbox", className)}
    />
  );
});

export interface TableActionCellProps extends HTMLAttributes<HTMLDivElement> {}
export const TableActionCell = forwardRef<HTMLDivElement, TableActionCellProps>(
  function TableActionCell({ className, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        className={rainCn(
          "rain-table-action-cell inline-flex items-center gap-rain-6",
          className,
        )}
      />
    );
  },
);

export interface TableActionHeaderProps extends HTMLAttributes<HTMLDivElement> {}
export const TableActionHeader = forwardRef<
  HTMLDivElement,
  TableActionHeaderProps
>(function TableActionHeader({ className, ...props }, ref) {
  return (
    <div
      {...props}
      ref={ref}
      className={rainCn(
        "rain-table-action-header inline-flex items-center gap-rain-6",
        className,
      )}
    />
  );
});

export interface TableCellActionButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: "default" | "danger";
}

export const TableCellActionButton = forwardRef<
  HTMLButtonElement,
  TableCellActionButtonProps
>(function TableCellActionButton(
  { tone = "default", className, ...props },
  ref,
) {
  return (
    <button
      {...props}
      ref={ref}
      type="button"
      data-tone={tone}
      className={rainCn(
        "rain-table-cell-action-btn inline-flex items-center gap-rain-4 rounded-rain-4 border-0 bg-transparent px-rain-6 py-rain-2 font-rain-ui text-rain-size-13 cursor-pointer hover:bg-[var(--rain-category-fill-neutral-alpha-5)]",
        tone === "danger"
          ? "text-[var(--rain-category-text-red-1)]"
          : "text-[var(--rain-category-text-brand-1)]",
        className,
      )}
    />
  );
});

export const TableCellActions = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function TableCellActions({ className, ...props }, ref) {
  return (
    <div
      {...props}
      ref={ref}
      className={rainCn(
        "rain-table-cell-actions inline-flex items-center gap-rain-6",
        className,
      )}
    />
  );
});

export interface TableRowActionsProps extends HTMLAttributes<HTMLDivElement> {}
export const TableRowActions = forwardRef<HTMLDivElement, TableRowActionsProps>(
  function TableRowActions({ className, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        className={rainCn(
          "rain-table-row-actions inline-flex items-center gap-rain-6",
          className,
        )}
      />
    );
  },
);

export interface TableDisclosureButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  expanded?: boolean;
}

export const TableDisclosureButton = forwardRef<
  HTMLButtonElement,
  TableDisclosureButtonProps
>(function TableDisclosureButton({ expanded = false, className, ...props }, ref) {
  return (
    <button
      {...props}
      ref={ref}
      type="button"
      aria-expanded={expanded}
      className={rainCn(
        "rain-table-disclosure-btn inline-flex size-[20px] items-center justify-center rounded-rain-4 border-0 bg-transparent p-0 text-[var(--rain-category-icon-neutral-2)] hover:bg-[var(--rain-category-fill-neutral-alpha-5)] cursor-pointer",
        className,
      )}
    >
      <ArrowDownIcon
        size={14}
        className={rainCn(
          "transition-transform duration-150",
          !expanded && "-rotate-90",
        )}
      />
    </button>
  );
});

export const TableReadonlyMark = forwardRef<
  HTMLSpanElement,
  HTMLAttributes<HTMLSpanElement>
>(function TableReadonlyMark({ className, children = "—", ...props }, ref) {
  return (
    <span
      {...props}
      ref={ref}
      className={rainCn(
        "rain-table-readonly-mark text-[var(--rain-category-text-neutral-5)]",
        className,
      )}
    >
      {children}
    </span>
  );
});

export const TableInlineInput = forwardRef<HTMLInputElement, InputProps>(
  function TableInlineInput({ size = 28, ...props }, ref) {
    return <Input {...props} ref={ref} size={size} />;
  },
);

export interface TablePersonValueProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  avatar?: ReactNode;
  secondary?: string;
}

export const TablePersonValue = forwardRef<
  HTMLDivElement,
  TablePersonValueProps
>(function TablePersonValue({ name, avatar, secondary, className, ...props }, ref) {
  return (
    <div
      {...props}
      ref={ref}
      className={rainCn(
        "rain-table-person-value inline-flex min-w-0 items-center gap-rain-8",
        className,
      )}
    >
      {avatar}
      <span className="min-w-0 truncate text-[var(--rain-category-text-neutral-1)]">
        {name}
      </span>
      {secondary && (
        <span className="flex-none text-rain-size-12 text-[var(--rain-category-text-neutral-4)]">
          {secondary}
        </span>
      )}
    </div>
  );
});

export interface TableMediaItem {
  id: string;
  name: string;
  src: string;
}

export const TableImageValue = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & { items: readonly TableMediaItem[] }
>(function TableImageValue({ items, className, ...props }, ref) {
  return (
    <div
      {...props}
      ref={ref}
      className={rainCn("inline-flex items-center gap-rain-4", className)}
    >
      {items.map((item) => (
        <img
          key={item.id}
          src={item.src}
          alt={item.name}
          className="size-[24px] rounded-rain-4 object-cover"
        />
      ))}
    </div>
  );
});

export const TableFileValue = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function TableFileValue({ className, ...props }, ref) {
  return (
    <div
      {...props}
      ref={ref}
      className={rainCn(
        "inline-flex min-w-0 items-center gap-rain-6",
        className,
      )}
    />
  );
});

export const TableFileName = forwardRef<
  HTMLSpanElement,
  HTMLAttributes<HTMLSpanElement>
>(function TableFileName({ className, ...props }, ref) {
  return (
    <span
      {...props}
      ref={ref}
      className={rainCn(
        "min-w-0 truncate text-[var(--rain-category-text-neutral-1)]",
        className,
      )}
    />
  );
});

export const TableDataValue = forwardRef<
  HTMLSpanElement,
  HTMLAttributes<HTMLSpanElement>
>(function TableDataValue({ className, ...props }, ref) {
  return (
    <span
      {...props}
      ref={ref}
      className={rainCn(
        "tabular-nums text-[var(--rain-category-text-neutral-1)]",
        className,
      )}
    />
  );
});
