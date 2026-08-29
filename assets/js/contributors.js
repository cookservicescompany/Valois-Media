function h(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));}

function publicUrl(value){
  let raw=String(value??"").trim();
  if(!raw)return "";
  if(raw.startsWith("//"))raw=`https:${raw}`;
  else if(/^www\./i.test(raw))raw=`https://${raw}`;
  try{
    const url=new URL(raw,location.origin);
    return url.protocol==="http:"||url.protocol==="https:"?url.href:"";
  }catch(_){return "";}
}

function socialIcon(name){
  const icons={
    instagram:`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4.25"></circle><circle class="icon-fill" cx="17.35" cy="6.7" r="1.15"></circle></svg>`,
    facebook:`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path class="icon-fill" d="M13.8 21v-8h2.8l.42-3.12H13.8v-2c0-.9.25-1.52 1.6-1.52h1.7V3.57c-.3-.04-1.3-.13-2.48-.13-2.45 0-4.12 1.5-4.12 4.25v2.19H7.74V13h2.76v8h3.3Z"></path></svg>`,
    x:`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path class="icon-fill" d="M4.4 3h4.42l4.05 5.54L17.72 3h1.9l-5.87 6.86L20.3 21h-4.42l-4.54-6.2L6.05 21h-1.9l6.3-7.52L4.4 3Zm3.52 1.55H6.9l9.85 14.9h1.02L7.92 4.55Z"></path></svg>`,
    linkedin:`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path class="icon-fill" d="M6.45 8.3A2.15 2.15 0 1 0 6.44 4a2.15 2.15 0 0 0 0 4.3ZM4.6 20h3.68V9.62H4.6V20Zm5.86 0h3.68v-5.78c0-1.52.29-3 2.18-3 1.86 0 1.88 1.74 1.88 3.1V20h3.68v-6.4c0-3.14-.68-5.56-4.35-5.56-1.76 0-2.94.97-3.42 1.88h-.05v-1.6h-3.53V20Z"></path></svg>`
  };
  return icons[name]||"";
}

function contributorSocials(person){
  const links=[
    {field:"website_url",label:"Website",kind:"website",icon:`<span class="social-globe" aria-hidden="true">🌐</span>`},
    {field:"instagram_url",label:"Instagram",kind:"instagram",icon:socialIcon("instagram")},
    {field:"facebook_url",label:"Facebook",kind:"facebook",icon:socialIcon("facebook")},
    {field:"x_url",label:"X",kind:"x",icon:socialIcon("x")},
    {field:"linkedin_url",label:"LinkedIn",kind:"linkedin",icon:socialIcon("linkedin")}
  ].map(item=>({...item,url:publicUrl(person[item.field])})).filter(item=>item.url);
  if(!links.length)return "";
  return `<nav class="contributor-socials" aria-label="${h(person.display_name)} links">${links.map(link=>`<a class="contributor-social-link social-${h(link.kind)}" href="${h(link.url)}" target="_blank" rel="noopener noreferrer" aria-label="${h(`${person.display_name} — ${link.label}`)}" title="${h(link.label)}">${link.icon}<span class="sr-only">${h(link.label)}</span></a>`).join("")}</nav>`;
}

function contributorHeadshot(person,{profile=false}={}){
  const url=publicUrl(person.headshot_url);
  if(!url)return "";
  const name=h(person.display_name);
  if(profile){
    return `<div class="contributor-headshot-wrap contributor-profile-headshot"><img src="${h(url)}" alt="Portrait of ${name}" data-contributor-headshot decoding="async" fetchpriority="high"></div>`;
  }
  return `<a class="contributor-headshot-wrap contributor-card-headshot-link" href="/contributor/?slug=${encodeURIComponent(person.slug)}" aria-label="View ${name}'s author profile"><img class="contributor-card-headshot" src="${h(url)}" alt="Portrait of ${name}" data-contributor-headshot loading="lazy" decoding="async"></a>`;
}

function removeBrokenHeadshots(root=document){
  root.querySelectorAll("img[data-contributor-headshot]").forEach(img=>{
    img.addEventListener("error",()=>img.closest(".contributor-headshot-wrap")?.remove(),{once:true});
  });
}

(async()=>{
 const grid=document.querySelector("[data-contributor-grid]");
 if(grid){
   const people=(await VMH_DATA.contributors()).filter(x=>x.status==="active");
   grid.innerHTML=people.map(p=>`<article class="card contributor-card">${contributorHeadshot(p)}<div class="card-body"><h3><a href="/contributor/?slug=${encodeURIComponent(p.slug)}">${h(p.display_name)}</a></h3><p class="meta">${h(p.professional_title)}</p><p>${h(p.short_bio)}</p></div></article>`).join("");
   removeBrokenHeadshots(grid);
 }
 const profile=document.querySelector("#contributor-profile");
 if(profile){
   const slug=new URLSearchParams(location.search).get("slug");
   const [people,products,credits]=await Promise.all([VMH_DATA.contributors(),VMH_DATA.products(),VMH_DATA.credits()]);
   const person=people.find(x=>x.slug===slug);
   if(!person){profile.innerHTML="<h1>Author not found</h1>";return;}
   const links=credits.filter(x=>x.contributor_id===person.contributor_id).map(x=>({credit:x,product:products.find(p=>p.product_id===x.product_id)})).filter(x=>x.product);
   const groups={};
   links.forEach(({credit,product})=>{const k=credit.display_label||credit.role;(groups[k]??=[]).push(product)});
   const headshot=contributorHeadshot(person,{profile:true});
   const socials=contributorSocials(person);
   const media=headshot||socials?`<aside class="contributor-profile-media">${headshot}${socials}</aside>`:"";
   profile.innerHTML=`<div class="prose contributor-profile-prose"><div class="contributor-profile-layout${media?" has-media":""}"><div class="contributor-profile-copy"><p class="eyebrow">${h(person.professional_title)}</p><h1>${h(person.display_name)}</h1><p class="lede">${h(person.full_bio||person.short_bio)}</p></div>${media}</div>
   ${Object.entries(groups).map(([label,items])=>`<h2>${h(label)}</h2><div class="product-grid grid">${items.map(productCard).join("")}</div>`).join("")}</div>`;
   removeBrokenHeadshots(profile);
 }
})();
