import { send } from "@src/features/mail/send";
import * as db from "@src/features/db";

export const sendTemplate = async ({
  email,
  subject,
  template,
  optionalFields,
}: {
  email: string;
  subject: string;
  template: string;
  optionalFields?: { [key: string]: any };
}) => {
  const mailTemplate = await db.query(
    db.format(
      `SELECT 
        t.html_body 
      FROM wp_appq_unlayer_mail_template t
      JOIN wp_appq_event_transactional_mail e ON (e.template_id = t.id)
      WHERE e.event_name = ?`,
      [template]
    )
  );

  if (!mailTemplate.length) return;

  let templateHtml = mailTemplate[0].html_body;

  if (optionalFields) {
    for (const key in optionalFields) {
      if (templateHtml.includes(key)) {
        templateHtml = templateHtml.replace(
          key,
          optionalFields[key as keyof typeof optionalFields]
        );
      }
    }
  }

  send({
    to: email,
    subject,
    html: templateHtml,
  });
};
