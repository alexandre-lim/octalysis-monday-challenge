export function getMongDb(req) {
  if (req) return req.db;
  return null;
}
