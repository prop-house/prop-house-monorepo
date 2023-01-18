// The file types we allow to be uploaded
const allowedFileTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/svg+xml',
  'image/gif',
  'video/quicktime',
];

/**
 * Checks if file is valid
 * @param file - File to check
 * @returns Boolean of whether file is valid
 */

const validFile = (file: File) => allowedFileTypes.includes(file.type);

export default validFile;
