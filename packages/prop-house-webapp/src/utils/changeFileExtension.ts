/**
 * Change the file extension readability
 * @param fileName - File name to change
 * @returns Updated file name
 */
const changeFileExtension = (fileName: string): string => {
  switch (fileName) {
    case 'mpeg':
      return 'MP3';
    case 'vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return 'Spreadsheet';
    case 'vnd.adobe.photoshop':
      return 'PSD';
    case undefined:
      return 'Unknown';
    default:
      return fileName.toUpperCase();
  }
};

export default changeFileExtension;
