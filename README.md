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

## Media status

The Details reader below the abstract loads `assets/papers/intertrack-full.pdf`
and starts at page 9. The current file contains 10 pages and matches
the manuscript project's `intertrack-full.pdf` in page text. Pages 1–8 match
the eight-page submission `root.pdf` apart from five intentional cross-reference
changes from “the website” to Appendix A–D. Pages 9–10 contain that appendix.
The website copy also sets its PDF opening action
to page 9; the new-tab link specifies the same page. The source PDF is unchanged.
When replacing the PDF at the same path, update the `?v=` version in the page's
three document URLs to avoid displaying a cached copy.

The reader supports continuous scrolling, text selection, page navigation,
zoom, fit width, fullscreen, and download. PDF.js 6.3.289 is hosted locally in
`assets/vendor/pdfjs/`, along with its license and supporting fonts/decoders.
No external viewer service is used. Preview through HTTP with the command above
(ES modules cannot load through `file://`); the direct PDF link remains available.

All 15 videos referenced by the page are now included in `assets/videos/`.
Except for the replacement described below, the original files were restored
without editing or anonymization. They may
contain branding, people, recognizable recording locations, or old project
labels and still require review before use in an anonymous submission.

`assets/images/overview.webp` is exported from the manuscript's current
`figures/overview.pdf`. It includes the same laboratory imagery as the paper.
All video and image paths referenced by the page have corresponding files.

On 2026-09-16, `robust-unsafe-commands.mp4` was replaced with the supplied
`robust_sim_ours.mp4`, whose labels are “W/O filter” and “Ours”. The web copy
uses H.264 / yuv420p at 1280×720 and 30 fps, CRF 23 with the slow preset,
and MP4 fast-start for progressive playback. Its 198 video frames are retained;
the silent audio track and source metadata are omitted. The file is 2,053,788
bytes (61.1% smaller than the supplied original). The HTML URL includes a
content version to invalidate the previous video's cache.

The full demo still includes an unqualified “The First Behavior World Model”
subtitle and cross-embodiment and household-task clips beyond the experiments
reported in the manuscript. That video has not been edited; its claims need
to be resolved separately from the HTML text.

The terrain pipeline image matches the submission figure and is exported
without embedded source-document metadata. In the page text, author names, affiliations,
personal links, contact details, institutional logos, analytics, the robot
transfer section, and the citation section are excluded.
