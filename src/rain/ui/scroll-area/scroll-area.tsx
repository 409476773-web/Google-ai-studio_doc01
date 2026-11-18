import { forwardRef } from "react";
import { ScrollArea as BaseScrollArea } from "@base-ui/react/scroll-area";
import { rainCn } from "../utils/rain-class-names";

export type ScrollAreaRootProps = Omit<BaseScrollArea.Root.Props, "className"> & {
  className?: string;
};
export type ScrollAreaViewportProps = Omit<
  BaseScrollArea.Viewport.Props,
  "className"
> & {
  className?: string;
};
export type ScrollAreaContentProps = Omit<
  BaseScrollArea.Content.Props,
  "className"
> & {
  className?: string;
};
export type ScrollAreaScrollbarProps = Omit<
  BaseScrollArea.Scrollbar.Props,
  "className"
> & {
  className?: string;
};
export type ScrollAreaThumbProps = Omit<
  BaseScrollArea.Thumb.Props,
  "className"
> & {
  className?: string;
};

const Root = forwardRef<HTMLDivElement, ScrollAreaRootProps>(function Root(
  { className, ...props },
  ref,
) {
  return (
    <BaseScrollArea.Root
      {...props}
      ref={ref}
      data-rain-id="ui-scroll-area"
      data-slot="root"
      className={rainCn("rain-scroll-area relative overflow-hidden", className)}
    />
  );
});

const Viewport = forwardRef<HTMLDivElement, ScrollAreaViewportProps>(
  function Viewport({ className, ...props }, ref) {
    return (
      <BaseScrollArea.Viewport
        {...props}
        ref={ref}
        data-slot="viewport"
        className={rainCn(
          "rain-scroll-area-viewport size-full overscroll-contain",
          className,
        )}
      />
    );
  },
);

const Content = forwardRef<HTMLDivElement, ScrollAreaContentProps>(
  function Content({ className, ...props }, ref) {
    return (
      <BaseScrollArea.Content
        {...props}
        ref={ref}
        data-slot="content"
        className={rainCn("rain-scroll-area-content min-w-full", className)}
      />
    );
  },
);

const Scrollbar = forwardRef<HTMLDivElement, ScrollAreaScrollbarProps>(
  function Scrollbar({ orientation = "vertical", className, children, ...props }, ref) {
    return (
      <BaseScrollArea.Scrollbar
        {...props}
        ref={ref}
        orientation={orientation}
        data-slot="scrollbar"
        className={rainCn(
          "rain-scroll-area-scrollbar flex touch-none select-none p-[2px] transition-colors",
          orientation === "vertical" ? "w-[10px]" : "h-[10px]",
          className,
        )}
      >
        {children ?? <Thumb />}
      </BaseScrollArea.Scrollbar>
    );
  },
);

const Thumb = forwardRef<HTMLDivElement, ScrollAreaThumbProps>(function Thumb(
  { className, ...props },
  ref,
) {
  return (
    <BaseScrollArea.Thumb
      {...props}
      ref={ref}
      data-slot="thumb"
      className={rainCn(
        "rain-scroll-area-thumb relative flex-1 rounded-rain-full bg-[var(--rain-category-fill-neutral-alpha-2)]",
        className,
      )}
    />
  );
});

export const ScrollArea = {
  Root,
  Viewport,
  Content,
  Scrollbar,
  Thumb,
  Corner: BaseScrollArea.Corner,
};
