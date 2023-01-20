/**
 * Returns an error message to denote which file names are duplicates
 * @param fileName Array of file name
 * @returns String of duplicate file name
 */
const getDuplicateFileMessage = (fileName: string[]): string => {
  let lastFileName;

  if (fileName.length > 3) {
    return 'there were several duplicate files';
  } else if (fileName.length > 1) {
    lastFileName = fileName.pop();
    return `${fileName.map(t => t).join(', ')}${
      lastFileName ? ` and ${lastFileName}` : ''
    } are already in the queue`;
  } else if (fileName.length === 1) {
    return `${fileName[0]} is already in queue`;
  } else {
    return '';
  }
};

export default getDuplicateFileMessage;
