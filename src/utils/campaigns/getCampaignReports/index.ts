import * as db from "@src/features/db";

export const getCampaignReports = async (
  cp_id: number
): Promise<StoplightComponents["schemas"]["Report"][] | false> => {
  const results = await db.query(
    db.format(`SELECT * FROM wp_appq_report WHERE campaign_id = ?`, [cp_id])
  );

  // Filter and map reports
  const reports = results.reduce(
    (
      acc: StoplightComponents["schemas"]["Report"][],
      report: StoplightComponents["schemas"]["Report"]
    ) => {
      if (report.url) {
        // Get the file type
        const file_type = getFileType(report.url);

        acc.push({
          id: report.id,
          title: report.title,
          description: report.description,
          url: report.url,
          creation_date: report.creation_date,
          ...(report.update_date && {
            update_date: report.update_date,
          }),
          ...(file_type && { file_type }),
        });
      }
      return acc;
    },
    []
  );

  return reports ?? false;
};

const getFileType = (url: string): string | false => {
  // Allowed file types
  const allowed_file_types = [
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
    "rar",
    "txt",
    "csv",
    "zip",
    "gzip",
    "gz",
    "7z",
  ];

  // Get the file extension
  const file_extension = url.split(".").pop();

  // Check if the file extension is allowed
  if (file_extension && allowed_file_types.includes(file_extension)) {
    return file_extension;
  }

  return false;
};
