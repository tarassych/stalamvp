# AI-Powered Interview Scheduler (Next.js + n8n)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

It simulates the scheduling of interviews between candidates and interviewers, integrates with `n8n` automation, and triggers AI-based follow-up like Google Meet scheduling and transcription simulation.

---

## 🚀 Features

- Candidate & interviewer selection form with date-time slot
- Real-time scheduling via `n8n` webhook
- Success confirmation + ability to simulate post-interview AI processing
- View past scheduled events with summaries, conclusions, and transcripts
- Transcripts shown in collapsible chat format per speaker
- Built-in retry & error handling

---

## 📦 Getting Started

### 1. Clone the repo & install dependencies

```bash
git clone https://github.com/tarassych/stalamvp
cd stalamvp
npm install
```

### 2. Create `.env.local`

Create a `.env.local` in your project root:

```bash
# .env.local
NEXT_PUBLIC_N8N_GET_CANDIDATES_URL=https://your-n8n-url/...
NEXT_PUBLIC_N8N_GET_INTERVIEWERS_URL=https://your-n8n-url/...
NEXT_PUBLIC_N8N_GET_EVENTS_URL=https://your-n8n-url/...
NEXT_PUBLIC_N8N_SIMULATE_AI_URL=https://your-n8n-url/...
N8N_SCHEDULE_EVENT_URL=https://your-n8n-url/...
```

### 3. Run the development server

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) to use the app.

---

## 🧭 Pages & Functionality

| Page | Route | Description |
|------|-------|-------------|
| `app/page.js` | `/` | Main UI to schedule an interview: select candidate, interviewers, and time |
| `app/events/page.js` | `/events` | View all past events with AI-generated summaries, conclusions, and transcript (if available) |

### 🔧 Key Functions

- **`handleSchedule()`** in `app/page.js`: Sends candidate, interviewer(s), and selected date to `/api/proxy-to-n8n`
- **`SuccessMessage` component**: Shown after scheduling; allows triggering post-meeting AI simulation
- **`simulateProcessing()`** in `events/page.js`: Sends event ID to n8n to simulate AI follow-up
- **API Proxy**: `/api/proxy-to-n8n.js` handles long-running requests to `n8n` (up to 3 min)

---

## 🧪 Running Tests

### 1. Install test dependencies

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event msw whatwg-fetch
```

### 2. Add test scripts to `package.json`

```json
"scripts": {
  "test": "jest"
}
```

### 3. Run the test suite

```bash
npm test
```

### Test Coverage

- `__tests__/events.test.js` – renders event data, toggles transcript, checks AI content
- `__tests__/home.test.js` – (recommended) schedule flow and form behavior

---

## 🛠 File Structure Overview

```
src/
├── app/
│   ├── page.js                 # Homepage form UI
│   └── events/
│       └── page.js             # Events list page
├── api/
│   └── proxy-to-n8n.js         # Proxy server route for long n8n requests
__tests__/
├── events.test.js              # MSW + RTL test for events view
.env.local                      # Your n8n API URLs
jest.config.js                  # Jest config
jest.setup.js                   # Mocks + polyfills for tests
```

---

## 🧠 Learn More

- [Next.js Docs](https://nextjs.org/docs)
- [n8n Docs](https://docs.n8n.io)
- [Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [MSW Docs](https://mswjs.io/)

---

## ☁️ Deployment

The easiest way to deploy your app is with [Vercel](https://vercel.com).

You can also use:

- [Render](https://render.com/)
- [Netlify](https://netlify.com/)
- Docker + GCP/AWS/VPS (manual)

---

## 📄 License

MIT