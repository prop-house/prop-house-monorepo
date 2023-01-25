// Checks if a string contains an image tag

const inputHasImage = (field: string) => {
  const imgRegex = /<img[^>]+src="([^">]+)"/;
  const match = imgRegex.exec(field);

  return match ? true : false;
};

export default inputHasImage;
