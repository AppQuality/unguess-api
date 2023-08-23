import axios from "axios";

export const checkUrl = async (url: string) => {
  try {
    const response = await axios.get(url, {
      headers: {
        Accept: "application/json",
      },
    });

    return (
      response !== undefined &&
      (response.status < 400 || response.status >= 500)
    );
  } catch (error) {
    return false;
  }
};
