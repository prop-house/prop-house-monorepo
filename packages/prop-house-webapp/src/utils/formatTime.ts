import dayjs from 'dayjs';

const formatTime = (time: Date | string) => {
  return dayjs(time).format('MMM D, YYYY');
};

export default formatTime;
