// ---------- DEFAULT SITES ----------
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get({ sites: [] }, (data) => {
    if (data.sites.length === 0) {
      chrome.storage.local.set({
        sites: ["youtube.com", "twitter.com", "x.com", "instagram.com"]
      });
    }
  });
});

// ---------- SITE BLOCKING ----------
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (!changeInfo.url) return;
  if (changeInfo.url.startsWith("chrome://")) return;
  if (changeInfo.url.startsWith("chrome-extension://")) return;

  chrome.storage.local.get({ focusEndTime: null, sites: [] }, (data) => {
    if (!data.focusEndTime) return;
    if (Date.now() > data.focusEndTime) return;

    for (const site of data.sites) {
      if (changeInfo.url.includes(site)) {
        chrome.tabs.update(tabId, {
          url: chrome.runtime.getURL(
            "block.html?site=" + encodeURIComponent(site)
          )
        });
        break;
      }
    }
  });
});

// ---------- START FOCUS (ALARM SET) ----------
chrome.storage.onChanged.addListener((changes) => {
  if (changes.focusEndTime && changes.focusEndTime.newValue) {
    chrome.alarms.create("focusEnd", {
      when: changes.focusEndTime.newValue
    });
  }
});

// ---------- ALARM HANDLER ----------
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== "focusEnd") return;

  chrome.storage.local.get(
    {
      focusStartTime: null,
      dailyFocus: 0,
      focusDate: null
    },
    (data) => {
      const today = new Date().toDateString();
      let dailyFocus = data.dailyFocus || 0;

      if (data.focusDate !== today) {
        dailyFocus = 0;
      }

      if (data.focusStartTime) {
        dailyFocus += Date.now() - data.focusStartTime;
      }

      chrome.storage.local.set({
        focusEndTime: null,
        focusStartTime: null,
        dailyFocus,
        focusDate: today
      });

      chrome.notifications.create({
        type: "basic",
        iconUrl: "icon.png",
        title: "Focus Completed",
        message: "Your focus session has ended."
      });
    }
  );
});
