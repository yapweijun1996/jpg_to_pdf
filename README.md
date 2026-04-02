# JPG to PDF Converter

A pure frontend, locally running JPG to PDF converter.  
Images never leave the browser, PDFs are generated on-device, and conversion history is stored in IndexedDB on the current machine.

## Features

- Pure static frontend with no Node.js backend
- No cloud upload and no remote conversion
- Drag and drop or choose multiple JPG/JPEG files
- Preview, reorder, and remove images before conversion
- Generate PDFs locally in the browser using a vendored `pdf-lib`
- IndexedDB-based conversion history
- Automatic history cleanup after `50MB`
- PWA support with offline app shell
- Automatic frontend update checks
- Multi-language UI: English, Chinese, Japanese, and Malay

## Project Structure

- [index.html](/mnt/c/Users/tno/Documents/GitHub/jpg_to_pdf/index.html): app shell and markup
- [styles.css](/mnt/c/Users/tno/Documents/GitHub/jpg_to_pdf/styles.css): UI and layout styling
- [app.js](/mnt/c/Users/tno/Documents/GitHub/jpg_to_pdf/app.js): app logic, conversion flow, IndexedDB, and PWA behavior
- [i18n.js](/mnt/c/Users/tno/Documents/GitHub/jpg_to_pdf/i18n.js): translations and formatting helpers
- [service-worker.js](/mnt/c/Users/tno/Documents/GitHub/jpg_to_pdf/service-worker.js): cache and update logic
- [manifest.json](/mnt/c/Users/tno/Documents/GitHub/jpg_to_pdf/manifest.json): PWA manifest
- [icons/](/mnt/c/Users/tno/Documents/GitHub/jpg_to_pdf/icons): local app icons
- [vendor/pdf-lib.min.js](/mnt/c/Users/tno/Documents/GitHub/jpg_to_pdf/vendor/pdf-lib.min.js): vendored PDF library

## Running the App

This is a static frontend project. You can use it in either of these ways:

1. Open [index.html](/mnt/c/Users/tno/Documents/GitHub/jpg_to_pdf/index.html) directly
2. Serve the folder with any static server and open it in the browser

Notes:

- `file://` mode supports the core conversion flow
- For full PWA behavior, service worker support, installability, and automatic updates, use `http://localhost/...` or another `http/https` origin

## How It Works

1. Select or drop JPG/JPEG files
2. Reorder them in the workspace
3. Click `Convert to PDF`
4. The browser generates the PDF locally
5. Download the result and save it to local history

The app first tries to embed each file as a native JPEG. If a file has a `.jpg` extension but is not a clean standard JPEG internally, the app falls back to browser decoding and re-rasterizes it as PNG before writing it into the PDF.

## History Storage

History is stored in IndexedDB and includes:

- output file name
- generation timestamp
- page count
- PDF size
- source file names
- skipped file names for partial conversions
- PDF Blob data

Storage policy:

- hard limit of `50MB`
- checked after every successful save
- oldest entries are removed first when the limit is exceeded
- the newest entry is always retained

## PWA Behavior

- A service worker is registered when the app is opened on `http/https`
- The app shell is cached locally for offline loading
- The app actively checks for frontend updates
- When a newer version is detected, the PWA switches to the latest frontend code automatically

If the browser still shows an older version after you changed the source:

1. hard refresh the page
2. close old tabs and reopen the app
3. if needed, unregister the old service worker in DevTools

## Browser Notes

- Recommended: recent Chrome, Edge, or Firefox
- Input is limited to JPG/JPEG files
- Very large images or very large batches can consume significant browser memory

## Development Notes

- No bundler is required
- All assets are local
- No CDN is used
- No backend API is used
- No remote upload is used

## License

Add a license file to the repository if you want to publish this project with an explicit license.
