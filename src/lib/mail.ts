import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendResetCode(email: string, code: string) {
  await resend.emails.send({
    from: "VIZION Store <onboarding@resend.dev>",
    to: email,
    subject: "Código de recuperação de senha — VIZION",
    html: `
      <div style="font-family:Arial,sans-serif;background:#0a0a0a;color:#fff;padding:40px 20px;text-align:center;">
        <h1 style="font-size:24px;margin-bottom:8px;">VIZION STORE</h1>
        <p style="color:#888;font-size:14px;margin-bottom:32px;">Recuperação de senha</p>
        <p style="color:#ccc;font-size:14px;margin-bottom:24px;">Use o código abaixo para redefinir sua senha:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#B6FF00;margin:24px 0;">${code}</div>
        <p style="color:#888;font-size:12px;margin-top:32px;">Este código expira em 15 minutos.</p>
        <p style="color:#666;font-size:12px;margin-top:8px;">Se você não solicitou a recuperação, ignore este e-mail.</p>
      </div>
    `,
  });
}
