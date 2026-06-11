export const storage = {
  get:    (key)        => JSON.parse(localStorage.getItem(key) ?? "null"),
  set:    (key, value) => localStorage.setItem(key, JSON.stringify(value)),
  remove: (key)        => localStorage.removeItem(key),
  clear:  ()           => localStorage.clear(),
};
