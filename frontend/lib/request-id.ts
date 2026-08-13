function createRequestId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `client-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getClientRequestId() {
  if (typeof window === "undefined") return createRequestId();
  const key = "nini_client_request_id";
  const existing = window.sessionStorage.getItem(key);
  if (existing) return existing;
  const requestId = createRequestId();
  window.sessionStorage.setItem(key, requestId);
  return requestId;
}
