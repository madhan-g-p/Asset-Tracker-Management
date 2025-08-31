// Format a JS Date to yyyy-mm-dd
exports.formatDate = (date) =>
  date ? date.toISOString().slice(0,10) : '';