import dayjs from 'dayjs';

const formatDateTime = (date: Date | string) => dayjs(date).tz().format('MM/DD/YYYY, hh:mm A');

export default formatDateTime;
