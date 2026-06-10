import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "NewLeaf Payments",
  description: "Secure payment processing by NewLeaf Financial",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌿</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: "dark",
        variables: {
          colorPrimary: "#10b981",
          colorBackground: "#0a0a0f",
          colorInputBackground: "rgba(255,255,255,0.05)",
          colorInputText: "rgba(255,255,255,0.92)",
          colorText: "rgba(255,255,255,0.92)",
          colorTextSecondary: "rgba(255,255,255,0.55)",
          colorNeutral: "rgba(255,255,255,0.15)",
          borderRadius: "0.75rem",
        },
      }}
    >
      <html lang="en" className="h-full antialiased">
        <body className="flex min-h-dvh flex-col">
          <TooltipProvider>
            {children}
          </TooltipProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "rgba(20, 20, 30, 0.95)",
                color: "rgba(255, 255, 255, 0.92)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "12px",
                backdropFilter: "blur(20px)",
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
