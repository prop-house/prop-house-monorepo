export const ParseDate = (str) => new Date(str);

export const tweetDate = (date: Date) => [date.toLocaleString('en-US', {timeZone: "America/New_York"}), "ET"].join(' ')
