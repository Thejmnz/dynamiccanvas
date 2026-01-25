"use client";

import { Suspense } from "react";
import { SignUpCard } from "@/features/auth/components/sign-up-card";

const SignUpPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUpCard />
    </Suspense>
  );
};

export default SignUpPage;
