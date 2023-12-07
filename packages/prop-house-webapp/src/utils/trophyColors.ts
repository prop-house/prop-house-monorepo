export const trophyColors = (place: 'first' | 'second' | 'third') => {
  switch (place) {
    case 'first':
      return 'F6A64E';
    case 'second':
      return 'C0C0C0';
    case 'third':
      return 'AC6700';
  }
};
