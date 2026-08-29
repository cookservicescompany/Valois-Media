
function e(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));}
(async()=>{
  const root=document.querySelector("#product-detail"); if(!root)return;
  const slug=new URLSearchParams(location.search).get("slug");
  const [products,contributors,credits]=await Promise.all([VMH_DATA.products(),VMH_DATA.contributors(),VMH_DATA.credits()]);
  const p=products.find(x=>x.slug===slug);
  if(!p){root.innerHTML="<h1>Book not found</h1><p>The requested title is unavailable.</p>";return;}
  document.title=p.seo_title||`${p.title} | Valois Media`;
  const byId=Object.fromEntries(contributors.map(x=>[x.contributor_id,x]));
  const pc=credits.filter(x=>x.product_id===p.product_id && String(x.active).toLowerCase()!=="false").sort((a,b)=>Number(a.credit_order)-Number(b.credit_order));
  const creditHtml=pc.map(c=>{const person=byId[c.contributor_id];return person?`<span>${e(c.display_label)} <a href="/contributor/?slug=${encodeURIComponent(person.slug)}">${e(person.display_name)}</a></span>`:""}).join(" · ");
  let features=[]; try{features=JSON.parse(p.features_json||"[]")}catch{}
  root.innerHTML=`<div class="product-page">
    <div><img class="book-cover" src="${e(p.cover_url||"/assets/VMHLogo01.png")}" alt="Cover of ${e(p.title)}"></div>
    <article>
      <span class="badge">${e(p.format_label||p.product_type)}</span>
      <h1>${e(p.title)}</h1>
      ${p.subtitle?`<p class="lede">${e(p.subtitle)}</p>`:""}
      <div class="credit-list">${creditHtml}</div>
      <p class="lede">${e(p.short_description||"")}</p>
      ${features.length?`<ul class="features">${features.map(x=>`<li>${e(x)}</li>`).join("")}</ul>`:""}
      <div class="purchase-panel">
        <h2>Purchase</h2>
        <div id="paypal-host" class="paypal-host"></div>
        <div class="retail-links">
          ${p.amazon_url?`<a class="button secondary" target="_blank" rel="noopener" href="${e(p.amazon_url)}">Buy on Amazon</a>`:""}
          ${p.barnes_noble_url?`<a class="button secondary" target="_blank" rel="noopener" href="${e(p.barnes_noble_url)}">Buy at Barnes & Noble</a>`:""}
        </div>
      </div>
      <div class="prose"><h2>About this edition</h2><p>${e(p.description||"")}</p></div>
    </article>
  </div>`;
  const host=document.querySelector("#paypal-host");
  try{
    const rendered=await VMH_PAYPAL.renderForSlug(p.slug,host);
    if(!rendered) host.remove();
  }catch(err){host.innerHTML=`<p class="notice error">${e(err.message)}</p>`;}
})();
