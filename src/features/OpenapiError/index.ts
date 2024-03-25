class OpenapiError extends Error {
  status_code: number;
  constructor(message: string | { message: string; status_code: number }) {
    if (typeof message === "string") {
      super(message);
      this.status_code = 500;
    } else {
      super(message.message);
      this.status_code = message.status_code;
    }
  }
}
export default OpenapiError;
