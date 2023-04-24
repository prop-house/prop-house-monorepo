import dayjs from 'dayjs';

const formatTime = (time: Date | string | number) => {
  if (typeof time === 'number') {
    return dayjs.unix(time).format('MMM D, YYYY');
  }
  return dayjs(time).format('MMM D, YYYY');
};

export default formatTime;
