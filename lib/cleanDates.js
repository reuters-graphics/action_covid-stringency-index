const moment = require('moment');

module.exports = (str) => {
  const momentFromDate = moment(str, 'YYYYMMDD');
  if (momentFromDate.isValid()) {
    return momentFromDate.format('DD/MM/YYYY');
  } else {
    return undefined;
  }
};
