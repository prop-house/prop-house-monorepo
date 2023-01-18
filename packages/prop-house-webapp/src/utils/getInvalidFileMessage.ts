/**
 * Returns an error message to denote which file types are not supported
 * @param fileTypes Array of file types
 * @returns String of invalid file types
 */
const getInvalidFileMessage = (fileTypes: string[]): string => {
  let lastFileType;

  if (fileTypes.length > 1) {
    lastFileType = fileTypes.pop();
    return `${fileTypes.map(t => t).join(', ')}${
      lastFileType ? ` or ${lastFileType}` : ''
    } files are not supported`;
  } else if (fileTypes.length === 1) {
    return `${fileTypes[0]} files are not supported`;
  } else {
    return '';
  }
};

export default getInvalidFileMessage;
