export const isInternal = (email: string) => {
  if (!email) return false;

  const domain = email.split("@")[1];

  if (!domain) return false;

  const acceptableDomains = ["unguess.io", "app-quality.com", "tryber.me"];

  return acceptableDomains.includes(domain);
};
