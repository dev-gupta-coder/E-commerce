import { storage } from "./storage";

const ACCESS_TOKEN_KEY = "accessToken";

export const getAccessToken  = ()      => storage.get(ACCESS_TOKEN_KEY);
export const setAccessToken  = (token) => storage.set(ACCESS_TOKEN_KEY, token);
export const clearAccessToken = ()     => storage.remove(ACCESS_TOKEN_KEY);

// export const parseJwt = (token) => {
//   try { return JSON.parse(atob(token.split(".")[1])); }
//   catch { return null; }
// };
// by codex chatgpt
export const parseJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

export const isTokenExpired = (token) => {
  const payload = parseJwt(token);
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000;
};
