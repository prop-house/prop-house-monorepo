// The file types we allow to be uploaded
const allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/gif'];

/**
 * Checks if file is valid
 * @param file - File to check
 * @returns Boolean of whether file is valid
 */

const validFileType = (file: File) => allowedFileTypes.includes(file.type);

export default validFileType;
