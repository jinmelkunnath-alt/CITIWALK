import { createContext } from "react";

export type ToastTone = "neutral" | "success" | "warning" | "error";

export type ToastRecord = {
  id: string;
  title: string;
  message?: string;
  tone: ToastTone;
};

export type AddToastOptions = Omit<ToastRecord, "id"> & {
  duration?: number;
};

export type UIContextValue = {
  toasts: ToastRecord[];
  addToast: (toast: AddToastOptions) => string;
  removeToast: (id: string) => void;
};

export const UIContext = createContext<UIContextValue | null>(null);
