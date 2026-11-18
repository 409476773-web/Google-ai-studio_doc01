import { forwardRef, type ReactNode } from "react";
import { Toast as BaseToast } from "@base-ui/react/toast";
import { AlertFilledIcon } from "../icons/alert-filled";
import { CircleCheckFilledIcon } from "../icons/circle-check-filled";
import { CircleCloseFilledIcon } from "../icons/circle-close-filled";
import { CloseIcon } from "../icons/close";
import { InfoFilledIcon } from "../icons/info-filled";
import { rainCn } from "../utils/rain-class-names";

export const createToastManager = BaseToast.createToastManager;
export const useToastManager = BaseToast.useToastManager;

export type ToastTone = "info" | "success" | "warning" | "error";

export interface RainToastData {
  type?: ToastTone | string;
}

export const toast = createToastManager<RainToastData>();

export const Toast = BaseToast.Root;
export const ToastAction = BaseToast.Action;
export const ToastClose = BaseToast.Close;
export const ToastContent = BaseToast.Content;
export const ToastDescription = BaseToast.Description;
export const ToastPortal = BaseToast.Portal;
export const ToastProvider = BaseToast.Provider;
export const ToastTitle = BaseToast.Title;
export const ToastViewport = BaseToast.Viewport;

function ToastToneIcon({ type }: { type?: string }) {
  switch (type) {
    case "success":
      return (
        <CircleCheckFilledIcon
          size={16}
          className="text-[var(--rain-category-icon-green-1)]"
        />
      );
    case "warning":
      return (
        <AlertFilledIcon
          size={16}
          className="text-[var(--rain-category-icon-orange-1)]"
        />
      );
    case "error":
      return (
        <CircleCloseFilledIcon
          size={16}
          className="text-[var(--rain-category-icon-red-1)]"
        />
      );
    default:
      return (
        <InfoFilledIcon
          size={16}
          className="text-[var(--rain-category-icon-brand-2)]"
        />
      );
  }
}

function ToastList() {
  const { toasts } = useToastManager();

  return (
    <>
      {toasts.map((item) => {
        const type = item.type ?? (item.data as RainToastData | undefined)?.type ?? "info";
        return (
          <BaseToast.Root
            key={item.id}
            toast={item}
            data-rain-id="ui-toast"
            data-tone={type}
            className="rain-toast pointer-events-auto flex w-[340px] max-w-[calc(100vw-32px)] items-start gap-rain-10 rounded-rain-8 border border-solid border-[var(--rain-category-border-neutral-3)] bg-[var(--rain-category-background-neutral-1)] p-rain-12 text-[var(--rain-category-text-neutral-1)] shadow-rain-overlay font-rain-ui"
          >
            <span className="mt-[2px] inline-flex flex-none" aria-hidden="true">
              <ToastToneIcon type={type} />
            </span>
            <BaseToast.Content className="flex min-w-0 flex-1 flex-col gap-rain-2">
              {item.title && (
                <BaseToast.Title className="text-rain-size-14 leading-rain-20 font-rain-semibold text-[var(--rain-category-text-neutral-1)]" />
              )}
              {item.description && (
                <BaseToast.Description className="text-rain-size-13 leading-rain-18 text-[var(--rain-category-text-neutral-3)]" />
              )}
            </BaseToast.Content>
            <BaseToast.Close
              aria-label="关闭通知"
              className="inline-flex size-[20px] flex-none items-center justify-center rounded-rain-4 border-0 bg-transparent p-0 text-[var(--rain-category-icon-neutral-3)] hover:bg-[var(--rain-category-fill-neutral-alpha-5)] hover:text-[var(--rain-category-icon-neutral-1)] cursor-pointer"
            >
              <CloseIcon size={12} />
            </BaseToast.Close>
          </BaseToast.Root>
        );
      })}
    </>
  );
}

export interface ToasterProps {
  children?: ReactNode;
  theme?: "light" | "dark";
  className?: string;
}

export const Toaster = forwardRef<HTMLDivElement, ToasterProps>(function Toaster(
  { children, theme = "light", className },
  ref,
) {
  return (
    <BaseToast.Provider toastManager={toast} timeout={3800} limit={4}>
      {children}
      <BaseToast.Portal>
        <BaseToast.Viewport
          ref={ref}
          data-rain-theme={theme}
          className={rainCn(
            "rain-toast-viewport fixed top-[16px] left-1/2 z-[100] flex -translate-x-1/2 flex-col items-center gap-rain-8 pointer-events-none outline-none",
            className,
          )}
        >
          <ToastList />
        </BaseToast.Viewport>
      </BaseToast.Portal>
    </BaseToast.Provider>
  );
});

Toaster.displayName = "Toaster";
