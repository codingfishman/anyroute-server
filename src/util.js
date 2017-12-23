/*
* format the date string
* @param date Date or timestamp
* @param formatter YYYYMMDDHHmmss
*/
module.exports.formatDate = function (date, formatter) {
  if (typeof date !== 'object') {
    date = new Date(date);
  }
  const transform = function (value) {
    return value < 10 ? '0' + value : value;
  };
  return formatter.replace(/^YYYY|MM|DD|hh|mm|ss/g, (match) => {
    switch (match) {
      case 'YYYY':
        return transform(date.getFullYear());
      case 'MM':
        return transform(date.getMonth() + 1);
      case 'mm':
        return transform(date.getMinutes());
      case 'DD':
        return transform(date.getDate());
      case 'hh':
        return transform(date.getHours());
      case 'ss':
        return transform(date.getSeconds());
      default:
        return ''
    }
  });
};

/**
* get a free port 
*/
module.exports.getFreePort = function () {
  return new Promise((resolve, reject) => {
    const server = require('net').createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, () => {
      const port = server.address().port;
      server.close(() => {
        resolve(port);
      });
    });
  });
}
