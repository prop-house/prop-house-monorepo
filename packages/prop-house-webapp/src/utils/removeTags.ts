const removeTags = (str: string) => str.replace(/(<([^>]+)>)/gi, "");

export default removeTags;
