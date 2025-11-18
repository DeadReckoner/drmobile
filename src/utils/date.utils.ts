import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

type AppDate = string | dayjs.Dayjs | Date;

const daysBetween = (start: AppDate, end: AppDate): number => {
  return Math.abs(
    dayjs(end).startOf('day').diff(dayjs(start).startOf('day'), 'days'),
  );
};

const createDate = (date?: AppDate) => {
  return date ? dayjs(date) : dayjs();
};

const formatDate = (date: AppDate, format: string = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format);
};

const formatRelativeTime = (date: AppDate): string => {
  const dateObj = dayjs(date);
  const now = dayjs();
  const startOfToday = now.startOf('day');
  const startOfYesterday = startOfToday.subtract(1, 'day');
  const startOfWeek = now.startOf('week');

  if (dateObj.isSame(startOfToday, 'day')) {
    return dateObj.format('h:mm A');
  }

  if (dateObj.isSame(startOfYesterday, 'day')) {
    return 'Yesterday';
  }

  if (dateObj.isAfter(startOfWeek) && dateObj.isBefore(startOfToday)) {
    return dateObj.format('dddd');
  }

  return dateObj.format('MM/DD/YYYY');
};

export const DateUtils = {
  daysBetween,
  createDate,
  formatDate,
  formatRelativeTime,
};
