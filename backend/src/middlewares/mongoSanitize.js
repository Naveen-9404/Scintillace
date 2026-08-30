const sanitize = (obj) => {
  if (obj instanceof Object) {
    for (const key in obj) {
      if (key.startsWith("$")) {
        delete obj[key];
      } else {
        sanitize(obj[key]);
      }
    }
  }
};

const mongoSanitize = (req, res, next) => {
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  next();
};

export default Object.freeze(mongoSanitize);
