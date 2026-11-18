import { createContext, forwardRef, useContext } from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import {
  PopupProvider,
  popupSurfaceClassName,
  popupWidthStyle,
  usePopupScope,
  usePopupTriggerRef,
} from "../_internal/popup";
import { getRainLocalRecipePart, type RainLocalRecipe } from "../recipes/local-recipe";
import { rainCn } from "../utils/rain-class-names";

export type PopoverPart = "content" | "title" | "description";
export type PopoverLocalRecipe = RainLocalRecipe<PopoverPart, "ui-popover">;
export type PopoverRootProps = BasePopover.Root.Props & {
  localRecipe?: PopoverLocalRecipe;
};

const RecipeContext = createContext<PopoverLocalRecipe | undefined>(undefined);

function Root({ localRecipe, onOpenChange, ...props }: PopoverRootProps) {
  return (
    <RecipeContext.Provider value={localRecipe}>
      <PopupProvider
        triggerId={props.triggerId}
        defaultTriggerId={props.defaultTriggerId}
      >
        {(setAnchor) => (
          <BasePopover.Root
            {...props}
            onOpenChange={(open, details) => {
              onOpenChange?.(open, details);
              if (
                open &&
                !details.isCanceled &&
                details.trigger instanceof HTMLElement
              ) {
                setAnchor(details.trigger);
              }
            }}
          />
        )}
      </PopupProvider>
    </RecipeContext.Provider>
  );
}

const Trigger = forwardRef<HTMLElement, BasePopover.Trigger.Props>(
  function Trigger(props, ref) {
    const anchorRef = usePopupTriggerRef(ref);
    return (
      <BasePopover.Trigger
        data-rain-id="ui-popover"
        data-slot="trigger"
        data-focus="control"
        {...props}
        ref={anchorRef}
      />
    );
  },
);

export type PopoverContentProps = Omit<
  BasePopover.Popup.Props,
  "className" | "style"
> & {
  className?: string;
  width?: number | "auto";
  localRecipe?: PopoverLocalRecipe;
  positionerProps?: Omit<
    BasePopover.Positioner.Props,
    "className" | "style"
  > & {
    className?: string;
  };
};

const Content = forwardRef<HTMLDivElement, PopoverContentProps>(
  function Content(
    { className, width = "auto", localRecipe: contentRecipe, positionerProps, ...props },
    ref,
  ) {
    const { theme, density, densityStyle } = usePopupScope();
    const rootRecipe = useContext(RecipeContext);
    const localRecipe = contentRecipe ?? rootRecipe;

    return (
      <BasePopover.Portal>
        <BasePopover.Positioner
          align="center"
          sideOffset={6}
          collisionPadding={8}
          {...positionerProps}
          data-rain-theme={theme}
          data-density={density}
          style={densityStyle}
          className={rainCn("rain-popup-positioner", positionerProps?.className)}
        >
          <BasePopover.Popup
            {...props}
            ref={ref}
            data-rain-id="ui-popover"
            data-slot="content"
            data-local-recipe={localRecipe?.id}
            style={width === "auto" ? undefined : popupWidthStyle(width)}
            className={rainCn(
              popupSurfaceClassName,
              "rain-popover p-rain-16",
              className,
              getRainLocalRecipePart(localRecipe, "content"),
            )}
          />
        </BasePopover.Positioner>
      </BasePopover.Portal>
    );
  },
);

const Title = forwardRef<
  HTMLHeadingElement,
  Omit<BasePopover.Title.Props, "className"> & { className?: string }
>(function Title({ className, ...props }, ref) {
  const localRecipe = useContext(RecipeContext);
  return (
    <BasePopover.Title
      {...props}
      ref={ref}
      data-slot="title"
      className={rainCn(
        "rain-popover__title m-rain-0 text-rain-size-15 leading-rain-22 font-rain-semibold text-[var(--rain-category-text-neutral-1)]",
        className,
        getRainLocalRecipePart(localRecipe, "title"),
      )}
    />
  );
});

const Description = forwardRef<
  HTMLParagraphElement,
  Omit<BasePopover.Description.Props, "className"> & { className?: string }
>(function Description({ className, ...props }, ref) {
  const localRecipe = useContext(RecipeContext);
  return (
    <BasePopover.Description
      {...props}
      ref={ref}
      data-slot="description"
      className={rainCn(
        "rain-popover__description m-rain-0 text-rain-size-13 leading-rain-20 text-[var(--rain-category-text-neutral-3)]",
        className,
        getRainLocalRecipePart(localRecipe, "description"),
      )}
    />
  );
});

const Close = forwardRef<HTMLButtonElement, BasePopover.Close.Props>(
  function Close(props, ref) {
    return <BasePopover.Close {...props} ref={ref} data-slot="close" />;
  },
);

export const Popover = {
  Root,
  Trigger,
  Content,
  Title,
  Description,
  Close,
};
