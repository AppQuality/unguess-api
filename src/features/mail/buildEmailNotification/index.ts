interface iNotification {
  notification_type:
    | "BUG_APPROVED"
    | "CP_CLOSED"
    | "BUG_COMMENT"
    | "BUG_COMMENT_MENTION";
  entity_name: string;
  entity_id: string;
}

interface iEmailNotification extends iNotification {
  channel: "email";
  data: {
    from: {
      name: string;
      email: string;
    };
    subject: string;
    html: string;
    to: {
      id?: number;
      name: string;
      email: string;
      notify?: boolean;
    }[];
    cc: {
      name: string;
      email: string;
      notify?: boolean;
    }[];
  };
}

export const buildNotificationEmail = ({
  entity_id,
  entity_name,
  subject,
  html,
  to,
  cc,
  notification_type,
}: {
  entity_id: string;
  entity_name: string;
  subject: string;
  html: string;
  to: {
    id?: number;
    name: string;
    email: string;
    notify?: boolean;
  }[];
  cc: {
    name: string;
    email: string;
    notify?: boolean;
  }[];
  notification_type: iNotification["notification_type"];
}): iEmailNotification => ({
  entity_id,
  entity_name,
  channel: "email" as const,
  notification_type,
  data: {
    from: {
      name: process.env.DEFAULT_SENDER_NAME || "UNGUESS",
      email: process.env.DEFAULT_SENDER_MAIL || "info@unguess.io",
    },
    to,
    cc,
    subject,
    html,
  },
});
