import { useContext } from "react";
import { UIContext } from "@/context/ui-context";

export function useUI() {
  const context = useContext(UIContext);
  if (!context) throw new Error("useUI must be used inside UIProvider");
  return context;
}
