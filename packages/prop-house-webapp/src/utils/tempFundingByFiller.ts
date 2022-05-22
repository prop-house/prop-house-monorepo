/**
 * Temp fix for populating "funded by" in profile headers.
 */
export const tempFundedBy = (contractAddress: string): string => {
  switch (contractAddress.toLocaleLowerCase()) {
    // lilnouns
    case '0x4b10701bfd7bfedc47d50562b76b436fbb5bdb3b'.toLocaleLowerCase():
      return 'Nouns DAO & Lil Nouns DAO';
    // zora
    case '0xca21d4228cdcc68d4e23807e5e370c07577dd152'.toLocaleLowerCase():
      return 'Nouns DAO & Zora';
    // default
    default:
      return 'Nouns DAO';
  }
};
