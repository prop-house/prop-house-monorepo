/**
 * This will return the award emoji for the given place assuming the place is 1, 2, or 3.
 * @param place place number
 * @returns the award emoji for the place
 */
export const getAwardEmoji = (place: number) => {
  switch (place) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return place;
  }
};
