import dayjs from 'dayjs';

/**
 * Formats dayjs().fromNow() to a shorter version. eg '20 minutes ago' -> '20m'
 */
export const shortFromNow = (timestamp: number) => {
  return dayjs(timestamp)
    .fromNow()
    .replace(/\b(\d+)\s+minutes?\s+ago\b/g, '$1m')
    .replace(/\ban\s+hour\s+ago\b/g, '1h')
    .replace(/\b(\d+)\s+hours?\s+ago\b/g, '$1h')
    .replace(/\b(\d+)\s+days?\s+ago\b/g, '$1d')
    .replace(/\b(\d+)\s+weeks?\s+ago\b/g, '$1w')
    .replace(/\b(\d+)\s+months?\s+ago\b/g, '$1mo')
    .replace(/\b(\d+)\s+years?\s+ago\b/g, '$1y');
};
