"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmailTemplate = exports.templates = void 0;
const email_enum_js_1 = require("../../enum/email.enum.js");
exports.templates = {
    [email_enum_js_1.EmailSubjectEnum.CONFIRM_EMAIL]: (data) => {
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f7; color: #51545e;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f7; width: 100%; margin: 0; padding: 40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 570px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: #4f46e5; padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">${data.title}</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 32px; text-align: center;">
              <p style="font-size: 16px; line-height: 1.5; color: #51545e; margin: 0 0 24px 0;">
                Thank you for registering! Please use the following code to confirm your email address:
              </p>

              <!-- Verification Code Box -->
              <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 6px; padding: 20px; display: inline-block; margin-bottom: 24px;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e293b;">${data.code}</span>
              </div>

              <p style="font-size: 14px; color: #64748b; margin: 0 0 8px 0;">
                This code will expire in <strong>10 minutes</strong>.
              </p>
              <p style="font-size: 14px; color: #94a3b8; margin: 0;">
                If you didn't request this email, you can safely ignore it.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
              <p style="margin: 0;">&copy; 2026 Your Company Name. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
    },
    [email_enum_js_1.EmailSubjectEnum.FORGOT_PASSWORD]: (data) => {
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f7; color: #51545e;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f7; width: 100%; margin: 0; padding: 40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 570px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: #4f46e5; padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">${data.title}</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 32px; text-align: center;">
              <p style="font-size: 16px; line-height: 1.5; color: #51545e; margin: 0 0 24px 0;">
                Thank you for registering! Please use the following code to confirm your email address:
              </p>

              <!-- Verification Code Box -->
              <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 6px; padding: 20px; display: inline-block; margin-bottom: 24px;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e293b;">${data.code}</span>
              </div>

              <p style="font-size: 14px; color: #64748b; margin: 0 0 8px 0;">
                This code will expire in <strong>10 minutes</strong>.
              </p>
              <p style="font-size: 14px; color: #94a3b8; margin: 0;">
                If you didn't request this email, you can safely ignore it.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
              <p style="margin: 0;">&copy; 2026 Your Company Name. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
    },
    [email_enum_js_1.EmailSubjectEnum.STEP_VERIFICATION]: (data) => {
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f7; color: #51545e;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f7; width: 100%; margin: 0; padding: 40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 570px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: #4f46e5; padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">${data.title}</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 32px; text-align: center;">
              <p style="font-size: 16px; line-height: 1.5; color: #51545e; margin: 0 0 24px 0;">
                Thank you for registering! Please use the following code to confirm your email address:
              </p>

              <!-- Verification Code Box -->
              <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 6px; padding: 20px; display: inline-block; margin-bottom: 24px;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e293b;">${data.code}</span>
              </div>

              <p style="font-size: 14px; color: #64748b; margin: 0 0 8px 0;">
                This code will expire in <strong>10 minutes</strong>.
              </p>
              <p style="font-size: 14px; color: #94a3b8; margin: 0;">
                If you didn't request this email, you can safely ignore it.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
              <p style="margin: 0;">&copy; 2026 Your Company Name. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
    },
};
const verifyEmailTemplate = (data) => {
    return exports.templates[data.subject](data);
};
exports.verifyEmailTemplate = verifyEmailTemplate;
