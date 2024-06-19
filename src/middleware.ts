import createMiddleware from "next-intl/middleware";
import { defaultLocale, locales, pathnames } from "@/lib/navigation";
import { NextRequest } from "next/server";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  pathnames,
});

export const middleware = async (req: NextRequest) => {
  return intlMiddleware(req);
};

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|images|favicon.ico).*)"],
};
