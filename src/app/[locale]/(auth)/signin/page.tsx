import SubmitButton from "@/components/auth/submit-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signIn } from "@/lib/auth";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { FaGithub, FaGoogle } from "react-icons/fa";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("signin");

  return {
    title: t("title"),
  };
}

export default async function Signin() {
  const t = await getTranslations("signin");

  return (
    <div className="h-screen flex items-center justify-center sm:px-0 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t("form.title")}</CardTitle>
          <CardDescription>{t("form.description")}</CardDescription>
        </CardHeader>

        <CardContent className="grid space-y-1.5">
          <form
            action={async () => {
              "use server";
              await signIn("google");
            }}
          >
            <SubmitButton icon={<FaGoogle />}>
              {t("form.buttons.signinWithGoogle")}
            </SubmitButton>
          </form>

          <form
            action={async () => {
              "use server";
              await signIn("github");
            }}
          >
            <SubmitButton icon={<FaGithub />}>
              {t("form.buttons.signinWithGithub")}
            </SubmitButton>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-sm">
            {t.rich("form.developedBy", {
              link: (partial) => (
                <Link
                  className="font-semibold hover:opacity-50 transition-all"
                  href="https://www.github.com/emrecunlu"
                >
                  {partial}
                </Link>
              ),
            })}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
