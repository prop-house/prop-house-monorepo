import dayjs from 'dayjs';

const diffTime = (time: Date | string) => {
	return dayjs(time).fromNow()
}

export default diffTime;
