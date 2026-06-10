import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <SignUp
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
