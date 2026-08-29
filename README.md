# Valois Media Website — v1.1.0 Alpha

Official website repository for **Valois Media Holdings**, published at **www.valoismedia.com**.

Copyright © 2026 Valois Media Holdings | All Rights Reserved | Developed by Cook Technology Services | https://cts.cook-international.com | Last Updated on 23 June 2026 at 05:17:00Z

## Included

- Static GitHub Pages-compatible website
- Universal responsive header and footer
- Product catalog powered by Google Sheets / Apps Script, with JSON fallbacks
- Contributor profiles and role-based product credits
- Website-hosted PayPal Hosted Buttons
- Amazon and Barnes & Noble link support
- Account registration, verification, login, password reset, library, downloads, and entitlements
- VMH Lumière protected in-browser reader
- Contact and newsletter endpoints
- Terms of Service, Privacy Policy, and Copyright pages
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

Hosted button IDs are stored only in `/assets/js/config.js`. Configure each PayPal Hosted Button's **item number** as the matching VMH product slug. Configure PayPal's return URL to your post-purchase page or to a page that calls `verify-paypal-return` with the returned `tx`.

## Drive asset naming

`syncDriveAssetsFromFolder()` is extension-friendly: the `drive_file_name` value is treated as a base name and matched against supported file extensions.

Cover images use the `covers` subfolder. EPUBs use the main VMH folder or nested folders.

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

Copyright © 2026 Cook Services Company, LLC | All Rights Reserved | Developed by Cook Technology Services | https://cts.cook-international.com | Last Updated on 23 June 2026 at 05:17:00Z
