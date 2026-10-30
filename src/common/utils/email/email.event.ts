import { EventEmitter } from "node:events";
import { sendEmail } from "./send.email";
import { verifyEmailTemplate } from "./email.template";
import { EmailSubjectEnum } from "../../enum/email.enum";

export const emailEvent = new EventEmitter();

emailEvent.on(
  "sendEmail",
  async ({
    recipients,
    subject = EmailSubjectEnum.CONFIRM_EMAIL,
    data,
  }: {
    subject?: EmailSubjectEnum;
    data: any;
    recipients: { to?: string[]; cc?: string[]; bcc?: string[] };
  }) => {
    try {
      await sendEmail({
        ...recipients,
        subject,
        html: verifyEmailTemplate({
          code: data.code,
          subject,
          title: data.title,
        }),
      });
    } catch (error) {
      console.log(error);
    }
  },
);
