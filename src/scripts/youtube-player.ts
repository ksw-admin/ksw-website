// Click-to-load YouTube player, shared by the home video (VideoFacade.astro) and videos in Markdown texts
// (VideoEmbeds.astro). Nothing loads from Google before the click; then the player comes from youtube-nocookie.com.

/** The player iframe for a video, focused once it replaces the placeholder. */
export function youtubeIframe(id: string, title?: string): HTMLIFrameElement {
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
  iframe.title = title ?? 'YouTube';
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  iframe.allowFullscreen = true;
  return iframe;
}

/**
 * For every box matching `selector` (with data-yt and data-title): a click on its play button puts the player in
 * place, either replacing the box's content ("content") or just the button ("button", keeps a caption below).
 */
export function initYoutubePlayers(selector: string, buttonSelector: string, replace: 'content' | 'button') {
  document.querySelectorAll<HTMLElement>(selector).forEach((box) => {
    const button = box.querySelector<HTMLElement>(buttonSelector);
    button?.addEventListener('click', () => {
      const iframe = youtubeIframe(box.dataset.yt!, box.dataset.title);
      if (replace === 'content') box.replaceChildren(iframe);
      else button.replaceWith(iframe);
      iframe.focus();
    });
  });
}
