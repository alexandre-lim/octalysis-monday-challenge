import { format, subDays, getUnixTime } from 'date-fns';

function getDateFromTwoWeeksAgo() {
  const todayDate = new Date();
  const TWO_WEEKS_DAY = 14;
  const twoWeeksAgoDate = subDays(todayDate, TWO_WEEKS_DAY);
  const twoWeeksAgoTimestamp = getUnixTime(twoWeeksAgoDate);
  const intervalDate = `${format(twoWeeksAgoDate, 'MM/dd/yyyy')} - ${format(todayDate, 'MM/dd/yyyy')}`;

  return {
    intervalDate,
    twoWeeksAgoTimestamp,
  };
}

export { getDateFromTwoWeeksAgo };
