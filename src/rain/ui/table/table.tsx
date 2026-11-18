import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ComponentPropsWithoutRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { defineRainLocalRecipe } from "../recipes/local-recipe";
import type { SelectPart } from "../select/select";
import { rainCn } from "../utils/rain-class-names";

export type TableSortDirection = "asc" | "desc" | "none";
export type TableHeaderAlign = "left" | "center" | "right";

export const tableHeaderHeights = {
  single: 40,
  twoLine: 56,
} as const;

export const tableHeaderSelectRecipe = defineRainLocalRecipe<
  SelectPart,
  "ui-select"
>({
  id: "table-header-select",
  scope: "component",
  origin: "ui-select",
  classes: {
    root: "min-w-0",
    frame: "h-[28px] border-transparent bg-transparent px-rain-6",
    value: "text-rain-size-13 font-rain-semibold",
  },
  modifiedParts: ["root", "frame", "value"],
  candidateTokens: [],
  promotionStatus: "promoted",
});

export const TableScrollArea = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function TableScrollArea({ className, ...props }, ref) {
  return (
    <div
      {...props}
      ref={ref}
      data-rain-id="ui-table-scroll-area"
      className={rainCn("rain-table-scroll w-full overflow-auto", className)}
    />
  );
});

export const Table = forwardRef<
  HTMLTableElement,
  ComponentPropsWithoutRef<"table">
>(function Table({ className, ...props }, ref) {
  return (
    <table
      {...props}
      ref={ref}
      data-rain-id="ui-table"
      className={rainCn(
        "rain-table w-full border-collapse text-left font-rain-ui text-rain-size-13",
        className,
      )}
    />
  );
});

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  ComponentPropsWithoutRef<"thead">
>(function TableHeader({ className, ...props }, ref) {
  return (
    <thead
      {...props}
      ref={ref}
      data-slot="header"
      className={rainCn("rain-table-header", className)}
    />
  );
});

export const TableBody = forwardRef<
  HTMLTableSectionElement,
  ComponentPropsWithoutRef<"tbody">
>(function TableBody({ className, ...props }, ref) {
  return (
    <tbody
      {...props}
      ref={ref}
      data-slot="body"
      className={rainCn("rain-table-body", className)}
    />
  );
});

export const TableFooter = forwardRef<
  HTMLTableSectionElement,
  ComponentPropsWithoutRef<"tfoot">
>(function TableFooter({ className, ...props }, ref) {
  return (
    <tfoot
      {...props}
      ref={ref}
      data-slot="footer"
      className={rainCn("rain-table-footer", className)}
    />
  );
});

export const TableRow = forwardRef<
  HTMLTableRowElement,
  ComponentPropsWithoutRef<"tr">
>(function TableRow({ className, ...props }, ref) {
  return (
    <tr
      {...props}
      ref={ref}
      data-slot="row"
      className={rainCn("rain-table-row", className)}
    />
  );
});

export const TableHead = forwardRef<
  HTMLTableCellElement,
  ComponentPropsWithoutRef<"th">
>(function TableHead({ className, ...props }, ref) {
  return (
    <th
      {...props}
      ref={ref}
      data-slot="head"
      className={rainCn("rain-table-head font-rain-semibold", className)}
    />
  );
});

export const TableCell = forwardRef<
  HTMLTableCellElement,
  ComponentPropsWithoutRef<"td">
>(function TableCell({ className, ...props }, ref) {
  return (
    <td
      {...props}
      ref={ref}
      data-slot="cell"
      className={rainCn("rain-table-cell", className)}
    />
  );
});

export const TableCaption = forwardRef<
  HTMLTableCaptionElement,
  ComponentPropsWithoutRef<"caption">
>(function TableCaption({ className, ...props }, ref) {
  return (
    <caption
      {...props}
      ref={ref}
      data-slot="caption"
      className={rainCn(
        "rain-table-caption mt-rain-8 text-rain-size-12 text-[var(--rain-category-text-neutral-4)]",
        className,
      )}
    />
  );
});

export interface TableHeaderContentProps extends HTMLAttributes<HTMLDivElement> {
  align?: TableHeaderAlign;
}

export const TableHeaderContent = forwardRef<
  HTMLDivElement,
  TableHeaderContentProps
>(function TableHeaderContent({ align = "left", className, ...props }, ref) {
  return (
    <div
      {...props}
      ref={ref}
      data-align={align}
      className={rainCn(
        "rain-table-header-content inline-flex items-center gap-rain-6",
        align === "center"
          ? "justify-center"
          : align === "right"
            ? "justify-end"
            : "justify-start",
        className,
      )}
    />
  );
});

export interface TableSortButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  direction?: TableSortDirection;
  children: ReactNode;
}

export const TableSortButton = forwardRef<
  HTMLButtonElement,
  TableSortButtonProps
>(function TableSortButton(
  { direction = "none", className, children, ...props },
  ref,
) {
  return (
    <button
      {...props}
      ref={ref}
      type="button"
      data-direction={direction}
      className={rainCn(
        "rain-table-sort-button inline-flex items-center gap-rain-4 border-0 bg-transparent p-0 font-inherit text-inherit cursor-pointer",
        className,
      )}
    >
      {children}
    </button>
  );
});

export const TableHeaderAction = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement>
>(function TableHeaderAction({ className, ...props }, ref) {
  return (
    <button
      {...props}
      ref={ref}
      type="button"
      className={rainCn(
        "rain-table-header-action inline-flex items-center justify-center rounded-rain-4 border-0 bg-transparent p-rain-2 text-[var(--rain-category-icon-neutral-3)] hover:bg-[var(--rain-category-fill-neutral-alpha-5)] cursor-pointer",
        className,
      )}
    />
  );
});

export const TableHeaderControl = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function TableHeaderControl({ className, ...props }, ref) {
  return (
    <div
      {...props}
      ref={ref}
      className={rainCn(
        "rain-table-header-control inline-flex items-center gap-rain-4",
        className,
      )}
    />
  );
});
