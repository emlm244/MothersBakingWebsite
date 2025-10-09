"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { restProvider } from "@data/rest-provider";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ui";

type VerifyStatus = "idle" | "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<VerifyStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing. Please use the link from your email.");
      return;
    }

    setStatus("loading");
    restProvider
      .confirmEmailVerification(token)
      .then((user) => {
        setVerifiedEmail(user.email);
        setStatus("success");
        setMessage("Your email is verified. You can sign in any time.");
      })
      .catch((error: unknown) => {
        const detail = error instanceof Error ? error.message : "Unable to verify email right now.";
        setStatus("error");
        setMessage(detail);
      });
  }, [token]);

  return (
    <div className="mx-auto max-w-lg py-16">
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Email verification</CardTitle>
          <CardDescription>
            {status === "loading" && "Confirming your account..."}
            {status === "success" && "Thanks for confirming your address!"}
            {status === "error" && "We couldn't verify that token."}
            {status === "idle" && "Waiting for verification token..."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "loading" ? (
            <p className="text-sm text-brown/70">Hold tight while we confirm your token.</p>
          ) : null}
          {status === "success" ? (
            <div className="space-y-3 text-sm text-green-800">
              <p>Your address {verifiedEmail ?? ""} is now verified.</p>
              <Button asChild>
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          ) : null}
          {status === "error" && message ? (
            <div className="space-y-3 text-sm text-red">
              <p>{message}</p>
              <p>
                Need a new link? Head to{" "}
                <Link className="text-pink underline" href="/login">
                  the login page
                </Link>{" "}
                to request another verification email.
              </p>
            </div>
          ) : null}
          {status !== "error" && status !== "success" && message ? (
            <p className="text-sm text-brown/70">{message}</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
