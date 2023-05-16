const createUploadMessage = (
  uniqueCount: number,
  duplicateCount: number,
  invalidCount: number,
): string => {
  // if there are no unique users, but there are duplicates and/or invalid addresses, return an error message
  if (uniqueCount === 0 && (duplicateCount > 0 || invalidCount > 0)) {
    let errorMessage = '';
    if (duplicateCount > 0) {
      errorMessage += `Found ${duplicateCount} duplicate${duplicateCount === 1 ? '' : 's'}. `;
    }
    if (invalidCount > 0) {
      errorMessage += `Found ${invalidCount} invalid address${invalidCount === 1 ? '' : 'es'}. `;
    }
    errorMessage += 'None were uploaded.';
    return errorMessage;
  }

  // Construct the first part of the message based on the number of unique users
  let message = `Successfully uploaded ${uniqueCount} ${uniqueCount === 1 ? 'user' : 'users'}.`;

  // Prepare the additional message for duplicates and invalid addresses
  let additionalMessage = '';

  // Add a message about duplicates if there are any
  if (duplicateCount > 0 && invalidCount > 0) {
    additionalMessage += `Found ${duplicateCount} duplicate and ${invalidCount} invalid ${
      invalidCount ? 'address' : 'addresses'
    } which were not uploaded.`;
  } else if (duplicateCount > 0) {
    additionalMessage += `Found ${duplicateCount} duplicate ${
      duplicateCount === 1 ? 'address' : 'addresses'
    } which ${duplicateCount === 1 ? 'was' : 'were'} not uploaded.`;
  } else if (invalidCount > 0) {
    additionalMessage += `Found ${invalidCount} invalid ${
      invalidCount === 1 ? 'address' : 'addresses'
    } which ${invalidCount === 1 ? 'was' : 'were'} not uploaded.`;
  }

  return additionalMessage ? `${message} ${additionalMessage}` : message;
};

export default createUploadMessage;
