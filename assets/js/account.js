(() => {
  'use strict';
  const portal = document.querySelector('#account-portal');
  if (!portal) return;

  const signedOut = portal.querySelector('[data-account-signed-out]');
  const signedIn = portal.querySelector('[data-account-signed-in]');
  const status = portal.querySelector('[data-account-status]');
  const name = portal.querySelector('[data-account-name]');
  const email = portal.querySelector('[data-account-email]');
  const verification = portal.querySelector('[data-account-verification]');
  const libraryCount = portal.querySelector('[data-account-library-count]');
  const signOutButton = portal.querySelector('[data-sign-out]');
  const reconcileForm = portal.querySelector('[data-reconcile-form]');
  const reconcileInput = portal.querySelector('[data-reconcile-tx]');
  const reconcileMessage = portal.querySelector('[data-reconcile-message]');
  const PENDING_TX_KEY = 'vmh_pending_reconcile_tx';

  const params = new URLSearchParams(location.search);
  const queryTx = String(params.get('tx') || params.get('txn_id') || '').trim();
  if (queryTx) {
    try { localStorage.setItem(PENDING_TX_KEY, queryTx); } catch (_) {}
  }

  function pendingTx() {
    if (queryTx) return queryTx;
    try { return localStorage.getItem(PENDING_TX_KEY) || ''; } catch (_) { return ''; }
  }

  function clearPendingTx() {
    try { localStorage.removeItem(PENDING_TX_KEY); } catch (_) {}
  }

  function prefillReconcile() {
    const tx = pendingTx();
    if (reconcileInput && tx && !reconcileInput.value) reconcileInput.value = tx;
  }

  function showSignedOut(message = '') {
    signedOut.hidden = false;
    signedIn.hidden = true;
    if (status) {
      status.hidden = !message;
      status.className = 'notice error';
      status.textContent = message;
    }
  }

  function showSignedIn(accountData) {
    const user = accountData.user || {};
    const library = Array.isArray(accountData.library) ? accountData.library : [];
    signedOut.hidden = true;
    signedIn.hidden = false;
    if (status) status.hidden = true;
    if (name) name.textContent = user.display_name || 'Valois Media Reader';
    if (email) email.textContent = user.email || '';
    if (verification) {
      verification.textContent = user.email_verified ? 'Verified' : 'Verification required';
      verification.className = user.email_verified ? 'badge account-verified' : 'badge account-unverified';
    }
    if (libraryCount) libraryCount.textContent = `${library.length} ${library.length === 1 ? 'title' : 'titles'}`;
    prefillReconcile();
  }

  async function loadAccount() {
    if (!VMH_AUTH.token) { showSignedOut(); return; }
    if (status) { status.hidden = false; status.className = 'notice'; status.textContent = 'Loading your account…'; }
    try {
      const response = await VMH_API.post('account', { token: VMH_AUTH.token });
      if (!response.ok) throw new Error(response.error || 'Your session could not be verified.');
      showSignedIn(response.data || {});
    } catch (error) {
      VMH_AUTH.clear();
      showSignedOut(`${error.message || 'Your session has expired.'} Please sign in again.`);
    }
  }

  reconcileForm?.addEventListener('submit', async event => {
    event.preventDefault();
    if (!VMH_AUTH.token) { showSignedOut('Sign in before attaching a purchase.'); return; }
    const tx = String(reconcileInput?.value || '').trim();
    if (!tx) return;
    const button = reconcileForm.querySelector('button[type="submit"]');
    if (button) button.disabled = true;
    if (reconcileMessage) { reconcileMessage.textContent = 'Verifying the PayPal transaction…'; reconcileMessage.className = 'form-message'; }
    try {
      const response = await VMH_API.post('reconcile-purchase', { token: VMH_AUTH.token, tx });
      if (!response.ok) throw new Error(response.error || 'The purchase could not be attached.');
      clearPendingTx();
      const product = response.data?.product || {};
      if (reconcileMessage) {
        reconcileMessage.className = 'form-message success';
        reconcileMessage.innerHTML = `${product.title ? `${escapeHtml(product.title)} was attached to your account. ` : 'Purchase attached to your account. '}<a href="/library/">Open Your Library</a>.`;
      }
      await loadAccount();
    } catch (error) {
      if (reconcileMessage) { reconcileMessage.className = 'form-message error'; reconcileMessage.textContent = error.message || 'The purchase could not be attached.'; }
    } finally {
      if (button) button.disabled = false;
    }
  });

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  }

  signOutButton?.addEventListener('click', async () => {
    signOutButton.disabled = true;
    await VMH_AUTH.signOut();
    showSignedOut('You have been signed out.');
    signOutButton.disabled = false;
  });

  window.addEventListener('vmh:authchange', () => VMH_AUTH.token ? loadAccount() : showSignedOut());
  loadAccount();
})();
