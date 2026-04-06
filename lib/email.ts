import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendOtpEmail(to: string, code: string): Promise<void> {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: 'Din bekræftelseskode - Fuhrmanns',
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
        <h2 style="margin-bottom: 16px;">Din bekræftelseskode</h2>
        <p>Brug denne kode til at se status på din bestilling:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px;
                    text-align: center; padding: 20px; background: #f4f4f5;
                    border-radius: 8px; margin: 16px 0;">
          ${code}
        </div>
        <p style="color: #71717a; font-size: 14px;">
          Koden udløber om 10 minutter. Hvis du ikke har anmodet om denne kode,
          kan du ignorere denne email.
        </p>
        <p style="color: #71717a; font-size: 12px;">Fuhrmanns Brudekjoler</p>
      </div>
    `,
  })
}
