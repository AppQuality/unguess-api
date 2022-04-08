import crypto from "crypto";
import axios from "axios";

//Return Gravatar Picture or boolean if 404
export const getGravatar = async (email: string) => {
  const hash = crypto.createHash("md5").update(email).digest("hex");

  // Make a request for a user with a given ID
  try {
    const { status } = await axios.get(
      `https://www.gravatar.com/avatar/${hash}?d=404`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    return status === 200 ? `https://www.gravatar.com/avatar/${hash}` : false;
  } catch (error) {
    return false;
  }
};
