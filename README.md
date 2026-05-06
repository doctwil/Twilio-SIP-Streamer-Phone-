# SIP Quickstart with AI Caller Screening

A Twilio-powered SIP phone system with an AI caller screening workflow and live dashboard. Deploy to Twilio Serverless in minutes.

**Features:**

- SIP Domain with demo users and dial-by-extension IVR
- Inbound and outbound PSTN calling via SIP softphones
- AI caller screening — callers state their name and reason, transcribed via OpenAI Whisper
- Live caller dashboard with real-time updates
- Admin interface with one-click initialization and configuration checklist
- Optional OBS/BlackHole integration for streaming call audio on macOS

---

## Prerequisites

- A [Twilio account](https://www.twilio.com/try-twilio)
- A [Twilio phone number with Voice capabilities](https://console.twilio.com/us1/develop/phone-numbers/manage/search)
- [Node.js](https://nodejs.org/) v20 or higher
- A SIP softphone client such as [Zoiper](https://www.zoiper.com/en/voip-softphone/download/current) or [Linphone](https://www.linphone.org/releases/)
- (Optional) An [OpenAI API key](https://platform.openai.com/api-keys) for AI caller screening

> **Note:** This guide uses macOS/Linux commands. Windows users can use [WSL](https://docs.microsoft.com/en-us/windows/wsl/install).

---

## Quick Start

### 1. Install the Twilio CLI and Serverless plugin

```bash
# macOS
brew tap twilio/brew && brew install twilio

# or via npm (any platform)
npm install -g twilio-cli

# Install serverless plugin
twilio plugins:install @twilio-labs/plugin-serverless

# Log in
twilio login
```

### 2. Clone and install

```bash
git clone <repo-url>
cd stream
npm install
```

### 3. Configure environment variables

Copy the example env file and fill in your Twilio credentials from the [Twilio Console](https://www.twilio.com/console):

```bash
cp .env.example .env
```

```
ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

| Variable | Default | Description |
| :------- | :------ | :---------- |
| `ACCOUNT_SID` | — | Your Twilio Account SID |
| `AUTH_TOKEN` | — | Your Twilio Auth Token |
| `APP_NAME` | `SIP Quickstart` | Display name in the admin UI |
| `ADMIN_PASSWORD` | `default` | Password for the admin interface |
| `DEFAULT_SIP_USER_PASSWORD` | `ThisIs1Password!` | Default password for demo SIP users |
| `OPENAI_API_KEY` | — | OpenAI key for AI caller screening (optional) |
| `ENABLE_AI_SCREENING` | `false` | Set to `true` to enable AI screening |

> **⚠️ Security:** Never commit `.env` to version control. It is already listed in `.gitignore`.

### 4. Deploy

```bash
twilio serverless:deploy
```

### 5. Initialize

1. Open your deployed admin page: `https://your-service-name.twil.io/admin/index.html`
2. Log in with the password from your `.env` file (default: `default`)
3. Click **Initialize your application for your environment**
4. Wait for setup to complete — this creates your SIP Domain, credential list, and demo users

---

## Usage

### Register a SIP client

After initialization, register a softphone with one of the demo users:

| User | Username | Extension |
| :--- | :------- | :-------- |
| Alice | `alice` | 100 |
| Bob | `bob` | 200 |
| Charlie | `charlie` | 300 |

Configure your softphone:
- **Username**: `alice` (or `bob`/`charlie`)
- **Password**: The SIP user password shown on the admin page
- **Domain**: `your-service-name.sip.us1.twilio.com` (shown on the splash page)
- **Transport**: UDP or TCP

> **Important:** Use the `.sip.us1.twilio.com` domain, not the `.twil.io` service URL.

### Make calls

- **Outbound**: Dial any phone number from your registered softphone
- **Inbound**: Call your Twilio number → enter an extension (100, 200, or 300)

---

## AI Caller Screening

When enabled, callers are prompted to state their name and reason for calling before being connected. Responses are transcribed with OpenAI Whisper and displayed on a live dashboard.

### Enable AI screening

Add to your `.env`:

```bash
OPENAI_API_KEY=your-openai-api-key-here
ENABLE_AI_SCREENING=true
```

Redeploy:

```bash
twilio serverless:deploy
```

### Live dashboard

Open the dashboard to see caller info in real time:

```
https://your-service-name.twil.io/caller-dashboard.html
```

### How it works

1. Caller dials your Twilio number
2. AI prompts for name → records and transcribes
3. AI prompts for reason → records and transcribes
4. Caller info appears on the live dashboard
5. Call routes to extension 100 (Alice)

### Cost

- Whisper transcription: ~$0.006/minute
- Typical call: < $0.01 in AI costs

---

## OBS / BlackHole Streaming Setup (macOS)

Route SIP call audio into OBS Studio for live streaming or recording.

### Step 1: Install BlackHole

1. Download [BlackHole 2ch](https://existential.audio/blackhole/)
2. Install the `.pkg` file
3. Restart your Mac
4. Verify: **System Settings → Sound → Output** shows "BlackHole 2ch"

> **Warning:** Do NOT set BlackHole as your main output — you won't hear audio.

### Step 2: Create a Multi-Output Device

1. Open **Audio MIDI Setup** (`Cmd + Space` → type "Audio MIDI Setup")
2. Click **+** → **Create Multi-Output Device**
3. Rename to `BlackHole + Speakers`
4. Check (in order):
   - ✅ Your physical speakers/headphones (first = master clock)
   - ✅ BlackHole 2ch

### Step 3: Configure your softphone

In your softphone audio settings:
- **Output Device**: `BlackHole + Speakers`
- **Ring Device**: `BlackHole + Speakers`
- **Input Device**: Your microphone

### Step 4: Configure OBS

1. Open OBS → **Settings → Audio**
2. Set an available **Mic/Auxiliary Audio** slot to **BlackHole 2ch**
3. Click Apply → OK
4. Verify the Audio Mixer shows activity during a test call

---

## Project Structure

```
stream/
├── .env                          # Your credentials (not committed)
├── package.json                  # Dependencies
├── assets/
│   ├── index.html                # Splash page — phone number, extensions, domain
│   ├── site.css                  # Splash page styles
│   ├── extensions.private.js     # User/extension mapping
│   ├── caller-dashboard.html     # Live AI caller dashboard
│   └── admin/
│       ├── index.html            # Admin interface
│       ├── admin-client.js       # Admin frontend API client
│       ├── admin.css             # Admin styles
│       ├── actions.private.js    # SIP domain initialization logic
│       ├── shared.private.js     # Auth helpers, env variable management
│       └── statuses.private.js   # Configuration checklist
├── functions/
│   ├── ai-caller-screening.js   # AI screening — record, transcribe, route
│   ├── call-status-callback.js  # Marks callers complete when call ends
│   ├── extension-menu.js        # IVR — routes callers by extension
│   ├── get-caller-info.js       # Caller dashboard data API
│   ├── outbound-calls.js        # Routes outbound SIP calls to PSTN
│   ├── recording-handler.js     # Logs recording metadata
│   ├── sip-configuration.js     # Returns app config as JSON
│   └── admin/
│       ├── check-status.js      # Returns checklist state
│       ├── login.js             # Admin login endpoint
│       └── perform-action.js    # Executes admin actions
└── readmes/
    └── sip-quickstart.md        # Original template readme
```

---

## Customization

### Change the admin password

Edit `.env`:

```bash
ADMIN_PASSWORD=your_secure_password_here
```

Then redeploy: `twilio serverless:deploy`

### Add new extensions

Edit `assets/extensions.private.js` to add users:

```javascript
module.exports = [
  { name: 'Alice Allison', username: 'alice', extension: '100' },
  { name: 'Bob Bobberson', username: 'bob', extension: '200' },
  { name: 'Charlie Charleston', username: 'charlie', extension: '300' },
  // Add your own:
  { name: 'New User', username: 'newuser', extension: '400' },
];
```

After editing, redeploy and use the admin page to create the new SIP credentials.

---

## Troubleshooting

| Problem | Solution |
| :------ | :------- |
| Call disconnects after entering extension | Verify SIP client is registered; check domain format uses `.sip.us1.twilio.com` |
| Softphone won't register | Confirm username/password match, domain includes regional suffix |
| AI transcription returns "[Could not transcribe]" | Check `OPENAI_API_KEY` and `AUTH_TOKEN` in `.env`; verify OpenAI has credits |
| Dashboard shows no callers | Expected on cold start — make a new call; localStorage persists history |
| Calls skip AI screening | Confirm `ENABLE_AI_SCREENING=true` in `.env` and redeploy |
| AUTH_TOKEN error in logs | Add `AUTH_TOKEN` to `.env` from [Twilio Console](https://console.twilio.com/) |

---

## Next Steps

- [Twilio SIP Overview](https://www.twilio.com/docs/voice/sip)
- [TwiML Voice: Dial](https://www.twilio.com/docs/voice/twiml/dial)
- [SIP Interface API](https://www.twilio.com/docs/voice/sip/api)
- [Twilio Functions](https://www.twilio.com/docs/serverless/functions-assets/functions)
- [SIP Trunking](https://www.twilio.com/docs/sip-trunking)

---

## License

This project is provided as a sample for educational purposes.
