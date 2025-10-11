import { contactFormSchema } from "@/lib/forms/contact";
import { sendContactNotification } from "@/lib/email";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ success: false, error: "Invalid payload." }, { status: 400 });
  }

  const parsed = contactFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.website) {
    return NextResponse.json({ success: true, message: "Thank you" });
  }

  await sendContactNotification(parsed.data);

  return NextResponse.json({ success: true });
}
