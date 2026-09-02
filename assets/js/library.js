(async()=>{
  const root=document.querySelector('#library');if(!root)return;
  const safe=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  if(!VMH_AUTH.token){root.innerHTML='<p class="notice">Sign in to view your library. <a href="/account/">Go to account</a>.</p>';return;}
  try{
    const r=await VMH_API.post('account',{token:VMH_AUTH.token});
    if(!r.ok)throw new Error(r.error||'Your library could not be loaded.');
    const library=r.data?.library||[];
    if(!library.length){root.innerHTML='<p class="notice">Your library is empty. <a href="/books/">Browse books</a> or <a href="/account/">reconcile an existing purchase</a>.</p>';return;}
    root.innerHTML=`<div class="product-grid grid">${library.map(x=>`<article class="card"><img class="book-cover" src="${safe(x.cover_url||'/assets/VMHLogo01.png')}" alt=""><div class="card-body"><h3>${safe(x.title)}</h3><p class="meta">${safe(x.reading_progress||0)}% complete</p>${x.reader_url?`<a class="button" href="${safe(x.reader_url)}">Read Online</a>`:''}${x.download_url?` <a class="button secondary" href="${safe(x.download_url)}">Download</a>`:''}</div></article>`).join('')}</div>`;
  }catch(err){root.innerHTML=`<p class="notice error">${safe(err.message||'Your library could not be loaded.')}</p>`;}
})();
