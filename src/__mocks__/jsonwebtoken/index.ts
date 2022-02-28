export default {
  verify: (token: string, secret: string) => {
    if (token === "tester") {
      return {
        ID: 1,
        testerId: 1,
        role: "tester",
        permission: {},
        iat: new Date().getTime() + 24 * 60 * 60,
        exp: new Date().getTime() + 24 * 60 * 60,
      };
    }

    if (token === "admin") {
      return {
        ID: 1,
        testerId: 1,
        role: "administrator",
        permission: {
          admin: {
            appq_bug: true,
            appq_campaign_dashboard: true,
            appq_campaign: true,
            appq_course: true,
            appq_manual: true,
            appq_preview: true,
            appq_prospect: true,
            appq_task_dashboard: true,
            appq_task: true,
            appq_tester_selection: true,
            appq_mail_merge: true,
            appq_video_dashboard: true,
            appq_profile: true,
            appq_custom_user_field: true,
            appq_campaign_category: true,
            appq_quality_badge: true,
            appq_fiscal_profile: true,
            appq_message_center: true,
            appq_email_templates: true,
            appq_simple_editor: true,
            appq_token_handling: true,
          },
        },
        iat: new Date().getTime() + 24 * 60 * 60,
        exp: new Date().getTime() + 24 * 60 * 60,
      };
    }
  },
};
