import dayjs from 'dayjs';

const formatDateTime = (date: Date | string) => {
  // .tz() is a method from the dayjs-timezone plugin
  // .format('MM/DD/YYYY, hh:mm A') means "Month/Day/Year, Hour:Minute AM/PM"
  return dayjs(date).tz().format('MM/DD/YYYY, hh:mm A');
};

export default formatDateTime;
