import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import nodemailer from "nodemailer";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
});

async function ensureTable() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      service VARCHAR(255),
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function POST(req: NextRequest) {
  const fd = await req.formData();
  const name = fd.get("n")?.toString().trim() ?? "";
  const email = fd.get("e")?.toString().trim() ?? "";
  const service = fd.get("s")?.toString() ?? "";
  const message = fd.get("m")?.toString().trim() ?? "";

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  try {
    await ensureTable();
    await pool.execute(
      "INSERT INTO contacts (name, email, service, message) VALUES (?, ?, ?, ?)",
      [name, email, service, message]
    );
  } catch (err) {
    console.error("DB error:", err);
    return NextResponse.json({ error: "Database error." }, { status: 500 });
  }

  // Send email
  try {
    const port = Number(process.env.SMTP_PORT ?? 587);
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transporter.sendMail({
      from: `"Axiora Website" <${process.env.SMTP_USER}>`,
      to: process.env.NOTIFY_EMAIL,
      replyTo: email,
      subject: `[${email}] New enquiry: ${service}`,
      text: `Name: ${name}\nEmail: ${email}\nService: ${service}\n\n${message}`,
    });
  } catch (err) {
    console.error("Email error:", err);
  }

  // Send WhatsApp via Twilio
  try {
    const accountSid = process.env.TWILIO_SID;
    const authToken = process.env.TWILIO_TOKEN;
    if (accountSid && authToken) {
      const body = `New Axiora enquiry\nName: ${name}\nEmail: ${email}\nService: ${service}\nMessage: ${message}`;
      await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: "POST",
        headers: {
          Authorization: "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: `whatsapp:${process.env.TWILIO_FROM}`,
          To: `whatsapp:${process.env.TWILIO_TO}`,
          Body: body,
        }),
      });
    }
  } catch (err) {
    console.error("WhatsApp error:", err);
  }

  return NextResponse.json({ ok: true });
}
