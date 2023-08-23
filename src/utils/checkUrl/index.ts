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
      (response.status === 200 || response.status === 201)
    );
  } catch (error) {
    return false;
  }
};
