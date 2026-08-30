import env from "./env.js";

const getOrigin = (value) => {
  try {
    return new URL(value).origin;
  } catch {
    return "";
  }
};

const clientOrigin =
  getOrigin(env.clientUrl);

const isTrustedClientOrigin = (
  origin,
) =>
  Boolean(clientOrigin) &&
  getOrigin(origin) === clientOrigin;

const corsConfig = Object.freeze({
  origin(origin, callback) {
    if (
      origin &&
      isTrustedClientOrigin(origin)
    ) {
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
  ],
});

export {
  isTrustedClientOrigin,
};

export default corsConfig;
