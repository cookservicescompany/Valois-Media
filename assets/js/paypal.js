
(() => {
  let sdkPromise;
  function loadSdk(){
    if(window.paypal?.HostedButtons) return Promise.resolve(window.paypal);
    if(sdkPromise) return sdkPromise;
    sdkPromise = new Promise((resolve,reject)=>{
      const s=document.createElement("script");
      const c=window.VMH_CONFIG;
      s.src=`https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(c.paypalClientId)}&components=hosted-buttons&enable-funding=venmo&currency=${encodeURIComponent(c.paypalCurrency)}`;
      s.onload=()=>resolve(window.paypal);
      s.onerror=()=>reject(new Error("PayPal could not be loaded."));
      document.head.appendChild(s);
    });
    return sdkPromise;
  }
  async function renderForSlug(slug, container){
    const id=window.VMH_CONFIG.paypalButtons[slug];
    if(!id || !container) return false;
    const paypal=await loadSdk();
    container.id=`paypal-container-${id}`;
    await paypal.HostedButtons({hostedButtonId:id}).render(`#${container.id}`);
    return true;
  }
  window.VMH_PAYPAL={renderForSlug};
})();
