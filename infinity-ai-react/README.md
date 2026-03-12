# Infinity AI — React App

A beautiful AI chat interface powered by Claude & Gemini.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v16 or higher → https://nodejs.org
- An **Anthropic API key** → https://console.anthropic.com/settings/keys
- (Optional) A **Gemini API key** → https://aistudio.google.com/app/apikey

---

## 📦 Installation

1. **Extract** this zip file to a folder

2. **Open terminal** in that folder and run:
   ```bash
   npm install
   ```
   *(This installs all dependencies — takes ~1-2 minutes the first time)*

3. **Start the app:**
   ```bash
   npm start
   ```
   The app opens automatically at **http://localhost:3000**

---

## 🔑 Adding Your API Key

1. Click the **API Key** button in the chat input bar
2. Paste your Claude API key (starts with `sk-ant-...`)
3. Click **Save Keys**
4. Start chatting!

---

## 📁 Project Structure

```
infinity-ai-react/
├── public/
│   └── index.html          # HTML entry point
├── src/
│   ├── index.js            # React entry point
│   └── InfinityAI.jsx      # Main app component (all-in-one)
├── package.json            # Dependencies
└── README.md               # This file
```

---

## ✨ Features

- 💬 Chat with Claude (Sonnet 4, Opus 4.5, Haiku 4.5) or Gemini (2.0 Flash, 2.5 Pro)
- 📎 File attachments — images, PDFs, documents
- 🖥️ Live Preview panel for generated HTML/CSS/JS code
- 🔄 Model switcher with Claude & Gemini support
- 🎨 Animated Infinity logo canvas
- 📋 Copy code blocks with one click
- 🌙 Dark purple theme

---

## 🛠 Build for Production

```bash
npm run build
```
Output goes to the `build/` folder — deploy anywhere (Netlify, Vercel, etc.)
