const moment = require('moment');

const sanitiseDate = (str) => {
  const momentFromDate = moment(str, 'YYYYMMDD');
  if (momentFromDate.isValid()) {
    return momentFromDate.format('DD/MM/YYYY');
  } else {
    return undefined;
  }
};

module.exports = sanitiseDate;
