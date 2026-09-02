(() => {
  'use strict';
  const root = document.querySelector('#purchase-complete');
  if (!root) return;
  const PENDING_TX_KEY = 'vmh_pending_reconcile_tx';
  const params = new URLSearchParams(location.search);
  const initialTx = String(params.get('tx') || params.get('txn_id') || '').trim();
  if (initialTx) { try { localStorage.setItem(PENDING_TX_KEY, initialTx); } catch (_) {} }

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const currentTx = () => {
    if (initialTx) return initialTx;
    try { return localStorage.getItem(PENDING_TX_KEY) || ''; } catch (_) { return ''; }
  };

  function renderForm(message = '') {
    const signedIn = Boolean(window.VMH_AUTH?.token);
    const tx = currentTx();
    root.innerHTML = `
      <p class="eyebrow">Valois Media account library</p>
      <h1>Reconcile Purchase</h1>
      <p class="lede">Your eBook download is delivered directly through PayPal. Reconciliation is only for attaching that purchase to your account so you can keep it in Your Library and read it online with VMH Lumière.</p>
      ${message ? `<div class="notice">${escapeHtml(message)}</div>` : ''}
      <form class="form-grid" data-purchase-reconcile>
        <label>PayPal transaction ID<input type="text" name="tx" value="${escapeHtml(tx)}" autocomplete="off" required></label>
        <button type="submit">${signedIn ? 'Attach Purchase to My Account' : 'Sign In to Attach Purchase'}</button>
        <div class="form-message" data-reconcile-message></div>
      </form>
      <div class="actions" style="margin-top:1rem">
        ${signedIn ? '<a class="button secondary" href="/library/">Open Your Library</a>' : '<a class="button secondary" href="/account/create/">Create Account</a>'}
        <a class="button secondary" href="/books/">Browse Books</a>
      </div>`;

    root.querySelector('[data-purchase-reconcile]')?.addEventListener('submit', handleSubmit);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const tx = String(new FormData(form).get('tx') || '').trim();
    if (!tx) return;
    try { localStorage.setItem(PENDING_TX_KEY, tx); } catch (_) {}

    if (!window.VMH_AUTH?.token) {
      location.href = `/account/?reconcile=1&tx=${encodeURIComponent(tx)}`;
      return;
    }

    const button = form.querySelector('button[type="submit"]');
    const message = form.querySelector('[data-reconcile-message]');
    if (button) button.disabled = true;
    if (message) { message.className = 'form-message'; message.textContent = 'Verifying the PayPal transaction…'; }

    try {
      const response = await VMH_API.post('reconcile-purchase', { token: VMH_AUTH.token, tx });
      if (!response.ok) throw new Error(response.error || 'The purchase could not be attached.');
      try { localStorage.removeItem(PENDING_TX_KEY); } catch (_) {}
      const product = response.data?.product || {};
      const readerUrl = response.data?.reader_url || '';
      root.innerHTML = `
        <p class="eyebrow">Purchase attached</p><h1>Your eBook is in Your Library</h1>
        <div class="notice success">${product.title ? `<strong>${escapeHtml(product.title)}</strong> has been attached to this Valois Media account.` : 'Your verified purchase has been attached to this Valois Media account.'}</div>
        <p class="lede">You can now keep the title in Your Library, download it from your account, and continue reading online with VMH Lumière.</p>
        <div class="actions"><a class="button" href="/library/">Open Your Library</a>${readerUrl ? `<a class="button secondary" href="${escapeHtml(readerUrl)}">Read Online in VMH Lumière</a>` : ''}<a class="button secondary" href="/account/">View Account</a></div>
        <p class="meta">PayPal transaction: ${escapeHtml(tx)}</p>`;
    } catch (error) {
      if (message) { message.className = 'form-message error'; message.textContent = error.message || 'The purchase could not be attached.'; }
      if (button) button.disabled = false;
    }
  }

  renderForm(initialTx ? 'PayPal returned a transaction ID. Sign in and attach it to this account.' : 'Enter the PayPal transaction ID from your receipt.');
})();
