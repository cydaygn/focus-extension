const countdownEl = document.getElementById("countdown");
const blockedSiteEl = document.getElementById("blockedSite");
const stopBtn = document.getElementById("stopFocus");

const params = new URLSearchParams(window.location.search);
const site = params.get("site");

blockedSiteEl.textContent = site
  ? `${site} is blocked during focus mode`
  : "This site is blocked during focus mode";

stopBtn.onclick = () => {
  chrome.storage.local.set({ focusEndTime: null });
};

setInterval(() => {
  chrome.storage.local.get({ focusEndTime: null }, (data) => {
    if (!data.focusEndTime) {
      countdownEl.textContent = "Focus stopped";
      return;
    }

    const remaining = data.focusEndTime - Date.now();

    if (remaining <= 0) {
      chrome.storage.local.set({ focusEndTime: null });
      countdownEl.textContent = "Focus finished";
      return;
    }

    const min = Math.floor(remaining / 60000);
    const sec = Math.floor((remaining % 60000) / 1000);
    countdownEl.textContent = `${min}:${sec.toString().padStart(2, "0")}`;
  });
}, 1000);
