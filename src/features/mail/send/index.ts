import sgMail from "@sendgrid/mail";

import config from "@src/config";

sgMail.setApiKey(config.sendgrid.key);

export const send = async ({
  to,
  from,
  subject,
  html,
  categories,
}: {
  to: string | string[];
  from?: string | { name: string; email: string };
  subject: string;
  html: string;
  categories?: string[];
}) => {
  if (!from) {
    from = config.sendgrid.default_sender;
  }

  const categoriesList = [
    config.sendgrid.default_category,
    ...(categories ?? []),
  ];
  const msg = {
    to,
    from,
    subject,
    html,
    categories: categoriesList ?? categories,
  };

  try {
    const d = await sgMail.sendMultiple(msg);
    return d;
  } catch (err) {
    console.log(err);
    if ((err as any).response) {
      console.error((err as any).response.body);
    }
  }
};
