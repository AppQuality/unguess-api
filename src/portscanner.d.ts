declare module "portscanner" {
  export function checkPortStatus(
    port: number,
    host: string,
    callback: (error: any, status: "open" | "closed") => void
  ): void;
}
