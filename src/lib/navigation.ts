import { createLocalizedPathnamesNavigation } from "next-intl/navigation";
import { Pathnames } from "next-intl/routing";

export const locales = ["tr", "en"] as const;
export const defaultLocale = "tr";

export const pathnames = {
  "/signin": {
    tr: "/giris-yap",
    en: "/signin",
  },
  "/": {
    tr: "/",
    en: "/",
  },
} satisfies Pathnames<typeof locales>;

export const {
  Link,
  getPathname,
  permanentRedirect,
  redirect,
  usePathname,
  useRouter,
} = createLocalizedPathnamesNavigation({
  locales,
  localePrefix: "always",
  pathnames,
});
