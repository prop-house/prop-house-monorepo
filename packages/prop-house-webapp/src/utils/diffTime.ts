import dayjs from 'dayjs';

const diffTime = (time: Date | string | number) => {
	if (typeof time === 'number') {
		return dayjs.unix(time).fromNow();
	}
	return dayjs(time).fromNow()
}

export default diffTime;
