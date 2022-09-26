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

const getFileType = (
  url: string
): StoplightComponents["schemas"]["Report"]["file_type"] => {
  // Get file url domain
  const urlDomain = getUrlDomain(url);

  // Get the file extension
  const fileExtension = getFileExtension(
    url
  ) as StoplightComponents["schemas"]["ReportExtensions"];

  // Get file type name
  const fileName = getFileTypeName(fileExtension);

  return {
    type: fileName,
    ...(fileExtension && { extension: fileExtension }),
    ...(urlDomain && { domain_name: urlDomain }),
  };
};

const getUrlDomain = (url: string): string | false => {
  const allowedDomains = [
    "google.com",
    "miro.com",
    "youtube.com",
    "figma.com",
    "dropbox.com",
    "mural.co",
    "iterspace.com",
    "tryber.me",
  ];
  const urlDomain = new URL(url).hostname.replace("www.", "");

  if (urlDomain) {
    return allowedDomains.includes(urlDomain) ? urlDomain : false;
  }

  return false;
};

const getFileExtension = (url: string): string | false => {
  // Allowed file types
  const allowedFileTypes = [
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
    "txt",
    "csv",
    "rar",
    "zip",
    "gzip",
    "gz",
    "7z",
  ];

  const fileExtension = url.split(".").pop()?.toLowerCase();
  if (fileExtension && allowedFileTypes.includes(fileExtension)) {
    return fileExtension;
  }

  return false;
};

const getFileTypeName = (extension: string): string => {
  switch (extension) {
    case "pdf":
      return "pdf";
    case "doc":
    case "docx":
      return "document";
    case "xls":
    case "xlsx":
      return "spreadsheet";
    case "ppt":
    case "pptx":
      return "presentation";
    case "txt":
      return "text";
    case "csv":
      return "csv";
    case "rar":
    case "zip":
    case "gzip":
    case "gz":
    case "7z":
      return "archive";
    default:
      return "link";
  }
};
