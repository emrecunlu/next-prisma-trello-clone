"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { usePathname } from "@/lib/navigation";

export function ThemeProvider({ children }: ThemeProviderProps) {
  const pathname = usePathname();

  const forcedTheme = pathname.startsWith("/signin") ? "light" : undefined;

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      forcedTheme={forcedTheme}
    >
      {children}
    </NextThemesProvider>
  );
}
