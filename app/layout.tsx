import "./globals.css";
import type { Metadata } from "next";
import { ToastProvider } from "../components/Toast";

export const metadata: Metadata = {
  title: "SplitSmart",
  description: "Split travel expenses with friends"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <div className="app-shell">{children}</div>
        </ToastProvider>
      </body>
    </html>
  );
}
