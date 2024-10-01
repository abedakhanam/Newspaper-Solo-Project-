interface CacheObj {
  [key: string]: {
    data: any;
    timestamp: number;
  };
}

let cache: CacheObj = {};

function setCache(key: string, value: any) {
  cache[key] = {
    data: value,
    timestamp: Date.now(),
  };
}

const validity = 60 * 60 * 1000; // 1hour
function getCache(key: string) {
  const cachedItem = cache[key];
  if (!cachedItem) return null;
  const now = Date.now();
  if (now - cachedItem.timestamp > validity) {
    delete cache[key];
    return null;
  }
  return cachedItem.data;
}

export { getCache, setCache };
