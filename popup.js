const input = document.getElementById("siteInput");
const addBtn = document.getElementById("addSite");
const list = document.getElementById("siteList");
const startBtn = document.getElementById("startFocus");
const stopBtn = document.getElementById("stopFocus");
const timerText = document.getElementById("timer");
const timeInput = document.getElementById("timeInput");
const popularContainer = document.getElementById("popularSites");

const popularSites = [
  "youtube.com",
  "twitter.com",
  "x.com",
  "instagram.com"
];
const dailyFocusEl = document.getElementById("dailyFocus");

function renderDailyFocus() {
  chrome.storage.local.get(
    { dailyFocus: 0, focusDate: null },
    (data) => {
      const today = new Date().toDateString();

      if (data.focusDate !== today) {
        dailyFocusEl.textContent = "Today: 0 min";
        return;
      }

      const minutes = Math.floor(data.dailyFocus / 60000);
      dailyFocusEl.textContent = `Today: ${minutes} min focused`;
    }
  );
}

// popup açıkken güncelle
setInterval(renderDailyFocus, 2000);
renderDailyFocus();

function renderPopularSites() {
  chrome.storage.local.get({ sites: [] }, (data) => {
    popularContainer.innerHTML = "";

    popularSites.forEach(site => {
      const btn = document.createElement("button");
      btn.textContent = site;

      const active = data.sites.includes(site);

      btn.style.padding = "6px 10px";
      btn.style.borderRadius = "6px";
      btn.style.border = "none";
      btn.style.cursor = "pointer";
      btn.style.background = active ? "#ff4d4d" : "#ddd";
      btn.style.color = active ? "white" : "black";

      btn.onclick = () => {
        let sites = [...data.sites];

        if (active) {
          sites = sites.filter(s => s !== site);
        } else {
          sites.push(site);
        }

        chrome.storage.local.set({ sites }, render);
      };

      popularContainer.appendChild(btn);
    });
  });
}

// ---------- SITE EKLE ----------
addBtn.onclick = () => {
  const site = input.value.trim();
  if (!site) return;

  chrome.storage.local.get({ sites: [] }, (data) => {
    chrome.storage.local.set({ sites: [...data.sites, site] });
    input.value = "";
    render();
  });
};

// popup açıkken güncelle
setInterval(renderDailyFocus, 2000);
renderDailyFocus();

// ---------- LISTE ----------
function render() {
  chrome.storage.local.get({ sites: [] }, (data) => {
    list.innerHTML = "";
    data.sites.forEach((site, index) => {
      const li = document.createElement("li");
      li.textContent = site;

      const del = document.createElement("button");
      del.textContent = "X";
      del.onclick = () => removeSite(index);

      li.appendChild(del);
      list.appendChild(li);
    });

    renderPopularSites();
  });
}

function removeSite(index) {
  chrome.storage.local.get({ sites: [] }, (data) => {
    const sites = data.sites;
    sites.splice(index, 1);
    chrome.storage.local.set({ sites });
    render();
  });
}

// ---------- FOCUS ----------
startBtn.onclick = () => {
  const minutes = Number(timeInput.value);
  if (!minutes || minutes <= 0) return;

  const endTime = Date.now() + minutes * 60 * 1000;

  chrome.storage.local.set({
    focusEndTime: endTime,
    focusStartTime: Date.now()
  });
};

stopBtn.onclick = () => {
  chrome.storage.local.set({ focusEndTime: null });
};

// ---------- TIMER ----------
setInterval(() => {
  chrome.storage.local.get({ focusEndTime: null }, (data) => {
    if (!data.focusEndTime) {
      timerText.textContent = "Not started";
      return;
    }

    const remaining = data.focusEndTime - Date.now();

    if (remaining <= 0) {
      timerText.textContent = "Focus finished";
      chrome.storage.local.set({ focusEndTime: null });
      return;
    }

    const min = Math.floor(remaining / 60000);
    const sec = Math.floor((remaining % 60000) / 1000);
    timerText.textContent = `${min}:${sec.toString().padStart(2, "0")}`;
  });
}, 1000);

render();
