const blacklist = {};

const addToBlacklist = (token, expirationTime) => {
  const expireAt = Date.now() + expirationTime * 1000; // Convert seconds to milliseconds
  blacklist[token] = expireAt;
};

const isBlacklisted = (token) => {
  return blacklist[token] && blacklist[token] > Date.now();
};

const cleanupBlacklist = () => {
  const now = Date.now();
  for (const token in blacklist) {
    if (blacklist[token] <= now) {
      delete blacklist[token];
    }
  }
};

// Cleanup every hour
setInterval(cleanupBlacklist, 3600 * 1000);

module.exports = {
  addToBlacklist,
  isBlacklisted,
};
