import dayjs from 'dayjs';

export default (time: Date | string) => {
	return dayjs(time).format("MMM D, YYYY")
}