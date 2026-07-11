interface AuthLayoutProps {
  children: React.ReactNode;
};

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="brand-dots relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12 text-[#101426] selection:bg-[#c9ff5a]">
      <div className="pointer-events-none absolute -left-20 -top-20 size-64 rounded-full border-[48px] border-[#5b35d5] opacity-90" />
      <div className="pointer-events-none absolute -bottom-16 -right-12 size-56 rotate-12 rounded-[48px] border-2 border-[#101426] bg-[#c9ff5a] shadow-[10px_10px_0_#101426]" />
      <div className="relative z-10 w-full max-w-[460px] px-2">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
