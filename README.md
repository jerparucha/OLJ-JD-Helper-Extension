# OnlineJobs.ph Description Helper

A browser extension that keeps the job description visible in a sidebar while you fill the application form on OnlineJobs.ph.

## How it works

1. Visit a job posting on OnlineJobs.ph — the description is automatically saved
2. Click Apply — you're taken to the application form
3. A toggle button (📋) appears at the bottom-right corner
4. Click it to open a sidebar with the full job description alongside the form
5. Click × or the button again to close it

Saved descriptions expire after 24 hours.

## Installation

1. Open Chrome or Edge (version 120+)
2. Go to `chrome://extensions` or `edge://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked**
5. Select the `OLJ Extension` folder

## Usage

- **Job listing page**: Description is saved automatically when the page loads
- **Application form**: Toggle button (📋) appears at bottom-right — click to show/hide the sidebar

## Architecture

```
OLJ Extension/
├── manifest.json          # Extension manifest (MV3)
├── icons/
└── src/
    ├── content.js         # Entry point — imports and initializes Flow
    ├── content.css        # All extension styles (injected by Chrome)
    ├── detector.js        # Page type detection and description extraction
    ├── flow.js            # Orchestrates logic for each page type
    ├── ui.js              # Sidebar and toggle button components
    └── utils/
        ├── logger.js      # Console logging wrapper
        └── storage.js     # localStorage persistence
```

Source files use ES module imports (`import`/`export`). Chrome resolves the import graph from `src/content.js` — only the entry point is listed in `manifest.json`.

## Development

To modify the extension:
1. Edit the relevant file (`ui.js` for UI, `detector.js` for page detection, `content.css` for styles)
2. Go to `chrome://extensions` and click the reload icon on the extension card
3. Refresh the OnlineJobs.ph page

**Changing the brand color**: update `--ojp-blue` and `--ojp-blue-dark` at the top of `src/content.css`.
