import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <SignIn
        appearance={{
          elements: {
            card: "glass-raised",
            formButtonPrimary: "emerald-gradient",
          },
        }}
      />
    </div>
  );
}
