import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FaUser } from "react-icons/fa";
import { auth, signOut } from "@/lib/auth";
import Image from "next/image";
import SwitchLanguage from "./switch-language";
import SwitchTheme from "./switch-theme";
import { getTranslations } from "next-intl/server";
import { logout } from "@/actions/user.action";

export default async function AccountDropdown() {
  const t = await getTranslations();
  const session = await auth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="destructive"
          size="icon"
          className="rounded-full size-8"
        >
          <FaUser />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80">
        <DropdownMenuLabel>
          <h1>{t("account")}</h1>

          <div className="flex items-center space-x-2.5 mt-2.5">
            <div className="size-10 relative rounded-full overflow-hidden bg-secondary flex items-center justify-center">
              {session?.user?.image && (
                <Image
                  src={session.user.image}
                  width={40}
                  height={40}
                  className="absolute inset-0"
                  alt="Avatar"
                />
              )}

              <span>{session?.user?.name?.at(0)}</span>
            </div>

            <div className="flex-1 overflow-hidden truncate leading-4">
              <h1 className="text-sm font-semibold">{session?.user?.name}</h1>
              <span className="text-xs font-medium text-foreground/60">
                {session?.user?.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <SwitchLanguage />

          <SwitchTheme />

          <DropdownMenuSeparator />

          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <DropdownMenuItem className="w-full" asChild>
              <button type="submit">{t("logout")}</button>
            </DropdownMenuItem>
          </form>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
