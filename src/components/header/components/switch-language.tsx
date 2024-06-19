"use client";

import {
  DropdownMenuCheckboxItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "@/lib/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useMemo } from "react";

export default function SwitchLanguage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const hasChecked = useCallback((value: string) => value === locale, [locale]);

  const handleChange = (value: "en" | "tr") => {
    router.replace("/", { locale: value });
  };

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>{t("language")}</DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          <DropdownMenuCheckboxItem
            checked={hasChecked("tr")}
            onClick={() => handleChange("tr")}
          >
            {t("languages.tr")}
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={hasChecked("en")}
            onClick={() => handleChange("en")}
          >
            {t("languages.en")}
          </DropdownMenuCheckboxItem>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}
