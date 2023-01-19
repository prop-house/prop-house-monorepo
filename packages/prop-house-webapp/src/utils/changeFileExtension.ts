/**
 * Change the file extension readability
 * @param fileName - File name to change
 * @returns Updated file name
 */
const changeFileExtension = (fileName: string): string => {
  switch (fileName) {
    case 'mpeg':
      return 'Audio';
    case 'quicktime':
    case 'mp4':
    case 'avi':
      return 'Video';
    case 'vnd.adobe.photoshop':
      return 'Photoshop';
    case 'vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return 'Spreadsheet';
    case undefined:
      return 'Unknown';
    default:
      return fileName.toUpperCase();
  }
};

export default changeFileExtension;
