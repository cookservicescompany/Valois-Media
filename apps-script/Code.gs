/**
 * VMH Website API
 * Version: 1.0.0 Alpha
 * Date: 2026-06-06
 * UTC build timestamp: 2026-06-06T16:45:00Z
 */
const VMH = Object.freeze({
  SHEET_ID: '1zxO63LYFzyqRn66UYAekXVGyZkIXYdGbGOlsVqqDKr8',
  SITE_URL: 'https://www.valoismedia.com',
  DRIVE_FOLDER_ID: '13NYcriBG-ohPxi8SP_2X4D2S7Nv9_wIC',
  TIME_ZONE: 'America/Indiana/Indianapolis',
  SUPPORT_EMAIL: 'valoismediaholdings@gmail.com',
  SESSION_DAYS: 7,
  VERIFY_HOURS: 24,
  RESET_HOURS: 2,
  PASSWORD_ITERATIONS: 2500,
  SHEETS: Object.freeze({
    SETTINGS:'Settings', PRODUCTS:'Products', CONTRIBUTORS:'Contributors',
    CREDITS:'Product Credits', ASSETS:'Digital Assets', CUSTOMERS:'Customers',
    ORDERS:'Orders', ENTITLEMENTS:'Entitlements', COMMUNICATIONS:'Communications',
    LOG:'System Log'
  })
});

const SCHEMAS = Object.freeze({
  'Settings':['key','value','public','description','updated_at'],
  'Products':['product_id','slug','status','product_type','title','subtitle','short_title','series_name','series_number','edition','isbn','publisher','publication_date','language','categories','format_label','price','original_price','currency','cover_file_name','cover_drive_file_id','cover_url','sample_url','short_description','description','features_json','amazon_asin','amazon_url','barnes_noble_url','reader_enabled','download_enabled','featured','new_release','forthcoming','sort_order','seo_title','seo_description','canonical_path','created_at','updated_at'],
  'Contributors':['contributor_id','slug','status','display_name','sort_name','professional_title','short_bio','full_bio','headshot_url','website_url','instagram_url','facebook_url','x_url','linkedin_url','featured','sort_order','seo_title','seo_description','created_at','updated_at'],
  'Product Credits':['credit_id','product_id','contributor_id','role','display_label','primary_credit','credit_order','active','created_at','updated_at'],
  'Digital Assets':['asset_id','product_id','asset_type','drive_file_name','drive_file_id','drive_resource_key','repository_path','mime_type','download_name','reader_enabled','download_enabled','active','max_downloads','file_version','file_size','checksum','updated_at'],
  'Customers':['customer_id','email','display_name','status','email_verified','created_at','updated_at','last_login_at','password_hash','password_salt','password_iterations','verification_token_hash','verification_expires_at','reset_token_hash','reset_expires_at','failed_login_count','locked_until','session_version','preferences_json'],
  'Orders':['order_id','paypal_order_id','paypal_capture_id','customer_id','email','product_id','quantity','unit_price','subtotal','tax','total','currency','status','payer_country','payment_source','raw_event_id','created_at','updated_at','metadata_json'],
  'Entitlements':['entitlement_id','customer_id','email','product_id','order_id','status','source','granted_at','expires_at','revoked_at','download_count','last_download_at','reading_progress','reading_location','last_read_at','reader_state_json','notes'],
  'Communications':['communication_id','record_type','email','name','subject','message','status','source','consent_version','created_at','updated_at','metadata_json'],
  'System Log':['timestamp','level','event','email','record_id','source','message','metadata_json']
});

function doGet(e) {
  const p = e && e.parameter ? e.parameter : {};
  const action = String(p.action || 'ping').toLowerCase();
  try {
    if (action === 'download') return downloadRedirect_(p);
    return json_(routeGet_(action, p), p.callback);
  } catch (err) {
    log_('ERROR', action, '', '', 'doGet', err.message, {});
    return json_({ok:false,error:safeError_(err)}, p.callback);
  }
}

function doPost(e) {
  const p = parsePost_(e);
  const action = String(p.action || '').toLowerCase();
  try {
    return json_(routePost_(action, p), p.callback);
  } catch (err) {
    log_('ERROR', action, normalizeEmail_(p.email || ''), '', 'doPost', err.message, {});
    return json_({ok:false,error:safeError_(err)}, p.callback);
  }
}

function routeGet_(action, p) {
  switch (action) {
    case 'ping': return {ok:true,data:{service:'VMH Website API',version:'1.0.0-alpha',timestamp:now_()}};
    case 'health': return healthCheck();
    case 'settings':
    case 'public-config': return {ok:true,data:publicSettings_()};
    case 'products': return {ok:true,data:publicProducts_()};
    case 'product': return {ok:true,data:getPublicProduct_(p.slug || p.product_id)};
    case 'contributors': return {ok:true,data:publicContributors_()};
    case 'contributor': return {ok:true,data:getPublicContributor_(p.slug || p.contributor_id)};
    case 'related-products': return {ok:true,data:relatedProducts_(p.product_id || p.slug)};
    case 'reader-manifest': return readerManifest_(p);
    case 'reader-chapter': return readerChapter_(p);
    default: return {ok:false,error:'Unknown action.'};
  }
}

function routePost_(action, p) {
  switch (action) {
    case 'contact': return submitContact_(p);
    case 'subscribe': return subscribe_(p);
    case 'unsubscribe': return unsubscribe_(p);
    case 'register': return register_(p);
    case 'login': return login_(p);
    case 'logout': return {ok:true,message:'Signed out.'};
    case 'verify-email': return verifyEmail_(p);
    case 'forgot-password': return forgotPassword_(p);
    case 'reset-password': return resetPassword_(p);
    case 'account': return account_(p);
    case 'save-reading-progress': return saveReadingProgress_(p);
    case 'verify-paypal-return': return verifyPayPalPdt_(p);
    default: return {ok:false,error:'Unknown action.'};
  }
}

function setupWorkbook() {
  const ss = SpreadsheetApp.openById(VMH.SHEET_ID);
  Object.keys(SCHEMAS).forEach(function(name) {
    let sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name);
    const headers = SCHEMAS[name];
    if (sh.getLastRow() === 0) sh.getRange(1,1,1,headers.length).setValues([headers]);
    const actual = sh.getRange(1,1,1,headers.length).getDisplayValues()[0];
    if (actual.join('\t') !== headers.join('\t')) throw new Error('Header mismatch in '+name);
    sh.setFrozenRows(1);
    sh.getRange(1,1,1,headers.length).setFontWeight('bold').setBackground('#0B2E4F').setFontColor('#FFFFFF');
    if (!sh.getFilter()) sh.getRange(1,1,Math.max(1,sh.getLastRow()),headers.length).createFilter();
  });
  return healthCheck();
}

function setupAccountSecrets() {
  const props = PropertiesService.getScriptProperties();
  ['ACCOUNT_PASSWORD_PEPPER','ACCOUNT_TOKEN_SECRET','ACCOUNT_ACTION_TOKEN_SECRET','DOWNLOAD_TOKEN_SECRET','READER_TOKEN_SECRET'].forEach(function(k){
    if (!props.getProperty(k)) props.setProperty(k, randomToken_(48));
  });
  return {ok:true,message:'Account and token secrets are configured.'};
}

function healthCheck() {
  const ss = SpreadsheetApp.openById(VMH.SHEET_ID);
  const checks = Object.keys(SCHEMAS).map(function(name) {
    const sh = ss.getSheetByName(name);
    return {sheet:name,exists:!!sh,headers_ok:!!sh && sh.getRange(1,1,1,SCHEMAS[name].length).getDisplayValues()[0].join('\t')===SCHEMAS[name].join('\t')};
  });
  return {ok:checks.every(c=>c.exists&&c.headers_ok),data:{checks:checks,web_app_url:ScriptApp.getService().getUrl(),timestamp:now_()}};
}

function syncDriveAssetsFromFolder() {
  const root = DriveApp.getFolderById(VMH.DRIVE_FOLDER_ID);
  const coversName = setting_('covers_folder_name') || 'covers';
  const coverFolders = root.getFoldersByName(coversName);
  const covers = coverFolders.hasNext() ? coverFolders.next() : null;
  const files = [];
  collectFiles_(root, files);
  if (covers) collectFiles_(covers, files);
  const sh = sheet_(VMH.SHEETS.ASSETS);
  const rows = readObjects_(sh);
  const products = readObjects_(sheet_(VMH.SHEETS.PRODUCTS));
  const productMap = {};
  products.forEach(p=>productMap[p.product_id]=p);
  let matched=0, missing=0;
  rows.forEach(function(row) {
    const stem = normalizeStem_(row.drive_file_name || '');
    const extNeeded = String(row.asset_type||'').toLowerCase()==='epub' ? ['epub'] : ['png','webp','jpg','jpeg','svg'];
    const candidates = files.filter(function(f){
      const parts=fileParts_(f.getName());
      return normalizeStem_(parts.stem)===stem && extNeeded.indexOf(parts.ext)>=0;
    });
    if (candidates.length===1) {
      row.drive_file_id=candidates[0].getId();
      row.drive_resource_key=candidates[0].getResourceKey()||'';
      row.mime_type=candidates[0].getMimeType()||row.mime_type;
      row.file_size=String(candidates[0].getSize()||'');
      row.updated_at=now_();
      updateObject_(sh,'asset_id',row.asset_id,row);
      matched++;
      if (String(row.asset_type).toLowerCase()==='cover' && productMap[row.product_id]) {
        const p=productMap[row.product_id];
        p.cover_drive_file_id=row.drive_file_id;
        p.cover_url='https://drive.google.com/thumbnail?id='+encodeURIComponent(row.drive_file_id)+'&sz=w1600';
        p.updated_at=now_();
        updateObject_(sheet_(VMH.SHEETS.PRODUCTS),'product_id',p.product_id,p);
      }
    } else missing++;
  });
  log_('INFO','DRIVE_SYNC','','','drive','Drive asset synchronization complete',{matched:matched,missing:missing});
  return {ok:true,data:{matched:matched,missing:missing}};
}

function collectFiles_(folder, out) {
  const it=folder.getFiles(); while(it.hasNext()) out.push(it.next());
}
function fileParts_(name) {
  const m=String(name||'').match(/^(.*?)(?:\.([^.]+))?$/);
  return {stem:m?m[1]:'',ext:(m&&m[2]?m[2]:'').toLowerCase()};
}
function normalizeStem_(s){return String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'');}

function publicSettings_() {
  const out={};
  readObjects_(sheet_(VMH.SHEETS.SETTINGS)).forEach(function(r){if(truthy_(r.public))out[r.key]=r.value;});
  return out;
}
function publicProducts_() {
  return readObjects_(sheet_(VMH.SHEETS.PRODUCTS)).filter(r=>String(r.status).toLowerCase()==='active').map(publicProduct_);
}
function publicProduct_(r) {
  const out={}; SCHEMAS.Products.forEach(k=>out[k]=r[k]||'');
  try{out.features=JSON.parse(r.features_json||'[]')}catch(_){out.features=[]}
  return out;
}
function getPublicProduct_(id) {
  const rows=publicProducts_(); return rows.find(r=>r.slug===id||r.product_id===id)||null;
}
function publicContributors_() {
  return readObjects_(sheet_(VMH.SHEETS.CONTRIBUTORS)).filter(r=>String(r.status).toLowerCase()==='active');
}
function getPublicContributor_(id) {
  const person=publicContributors_().find(r=>r.slug===id||r.contributor_id===id);
  if(!person)return null;
  const credits=readObjects_(sheet_(VMH.SHEETS.CREDITS)).filter(r=>r.contributor_id===person.contributor_id&&truthy_(r.active));
  const products=publicProducts_();
  person.credits=credits.map(c=>({credit:c,product:products.find(p=>p.product_id===c.product_id)})).filter(x=>x.product);
  return person;
}
function relatedProducts_(id) {
  const p=getPublicProduct_(id); if(!p)return [];
  return publicProducts_().filter(x=>x.product_id!==p.product_id && (x.series_name===p.series_name || x.title===p.title)).slice(0,4);
}

function submitContact_(p) {
  if (p.website) return {ok:true,message:'Thank you.'};
  requireEmail_(p.email); requireText_(p.name,1,120); requireText_(p.subject,1,180); requireText_(p.message,1,5000);
  rateLimit_('contact:'+ipKey_(p),5,3600);
  appendObject_(sheet_(VMH.SHEETS.COMMUNICATIONS),{
    communication_id:'comm_'+Utilities.getUuid(),record_type:'contact_message',email:normalizeEmail_(p.email),name:clean_(p.name,120),
    subject:clean_(p.subject,180),message:clean_(p.message,5000),status:'new',source:'website',
    consent_version:setting_('consent_version')||'',created_at:now_(),updated_at:now_(),metadata_json:'{}'
  });
  try{MailApp.sendEmail({to:VMH.SUPPORT_EMAIL,replyTo:normalizeEmail_(p.email),subject:'VMH Contact: '+clean_(p.subject,180),body:clean_(p.message,5000)});}catch(_){}
  return {ok:true,message:'Your message was sent.'};
}

function subscribe_(p) {
  requireEmail_(p.email);
  const email=normalizeEmail_(p.email);
  appendObject_(sheet_(VMH.SHEETS.COMMUNICATIONS),{
    communication_id:'comm_'+Utilities.getUuid(),record_type:'newsletter_subscriber',email:email,name:clean_(p.name,120),
    subject:'',message:'',status:'active',source:'website',consent_version:setting_('consent_version')||'',
    created_at:now_(),updated_at:now_(),metadata_json:'{}'
  });
  return {ok:true,message:'You are subscribed.'};
}
function unsubscribe_(p) {
  requireEmail_(p.email); const email=normalizeEmail_(p.email);
  appendObject_(sheet_(VMH.SHEETS.COMMUNICATIONS),{
    communication_id:'comm_'+Utilities.getUuid(),record_type:'do_not_email',email:email,name:'',subject:'',message:'',
    status:'active',source:'website',consent_version:setting_('consent_version')||'',created_at:now_(),updated_at:now_(),metadata_json:'{}'
  });
  return {ok:true,message:'You are unsubscribed.'};
}

function register_(p) {
  requireEmail_(p.email); requirePassword_(p.password);
  const email=normalizeEmail_(p.email); const sh=sheet_(VMH.SHEETS.CUSTOMERS);
  if(findBy_(sh,'email',email)) throw new Error('An account already exists for this email address.');
  const salt=randomToken_(24); const iterations=VMH.PASSWORD_ITERATIONS;
  const token=randomToken_(32);
  const customer={
    customer_id:'cust_'+Utilities.getUuid(),email:email,display_name:clean_(p.display_name,120),status:'active',
    email_verified:'FALSE',created_at:now_(),updated_at:now_(),last_login_at:'',
    password_hash:passwordHash_(p.password,salt,iterations),password_salt:salt,password_iterations:String(iterations),
    verification_token_hash:sha256_(token),verification_expires_at:futureHours_(VMH.VERIFY_HOURS),
    reset_token_hash:'',reset_expires_at:'',failed_login_count:'0',locked_until:'',session_version:'1',preferences_json:'{}'
  };
  appendObject_(sh,customer); linkEmailEntitlementsToCustomer_(customer);
  const url=VMH.SITE_URL+'/account/verify/?token='+encodeURIComponent(token);
  sendHtml_(email,'Verify your Valois Media account','Verify your account: '+url,'<p>Verify your Valois Media account:</p><p><a href="'+url+'">Verify Email</a></p>');
  return {ok:true,message:'Account created. Check your email to verify it.'};
}

function login_(p) {
  requireEmail_(p.email); requireText_(p.password,1,500);
  const email=normalizeEmail_(p.email); rateLimit_('login:'+email,15,3600);
  const sh=sheet_(VMH.SHEETS.CUSTOMERS); const c=findBy_(sh,'email',email);
  if(!c || String(c.status).toLowerCase()!=='active') throw new Error('Invalid email or password.');
  if(c.locked_until && new Date(c.locked_until).getTime()>Date.now()) throw new Error('Account temporarily locked. Try again later.');
  const actual=passwordHash_(p.password,c.password_salt,Number(c.password_iterations||VMH.PASSWORD_ITERATIONS));
  if(!constantTimeEqual_(actual,c.password_hash)){
    c.failed_login_count=String(Number(c.failed_login_count||0)+1);
    if(Number(c.failed_login_count)>=8)c.locked_until=futureMinutes_(30);
    c.updated_at=now_(); updateObject_(sh,'customer_id',c.customer_id,c);
    throw new Error('Invalid email or password.');
  }
  c.failed_login_count='0';c.locked_until='';c.last_login_at=now_();c.updated_at=now_();updateObject_(sh,'customer_id',c.customer_id,c);
  return {ok:true,message:'Signed in.',token:createSession_(c)};
}

function verifyEmail_(p) {
  const hash=sha256_(clean_(p.token,500)); const sh=sheet_(VMH.SHEETS.CUSTOMERS);
  const c=findBy_(sh,'verification_token_hash',hash);
  if(!c || new Date(c.verification_expires_at).getTime()<Date.now()) throw new Error('Verification link is invalid or expired.');
  c.email_verified='TRUE';c.verification_token_hash='';c.verification_expires_at='';c.updated_at=now_();updateObject_(sh,'customer_id',c.customer_id,c);
  linkEmailEntitlementsToCustomer_(c);
  return {ok:true,message:'Your email address is verified.'};
}

function forgotPassword_(p) {
  requireEmail_(p.email); const email=normalizeEmail_(p.email); const sh=sheet_(VMH.SHEETS.CUSTOMERS); const c=findBy_(sh,'email',email);
  if(c){
    const token=randomToken_(32);c.reset_token_hash=sha256_(token);c.reset_expires_at=futureHours_(VMH.RESET_HOURS);c.updated_at=now_();updateObject_(sh,'customer_id',c.customer_id,c);
    const url=VMH.SITE_URL+'/account/reset-password/?token='+encodeURIComponent(token);
    sendHtml_(email,'Reset your Valois Media password','Reset your password: '+url,'<p><a href="'+url+'">Reset Password</a></p>');
  }
  return {ok:true,message:'If an account exists, a reset link has been sent.'};
}

function resetPassword_(p) {
  requirePassword_(p.password); const hash=sha256_(clean_(p.token,500)); const sh=sheet_(VMH.SHEETS.CUSTOMERS); const c=findBy_(sh,'reset_token_hash',hash);
  if(!c || new Date(c.reset_expires_at).getTime()<Date.now()) throw new Error('Reset link is invalid or expired.');
  const salt=randomToken_(24);c.password_salt=salt;c.password_iterations=String(VMH.PASSWORD_ITERATIONS);c.password_hash=passwordHash_(p.password,salt,VMH.PASSWORD_ITERATIONS);
  c.reset_token_hash='';c.reset_expires_at='';c.session_version=String(Number(c.session_version||1)+1);c.updated_at=now_();updateObject_(sh,'customer_id',c.customer_id,c);
  return {ok:true,message:'Password updated.'};
}

function account_(p) {
  const c=requireSession_(p.token); const email=normalizeEmail_(c.email);
  const products={}; publicProducts_().forEach(x=>products[x.product_id]=x);
  const ents=readObjects_(sheet_(VMH.SHEETS.ENTITLEMENTS)).filter(function(e){
    return String(e.status).toLowerCase()==='active' && (e.customer_id===c.customer_id||normalizeEmail_(e.email)===email);
  });
  const library=ents.map(function(e){
    const p=products[e.product_id]; if(!p)return null;
    const a=findAssetForProduct_(p.product_id,'epub');
    let download='';
    if(a&&truthy_(p.download_enabled)&&truthy_(a.download_enabled)){
      download=ScriptApp.getService().getUrl()+'?action=download&token='+encodeURIComponent(createSignedToken_({kind:'download',customer_id:c.customer_id,email:email,product_id:p.product_id,asset_id:a.asset_id,exp:Date.now()+3600000},'DOWNLOAD_TOKEN_SECRET'));
    }
    return Object.assign({},p,{reading_progress:e.reading_progress||'0',reading_location:e.reading_location||'',download_url:download});
  }).filter(Boolean);
  return {ok:true,data:{user:{customer_id:c.customer_id,email:c.email,display_name:c.display_name,email_verified:truthy_(c.email_verified)},library:library}};
}

function saveReadingProgress_(p) {
  const c=requireSession_(p.token); const product=getPublicProduct_(p.product); if(!product)throw new Error('Book not found.');
  const ent=requireEntitlement_(c,product.product_id);
  ent.reading_progress=String(Math.max(0,Math.min(100,Number(p.reading_progress||0))));
  ent.reading_location=clean_(p.reading_location,500);ent.last_read_at=now_();ent.reader_state_json=clean_(p.reader_state_json||'{}',5000);
  updateObject_(sheet_(VMH.SHEETS.ENTITLEMENTS),'entitlement_id',ent.entitlement_id,ent);
  return {ok:true,message:'Progress saved.'};
}

function readerManifest_(p) {
  const c=requireSession_(p.token); const product=getPublicProduct_(p.product); if(!product||!truthy_(product.reader_enabled))throw new Error('Reader access is unavailable.');
  const ent=requireEntitlement_(c,product.product_id); const asset=findAssetForProduct_(product.product_id,'epub'); if(!asset)throw new Error('eBook asset is unavailable.');
  const epub=loadEpub_(asset); return {ok:true,data:{title:product.title,slug:product.slug,spine:epub.spine.map(x=>({id:x.id,href:x.href,title:x.title||''})),reading_location:ent.reading_location||''}};
}

function readerChapter_(p) {
  const c=requireSession_(p.token); const product=getPublicProduct_(p.product); if(!product)throw new Error('Book not found.');
  requireEntitlement_(c,product.product_id); const asset=findAssetForProduct_(product.product_id,'epub'); if(!asset)throw new Error('eBook asset unavailable.');
  const epub=loadEpub_(asset); const item=epub.spine.find(x=>x.id===p.chapter); if(!item)throw new Error('Chapter unavailable.');
  const blob=epub.blobs[item.path]; if(!blob)throw new Error('Chapter file unavailable.');
  return {ok:true,data:{html:sanitizeChapter_(blob.getDataAsString())}};
}

function loadEpub_(asset) {
  const file=DriveApp.getFileById(asset.drive_file_id); const blobs=Utilities.unzip(file.getBlob()); const map={};blobs.forEach(b=>map[b.getName()]=b);
  const container=map['META-INF/container.xml']; if(!container)throw new Error('Invalid EPUB container.');
  const cm=container.getDataAsString().match(/full-path=["']([^"']+)["']/i); if(!cm)throw new Error('EPUB package not found.');
  const opfPath=cm[1]; const opf=map[opfPath]; if(!opf)throw new Error('EPUB package file unavailable.');
  const xml=opf.getDataAsString(); const manifest={};
  (xml.match(/<item\b[^>]*>/gi)||[]).forEach(function(tag){
    const id=attr_(tag,'id'),href=attr_(tag,'href'),media=attr_(tag,'media-type'); if(id&&href)manifest[id]={id:id,href:href,media:media,path:resolvePath_(opfPath,href)};
  });
  const spine=[];(xml.match(/<itemref\b[^>]*>/gi)||[]).forEach(function(tag){const idref=attr_(tag,'idref');if(manifest[idref])spine.push(manifest[idref]);});
  return {spine:spine,blobs:map};
}
function attr_(tag,name){const m=tag.match(new RegExp(name+'=["\\\']([^"\\\']+)["\\\']','i'));return m?m[1]:'';}
function resolvePath_(base,rel){const parts=base.split('/');parts.pop();String(rel).split('/').forEach(function(p){if(p==='..')parts.pop();else if(p!=='.')parts.push(p)});return parts.join('/');}
function sanitizeChapter_(s) {
  s=String(s||'').replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<iframe[\s\S]*?<\/iframe>/gi,'').replace(/<form[\s\S]*?<\/form>/gi,'');
  s=s.replace(/\son\w+\s*=\s*(["']).*?\1/gi,'').replace(/\s(href|src)\s*=\s*(["'])\s*(javascript:|data:text\/html)[\s\S]*?\2/gi,'');
  const body=s.match(/<body[^>]*>([\s\S]*?)<\/body>/i);return body?body[1]:s;
}

function verifyPayPalPdt_(p) {
  const tx=clean_(p.tx||p.txn_id,200); if(!tx)throw new Error('Missing PayPal transaction ID.');
  const identity=PropertiesService.getScriptProperties().getProperty('PAYPAL_PDT_IDENTITY_TOKEN'); if(!identity)throw new Error('PayPal PDT is not configured.');
  const response=UrlFetchApp.fetch('https://www.paypal.com/cgi-bin/webscr',{method:'post',payload:{cmd:'_notify-synch',tx:tx,at:identity},muteHttpExceptions:true});
  const parsed=parsePdt_(response.getContentText()); if(!parsed.ok||parsed.data.payment_status!=='Completed')throw new Error('PayPal did not verify a completed payment.');
  const d=parsed.data; const receiver=normalizeEmail_(PropertiesService.getScriptProperties().getProperty('PAYPAL_RECEIVER_EMAIL')||'');
  const actual=normalizeEmail_(d.receiver_email||d.business||''); if(receiver&&actual&&receiver!==actual)throw new Error('PayPal receiver mismatch.');
  const product=getPublicProduct_(d.item_number||d.custom||'')||publicProducts_().find(x=>x.title===d.item_name);
  if(!product)throw new Error('Verified payment could not be matched to a product. Configure the PayPal item number as the product slug.');
  if(product.price && Math.abs(Number(product.price)-Number(d.mc_gross||0))>.001)throw new Error('PayPal amount did not match the product.');
  const email=normalizeEmail_(d.payer_email||'');requireEmail_(email);
  const existing=findBy_(sheet_(VMH.SHEETS.ORDERS),'paypal_capture_id',tx); if(existing)return {ok:true,message:'Purchase already recorded.'};
  const customer=findBy_(sheet_(VMH.SHEETS.CUSTOMERS),'email',email);
  const order={order_id:'pdt_'+tx,paypal_order_id:d.parent_txn_id||'',paypal_capture_id:tx,customer_id:customer?customer.customer_id:'',email:email,product_id:product.product_id,quantity:'1',unit_price:d.mc_gross||'',subtotal:d.mc_gross||'',tax:d.tax||'0',total:d.mc_gross||'',currency:d.mc_currency||'USD',status:'completed',payer_country:d.residence_country||'',payment_source:'paypal-pdt',raw_event_id:'pdt:'+tx,created_at:now_(),updated_at:now_(),metadata_json:JSON.stringify({item_name:d.item_name||'',item_number:d.item_number||''})};
  appendObject_(sheet_(VMH.SHEETS.ORDERS),order);
  grantEntitlement_({customer_id:order.customer_id,email:email,product_id:product.product_id,order_id:order.order_id,source:'paypal_verified'});
  return {ok:true,message:'Purchase verified.',data:{product:product}};
}

function parsePdt_(text) {
  const lines=String(text||'').split(/\r?\n/); if(lines.shift()!=='SUCCESS')return {ok:false,data:{}};
  const data={};lines.forEach(function(line){const i=line.indexOf('=');if(i>0)data[decodeURIComponent(line.slice(0,i).replace(/\+/g,' '))]=decodeURIComponent(line.slice(i+1).replace(/\+/g,' '));});
  return {ok:true,data:data};
}

function grantEntitlement_(v) {
  const sh=sheet_(VMH.SHEETS.ENTITLEMENTS); const current=readObjects_(sh).find(e=>e.product_id===v.product_id && (e.order_id===v.order_id||normalizeEmail_(e.email)===normalizeEmail_(v.email)) && String(e.status).toLowerCase()==='active');
  if(current)return current;
  const e={entitlement_id:'ent_'+Utilities.getUuid(),customer_id:v.customer_id||'',email:normalizeEmail_(v.email),product_id:v.product_id,order_id:v.order_id||'',status:'active',source:v.source||'manual',granted_at:now_(),expires_at:'',revoked_at:'',download_count:'0',last_download_at:'',reading_progress:'0',reading_location:'',last_read_at:'',reader_state_json:'{}',notes:''};
  appendObject_(sh,e);return e;
}
function linkEmailEntitlementsToCustomer_(c) {
  const sh=sheet_(VMH.SHEETS.ENTITLEMENTS);readObjects_(sh).forEach(function(e){if(!e.customer_id&&normalizeEmail_(e.email)===normalizeEmail_(c.email)){e.customer_id=c.customer_id;updateObject_(sh,'entitlement_id',e.entitlement_id,e)}});
}
function requireEntitlement_(c,productId) {
  const email=normalizeEmail_(c.email);const e=readObjects_(sheet_(VMH.SHEETS.ENTITLEMENTS)).find(x=>String(x.status).toLowerCase()==='active'&&x.product_id===productId&&(x.customer_id===c.customer_id||normalizeEmail_(x.email)===email));
  if(!e)throw new Error('Your account does not have access to this book.');return e;
}
function findAssetForProduct_(productId,type) {return readObjects_(sheet_(VMH.SHEETS.ASSETS)).find(a=>a.product_id===productId&&String(a.asset_type).toLowerCase()===type&&truthy_(a.active)&&a.drive_file_id)||null;}

function downloadRedirect_(p) {
  try{
    const data=verifySignedToken_(p.token,'DOWNLOAD_TOKEN_SECRET');if(data.kind!=='download')throw new Error('Invalid download token.');
    const c=findBy_(sheet_(VMH.SHEETS.CUSTOMERS),'customer_id',data.customer_id);if(!c)throw new Error('Account unavailable.');
    requireEntitlement_(c,data.product_id);const a=findBy_(sheet_(VMH.SHEETS.ASSETS),'asset_id',data.asset_id);if(!a||!truthy_(a.active))throw new Error('Asset unavailable.');
    const target='https://drive.google.com/uc?export=download&id='+encodeURIComponent(a.drive_file_id)+(a.drive_resource_key?'&resourcekey='+encodeURIComponent(a.drive_resource_key):'');
    return HtmlService.createHtmlOutput('<!doctype html><meta charset="utf-8"><title>Starting download</title><script>location.replace('+JSON.stringify(target)+');<\/script><p><a href="'+target.replace(/&/g,'&amp;')+'">Continue to download</a></p>');
  }catch(err){return HtmlService.createHtmlOutput('<h1>Download unavailable</h1><p>'+escapeHtml_(safeError_(err))+'</p>');}
}

function createSession_(c) {return createSignedToken_({kind:'session',customer_id:c.customer_id,email:c.email,version:String(c.session_version||1),exp:Date.now()+VMH.SESSION_DAYS*86400000},'ACCOUNT_TOKEN_SECRET');}
function requireSession_(token) {const d=verifySignedToken_(token,'ACCOUNT_TOKEN_SECRET');if(d.kind!=='session')throw new Error('Invalid session.');const c=findBy_(sheet_(VMH.SHEETS.CUSTOMERS),'customer_id',d.customer_id);if(!c||String(c.session_version||1)!==String(d.version))throw new Error('Session expired.');return c;}
function createSignedToken_(payload,keyName){const secret=secret_(keyName);const body=b64_(JSON.stringify(payload));const sig=b64bytes_(Utilities.computeHmacSha256Signature(body,secret));return body+'.'+sig;}
function verifySignedToken_(token,keyName){const parts=String(token||'').split('.');if(parts.length!==2)throw new Error('Invalid token.');const expected=b64bytes_(Utilities.computeHmacSha256Signature(parts[0],secret_(keyName)));if(!constantTimeEqual_(expected,parts[1]))throw new Error('Invalid token.');const d=JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0])).getDataAsString());if(Number(d.exp||0)<Date.now())throw new Error('Token expired.');return d;}
function secret_(name){const s=PropertiesService.getScriptProperties().getProperty(name);if(!s)throw new Error(name+' is not configured.');return s;}
function passwordHash_(password,salt,iterations){let value=String(password)+'|'+salt+'|'+secret_('ACCOUNT_PASSWORD_PEPPER');for(let i=0;i<iterations;i++)value=sha256_(value);return value;}
function sha256_(s){return b64bytes_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(s),Utilities.Charset.UTF_8));}
function b64_(s){return Utilities.base64EncodeWebSafe(String(s),Utilities.Charset.UTF_8).replace(/=+$/,'');}
function b64bytes_(b){return Utilities.base64EncodeWebSafe(b).replace(/=+$/,'');}
function constantTimeEqual_(a,b){a=String(a||'');b=String(b||'');let diff=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)diff|=(a.charCodeAt(i%Math.max(1,a.length))||0)^(b.charCodeAt(i%Math.max(1,b.length))||0);return diff===0;}

function parsePost_(e){const out={};if(e&&e.parameter)Object.keys(e.parameter).forEach(k=>out[k]=e.parameter[k]);if(e&&e.postData&&e.postData.type==='application/json'){try{Object.assign(out,JSON.parse(e.postData.contents||'{}'))}catch(_){}}return out;}
function json_(obj,callback){const text=JSON.stringify(obj);if(callback&&/^[A-Za-z_$][0-9A-Za-z_$\.]{0,80}$/.test(callback))return ContentService.createTextOutput(callback+'('+text+')').setMimeType(ContentService.MimeType.JAVASCRIPT);return ContentService.createTextOutput(text).setMimeType(ContentService.MimeType.JSON);}
function sheet_(name){const sh=SpreadsheetApp.openById(VMH.SHEET_ID).getSheetByName(name);if(!sh)throw new Error('Missing sheet: '+name);return sh;}
function readObjects_(sh){const values=sh.getDataRange().getDisplayValues();if(values.length<2)return [];const h=values[0];return values.slice(1).filter(r=>r.some(v=>v!=='')).map(r=>{const o={};h.forEach((k,i)=>o[k]=r[i]||'');return o});}
function appendObject_(sh,obj){const h=sh.getRange(1,1,1,sh.getLastColumn()).getDisplayValues()[0];sh.appendRow(h.map(k=>obj[k]===undefined?'':obj[k]));return obj;}
function updateObject_(sh,key,keyValue,obj){const rows=sh.getDataRange().getDisplayValues();const h=rows[0];const ki=h.indexOf(key);for(let r=1;r<rows.length;r++){if(String(rows[r][ki])===String(keyValue)){sh.getRange(r+1,1,1,h.length).setValues([h.map(k=>obj[k]===undefined?'':obj[k])]);return obj}}throw new Error('Record not found.');}
function findBy_(sh,key,value){return readObjects_(sh).find(r=>String(r[key])===String(value))||null;}
function setting_(key){const r=findBy_(sheet_(VMH.SHEETS.SETTINGS),'key',key);return r?r.value:'';}
function now_(){return Utilities.formatDate(new Date(),VMH.TIME_ZONE,"yyyy-MM-dd'T'HH:mm:ssXXX");}
function futureHours_(h){return Utilities.formatDate(new Date(Date.now()+h*3600000),VMH.TIME_ZONE,"yyyy-MM-dd'T'HH:mm:ssXXX");}
function futureMinutes_(m){return Utilities.formatDate(new Date(Date.now()+m*60000),VMH.TIME_ZONE,"yyyy-MM-dd'T'HH:mm:ssXXX");}
function clean_(s,n){return String(s||'').replace(/\u0000/g,'').trim().slice(0,n||1000);}
function normalizeEmail_(s){return clean_(s,254).toLowerCase();}
function requireEmail_(s){if(!/^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/.test(normalizeEmail_(s)))throw new Error('Enter a valid email address.');}
function requirePassword_(s){if(String(s||'').length<10)throw new Error('Password must contain at least 10 characters.');}
function requireText_(s,min,max){const v=clean_(s,max);if(v.length<min)throw new Error('Complete all required fields.');}
function truthy_(v){return ['true','1','yes','active'].indexOf(String(v||'').toLowerCase())>=0;}
function randomToken_(bytes){return b64bytes_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,Utilities.getUuid()+'|'+Date.now()+'|'+Math.random())).slice(0,bytes);}
function rateLimit_(key,max,seconds){const c=CacheService.getScriptCache();const k='rl:'+sha256_(key).slice(0,32);const n=Number(c.get(k)||0)+1;if(n>max)throw new Error('Too many requests. Try again later.');c.put(k,String(n),seconds);}
function ipKey_(p){return clean_(p.ip||p.user_agent||'browser',300);}
function sendHtml_(to,subject,text,html){try{MailApp.sendEmail({to:to,subject:subject,body:text,htmlBody:html,name:'Valois Media',replyTo:VMH.SUPPORT_EMAIL});}catch(_){}}
function log_(level,event,email,recordId,source,message,meta){try{appendObject_(sheet_(VMH.SHEETS.LOG),{timestamp:now_(),level:level,event:event,email:email,record_id:recordId,source:source,message:message,metadata_json:JSON.stringify(meta||{})})}catch(_){}}
function safeError_(e){return clean_(e&&e.message?e.message:String(e||'Request failed.'),500);}
function escapeHtml_(s){return String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
