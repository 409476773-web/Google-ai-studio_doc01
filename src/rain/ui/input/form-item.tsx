import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import type { FieldStatus } from "../field/field.styles";
import { rainCn } from "../utils/rain-class-names";

export interface FormItemProps extends HTMLAttributes<HTMLDivElement> {
  label?: ReactNode;
  htmlFor?: string;
  required?: boolean;
  help?: ReactNode;
  message?: ReactNode;
  status?: FieldStatus;
}

export const FormItem = forwardRef<HTMLDivElement, FormItemProps>(
  function FormItem(
    {
      label,
      htmlFor,
      required = false,
      help,
      message,
      status = "default",
      className,
      children,
      ...props
    },
    ref,
  ) {
    return (
      <div
        {...props}
        ref={ref}
        data-rain-id="ui-form-item"
        data-slot="form-item"
        data-status={status}
        className={rainCn(
          "rain-form-item flex min-w-0 flex-col gap-rain-6 font-rain-ui",
          className,
        )}
      >
        {label !== undefined && (
          <label
            htmlFor={htmlFor}
            data-slot="label"
            className="rain-field-label inline-flex items-center gap-rain-4 text-rain-size-13 leading-rain-18 font-rain-semibold text-[var(--rain-category-text-neutral-2)]"
          >
            <span>{label}</span>
            {required && (
              <span
                aria-hidden="true"
                className="text-[var(--rain-category-text-red-1)]"
              >
                *
              </span>
            )}
          </label>
        )}
        {children}
        {help && (
          <p
            data-slot="help"
            className="m-rain-0 text-rain-size-12 leading-rain-18 text-[var(--rain-category-text-neutral-4)]"
          >
            {help}
          </p>
        )}
        {message && (
          <p
            data-slot="message"
            className={rainCn(
              "m-rain-0 text-rain-size-12 leading-rain-18",
              status === "error"
                ? "text-[var(--rain-category-text-red-1)]"
                : status === "warning"
                  ? "text-[var(--rain-category-text-orange-1)]"
                  : "text-[var(--rain-category-text-neutral-3)]",
            )}
          >
            {message}
          </p>
        )}
      </div>
    );
  },
);

FormItem.displayName = "FormItem";
