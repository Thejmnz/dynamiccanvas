import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { feedbackPosts, feedbackSubscriptions, users } from "@/db/schema";

type FeedbackEmailEvent =
  | { type: "comment"; message: string }
  | { type: "status"; value: string }
  | { type: "moderation"; value: string };

const escapeHtml = (value: string) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const statusNames: Record<string, string> = {
  open: "Recibida",
  planned: "Planeada",
  in_progress: "En progreso",
  completed: "Completada",
  declined: "No planeada",
  approved: "Aprobada",
  rejected: "Rechazada",
  pending: "Pendiente",
};

export async function sendFeedbackNotification(
  feedbackId: string,
  actorId: string,
  actorName: string,
  event: FeedbackEmailEvent,
) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  try {
    const [[post], subscribers] = await Promise.all([
      db.select({ title: feedbackPosts.title }).from(feedbackPosts).where(eq(feedbackPosts.id, feedbackId)),
      db
        .select({ userId: users.id, email: users.email, name: users.name })
        .from(feedbackSubscriptions)
        .innerJoin(users, eq(feedbackSubscriptions.userId, users.id))
        .where(eq(feedbackSubscriptions.feedbackId, feedbackId)),
    ]);
    if (!post) return;

    const recipients = subscribers.filter((subscriber) => subscriber.userId !== actorId && subscriber.email).slice(0, 50);
    if (recipients.length === 0) return;

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")).replace(/\/$/, "");
    const postUrl = `${appUrl}/feedback?post=${encodeURIComponent(feedbackId)}`;
    const from = process.env.FEEDBACK_EMAIL_FROM || "Dynamic Canvas <notifications@dynamiccanvas.app>";
    const actor = escapeHtml(actorName || "El equipo de Dynamic Canvas");
    const title = escapeHtml(post.title);
    const eventText = event.type === "comment"
      ? `${actor} agregó un nuevo comentario.`
      : event.type === "status"
        ? `${actor} cambió el estado a <strong>${escapeHtml(statusNames[event.value] || event.value)}</strong>.`
        : `${actor} cambió la moderación a <strong>${escapeHtml(statusNames[event.value] || event.value)}</strong>.`;
    const preview = event.type === "comment"
      ? `<div style="margin:18px 0 0;padding:16px;border:1px solid #e8e5f2;border-radius:14px;background:#f8f7fc;color:#454b60;line-height:1.65">${escapeHtml(event.message).replaceAll("\n", "<br>")}</div>`
      : "";
    const subject = event.type === "comment"
      ? `Nuevo comentario: ${post.title}`
      : `Actualización: ${post.title}`;

    await Promise.allSettled(recipients.map(async (recipient) => {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "User-Agent": "DynamicCanvas/1.0",
        },
        body: JSON.stringify({
          from,
          to: [recipient.email],
          subject,
          html: `
            <div style="margin:0;background:#f5f6fb;padding:36px 14px;font-family:Inter,Arial,sans-serif;color:#101426">
              <div style="max-width:600px;margin:0 auto;border:1px solid #e8e5f2;border-radius:22px;background:#ffffff;overflow:hidden">
                <div style="padding:24px 28px;border-bottom:1px solid #eeeef4">
                  <img src="${appUrl}/logo-512.png" width="42" height="42" alt="Dynamic Canvas" style="display:block;border-radius:11px" />
                </div>
                <div style="padding:30px 28px">
                  <p style="margin:0 0 8px;color:#6a43dc;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.12em">Feedback actualizado</p>
                  <h1 style="margin:0;font-size:25px;line-height:1.2">${title}</h1>
                  <p style="margin:18px 0 0;color:#596174;font-size:15px;line-height:1.65">${eventText}</p>
                  ${preview}
                  <a href="${postUrl}" style="display:inline-block;margin-top:24px;padding:13px 18px;border-radius:11px;background:#5b35d5;color:#fff;text-decoration:none;font-size:14px;font-weight:800">Ver conversación</a>
                </div>
                <div style="padding:18px 28px;background:#fafafe;color:#8a8f9e;font-size:11px;line-height:1.6">Recibes este correo porque sigues esta idea. Puedes dejar de seguirla desde el panel de feedback.</div>
              </div>
            </div>`,
        }),
      });
      if (!response.ok) console.error("[Feedback email] Resend rejected notification:", response.status, await response.text());
    }));
  } catch (error) {
    console.error("[Feedback email] Could not send notification:", error);
  }
}
