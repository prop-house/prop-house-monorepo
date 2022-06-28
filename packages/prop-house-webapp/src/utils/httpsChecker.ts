/**
 * Add https:// to url string if not there or if http://
 */
const httpsChecker = (link: string) => {
  const urlPattern = new RegExp(
    /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/
  );

  if (urlPattern.test(link)) {
    link = link.replace("https://", "").replace("http://", "");

    link = `https://${link}`;
  }

  return link;
};

export default httpsChecker;
