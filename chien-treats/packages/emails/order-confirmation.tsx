import { Body, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";

interface OrderConfirmationProps {
  customerName: string;
  orderNumber: string;
}

export function OrderConfirmationEmail({ customerName, orderNumber }: OrderConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>Your Chien's Treats order is baking!</Preview>
      <Body style={{ backgroundColor: "#F2E6D8", fontFamily: "Inter, sans-serif" }}>
        <Container style={{ backgroundColor: "#FFFFFF", borderRadius: 24, padding: "32px", maxWidth: "520px" }}>
          <Heading style={{ fontFamily: "Nunito, sans-serif", color: "#6B4A3A" }}>
            Thanks, {customerName}!
          </Heading>
          <Text>Your order {orderNumber} is marked demo-paid. We'll reach out with pickup details shortly.</Text>
          <Text>Until then, enjoy planning your celebration ?</Text>
        </Container>
      </Body>
    </Html>
  );
}
