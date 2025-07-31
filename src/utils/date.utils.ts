import dayjs from 'dayjs';

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

export const DateUtils = {
  daysBetween,
  createDate,
  formatDate,
};
