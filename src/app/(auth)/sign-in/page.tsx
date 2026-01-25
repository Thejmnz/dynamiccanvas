"use client";

import { Suspense } from "react";
import { SignInCard } from "@/features/auth/components/sign-in-card";

const SignInPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInCard />
    </Suspense>
  );
};

export default SignInPage;
