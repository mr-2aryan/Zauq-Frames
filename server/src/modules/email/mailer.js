import fs from 'node:fs/promises';
import path from 'node:path';
import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';

/** SMTP, when it's set up (SMTP_HOST); otherwise emails go to the outbox folder. */
const transport = env.mail.host
  ? nodemailer.createTransport({
      host: env.mail.host,
      port: env.mail.port,
      secure: env.mail.secure,
      ...(env.mail.user ? { auth: { user: env.mail.user, pass: env.mail.pass } } : {}),
    })
  : null;

let warned = false;

/**
 * Sends one email. Without SMTP it is written to server/outbox/ as an .html
 * file you can open in a browser (in development), so templates can be checked
 * without sending anything.
 * @param {{ to: string, subject: string, html: string, text: string, tag: string }} message
 */
export async function sendMail({ to, subject, html, text, tag }) {
  if (transport) {
    await transport.sendMail({ from: env.mail.from, replyTo: env.mail.replyTo, to, ...(env.mail.bcc ? { bcc: env.mail.bcc } : {}), subject, html, text });
    return { sent: true };
  }
  if (env.isProduction) {
    if (!warned) console.warn('Email is not set up (SMTP_HOST), so order emails are not being sent.');
    warned = true;
    return { sent: false };
  }
  await fs.mkdir(env.outboxDir, { recursive: true });
  const file = path.join(env.outboxDir, `${new Date().toISOString().replace(/[:.]/g, '-')}-${tag}.html`);
  await fs.writeFile(file, html, 'utf8');
  console.log(`Email "${subject}" (to ${to}) saved to outbox/${path.basename(file)} — SMTP is not set up.`);
  return { sent: false, file };
}
