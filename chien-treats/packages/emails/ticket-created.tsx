import { Body, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";

interface TicketCreatedProps {
  ticketNumber: string;
}

export function TicketCreatedEmail({ ticketNumber }: TicketCreatedProps) {
  return (
    <Html>
      <Head />
      <Preview>We received your support ticket</Preview>
      <Body style={{ backgroundColor: "#F2E6D8", fontFamily: "Inter, sans-serif" }}>
        <Container style={{ backgroundColor: "#FFFFFF", borderRadius: 24, padding: "32px", maxWidth: "520px" }}>
          <Heading style={{ fontFamily: "Nunito, sans-serif", color: "#6B4A3A" }}>
            We've got your note!
          </Heading>
          <Text>Ticket {ticketNumber} is in our baking queue. A human will reply within one business day.</Text>
          <Text>You can reply to this email with screenshots or more context at any time.</Text>
        </Container>
      </Body>
    </Html>
  );
}
