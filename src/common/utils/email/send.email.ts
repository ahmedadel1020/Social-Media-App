import nodemailer from "nodemailer";
import { BadRequestException } from "../../exception/domain.exception";
import { APP_EMAIL, APP_NAME, APP_PASSWORD } from "../../../config";
import { EmailSubjectEnum } from "../../enum/email.enum";

export const userEmailKey = ({
  email,
  subject,
}: {
  email: string;
  subject: EmailSubjectEnum;
}): string => {
  return `User::${email}::${subject}::otp`;
};
export const userEmailTrialsKey = ({
  email,
  subject,
}: {
  email: string;
  subject: EmailSubjectEnum;
}): string => {
  return `${userEmailKey({ email, subject })}::Trials`;
};
// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: APP_EMAIL,
    pass: APP_PASSWORD,
  },
});

export const sendEmail = async ({
  to, // list of recipients
  cc,
  bcc,
  subject, // subject line
  text, // plain text body
  html, // HTML body
  attachments = [],
}: {
  to?: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: any[];
}) => {
  try {
    if (!to?.length && !cc?.length && !bcc?.length) {
      throw new BadRequestException("Missing email recipients");
    }
    if (!text?.length && !html?.length && !attachments?.length) {
      throw new BadRequestException("Missing email content");
    }
    const info = await transporter.sendMail({
      from: `"${APP_NAME}" <${APP_EMAIL}>`, // sender address
      to, // list of recipients
      cc,
      bcc,
      subject, // subject line
      text, // plain text body
      html, // HTML body
      attachments,
    });

    console.log("Message sent: %s", info.messageId);
    // Preview URL is only available when using an Ethereal test account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (err) {
    console.error("Error while sending mail:", err);
  }
};
