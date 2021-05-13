import {
  format,
  subDays,
  getUnixTime,
  endOfDay,
  endOfMonth,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfYear,
} from 'date-fns';

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

function getFormatTodayDate() {
  const todayDate = new Date();
  return {
    formattedDate: `${format(todayDate, 'MM/dd/yyyy')}`,
    timestamp: getUnixTime(todayDate),
  };
}

function getDayTimestampInterval(date) {
  const startDayTimestamp = getUnixTime(startOfDay(date));
  const endDayTimestamp = getUnixTime(endOfDay(date));

  return {
    startDayTimestamp,
    endDayTimestamp,
  };
}

function getMonthTimestampInterval(date) {
  const startMonthTimestamp = getUnixTime(startOfMonth(date));
  const endMonthTimestamp = getUnixTime(endOfMonth(date));

  return {
    startMonthTimestamp,
    endMonthTimestamp,
  };
}

function getYearTimestampInterval(date) {
  const startYearTimestamp = getUnixTime(startOfYear(date));
  const endYearTimestamp = getUnixTime(endOfYear(date));

  return {
    startYearTimestamp,
    endYearTimestamp,
  };
}

export {
  getDateFromTwoWeeksAgo,
  getFormatTodayDate,
  getDayTimestampInterval,
  getMonthTimestampInterval,
  getYearTimestampInterval,
};
