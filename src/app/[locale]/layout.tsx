import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/assets/css/globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ThemeProvider } from "@/context/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | Trello",
    default: "Trello",
    absolute: "Trello",
  },
};

type Props = {
  children: React.ReactNode;
  params: {
    locale: string;
  };
};

export default async function RootLayout({
  children,
  params: { locale },
}: Props) {
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>{children}</ThemeProvider>
        </NextIntlClientProvider>

        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
