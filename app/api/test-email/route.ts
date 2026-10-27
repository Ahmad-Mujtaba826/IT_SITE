import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET() {
  try {
    const port = Number(process.env.SMTP_PORT ?? 587);
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.verify();
    await transporter.sendMail({
      from: `"Axiora Test" <${process.env.SMTP_USER}>`,
      to: process.env.NOTIFY_EMAIL,
      subject: "Axiora Email Test ✅",
      text: "Email setup kaam kar raha hai!",
    });

    return NextResponse.json({ ok: true, message: "Email sent! Check your inbox." });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
