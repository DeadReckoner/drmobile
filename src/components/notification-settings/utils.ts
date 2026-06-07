export const parseTimeString = (time: string | undefined): Date => {
  const safe = time ?? '00:00';
  const [hours, minutes] = safe.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export const formatTimeToString = (date: Date): string => {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
};

export const formatTimeDisplay = (time: string | undefined): string => {
  const safe = time ?? '00:00';
  const [hours, minutes] = safe.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export const formatHourDisplay = (hour: number): string => {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHours = hour % 12 || 12;
  return `${displayHours}:00 ${period}`;
};
