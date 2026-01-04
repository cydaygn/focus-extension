# Focus Mode Chrome Extension

Blocks distracting websites during focus sessions.

## 🚀 Features

- ⏱ Focus timer with live countdown
- 🚫 Block selected websites during focus mode
- 🛑 Custom block page instead of redirecting
- 🔴 “Stop Focus” button to exit anytime
- 🌐 Popular sites quick-add (YouTube, X, Instagram, etc.)
- 🧠 Daily focus logic-ready architecture
- 💾 Persistent state using Chrome Storage API

## 🖥 How It Works

1. User selects websites to block  
2. Sets a focus duration (in minutes)  
3. Starts focus mode  
4. While focus is active:
   - Blocked sites are intercepted
   - A custom block page is shown
   - Remaining time is displayed
5. Focus ends automatically or manually


## Tech
- JavaScript
- Chrome Extension API
This project demonstrates:
- Browser extension architecture
- State management without frameworks
- UX-focused decision making
- Clean separation of background & UI logic
- Real-world productivity use case

## 🛠 Installation (Developer Mode)
1. Clone the repository
2. Open `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked**
5. Select the project folder
