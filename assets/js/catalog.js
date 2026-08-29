
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));}
function productCard(p){
  return `<article class="card">
    <a href="/book/?slug=${encodeURIComponent(p.slug)}"><img class="book-cover" loading="lazy" src="${esc(p.cover_url||"/assets/VMHLogo01.png")}" alt="Cover of ${esc(p.title)}"></a>
    <div class="card-body">
      <span class="badge">${esc(p.format_label||p.product_type)}</span>
      <h3><a href="/book/?slug=${encodeURIComponent(p.slug)}">${esc(p.title)}</a></h3>
      ${p.subtitle?`<p class="meta">${esc(p.subtitle)}</p>`:""}
      <p>${esc(p.short_description||"")}</p>
    </div>
  </article>`;
}
(async()=>{
  const root=document.querySelector("[data-product-grid]");
  if(!root)return;
  const products=(await VMH_DATA.products()).filter(p=>String(p.status).toLowerCase()==="active");
  root.innerHTML=products.map(productCard).join("");
})();
