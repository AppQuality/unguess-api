import portscanner from "portscanner";

export const getFirstAvailableIp = async (ip: number = 1): Promise<string> => {
  const ipString = `192.168.100.${ip}`;
  const isAvailable = await isIpAvailable(ipString);
  if (isAvailable) {
    return ipString;
  }
  if (ip + 1 > 255) {
    throw new Error("No available ip");
  }
  return getFirstAvailableIp(ip + 1);
};

const isIpAvailable = async (ip: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    portscanner.checkPortStatus(3306, ip, function (error, status) {
      if (status === "closed") {
        return resolve(true);
      }
      return resolve(false);
    });
  });
};
