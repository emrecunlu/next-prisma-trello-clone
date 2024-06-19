"use client";

import {
  DropdownMenuCheckboxItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useCallback } from "react";

export default function SwitchTheme() {
  const t = useTranslations();
  const { theme, setTheme } = useTheme();

  const hasChecked = useCallback((value: string) => value === theme, [theme]);

  const handleChange = (value: "dark" | "light" | "system") => {
    setTheme(value);
  };

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>{t("theme")}</DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          <DropdownMenuCheckboxItem
            checked={hasChecked("dark")}
            onClick={() => handleChange("dark")}
          >
            {t("themes.dark")}
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={hasChecked("light")}
            onClick={() => handleChange("light")}
          >
            {t("themes.light")}
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={hasChecked("system")}
            onClick={() => handleChange("system")}
          >
            {t("themes.system")}
          </DropdownMenuCheckboxItem>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}
