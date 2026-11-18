import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import {
  tagSizeClassNames,
  type TagColorProfile,
  type TagSize,
} from "@rain-next/foundations";
import { CloseIcon } from "../icons/close";
import { getRainLocalRecipePart, type RainLocalRecipe } from "../recipes/local-recipe";
import { rainCn } from "../utils/rain-class-names";

export type TagAppearance = "alpha" | "solid" | "outline";
export type TagTone = "default" | "success" | "processing" | "warning" | "error";
export type TagColor = TagColorProfile | TagTone;
export type TagLayout = "inline" | "vertical";
export type TagPart = "root" | "label" | "icon" | "remove";
export type TagLocalRecipe = RainLocalRecipe<TagPart, "ui-tag">;
export type { TagSize };

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  appearance?: TagAppearance;
  color?: TagColor;
  tone?: TagTone;
  size?: TagSize;
  layout?: TagLayout;
  leadingIcon?: ReactNode;
  removable?: boolean;
  onRemove?: () => void;
  disabled?: boolean;
  localRecipe?: TagLocalRecipe;
}

const toneColorClasses: Record<TagTone, Record<TagAppearance, string>> = {
  default: {
    alpha:
      "bg-[var(--rain-category-fill-neutral-alpha-5)] text-[var(--rain-category-text-neutral-2)] border-transparent",
    solid:
      "bg-[var(--rain-category-fill-neutral-solid-2)] text-[var(--rain-category-text-neutral-1)] border-transparent",
    outline:
      "bg-transparent text-[var(--rain-category-text-neutral-2)] border-[var(--rain-category-border-neutral-2)]",
  },
  processing: {
    alpha:
      "bg-[var(--rain-category-fill-brand-alpha-4)] text-[var(--rain-category-text-brand-1)] border-transparent",
    solid:
      "bg-[var(--rain-category-fill-brand-solid-2)] text-[var(--rain-category-oncolor-1)] border-transparent",
    outline:
      "bg-transparent text-[var(--rain-category-text-brand-1)] border-[var(--rain-category-border-brand-1)]",
  },
  success: {
    alpha:
      "bg-[var(--rain-category-fill-green-alpha-2)] text-[var(--rain-category-text-green-1)] border-transparent",
    solid:
      "bg-[var(--rain-category-fill-green-solid-2)] text-[var(--rain-category-oncolor-1)] border-transparent",
    outline:
      "bg-transparent text-[var(--rain-category-text-green-1)] border-[var(--rain-category-border-green-1)]",
  },
  warning: {
    alpha:
      "bg-[var(--rain-category-fill-orange-alpha-2)] text-[var(--rain-category-text-orange-1)] border-transparent",
    solid:
      "bg-[var(--rain-category-fill-orange-solid-2)] text-[var(--rain-category-oncolor-1)] border-transparent",
    outline:
      "bg-transparent text-[var(--rain-category-text-orange-1)] border-[var(--rain-category-border-orange-1)]",
  },
  error: {
    alpha:
      "bg-[var(--rain-category-fill-red-alpha-2)] text-[var(--rain-category-text-red-1)] border-transparent",
    solid:
      "bg-[var(--rain-category-fill-red-solid-2)] text-[var(--rain-category-oncolor-1)] border-transparent",
    outline:
      "bg-transparent text-[var(--rain-category-text-red-1)] border-[var(--rain-category-border-red-1)]",
  },
};

export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  {
    appearance = "alpha",
    color,
    tone = "default",
    size = 24,
    layout = "inline",
    leadingIcon,
    removable = false,
    onRemove,
    disabled = false,
    localRecipe,
    className,
    children,
    ...props
  },
  ref,
) {
  const resolvedTone: TagTone =
    color && color in toneColorClasses ? (color as TagTone) : tone;

  return (
    <span
      {...props}
      ref={ref}
      data-rain-id="ui-tag"
      data-slot="root"
      data-size={size}
      data-appearance={appearance}
      data-state={disabled ? "disabled" : "default"}
      data-removable={removable ? "true" : undefined}
      className={rainCn(
        "rain-tag inline-flex items-center gap-rain-4 border border-solid font-rain-ui whitespace-nowrap select-none",
        size === 20
          ? "px-rain-6 rounded-rain-4 text-rain-size-12 leading-rain-14"
          : size === 28
            ? "px-rain-12 rounded-rain-6 text-rain-size-13 leading-rain-18"
            : "px-rain-8 rounded-rain-6 text-rain-size-13 leading-rain-18",
        tagSizeClassNames[size],
        layout === "vertical" && "rain-tag-vertical",
        toneColorClasses[resolvedTone][appearance],
        disabled && "opacity-50 cursor-not-allowed",
        className,
        getRainLocalRecipePart(localRecipe, "root"),
      )}
    >
      {leadingIcon && (
        <span
          data-slot="leading-icon"
          className={rainCn(
            "inline-flex flex-none items-center",
            getRainLocalRecipePart(localRecipe, "icon"),
          )}
          aria-hidden="true"
        >
          {leadingIcon}
        </span>
      )}
      <span
        data-slot="label"
        className={rainCn("truncate", getRainLocalRecipePart(localRecipe, "label"))}
      >
        {children}
      </span>
      {removable && (
        <button
          type="button"
          disabled={disabled}
          aria-label="移除标签"
          onClick={onRemove}
          className={rainCn(
            "rain-tag__remove inline-flex size-[16px] flex-none items-center justify-center rounded-rain-4 border-0 bg-transparent p-0 text-current cursor-pointer hover:bg-[var(--rain-category-fill-neutral-alpha-5)]",
            getRainLocalRecipePart(localRecipe, "remove"),
          )}
        >
          <CloseIcon size={12} />
        </button>
      )}
    </span>
  );
});

Tag.displayName = "Tag";
