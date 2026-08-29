
const API = (() => {
  const base = () => window.VMH_CONFIG.apiUrl;
  async function get(action, params = {}) {
    const url = new URL(base());
    url.searchParams.set("action", action);
    Object.entries(params).forEach(([k,v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
    });
    const res = await fetch(url.toString(), {redirect:"follow", cache:"no-store"});
    const text = await res.text();
    try { return JSON.parse(text); } catch { throw new Error("The VMH API returned an invalid response."); }
  }
  async function post(action, payload = {}) {
    const body = new URLSearchParams();
    body.set("action", action);
    Object.entries(payload).forEach(([k,v]) => body.set(k, typeof v === "object" ? JSON.stringify(v) : String(v ?? "")));
    const res = await fetch(base(), {method:"POST", body, redirect:"follow"});
    const text = await res.text();
    try { return JSON.parse(text); } catch { throw new Error("The VMH API returned an invalid response."); }
  }
  return {get, post};
})();
window.VMH_API = API;
