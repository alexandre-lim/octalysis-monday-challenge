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
  isValid,
  isExists,
} from 'date-fns';

export const DATE_MODE = {
  DAY: 'day',
  MONTH: 'month',
  YEAR: 'year',
};

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

function getTimestampInterval(date, mode) {
  let startDateTimestamp = null;
  let endDateTimestamp = null;
  switch (mode) {
    case DATE_MODE.DAY: {
      ({ startDayTimestamp: startDateTimestamp, endDayTimestamp: endDateTimestamp } = getDayTimestampInterval(date));
      return {
        startDateTimestamp,
        endDateTimestamp,
      };
    }
    case DATE_MODE.MONTH:
      ({ startMonthTimestamp: startDateTimestamp, endMonthTimestamp: endDateTimestamp } = getMonthTimestampInterval(
        date
      ));
      return {
        startDateTimestamp,
        endDateTimestamp,
      };
    case DATE_MODE.YEAR:
      ({ startYearTimestamp: startDateTimestamp, endYearTimestamp: endDateTimestamp } = getYearTimestampInterval(date));
      return {
        startDateTimestamp,
        endDateTimestamp,
      };
    default:
      return {
        startDateTimestamp,
        endDateTimestamp,
      };
  }
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

function checkValidDate(date, year, month, day) {
  // Month start at 0
  if (day && day !== '') {
    return isValid(date) && isExists(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
  }
  return isValid(date);
}

export {
  getDateFromTwoWeeksAgo,
  getFormatTodayDate,
  getTimestampInterval,
  getDayTimestampInterval,
  getMonthTimestampInterval,
  getYearTimestampInterval,
  checkValidDate,
};
