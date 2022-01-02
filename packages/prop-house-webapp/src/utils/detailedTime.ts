import dayjs from 'dayjs';

const detailedTime = (time: Date | string) => {
	return dayjs(time).format("MMM D, YYYY h:mm:ss a")
}

export default detailedTime
