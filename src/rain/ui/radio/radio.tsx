import {
  Fragment,
  forwardRef,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type FieldsetHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { useDensity } from "@rain-next/foundations";
import { getRainLocalRecipePart, type RainLocalRecipe } from "../recipes/local-recipe";
import {
  SelectionControlContent,
  SelectionControlSurface,
} from "../selection-control/selection-control";
import { rainCn } from "../utils/rain-class-names";
import { useDefaultReset } from "../utils/use-default-reset";

export { RadioIndicator } from "../selection-control/selection-control";

export type RadioPart = "root" | "input" | "control" | "label" | "description";
type RadioRecipe = RainLocalRecipe<RadioPart, "ui-radio">;

interface RadioBase
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    | "type"
    | "size"
    | "style"
    | "children"
    | "className"
    | "defaultChecked"
    | "checked"
    | "onChange"
    | "value"
    | "role"
    | "aria-checked"
    | "readOnly"
    | "dangerouslySetInnerHTML"
  > {
  label?: string;
  description?: string;
  value?: string;
  className?: string;
  localRecipe?: RadioRecipe;
}

export type RadioProps = RadioBase &
  (
    | {
        checked: boolean;
        defaultChecked?: never;
        onCheckedChange: (checked: boolean) => void;
      }
    | {
        checked?: never;
        defaultChecked?: boolean;
        onCheckedChange?: (checked: boolean) => void;
      }
  );

const nonEmpty = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;
const ids = (...values: (string | false | undefined)[]) =>
  values.filter(Boolean).join(" ") || undefined;

export const RadioControl = forwardRef<
  HTMLInputElement,
  RadioProps & {
    renderContent?: (ids: { labelId: string; descriptionId: string }) => ReactNode;
  }
>(function RadioControl(
  {
    checked,
    defaultChecked,
    onCheckedChange,
    label,
    description,
    value = "on",
    disabled = false,
    className,
    localRecipe,
    renderContent,
    "aria-disabled": ariaDisabled,
    ...inputProps
  },
  forwardedRef,
) {
  const density = useDensity();
  const generated = useId();
  const ref = useRef<HTMLInputElement>(null);
  const [internalChecked, setInternalChecked] = useState(defaultChecked ?? false);
  const controlled = checked !== undefined;
  const selected = controlled ? checked : internalChecked;
  const present = useRef(selected);
  const unavailable =
    disabled || ariaDisabled === true || ariaDisabled === "true";

  useImperativeHandle(forwardedRef, () => ref.current!, []);
  useLayoutEffect(() => {
    present.current = selected;
  });
  useDefaultReset(
    ref,
    !controlled,
    () => [[ref.current!, defaultChecked ?? false]],
    () => setInternalChecked(defaultChecked ?? false),
  );

  return (
    <SelectionControlSurface
      state={{ kind: "radio", checked: selected, disabled: unavailable }}
      labelProps={{
        "data-density": density,
        "data-local-recipe": localRecipe?.id,
        className: rainCn(className, getRainLocalRecipePart(localRecipe, "root")),
      }}
      indicatorClassName={getRainLocalRecipePart(localRecipe, "control")}
      input={
        <input
          {...inputProps}
          ref={ref}
          type="radio"
          value={value}
          checked={selected}
          disabled={unavailable}
          aria-disabled={unavailable || undefined}
          aria-checked={selected}
          aria-labelledby={
            inputProps["aria-labelledby"] ??
            (inputProps["aria-label"] ? undefined : `${generated}-label`)
          }
          aria-describedby={ids(
            inputProps["aria-describedby"],
            description && `${generated}-description`,
          )}
          data-slot="input"
          data-focus="control"
          className={rainCn("sr-only", getRainLocalRecipePart(localRecipe, "input"))}
          onChange={(event) => {
            const input = event.currentTarget;
            if (input.matches(":disabled")) return;
            if (event.nativeEvent.defaultPrevented) {
              queueMicrotask(() => {
                input.checked = present.current;
              });
              return;
            }
            if (!controlled) setInternalChecked(input.checked);
            onCheckedChange?.(input.checked);
          }}
        />
      }
    >
      {renderContent ? (
        renderContent({
          labelId: `${generated}-label`,
          descriptionId: `${generated}-description`,
        })
      ) : (
        <SelectionControlContent
          label={label}
          description={description}
          labelId={`${generated}-label`}
          descriptionId={`${generated}-description`}
          labelClassName={getRainLocalRecipePart(localRecipe, "label")}
          descriptionClassName={getRainLocalRecipePart(
            localRecipe,
            "description",
          )}
        />
      )}
    </SelectionControlSurface>
  );
});

RadioControl.displayName = "RadioControl";

export const Radio = forwardRef<HTMLInputElement, RadioProps>((props, ref) => (
  <RadioControl {...props} ref={ref} />
));
Radio.displayName = "Radio";

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RadioGroupBase
  extends Omit<
    FieldsetHTMLAttributes<HTMLFieldSetElement>,
    | "children"
    | "style"
    | "onChange"
    | "defaultValue"
    | "value"
    | "role"
    | "dangerouslySetInnerHTML"
  > {
  options: readonly RadioOption[];
  renderOption?: (
    props: Omit<Extract<RadioProps, { checked: boolean }>, "localRecipe">,
  ) => ReactNode;
  legend: string;
  legendHidden?: boolean;
  orientation?: "vertical" | "horizontal";
  help?: string;
  message?: string;
  invalid?: boolean;
  required?: boolean;
  localRecipe?: RadioRecipe;
}

export type RadioGroupProps = RadioGroupBase &
  (
    | {
        value: string;
        defaultValue?: never;
        onValueChange: (value: string) => void;
      }
    | {
        value?: never;
        defaultValue?: string;
        onValueChange?: (value: string) => void;
      }
  );

export const RadioGroup = forwardRef<HTMLFieldSetElement, RadioGroupProps>(
  function RadioGroup(
    {
      options,
      renderOption,
      legend,
      legendHidden = false,
      orientation = "vertical",
      value,
      defaultValue: defaultValueProp,
      onValueChange,
      help,
      message,
      invalid = false,
      required = false,
      disabled = false,
      name,
      form,
      localRecipe,
      className,
      "aria-disabled": ariaDisabled,
      ...fieldsetProps
    },
    forwardedRef,
  ) {
    const generated = useId();
    const density = useDensity();
    const ref = useRef<HTMLFieldSetElement>(null);
    const defaultValue = defaultValueProp ?? "";
    const [internalValue, setInternalValue] = useState<string>(defaultValue);
    const controlled = value !== undefined;
    const selected = controlled ? value : internalValue;
    const current = useRef(selected);
    useLayoutEffect(() => {
      current.current = selected;
    });
    const unavailable =
      disabled || ariaDisabled === true || ariaDisabled === "true";
    const descriptionIds = ids(
      fieldsetProps["aria-describedby"],
      help && `${generated}-help`,
      message && `${generated}-message`,
    );
    const resolvedName = name ?? `${generated}-radio-group`;

    useImperativeHandle(forwardedRef, () => ref.current!, []);
    useDefaultReset(
      ref,
      !controlled,
      () =>
        Array.from(
          ref.current!.querySelectorAll<HTMLInputElement>('input[type="radio"]'),
        ).map((input) => [input, input.value === defaultValue]),
      () => {
        current.current = defaultValue;
        setInternalValue(defaultValue);
      },
    );

    if (!nonEmpty(legend) || !Array.isArray(options)) {
      throw new Error("RadioGroup requires a legend and valid options.");
    }

    return (
      <fieldset
        {...fieldsetProps}
        ref={ref}
        form={form}
        disabled={unavailable}
        role="radiogroup"
        aria-labelledby={
          fieldsetProps["aria-labelledby"] ??
          (fieldsetProps["aria-label"] ? undefined : `${generated}-legend`)
        }
        aria-describedby={descriptionIds}
        aria-invalid={invalid || fieldsetProps["aria-invalid"] || undefined}
        aria-disabled={unavailable || undefined}
        data-rain-id="ui-radio-group"
        data-slot="root"
        data-density={density}
        data-invalid={invalid}
        data-orientation={orientation}
        className={rainCn(
          "rain-radio-group min-w-rain-0 m-rain-0 p-rain-0 border-none font-rain-ui text-rain-size-15 leading-rain-24",
          className,
        )}
      >
        <legend
          id={`${generated}-legend`}
          data-slot="legend"
          className={
            legendHidden ? "sr-only" : "p-rain-0 mb-rain-8 font-rain-semibold"
          }
        >
          {legend}
          {required && <span className="sr-only">（必选一项）</span>}
        </legend>
        {help && (
          <p
            id={`${generated}-help`}
            data-slot="help"
            className="m-rain-0 mb-rain-12 text-rain-size-13 leading-rain-22"
          >
            {help}
          </p>
        )}
        <div
          data-slot="items"
          className={rainCn(
            "flex min-w-rain-0 items-start gap-rain-12",
            orientation === "vertical" ? "flex-col" : "flex-wrap",
          )}
        >
          {options.map((option) => {
            const props: Omit<
              Extract<RadioProps, { checked: boolean }>,
              "localRecipe"
            > = {
              ...option,
              name: resolvedName,
              form,
              disabled: unavailable || option.disabled,
              checked: selected === option.value,
              "aria-describedby": descriptionIds,
              "aria-invalid": invalid || undefined,
              onCheckedChange: (next) => {
                if (!next || unavailable || option.disabled) return;
                if (!controlled) {
                  current.current = option.value;
                  setInternalValue(option.value);
                }
                onValueChange?.(option.value);
              },
            };
            return renderOption ? (
              <Fragment key={option.value}>{renderOption(props)}</Fragment>
            ) : (
              <Radio key={option.value} {...props} localRecipe={localRecipe} />
            );
          })}
        </div>
        {message && (
          <p
            id={`${generated}-message`}
            data-slot="message"
            className="m-rain-0 mt-rain-8 text-rain-size-13 leading-rain-22"
          >
            {message}
          </p>
        )}
      </fieldset>
    );
  },
);

RadioGroup.displayName = "RadioGroup";
