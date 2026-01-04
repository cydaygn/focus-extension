// 1. KURULUM VE VARSAYILAN AYARLAR
chrome.runtime.onInstalled.addListener(() => {
  // Varsayılan Siteleri Ayarla (Eğer liste boşsa)
  chrome.storage.local.get({ sites: [] }, (data) => {
    if (data.sites.length === 0) {
      chrome.storage.local.set({
        sites: ["x.com", "instagram.com", "youtube.com", "netflix.com"]
      });
    }
  });

  // Sağ Tık Menüsünü Oluştur (Sadece bir kez burada tanımlanmalı)
  chrome.contextMenus.create({
    id: "blockThisSite",
    title: "Bu siteyi odak listesine ekle",
    contexts: ["page"]
  });
});

// 2. SİTE ENGELLEME MANTIĞI
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (!changeInfo.url) return;
  // Chrome sistem sayfalarını engellemeye çalışma (Hata verir)
  if (changeInfo.url.startsWith("chrome://") || changeInfo.url.startsWith("chrome-extension://")) return;

  chrome.storage.local.get({ focusEndTime: null, sites: [] }, (data) => {
    // Odaklanma süresi yoksa veya süre bittiyse engelleme yapma
    if (!data.focusEndTime) return;
    if (Date.now() > data.focusEndTime) return;

    for (const site of data.sites) {
      if (changeInfo.url.includes(site)) {
        chrome.tabs.update(tabId, {
          url: chrome.runtime.getURL("block.html?site=" + encodeURIComponent(site))
        });
        break;
      }
    }
  });
});

// 3. ALARM VE BİLDİRİM YÖNETİMİ
chrome.storage.onChanged.addListener((changes) => {
  // Yeni bir odak süresi ayarlandığında alarm kur
  if (changes.focusEndTime && changes.focusEndTime.newValue) {
    chrome.alarms.create("focusEnd", {
      when: changes.focusEndTime.newValue
    });
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== "focusEnd") return;

  chrome.storage.local.get(
    { focusStartTime: null, dailyFocus: 0, focusDate: null },
    (data) => {
      const today = new Date().toDateString();
      let dailyFocus = (data.focusDate === today) ? data.dailyFocus : 0;

      if (data.focusStartTime) {
        dailyFocus += Date.now() - data.focusStartTime;
      }

      // Odaklanma bittiğinde verileri güncelle
      chrome.storage.local.set({
        focusEndTime: null,
        focusStartTime: null,
        dailyFocus,
        focusDate: today
      });

      // Türkçe Bildirim Gönder
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icon.png",
        title: "Odaklanma Tamamlandı",
        message: "Tebrikler, bir odaklanma seansını daha başarıyla bitirdin!"
      });
    }
  );
});

// 4. SAĞ TIK MENÜSÜ İLE SİTE EKLEME
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "blockThisSite") {
    try {
      const url = new URL(tab.url);
      const domain = url.hostname.replace("www.", "");

      chrome.storage.local.get({ sites: [] }, (data) => {
        if (!data.sites.includes(domain)) {
          const updatedSites = [...data.sites, domain];
          chrome.storage.local.set({ sites: updatedSites }, () => {
            chrome.notifications.create({
              type: "basic",
              iconUrl: "icon.png",
              title: "Site Eklendi",
              message: `${domain} artık odak listende!`
            });
          });
        }
      });
    } catch (e) {
      console.error("URL okunamadı.");
    }
  }
});