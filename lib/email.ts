import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY não configurada. E-mail simulado:", subject);
    return { success: false, error: "Chave não configurada" };
  }

  try {
    const data = await resend.emails.send({
      from: "SurveyManager <onboarding@resend.dev>", // Utiliza o remetente de testes do Resend
      to,
      subject,
      html,
    });
    return { success: true, data };
  } catch (error: any) {
    console.error("Erro ao enviar e-mail:", error);
    return { success: false, error: error.message };
  }
}
