
const VMH_DATA = (() => {
  async function loadJson(path){ const r=await fetch(path,{cache:"no-store"}); if(!r.ok) throw new Error("Could not load site data."); return r.json(); }
  async function products(){
    try { const r=await VMH_API.get("products"); if(r.ok && Array.isArray(r.data)) return r.data; } catch(e){}
    return loadJson("/assets/data/products.json");
  }
  async function contributors(){
    try { const r=await VMH_API.get("contributors"); if(r.ok && Array.isArray(r.data)) return r.data; } catch(e){}
    return loadJson("/assets/data/contributors.json");
  }
  async function credits(){ return loadJson("/assets/data/credits.json"); }
  return {products,contributors,credits};
})();
window.VMH_DATA=VMH_DATA;
