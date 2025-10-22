const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8099";

export const buildApiUrl = (path: string): string => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export const getApiBaseUrl = (): string => API_BASE_URL;

export default API_BASE_URL;
