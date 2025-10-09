"use client";

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@ui";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { requestEmailVerification, resetVerification } from "./authSlice";

interface VerifiedUserGateProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export function VerifiedUserGate({ children, title, description }: VerifiedUserGateProps) {
  const dispatch = useAppDispatch();
  const { user, verification, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    return () => {
      dispatch(resetVerification());
    };
  }, [dispatch]);

  if (!user) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>{title ?? "Sign in to continue"}</CardTitle>
          <CardDescription>
            {description ??
              "You need an account to reach our team and follow your support tickets. Sign in or create an account to get started."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/register">Create account</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!user.emailVerifiedAt) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Verify your email</CardTitle>
          <CardDescription>
            We&apos;ve sent a confirmation link to <span className="font-medium text-brown">{user.email}</span>. Click the link
            to unlock support and contact forms. Didn&apos;t get it? We can resend the email.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            type="button"
            onClick={() => dispatch(requestEmailVerification())}
            disabled={verification.requesting || loading}
          >
            {verification.requesting ? "Sending..." : "Resend verification email"}
          </Button>
          {verification.requested && !verification.requesting ? (
            <p className="text-sm text-green-700">Verification email sent. Check your inbox and spam folder.</p>
          ) : null}
          {verification.error ? <p className="text-sm text-red">{verification.error}</p> : null}
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}
