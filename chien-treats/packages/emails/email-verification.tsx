import { Body, Container, Head, Heading, Html, Link, Preview, Text } from "@react-email/components";

interface EmailVerificationProps {
  name: string;
  verificationUrl: string;
}

export function EmailVerificationEmail({ name, verificationUrl }: EmailVerificationProps) {
  return (
    <Html>
      <Head />
      <Preview>Confirm your email for Chien&apos;s Treats</Preview>
      <Body style={{ backgroundColor: "#F2E6D8", fontFamily: "Inter, sans-serif" }}>
        <Container style={{ backgroundColor: "#FFFFFF", borderRadius: 24, padding: "32px", maxWidth: "520px" }}>
          <Heading style={{ fontFamily: "Nunito, sans-serif", color: "#6B4A3A" }}>Welcome to Chien&apos;s Treats</Heading>
          <Text style={{ color: "#4B3621" }}>
            Hi {name.trim().length ? name : "there"}, thanks for creating an account. Please verify your email address so we can
            keep your treats and support tickets secure.
          </Text>
          <Text style={{ marginTop: "16px", textAlign: "center" }}>
            <Link
              href={verificationUrl}
              style={{
                display: "inline-block",
                backgroundColor: "#D97852",
                color: "#FFFFFF",
                padding: "12px 28px",
                borderRadius: "999px",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Verify email
            </Link>
          </Text>
          <Text style={{ color: "#7A5A44", fontSize: "14px", marginTop: "24px" }}>
            If the button doesn&rsquo;t work, copy and paste this link into your browser:{" "}
            <Link href={verificationUrl}>{verificationUrl}</Link>
          </Text>
          <Text style={{ color: "#A37E64", fontSize: "12px", marginTop: "24px" }}>
            This link will expire in 24 hours. If you didn&apos;t create an account, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
