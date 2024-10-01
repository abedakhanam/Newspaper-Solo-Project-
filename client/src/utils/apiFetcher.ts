import { getCache, setCache } from "./cache";

async function fetchWithCache(url: string): Promise<any> {
  const cachedData = getCache(url);
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    setCache(url, data);
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

export { fetchWithCache };
