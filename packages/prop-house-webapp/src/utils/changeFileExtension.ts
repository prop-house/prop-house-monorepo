/**
 * Change the file extension readability
 * @param fileName - File name to change
 * @returns Updated file name
 */
const changeFileExtension = (fileName: string): string => {
  switch (fileName) {
    case 'mpeg':
      return 'audio';
    case 'quicktime':
    case 'mp4':
    case 'avi':
      return 'video';
    case 'vnd.adobe.photoshop':
      return 'Photoshop';
    case 'vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return 'spreadsheet';
    case undefined:
      return 'unknown';
    default:
      return fileName.toUpperCase();
  }
};

export default changeFileExtension;
