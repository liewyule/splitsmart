import "./globals.css";
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { ToastProvider } from "../components/Toast";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "SplitSmart",
  description: "Split travel expenses with friends"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={dmSans.className}>
        <ToastProvider>
          <div className="app-shell">{children}</div>
        </ToastProvider>
      </body>
    </html>
  );
}
