import Link from "next/link";

interface AuthLayoutProps {
  children: React.ReactNode;
};

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="dark min-h-screen bg-[#101622] text-slate-100 antialiased selection:bg-[#135bec]/30 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#135bec]/40 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-[30%] h-[30%] bg-blue-600/30 blur-[100px] rounded-full"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[420px] px-4">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
