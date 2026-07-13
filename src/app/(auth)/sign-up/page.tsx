"use client";

import { Suspense } from "react";
import { SignUpCard } from "@/features/auth/components/sign-up-card";
import { BrandLoading } from "@/components/brand-loading";

const SignUpPage = () => {
  return (
    <Suspense fallback={<BrandLoading fullScreen label="" />}>
      <SignUpCard />
    </Suspense>
  );
};

export default SignUpPage;
