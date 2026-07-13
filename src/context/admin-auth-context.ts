import { createContext } from "react";

export type AdminUser = {
  uid: string;
  email: string;
  displayName: string;
};

export type AdminAuthContextValue = {
  admin: AdminUser | null;
  initializing: boolean;
  authenticating: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

export const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);
