const moment = require('moment');
console.log(moment.unix(1721907284))
exports.getTargetDate = (period, targetDateString, interval = 1) => {
  const today = moment();
  const targetDate = moment.unix(targetDateString);

  let resultDate;
  switch (period) {
    case 'daily':
      if (today.isSameOrAfter(targetDate, 'day')) {
        resultDate = today.clone().add(interval, 'day');
      } else {
        resultDate = today.clone().date(targetDate.date());
      }
      break;
    case 'weekly':
      const targetDayOfWeek = targetDate.day();
      if (today.day() >= targetDayOfWeek) {
        resultDate = today.clone().add(interval, 'week').day(targetDayOfWeek);
      } else {
        resultDate = today.clone().day(targetDayOfWeek);
      }
      break;
    case 'monthly':
      const targetDayOfMonth = targetDate.date();
      if (today.date() > targetDayOfMonth) {
        resultDate = today.clone().add(interval, 'month').date(targetDayOfMonth);
      } else {
        resultDate = today.clone().date(targetDayOfMonth);
      }
      break;
    case 'yearly':
      if (today.isAfter(targetDate, 'day')) {
        resultDate = targetDate.clone().add(interval, 'year');
      } else {
        resultDate = targetDate.clone();
      }
      break;
    default:
      throw new Error('Invalid interval type. Use "daily", "weekly", "monthly", or "yearly".');
  }

  return resultDate;
};