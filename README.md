# InterTrack anonymous project page

Static project page for https://intertrack2026.github.io/.

## Publish on GitHub Pages

Push this repository to `intertrack2026/intertrack2026.github.io`.
In the repository's **Settings → Pages**, select **Deploy from a branch**,
then **main** and **/(root)**. After the Pages deployment completes, the
site is served at the URL above. No build command or custom domain is needed.
The root `index.html` and `.nojekyll` are included.

## Preview locally

Run `python -m http.server 8000` from this directory and open
http://localhost:8000/.

## Media to supply

The Details reader below the abstract loads `assets/papers/intertrack-full.pdf`
and starts at page 9. The current file contains 11 pages, synchronized from
the provided `root_full.pdf`. The website copy also sets its PDF opening action
to page 9; the new-tab link specifies the same page. The source PDF is unchanged.
When replacing the PDF at the same path, update the `?v=` version in the page's
three document URLs to avoid displaying a cached copy.

The reader supports continuous scrolling, text selection, page navigation,
zoom, fit width, fullscreen, and download. PDF.js 6.3.289 is hosted locally in
`assets/vendor/pdfjs/`, along with its license and supporting fonts/decoders.
No external viewer service is used. Preview through HTTP with the command above
(ES modules cannot load through `file://`); the direct PDF link remains available.

The following files are intentionally absent pending anonymization.
Their paths remain in the page; add approved replacements at the same paths
and reload to display them. Until then, the page displays placeholders.
Do not create empty MP4 or WebP files.

All retained video slots require replacements because the original footage
contains branding, people, recognizable recording locations, or old project
labels. The method overview also contains laboratory footage.

- `assets/videos/full-demo.mp4`
- `assets/videos/sonic-payload.mp4`
- `assets/videos/sonic-payload2.mp4`
- `assets/videos/sonic-terrain.mp4`
- `assets/videos/sonic-terrain2.mp4`
- `assets/videos/interaction-chair.mp4`
- `assets/videos/interaction-step.mp4`
- `assets/videos/interaction-payload.mp4`
- `assets/videos/robust-chair-removed.mp4`
- `assets/videos/robust-step-removed.mp4`
- `assets/videos/robust-disturbance.mp4`
- `assets/videos/robust-unsafe-commands.mp4`
- `assets/videos/motion-high-kick.mp4`
- `assets/videos/motion-tai-chi.mp4`
- `assets/videos/motion-jump.mp4`
- `assets/images/overview.webp`

The terrain pipeline image matches the submission figure and is exported
without embedded source-document metadata. Author names, affiliations,
personal links, contact details, institutional logos, analytics, the robot
transfer section, and the citation section are excluded.
