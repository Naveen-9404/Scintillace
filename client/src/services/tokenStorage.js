const ACCESS_TOKEN_KEY =
  "scintillace_access_token";

const getAccessToken = () => {
  return localStorage.getItem(
    ACCESS_TOKEN_KEY,
  );
};

const setAccessToken = (token) => {
  if (
    typeof token !== "string" ||
    !token.trim()
  ) {
    return;
  }

  localStorage.setItem(
    ACCESS_TOKEN_KEY,
    token,
  );
};

const clearAccessToken = () => {
  localStorage.removeItem(
    ACCESS_TOKEN_KEY,
  );
};

const tokenStorage =
  Object.freeze({
    getAccessToken,
    setAccessToken,
    clearAccessToken,
  });

export {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
};

export default tokenStorage;