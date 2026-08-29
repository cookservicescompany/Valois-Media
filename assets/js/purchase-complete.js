(() => {
  const root = document.querySelector("#purchase-complete");
  if (!root) return;

  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[character]));

  const params = new URLSearchParams(window.location.search);
  const transactionId = params.get("tx") || params.get("txn_id") || "";

  function accountActions() {
    const signedIn = Boolean(window.VMH_AUTH?.token);
    return signedIn
      ? `<div class="actions"><a class="button" href="/library/">Open Your Library</a><a class="button secondary" href="/account/">View Account</a></div>`
      : `<div class="actions"><a class="button" href="/account/">Sign In</a><a class="button secondary" href="/account/create/">Create Account</a><a class="button secondary" href="/library/">Your Library</a></div>`;
  }

  function showMissingTransaction() {
    root.innerHTML = `
      <p class="eyebrow">Secure digital fulfillment</p>
      <h1>Transaction information is missing</h1>
      <div class="notice error">
        PayPal did not include the transaction ID required for automatic verification. Do not purchase the title again.
      </div>
      <p>Return from your completed PayPal checkout or contact <a href="mailto:${escapeHtml(window.VMH_CONFIG.contactEmail)}">${escapeHtml(window.VMH_CONFIG.contactEmail)}</a> with your PayPal receipt.</p>
      ${accountActions()}`;
  }

  async function verifyPurchase() {
    if (!transactionId) {
      showMissingTransaction();
      return;
    }

    try {
      const response = await window.VMH_API.post("verify-paypal-return", { tx: transactionId });
      if (!response.ok) throw new Error(response.error || "The completed payment could not be verified.");

      const product = response.data?.product || {};
      const productTitle = product.title ? ` for <strong>${escapeHtml(product.title)}</strong>` : "";

      root.innerHTML = `
        <p class="eyebrow">Payment confirmed</p>
        <h1>Your eBook purchase is complete</h1>
        <div class="notice success">PayPal verified your payment${productTitle}, and your digital entitlement has been recorded.</div>
        <p class="lede">Sign in or create a Valois Media account using the same email address used for PayPal. Your eBook will appear in Your Library, where you can read it in VMH Lumière or use the protected Download button.</p>
        ${accountActions()}
        <p class="meta">PayPal transaction: ${escapeHtml(transactionId)}</p>`;
    } catch (error) {
      root.innerHTML = `
        <p class="eyebrow">Payment verification</p>
        <h1>We could not verify the return automatically</h1>
        <div class="notice error">${escapeHtml(error.message || "Payment verification failed.")}</div>
        <p>Do not submit another payment. Contact <a href="mailto:${escapeHtml(window.VMH_CONFIG.contactEmail)}">${escapeHtml(window.VMH_CONFIG.contactEmail)}</a> with your PayPal receipt and transaction ID so the purchase can be matched to your account.</p>
        ${accountActions()}
        <p class="meta">PayPal transaction: ${escapeHtml(transactionId)}</p>`;
    }
  }

  verifyPurchase();
})();
