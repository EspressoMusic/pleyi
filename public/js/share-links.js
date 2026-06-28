/* Room link sharing — native Web Share API + social network fallbacks */

function buildRoomSharePayload(code, title) {
  const url = `${window.location.origin}/join?code=${code}`;
  const shareTitle = title || "חדר Pleyi";
  const text = `הצטרפו לחדר ${shareTitle} ב-Pleyi! קוד: ${code}`;
  return { url, title: shareTitle, text };
}

function getSocialShareLinks({ url, title, text }) {
  const fullText = `${text}\n${url}`;
  return {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(fullText)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(fullText)}`,
  };
}

function populateSocialShareGrid(container, payload) {
  if (!container || !payload) return;
  const links = getSocialShareLinks(payload);
  container.querySelectorAll("[data-share-network]").forEach((el) => {
    const network = el.dataset.shareNetwork;
    if (links[network]) el.href = links[network];
  });
}

async function shareRoomLink({ code, title, socialContainer, onNativeSuccess, onSocialShown }) {
  if (!code || code === "------") return false;
  const payload = buildRoomSharePayload(code, title);

  const preferNative = navigator.share && window.matchMedia("(pointer: coarse)").matches;

  if (preferNative) {
    try {
      await navigator.share({ title: payload.title, text: payload.text, url: payload.url });
      onNativeSuccess?.();
      return true;
    } catch (err) {
      if (err?.name === "AbortError") return true;
    }
  }

  if (socialContainer) {
    populateSocialShareGrid(socialContainer, payload);
    socialContainer.classList.remove("hidden");
    onSocialShown?.();
    return true;
  }

  return false;
}
