import { Body, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";

interface TicketUpdatedProps {
  ticketNumber: string;
  status: string;
}

export function TicketUpdatedEmail({ ticketNumber, status }: TicketUpdatedProps) {
  return (
    <Html>
      <Head />
      <Preview>Your ticket was updated</Preview>
      <Body style={{ backgroundColor: "#F2E6D8", fontFamily: "Inter, sans-serif" }}>
        <Container style={{ backgroundColor: "#FFFFFF", borderRadius: 24, padding: "32px", maxWidth: "520px" }}>
          <Heading style={{ fontFamily: "Nunito, sans-serif", color: "#6B4A3A" }}>
            Ticket {ticketNumber} is now {status}
          </Heading>
          <Text>Peek at the admin to review notes or reply directly to continue the conversation.</Text>
          <Text>If this looks resolved, you can close the request from the support center.</Text>
        </Container>
      </Body>
    </Html>
  );
}
