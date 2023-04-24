import dayjs from 'dayjs';

const detailedTime = (time: Date | string | number) => {
	return dayjs(time).format("MMM D, YYYY h:mm:ss a")
}

export default detailedTime
