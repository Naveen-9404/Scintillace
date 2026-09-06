import env from "./env.js";

const getOrigin = (value) => {
  try {
    return new URL(value).origin;
  } catch {
    return "";
  }
};

const clientOrigins = env.clientUrl
  ? env.clientUrl.split(",").map(url => getOrigin(url.trim())).filter(Boolean)
  : [];

const isTrustedClientOrigin = (origin) => {
  const originStr = getOrigin(origin);
  return Boolean(originStr) && clientOrigins.includes(originStr);
};

const corsConfig = Object.freeze({
  origin(origin, callback) {
    if (origin && isTrustedClientOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(null, false);
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Guest-Token",
    "X-Accommodation-Token",
  ],
});

export {
  isTrustedClientOrigin,
};

export default corsConfig;
