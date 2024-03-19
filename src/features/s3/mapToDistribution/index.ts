function mapToDistribution(url: string) {
  if (url.includes("mediaconvert-encoder-staging-bucket")) {
    return url.replace(
      "https://s3-eu-west-1.amazonaws.com/mediaconvert-encoder-staging-bucket",
      "https://media-processed.dev.tryber.me"
    );
  }
  if (url.includes("mediaconvert-encoder-production-bucket")) {
    return url.replace(
      "https://s3-eu-west-1.amazonaws.com/mediaconvert-encoder-production-bucket",
      "https://media-processed.tryber.me"
    );
  }

  if (url.includes("mediaconvert-encoder-production-bucket-origin")) {
    return url.replace(
      "https://s3-eu-west-1.amazonaws.com/mediaconvert-encoder-production-bucket-origin",
      "https://media-origin.tryber.me"
    );
  }

  if (url.includes("mediaconvert-encoder-staging-bucket-origin")) {
    return url.replace(
      "https://s3-eu-west-1.amazonaws.com/mediaconvert-encoder-staging-bucket-origin",
      "https://media-origin.dev.tryber.me"
    );
  }

  return url;
}

export { mapToDistribution };
