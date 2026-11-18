import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Select as BaseSelect } from "@base-ui/react/select";
import {
  selectSizeClassNames,
  useDensity,
  type SelectSize,
} from "@rain-next/foundations";
import { popupSurfaceClassName } from "../_internal/popup";
import {
  fieldFrameRecipe,
  type FieldAppearance,
  type FieldStatus,
} from "../field/field.styles";
import { ArrowDownIcon } from "../icons/arrow-down";
import { CheckBoldIcon } from "../icons/check-bold";
import { CloseIcon } from "../icons/close";
import { getRainLocalRecipePart, type RainLocalRecipe } from "../recipes/local-recipe";
import { rainCn } from "../utils/rain-class-names";

export type { SelectSize };
export type SelectAppearance = FieldAppearance;
export type SelectStatus = FieldStatus;
export type SelectValue = string | null;
export type SelectPart =
  | "root"
  | "frame"
  | "value"
  | "indicator"
  | "clear"
  | "popup"
  | "option";

export interface SelectOption {
  value: string;
  label: ReactNode;
  description?: string;
  disabled?: boolean;
}

export type SelectChangeDetails = BaseSelect.Root.ChangeEventDetails;

export interface SelectHandle {
  focus: () => void;
}

export interface SelectProps {
  options: readonly SelectOption[];
  value?: SelectValue;
  defaultValue?: SelectValue;
  onValueChange?: (value: SelectValue, details: SelectChangeDetails) => void;
  placeholder?: string;
  size?: SelectSize;
  appearance?: SelectAppearance;
  status?: SelectStatus;
  clearable?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  name?: string;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  className?: string;
  localRecipe?: RainLocalRecipe<SelectPart, "ui-select">;
}

export const Select = forwardRef<SelectHandle, SelectProps>(function Select(
  {
    options,
    value,
    defaultValue = null,
    onValueChange,
    placeholder = "请选择",
    size = 32,
    appearance = "outlined",
    status = "default",
    clearable = false,
    disabled = false,
    readOnly = false,
    name,
    id,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    className,
    localRecipe,
  },
  forwardedRef,
) {
  const density = useDensity();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [internalValue, setInternalValue] = useState<SelectValue>(defaultValue);
  const [open, setOpen] = useState(false);

  const controlled = value !== undefined;
  const currentValue = controlled ? value : internalValue;
  const selectedOption = options.find((opt) => opt.value === currentValue);
  const fieldState = disabled ? "disabled" : readOnly ? "readonly" : "editable";

  useImperativeHandle(forwardedRef, () => ({
    focus: () => triggerRef.current?.focus(),
  }));

  function handleChange(
    nextValue: string | null,
    details: BaseSelect.Root.ChangeEventDetails,
  ) {
    const normalized = nextValue ?? null;
    if (!controlled) {
      setInternalValue(normalized);
    }
    onValueChange?.(normalized, details);
  }

  return (
    <div
      data-rain-id="ui-select"
      data-slot="root"
      data-size={size}
      data-appearance={appearance}
      data-status={status}
      data-state={open ? "open" : "closed"}
      data-density={density}
      data-local-recipe={localRecipe?.id}
      className={rainCn(
        "rain-select relative inline-flex w-full min-w-0 items-center",
        className,
        getRainLocalRecipePart(localRecipe, "root"),
      )}
    >
      <BaseSelect.Root<string, false>
        value={currentValue}
        onValueChange={handleChange}
        open={open}
        onOpenChange={setOpen}
        disabled={disabled}
        readOnly={readOnly}
        name={name}
        id={id}
        modal={false}
      >
        <BaseSelect.Trigger
          ref={triggerRef}
          data-slot="frame"
          data-appearance={appearance}
          data-status={status}
          data-open={open ? "true" : undefined}
          data-permission={disabled || readOnly ? "readonly" : "editable"}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          className={rainCn(
            fieldFrameRecipe({
              size,
              appearance,
              status,
              state: fieldState,
            }),
            selectSizeClassNames[size],
            "w-full justify-between text-left cursor-pointer",
            disabled && "cursor-not-allowed",
            getRainLocalRecipePart(localRecipe, "frame"),
          )}
        >
          <span
            data-slot="value"
            className={rainCn(
              "rain-select__value min-w-0 flex-1 truncate text-left",
              !selectedOption && "text-[var(--rain-category-text-neutral-5)]",
              getRainLocalRecipePart(localRecipe, "value"),
            )}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>

          <span className="inline-flex flex-none items-center gap-rain-2">
            {clearable && currentValue !== null && !disabled && !readOnly && (
              <span
                role="button"
                tabIndex={-1}
                data-slot="clear-action"
                aria-label="清空选项"
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  if (!controlled) {
                    setInternalValue(null);
                  }
                  onValueChange?.(null, {
                    reason: "none",
                    event: event.nativeEvent,
                    cancel: () => {},
                    allowPropagation: () => {},
                    isCanceled: false,
                    isPropagationAllowed: false,
                    trigger: undefined,
                  } as SelectChangeDetails);
                }}
                className={rainCn(
                  "inline-flex size-[18px] items-center justify-center rounded-rain-4 text-[var(--rain-category-icon-neutral-3)] hover:bg-[var(--rain-category-fill-neutral-alpha-5)] hover:text-[var(--rain-category-icon-neutral-1)]",
                  getRainLocalRecipePart(localRecipe, "clear"),
                )}
              >
                <CloseIcon size={12} />
              </span>
            )}
            <BaseSelect.Icon
              data-slot="indicator"
              className={rainCn(
                "inline-flex flex-none items-center text-[var(--rain-category-icon-neutral-3)] transition-transform duration-150",
                open && "rotate-180",
                getRainLocalRecipePart(localRecipe, "indicator"),
              )}
            >
              <ArrowDownIcon size={14} />
            </BaseSelect.Icon>
          </span>
        </BaseSelect.Trigger>

        <BaseSelect.Portal>
          <BaseSelect.Positioner
            sideOffset={6}
            alignItemWithTrigger={false}
            collisionPadding={8}
            data-rain-theme="light"
            data-density={density}
            className="rain-popup-positioner rain-select__positioner z-50"
          >
            <BaseSelect.Popup
              data-rain-id="ui-select"
              data-slot="popup"
              data-local-recipe={localRecipe?.id}
              className={rainCn(
                popupSurfaceClassName,
                "rain-select__popup rain-menu max-h-[280px] overflow-y-auto p-rain-6",
                getRainLocalRecipePart(localRecipe, "popup"),
              )}
            >
              <BaseSelect.List className="flex flex-col gap-[2px] outline-none">
                {options.map((option) => (
                  <BaseSelect.Item
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    data-slot="option"
                    className={rainCn(
                      "rain-menu-item flex min-h-[32px] w-full items-center justify-between gap-rain-8 rounded-rain-6 px-rain-10 py-rain-6 font-rain-ui text-rain-size-13 leading-rain-18 text-[var(--rain-category-text-neutral-1)] outline-none select-none cursor-pointer data-[highlighted]:bg-[var(--rain-category-fill-neutral-alpha-6)] data-[selected]:bg-[var(--rain-category-fill-brand-alpha-4)] data-[selected]:font-rain-semibold data-[selected]:text-[var(--rain-category-text-brand-1)] data-[disabled]:cursor-not-allowed data-[disabled]:text-[var(--rain-category-text-neutral-6)]",
                      getRainLocalRecipePart(localRecipe, "option"),
                    )}
                  >
                    <BaseSelect.ItemText className="min-w-0 flex-1 truncate">
                      {option.label}
                    </BaseSelect.ItemText>
                    <BaseSelect.ItemIndicator className="inline-flex flex-none items-center text-[var(--rain-category-icon-brand-1)]">
                      <CheckBoldIcon size={12} />
                    </BaseSelect.ItemIndicator>
                  </BaseSelect.Item>
                ))}
              </BaseSelect.List>
            </BaseSelect.Popup>
          </BaseSelect.Positioner>
        </BaseSelect.Portal>
      </BaseSelect.Root>
    </div>
  );
});

Select.displayName = "Select";
