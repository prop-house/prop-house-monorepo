import dayjs from 'dayjs';

export const getDayDifference = (date1: Date, date2: Date) => dayjs(date1).diff(dayjs(date2), 'd');
