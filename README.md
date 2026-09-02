[README.md](https://github.com/user-attachments/files/31742993/README.md)
# Valois Media Website — v1.1.0 Alpha

<p align="center">
  <a href="https://www.valoismedia.com/">
    <img src="assets/VMHLogo01.png" alt="Valois Media Holdings" width="220">
  </a>
  &nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://www.valoismedia.com/lumiere/">
    <img src="assets/Lumiere01.png" alt="VMH Lumière" width="330">
  </a>
</p>

<p align="center"><strong>Independent Publishing • Digital Editions • VMH Lumière</strong></p>


Official website repository for **Valois Media Holdings**, published at **www.valoismedia.com**.

Copyright © 2026 Valois Media Holdings | All Rights Reserved | Developed by Cook Technology Services | https://cts.cook-international.com | Last Updated on 02 September 2026 at 14:42:06Z

## 2 September 2026 platform update

- Stabilized **VMH Lumière** so entitled customers can read purchased EPUB editions online from repository-hosted `/assets/products/` files.
- Kept the existing VMH Google Sheet schema unchanged; account, order, entitlement, and reading-progress fields continue to use the current hardcoded schema in `Code.gs`.
- Added **Reconcile Purchase** account workflow so verified PayPal transactions can be attached to the currently signed-in VMH account and exposed in the Library for online reading.
- Repositioned `/purchase-complete/` as the purchase-reconciliation experience while direct PayPal-button downloads remain independent.
- Added `/editorial-standards/` and expanded the Terms of Service, Privacy Policy, and Copyright pages.
- Added **Editorial Standards** immediately above **Terms of Service** in the Legal footer.
- Expanded Copyright presentation with linked VMH products and their correct cover assets, including separate treatment of the annotated and standard *The Sun Also Rises* editions.
- Apps Script build metadata synchronized to `2026-09-02T14:42:06Z`.

## Included

- Static GitHub Pages-compatible website
- Universal responsive header and footer
- Product catalog powered by Google Sheets / Apps Script, with JSON fallbacks
- Contributor profiles and role-based product credits
- Website-hosted PayPal Hosted Buttons
- Amazon and Barnes & Noble link support
- Account registration, verification, login, password reset, library, downloads, and entitlements
- VMH Lumière entitlement-gated in-browser EPUB reader using repository-hosted `/assets/products/` files
- Contact and newsletter endpoints
- Editorial Standards, Terms of Service, Privacy Policy, and Copyright legal pages
- Google Drive asset synchronization using extension-friendly base filenames
- Canonical TSV files in `/data`
- Cover preview-link mapping in `/data/cover-links.tsv`

## Important configured URLs

- Site: `https://www.valoismedia.com`
- Apps Script: `https://script.google.com/macros/s/AKfycbx55-lohe06sBVDhjlNsL9lTzTN1GvIrmUcrQZVduu9-5CBTmjzX9vZj6A5pqVm_szr/exec`
- Spreadsheet ID: `1zxO63LYFzyqRn66UYAekXVGyZkIXYdGbGOlsVqqDKr8`
- Drive folder ID: `13NYcriBG-ohPxi8SP_2X4D2S7Nv9_wIC`

## Logo behavior

Clicking `VMHLogo01` in the universal header or footer opens:

`https://www.valoismedia.com/`

The destination is controlled by `logoHomeUrl` in `/assets/js/config.js`.

README branding uses the checked-in assets:

- `assets/VMHLogo01.png` — Valois Media Holdings logo, linked to `https://www.valoismedia.com/`.
- `assets/Lumiere01.png` — VMH Lumière logo, linked to `https://www.valoismedia.com/lumiere/`.


## Deploy Apps Script

1. Open the Apps Script project named `VMH Website`.
2. Replace `Code.gs` with `/apps-script/Code.gs`.
3. Replace the manifest with `/apps-script/appsscript.json`.
4. Run `setupWorkbook()`.
5. Run `setupAccountSecrets()`.
6. Add these Script Properties:
   - `PAYPAL_PDT_IDENTITY_TOKEN`
   - `PAYPAL_RECEIVER_EMAIL`
7. Run `syncDriveAssetsFromFolder()`.
8. Deploy a new web-app version executing as the deploying user with public access required by the frontend.
9. Confirm `health`:
   `WEB_APP_URL?action=health`

## PayPal requirements

Hosted button IDs are stored only in `/assets/js/config.js`. Configure each PayPal Hosted Button's **item number** as the matching VMH product slug. Direct-download behavior may remain configured in the PayPal button itself. The VMH `/purchase-complete/` page is used to reconcile the returned PayPal transaction ID (`tx`) to the currently signed-in account so the corresponding entitlement appears in the customer Library and can be opened in VMH Lumière.

## Drive asset naming

`syncDriveAssetsFromFolder()` is extension-friendly: the `drive_file_name` value is treated as a base name and matched against supported file extensions.

Cover images may continue to use the `covers` subfolder and legacy Drive synchronization. VMH Lumière and account eBook delivery use the checked-in repository files under `/assets/products/`; Google Drive is not the canonical EPUB reader source.

## GitHub Pages

- Repository: `CookInternational/Valois-Media`
- CNAME: `www.valoismedia.com`
- Publish from the root of the `main` branch.

## Legal note

The included legal pages are operational drafts based on the facts supplied. They should be reviewed by qualified counsel before production launch.


## v1.1.0 Alpha changes

- Renamed the branded reader to **VMH Lumière** throughout the repository.
- Corrected header and footer logo links to `https://www.valoismedia.com/`.
- Doubled the desktop header logo dimensions.
- Added dynamic Login / Account navigation to the right of Contact.
- Added a signed-in account dashboard and sign-out flow.
- Added branded VMH Lumière empty, loading, sign-in, and error states.
- Expanded Terms of Service, Privacy Policy, and Copyright pages.
- Added the Editorial Standards page and Legal-footer link above Terms of Service.
- Added account-side PayPal purchase reconciliation without changing the Google Sheet schema.
- Moved VMH Lumière EPUB rendering to repository-hosted `/assets/products/` files with browser-side EPUB.js/JSZip rendering.
- Preserved entitlement-gated reading and existing reading-progress fields in the Entitlements sheet.

Copyright © 2026 Cook Services Company, LLC | All Rights Reserved | Developed by Cook Technology Services | https://cts.cook-international.com | Last Updated on 02 September 2026 at 14:42:06Z
