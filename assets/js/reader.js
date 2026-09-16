const reader = document.querySelector('.pdf-reader');
const readerScriptUrl = document.currentScript.src;

async function startReader() {
  const scroller = reader.querySelector('.pdf-scroll');
  const pages = reader.querySelector('.pdf-pages');
  const loading = reader.querySelector('.pdf-loading');
  const input = reader.querySelector('.pdf-page-input');
  const status = reader.querySelector('.pdf-status');
  const button = action => reader.querySelector(`[data-action="${action}"]`);
  let pdf, pdfjs, current = 1, scale = 1, fit = true, generation = 0;
  let items = [], observer, resizeTimer, scrollTick = false;

  function updateControls() {
    input.value = current;
    button('previous').disabled = current === 1;
    button('next').disabled = current === pdf.numPages;
    button('zoom-out').disabled = scale <= 0.25;
    button('zoom-in').disabled = scale >= 3;
    reader.querySelector('.pdf-zoom-value').textContent = `${Math.round(scale * 100)}%`;
    reader.querySelector('.pdf-progress > span').style.width = `${current / pdf.numPages * 100}%`;
    status.textContent = `Page ${current} of ${pdf.numPages}`;
  }

  function jump(number) {
    if (!pdf) return;
    current = Math.max(1, Math.min(pdf.numPages, Math.round(number) || current));
    scroller.scrollTop = pages.offsetTop + items[current - 1].element.offsetTop - 16;
    renderPage(items[current - 1]);
    updateControls();
  }

  async function renderPage(item) {
    if (item.started) return;
    item.started = true;
    const revision = generation;
    const viewport = item.page.getViewport({ scale });
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(viewport.width * pixelRatio);
    canvas.height = Math.ceil(viewport.height * pixelRatio);
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;
    canvas.setAttribute('aria-hidden', 'true');
    item.sheet.append(canvas);
    try {
      item.task = item.page.render({ canvasContext: canvas.getContext('2d'), viewport,
        transform: pixelRatio === 1 ? null : [pixelRatio, 0, 0, pixelRatio, 0, 0] });
      await item.task.promise;
      if (revision !== generation) return;
      item.element.dataset.rendered = 'true';
      const textContainer = document.createElement('div');
      textContainer.className = 'textLayer';
      textContainer.style.setProperty('--total-scale-factor', viewport.scale);
      textContainer.style.setProperty('--scale-round-x', '1px');
      textContainer.style.setProperty('--scale-round-y', '1px');
      item.sheet.append(textContainer);
      item.textLayer = new pdfjs.TextLayer({ textContentSource: item.page.streamTextContent(), container: textContainer, viewport });
      await item.textLayer.render();
    } catch (error) {
      if (revision !== generation || error.name === 'RenderingCancelledException' || error.name === 'AbortException') return;
      status.textContent = 'This page could not be displayed. Open the PDF using the link above.';
    }
  }

  function layout() {
    generation++;
    observer?.disconnect();
    items.forEach(item => { item.task?.cancel(); item.textLayer?.cancel(); });
    if (fit) {
      const padding = window.innerWidth <= 700 ? 20 : 48;
      scale = Math.min(scroller.clientWidth - padding, 940) / items[0].page.getViewport({ scale: 1 }).width;
    }
    const fragment = document.createDocumentFragment();
    items.forEach((item, index) => {
      const viewport = item.page.getViewport({ scale });
      const element = document.createElement('div');
      element.className = 'pdf-page';
      element.dataset.page = index + 1;
      element.setAttribute('role', 'region');
      element.setAttribute('aria-label', `Page ${index + 1}`);
      const sheet = document.createElement('div');
      sheet.className = 'pdf-sheet';
      sheet.style.width = `${viewport.width}px`;
      sheet.style.height = `${viewport.height}px`;
      const label = document.createElement('p');
      label.className = 'pdf-page-label';
      label.textContent = String(index + 1).padStart(2, '0');
      label.setAttribute('aria-hidden', 'true');
      element.append(sheet, label);
      fragment.append(element);
      Object.assign(item, { element, sheet, started: false, task: null, textLayer: null });
    });
    pages.replaceChildren(fragment);
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) renderPage(items[Number(entry.target.dataset.page) - 1]); });
    }, { root: scroller, rootMargin: '500px 0px' });
    items.forEach(item => observer.observe(item.element));
    jump(current);
  }

  try {
    const base = new URL('../vendor/pdfjs/', readerScriptUrl).href;
    pdfjs = await import(`${base}pdf.min.mjs`);
    pdfjs.GlobalWorkerOptions.workerSrc = `${base}pdf.worker.min.mjs`;
    pdf = await pdfjs.getDocument({ url: reader.dataset.pdf, cMapUrl: `${base}cmaps/`, cMapPacked: true,
      standardFontDataUrl: `${base}standard_fonts/`, wasmUrl: `${base}wasm/`, isEvalSupported: false }).promise;
    items = await Promise.all(Array.from({ length: pdf.numPages }, async (_, index) => ({ page: await pdf.getPage(index + 1) })));
    const requestedPage = Number(reader.dataset.startPage) || 1;
    current = requestedPage <= pdf.numPages ? requestedPage : 1;
    input.max = pdf.numPages;
    reader.querySelector('.pdf-page-count').textContent = pdf.numPages;
    reader.querySelector('.pdf-document-info').textContent = `Technical details · ${pdf.numPages} pages`;
    loading.hidden = true;
    reader.querySelectorAll('button, input').forEach(control => { control.disabled = false; });
    scroller.setAttribute('aria-busy', 'false');
    layout();
    input.addEventListener('change', () => jump(Number(input.value)));
    input.addEventListener('keydown', event => {
      if (event.key === 'Enter') { jump(Number(input.value)); input.blur(); }
    });
    button('previous').addEventListener('click', () => jump(current - 1));
    button('next').addEventListener('click', () => jump(current + 1));
    for (const [action, delta] of [['zoom-in', 0.2], ['zoom-out', -0.2]]) {
      button(action).addEventListener('click', () => { fit = false; scale = Math.max(0.25, Math.min(3, scale + delta)); layout(); });
    }
    button('fit').addEventListener('click', () => { fit = true; layout(); });
    scroller.addEventListener('scroll', () => {
      if (scrollTick) return;
      scrollTick = true;
      requestAnimationFrame(() => {
        scrollTick = false;
        const probe = scroller.scrollTop + 80 - pages.offsetTop;
        let page = 1;
        items.forEach((item, index) => { if (item.element.offsetTop <= probe) page = index + 1; });
        if (current !== page) { current = page; updateControls(); }
      });
    }, { passive: true });
    let lastWidth = scroller.clientWidth;
    new ResizeObserver(() => {
      if (scroller.clientWidth === lastWidth) return;
      lastWidth = scroller.clientWidth;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { if (fit) layout(); }, 120);
    }).observe(scroller);
  } catch {
    loading.textContent = 'The document could not be loaded. Please use “Open in a new tab” above.';
    scroller.setAttribute('aria-busy', 'false');
    status.textContent = 'PDF reader unavailable';
  }

  const fullscreen = button('fullscreen');
  if (!document.fullscreenEnabled) fullscreen.hidden = true;
  fullscreen.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement === reader) await document.exitFullscreen();
      else await reader.requestFullscreen();
    } catch { status.textContent = 'Fullscreen is unavailable in this browser.'; }
  });
  document.addEventListener('fullscreenchange', () => {
    const active = document.fullscreenElement === reader;
    fullscreen.setAttribute('aria-label', active ? 'Exit fullscreen' : 'Enter fullscreen');
    fullscreen.title = active ? 'Exit fullscreen' : 'Fullscreen';
  });
}

if (reader && window.location.protocol === 'file:') {
  reader.querySelector('.pdf-loading').textContent = 'For the embedded reader, use a local web preview. You can also open the document with “Open in a new tab” above.';
  reader.querySelector('.pdf-status').textContent = 'Local file preview';
  reader.querySelector('.pdf-scroll').setAttribute('aria-busy', 'false');
  reader.querySelector('[data-action="fullscreen"]').disabled = true;
} else if (reader) {
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); startReader(); }
  }, { rootMargin: '500px' });
  observer.observe(reader);
}
