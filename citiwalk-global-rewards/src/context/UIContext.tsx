import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  UIContext,
  type AddToastOptions,
  type ToastRecord,
} from "@/context/ui-context";

export function UIProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const timers = useRef(new Map<string, number>());

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) window.clearTimeout(timer);
    timers.current.delete(id);
  }, []);

  const addToast = useCallback(
    ({ duration = 5000, ...toast }: AddToastOptions) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, ...toast }].slice(-4));

      const timer = window.setTimeout(() => removeToast(id), duration);
      timers.current.set(id, timer);
      return id;
    },
    [removeToast],
  );

  useEffect(() => {
    const activeTimers = timers.current;
    return () => activeTimers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const value = useMemo(
    () => ({ toasts, addToast, removeToast }),
    [addToast, removeToast, toasts],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}
