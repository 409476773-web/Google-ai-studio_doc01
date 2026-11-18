import {
  forwardRef,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { inputSizeClassNames, type InputSize } from "@rain-next/foundations";
import { fieldFrameRecipe, type FieldAppearance, type FieldStatus } from "../field/field.styles";
import { CloseIcon } from "../icons/close";
import { getRainLocalRecipePart, type RainLocalRecipe } from "../recipes/local-recipe";
import { rainCn } from "../utils/rain-class-names";

export type { InputSize };
export type InputAppearance = FieldAppearance;
export type InputStatus = FieldStatus;
export type InputCountMode = "none" | "always" | "focus";
export type InputType =
  | "text"
  | "search"
  | "password"
  | "email"
  | "url"
  | "tel"
  | "number";
export type InputPart = "root" | "frame" | "control" | "clear" | "count";

export interface InputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "size" | "type" | "value" | "defaultValue"
  > {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  size?: InputSize;
  appearance?: InputAppearance;
  status?: InputStatus;
  type?: InputType;
  clearable?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  prefix?: string;
  suffix?: string;
  countMode?: InputCountMode;
  localRecipe?: RainLocalRecipe<InputPart, "ui-input">;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    value,
    defaultValue = "",
    onValueChange,
    onChange,
    size = 32,
    appearance = "outlined",
    status = "default",
    type = "text",
    clearable = false,
    leadingIcon,
    trailingIcon,
    prefix,
    suffix,
    countMode = "none",
    disabled = false,
    readOnly = false,
    maxLength,
    className,
    localRecipe,
    id,
    ...nativeProps
  },
  forwardedRef,
) {
  const generatedId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const controlled = value !== undefined;
  const currentValue = controlled ? value : internalValue;
  const fieldState = disabled ? "disabled" : readOnly ? "readonly" : "editable";
  const showClear =
    clearable && !disabled && !readOnly && currentValue.length > 0;

  useImperativeHandle(forwardedRef, () => inputRef.current!, []);

  function updateValue(nextValue: string) {
    if (!controlled) {
      setInternalValue(nextValue);
    }
    onValueChange?.(nextValue);
  }

  return (
    <div
      data-rain-id="ui-input"
      data-slot="root"
      data-size={size}
      data-appearance={appearance}
      data-status={status}
      data-state={fieldState}
      data-local-recipe={localRecipe?.id}
      className={rainCn(
        "rain-input inline-flex w-full min-w-0 items-center",
        className,
        getRainLocalRecipePart(localRecipe, "root"),
      )}
    >
      <div
        data-slot="frame"
        data-appearance={appearance}
        data-status={status}
        data-permission={disabled || readOnly ? "readonly" : "editable"}
        className={rainCn(
          "rain-input-frame w-full",
          fieldFrameRecipe({
            size,
            appearance,
            status,
            state: fieldState,
          }),
          inputSizeClassNames[size],
          getRainLocalRecipePart(localRecipe, "frame"),
        )}
      >
        {leadingIcon && (
          <span
            data-slot="leading-icon"
            aria-hidden="true"
            className="inline-flex flex-none items-center text-[var(--rain-category-icon-neutral-3)]"
          >
            {leadingIcon}
          </span>
        )}
        {prefix && (
          <span
            data-slot="prefix"
            className="flex-none text-[var(--rain-category-text-neutral-3)]"
          >
            {prefix}
          </span>
        )}
        <input
          {...nativeProps}
          ref={inputRef}
          id={id ?? generatedId}
          type={type}
          value={currentValue}
          disabled={disabled}
          readOnly={readOnly}
          maxLength={maxLength}
          data-slot="control"
          onChange={(event) => {
            onChange?.(event);
            if (!event.defaultPrevented) {
              updateValue(event.currentTarget.value);
            }
          }}
          className={rainCn(
            "rain-input__control min-w-0 flex-1 border-0 bg-transparent p-0 text-inherit outline-none placeholder:text-[var(--rain-category-text-neutral-5)]",
            disabled && "cursor-not-allowed",
            getRainLocalRecipePart(localRecipe, "control"),
          )}
        />
        {showClear && (
          <button
            type="button"
            data-slot="clear-action"
            aria-label="清空输入"
            tabIndex={-1}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              updateValue("");
              inputRef.current?.focus();
            }}
            className={rainCn(
              "rain-input__clear inline-flex size-[20px] flex-none items-center justify-center rounded-rain-4 border-0 bg-transparent p-0 text-[var(--rain-category-icon-neutral-3)] hover:bg-[var(--rain-category-fill-neutral-alpha-5)] hover:text-[var(--rain-category-icon-neutral-1)] cursor-pointer",
              getRainLocalRecipePart(localRecipe, "clear"),
            )}
          >
            <CloseIcon size={12} />
          </button>
        )}
        {countMode !== "none" && maxLength !== undefined && (
          <span
            data-slot="count"
            className={rainCn(
              "flex-none text-rain-size-12 text-[var(--rain-category-text-neutral-4)] tabular-nums",
              currentValue.length > maxLength &&
                "font-rain-semibold text-[var(--rain-category-text-red-1)]",
              getRainLocalRecipePart(localRecipe, "count"),
            )}
          >
            {currentValue.length}/{maxLength}
          </span>
        )}
        {suffix && (
          <span
            data-slot="suffix"
            className="flex-none text-[var(--rain-category-text-neutral-3)]"
          >
            {suffix}
          </span>
        )}
        {trailingIcon && (
          <span
            data-slot="trailing-icon"
            aria-hidden="true"
            className="inline-flex flex-none items-center text-[var(--rain-category-icon-neutral-3)]"
          >
            {trailingIcon}
          </span>
        )}
      </div>
    </div>
  );
});

Input.displayName = "Input";
