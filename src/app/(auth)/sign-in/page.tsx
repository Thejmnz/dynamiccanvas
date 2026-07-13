"use client";

import { Suspense } from "react";
import { SignInCard } from "@/features/auth/components/sign-in-card";
import { BrandLoading } from "@/components/brand-loading";

const SignInPage = () => {
  return (
    <Suspense fallback={<BrandLoading fullScreen label="" />}>
      <SignInCard />
    </Suspense>
  );
};

export default SignInPage;
