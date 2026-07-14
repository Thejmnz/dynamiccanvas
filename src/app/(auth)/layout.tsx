interface AuthLayoutProps {
  children: React.ReactNode;
};

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="auth-modern-background relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12 text-[#101426] selection:bg-[#d9ccff]">
      <div className="pointer-events-none absolute -left-32 -top-36 size-[28rem] rounded-full bg-[#5b35d5]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 size-[30rem] rounded-full bg-[#8266e6]/10 blur-3xl" />
      <div className="relative z-10 w-full max-w-[460px] px-2">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
