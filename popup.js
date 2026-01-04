const input = document.getElementById("siteInput");
const addBtn = document.getElementById("addSite");
const list = document.getElementById("siteList");
const startBtn = document.getElementById("startFocus");
const stopBtn = document.getElementById("stopFocus");
const timerText = document.getElementById("timer");
const timeInput = document.getElementById("timeInput");
const popularContainer = document.getElementById("popularSites");
const dailyFocusEl = document.getElementById("dailyFocus");

const popularSites = ["x.com", "instagram.com", "youtube.com", "netflix.com"];

// Günlük İstatistikleri Göster
function renderDailyFocus() {
  chrome.storage.local.get({ dailyFocus: 0, focusDate: null }, (data) => {
    const today = new Date().toDateString();
    if (data.focusDate !== today) {
      dailyFocusEl.textContent = "Bugün: 0 dk";
      return;
    }
    const minutes = Math.floor(data.dailyFocus / 60000);
    dailyFocusEl.textContent = `Bugün: ${minutes} dk odaklandın`;
  });
}

// Popüler Siteleri Listele
function renderPopularSites() {
  chrome.storage.local.get({ sites: [] }, (data) => {
    popularContainer.innerHTML = "";
    popularSites.forEach(site => {
      const btn = document.createElement("button");
      btn.textContent = site;
      const active = data.sites.includes(site);
      if (active) btn.style.borderColor = "white";

      btn.onclick = () => {
        let sites = [...data.sites];
        if (active) sites = sites.filter(s => s !== site);
        else sites.push(site);
        chrome.storage.local.set({ sites }, render);
      };
      popularContainer.appendChild(btn);
    });
  });
}

// Site Ekle
addBtn.onclick = () => {
  const site = input.value.trim().toLowerCase();
  if (!site) return;
  chrome.storage.local.get({ sites: [] }, (data) => {
    if (!data.sites.includes(site)) {
      chrome.storage.local.set({ sites: [...data.sites, site] }, () => {
        input.value = "";
        render();
      });
    }
  });
};

// Listeyi Çiz
function render() {
  chrome.storage.local.get({ sites: [] }, (data) => {
    list.innerHTML = "";
    data.sites.forEach((site, index) => {
      const li = document.createElement("li");
      li.innerHTML = `<span>${site}</span><button data-index="${index}">X</button>`;
      li.querySelector("button").onclick = () => removeSite(index);
      list.appendChild(li);
    });
    renderPopularSites();
    
    // Otomatik Kaydırma (Yeni eklenen siteyi gör)
    const container = document.querySelector('.list-container');
    container.scrollTop = container.scrollHeight;
  });
}

function removeSite(index) {
  chrome.storage.local.get({ sites: [] }, (data) => {
    const sites = data.sites;
    sites.splice(index, 1);
    chrome.storage.local.set({ sites }, render);
  });
}

// Odaklanma Kontrolleri
startBtn.onclick = () => {
  const mins = Number(timeInput.value);
  if (mins <= 0) return;
  const endTime = Date.now() + mins * 60000;
  chrome.storage.local.set({ focusEndTime: endTime, focusStartTime: Date.now() });
};

stopBtn.onclick = () => {
  chrome.storage.local.set({ focusEndTime: null });
};

// Sayaç Güncelleme
setInterval(() => {
  chrome.storage.local.get({ focusEndTime: null }, (data) => {
    if (!data.focusEndTime) {
      timerText.textContent = "Başlamadı";
      return;
    }
    const remaining = data.focusEndTime - Date.now();
    if (remaining <= 0) {
      timerText.textContent = "Süre Doldu!";
      chrome.storage.local.set({ focusEndTime: null });
      return;
    }
    const m = Math.floor(remaining / 60000);
    const s = Math.floor((remaining % 60000) / 1000);
    timerText.textContent = `${m}:${s.toString().padStart(2, "0")}`;
  });
  renderDailyFocus();
}, 1000);

render();