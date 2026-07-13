import { routePaths } from "@/routes/paths";

export type NavigationItem = {
  label: string;
  href: string;
};

export const primaryNavigation: NavigationItem[] = [
  { label: "Countdown", href: `${routePaths.home}#countdown` },
  { label: "Prizes", href: `${routePaths.home}#prizes` },
  { label: "Participate", href: `${routePaths.home}#participation` },
  { label: "Entry", href: `${routePaths.home}#entry` },
  { label: "FAQ", href: `${routePaths.home}#faq` },
];

export const legalNavigation: NavigationItem[] = [
  { label: "Terms", href: routePaths.terms },
  { label: "Privacy", href: routePaths.privacy },
  { label: "Official Rules", href: routePaths.rules },
];
