const mediaFrames = document.querySelectorAll("[data-video]");

async function resourceExists(source) {
  // Browsers do not allow fetch/HEAD requests for local file URLs.
  if (window.location.protocol === "file:") {
    return true;
  }

  try {
    const response = await fetch(source, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
}

function createVideo(source, label) {
  const video = document.createElement("video");
  video.src = source;
  video.controls = true;
  video.autoplay = true;
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = "metadata";
  video.setAttribute("aria-label", label || "Demo video");
  return video;
}

async function attachMedia(frame) {
  const placeholder = frame.firstElementChild?.cloneNode(true);
  const source = frame.dataset.video;

  try {
    if (!source || !(await resourceExists(source))) {
      return;
    }

    const media = createVideo(source, frame.dataset.label);
    const loaded = await new Promise((resolve) => {
      const cleanup = () => {
        media.removeEventListener("loadedmetadata", onLoad);
        media.removeEventListener("error", onError);
      };
      const onLoad = () => {
        cleanup();
        resolve(true);
      };
      const onError = () => {
        cleanup();
        media.remove();
        resolve(false);
      };

      media.addEventListener("loadedmetadata", onLoad, { once: true });
      media.addEventListener("error", onError, { once: true });
      frame.replaceChildren(media);
    });

    if (loaded) {
      return;
    }
  } catch {
    // Keep the release placeholder if the video cannot be loaded.
  }

  if (!frame.firstChild && placeholder) {
    frame.replaceChildren(placeholder);
  }
}

if ("IntersectionObserver" in window) {
  const mediaObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        mediaObserver.unobserve(entry.target);
        attachMedia(entry.target);
      });
    },
    { rootMargin: "320px 0px" },
  );

  mediaFrames.forEach((frame) => mediaObserver.observe(frame));
} else {
  mediaFrames.forEach(attachMedia);
}

function scrollToHash() {
  if (!window.location.hash) {
    return;
  }

  const target = document.querySelector(window.location.hash);
  target?.scrollIntoView({ block: "start" });
}

window.addEventListener("load", () => window.requestAnimationFrame(scrollToHash));
window.addEventListener("hashchange", scrollToHash);

// Keep the figure placeholder until an approved replacement is available.
async function attachFigure(frame) {
  const source = frame.dataset.image;
  if (!source || !(await resourceExists(source))) return;
  const image = new Image();
  image.alt = frame.dataset.label || "Method figure";
  image.decoding = "async";
  image.addEventListener("load", () => {
    const link = document.createElement("a");
    link.href = source;
    link.target = "_blank";
    link.rel = "noopener";
    link.append(image);
    frame.replaceChildren(link);
  }, { once: true });
  image.src = source;
}
document.querySelectorAll("[data-image]").forEach(attachFigure);
