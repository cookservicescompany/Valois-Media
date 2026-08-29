
(async()=>{
 const root=document.querySelector("#library");if(!root)return;
 if(!VMH_AUTH.token){root.innerHTML='<p class="notice">Sign in to view your library. <a href="/account/">Go to account</a>.</p>';return;}
 try{
  const r=await VMH_API.post("account",{token:VMH_AUTH.token});
  if(!r.ok)throw new Error(r.error);
  const library=r.data?.library||r.library||[];
  if(!library.length){root.innerHTML='<p class="notice">Your library is empty. <a href="/books/">Browse books</a>.</p>';return;}
  root.innerHTML=`<div class="product-grid grid">${library.map(x=>`<article class="card"><img class="book-cover" src="${x.cover_url||x.cover_path||"/assets/VMHLogo01.png"}" alt=""><div class="card-body"><h3>${x.title}</h3><p class="meta">${x.reading_progress||0}% complete</p><a class="button" href="/lumiere/?book=${encodeURIComponent(x.slug)}">Read now</a>${x.download_url?` <a class="button secondary" href="${x.download_url}">Download</a>`:""}</div></article>`).join("")}</div>`;
 }catch(err){root.innerHTML=`<p class="notice error">${err.message}</p>`}
})();
