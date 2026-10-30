"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailEvent = void 0;
const node_events_1 = require("node:events");
const send_email_1 = require("./send.email");
const email_template_1 = require("./email.template");
const email_enum_1 = require("../../enum/email.enum");
exports.emailEvent = new node_events_1.EventEmitter();
exports.emailEvent.on("sendEmail", async ({ recipients, subject = email_enum_1.EmailSubjectEnum.CONFIRM_EMAIL, data, }) => {
    try {
        await (0, send_email_1.sendEmail)({
            ...recipients,
            subject,
            html: (0, email_template_1.verifyEmailTemplate)({
                code: data.code,
                subject,
                title: data.title,
            }),
        });
    }
    catch (error) {
        console.log(error);
    }
});
