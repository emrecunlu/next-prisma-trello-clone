import { Link } from "@/lib/navigation";
import { FaTrello } from "react-icons/fa";
import AccountDropdown from "./components/account-dropdown";
import { auth } from "@/lib/auth";

export default async function Header() {
  const session = await auth();

  return (
    <header className="h-12 flex items-center justify-between bg-background pe-4 ps-2 border-b shadow-md">
      <Link
        href="/"
        className="flex items-center gap-x-1.5 transition-all font-medium hover:bg-secondary px-2 py-1 rounded group"
      >
        <FaTrello
          size={20}
          className="group-hover:-rotate-6 transition-transform"
        />
        Trello
      </Link>

      <AccountDropdown />
    </header>
  );
}
