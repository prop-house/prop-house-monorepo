/**
 * Returns an error message to denote which file types are not supported
 * @param fileTypes Array of file types
 * @returns String of invalid file types
 */
const getInvalidFileTypeMessage = (fileName: string[]): string => {
  let lastFileType;

  if (fileName.length > 3) {
    return 'there were several unsupported files';
  } else if (fileName.length > 1) {
    lastFileType = fileName.pop();
    return `${fileName.map(t => t).join(', ')}${
      lastFileType ? ` or ${lastFileType}` : ''
    } files are not supported`;
  } else if (fileName.length === 1) {
    return `${fileName[0]} files are not supported`;
  } else {
    return '';
  }
};

export default getInvalidFileTypeMessage;
