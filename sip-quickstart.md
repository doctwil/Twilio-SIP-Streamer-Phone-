# Part 1 : SIP Quickstart

SIP (Session Initiation Protocol) is commonly used for VoIP calling. In this quickstart, you'll create a Twilio SIP Domain, register SIP clients, and place inbound and outbound calls through the PSTN. You'll also get demo users and a prebuilt IVR that routes calls to extensions.

## Prerequisites

Before you begin, make sure you have the following:

- A [Twilio account](https://www.twilio.com/try-twilio).
- A [Twilio phone number with Voice capabilities](https://console.twilio.com/us1/develop/phone-numbers/manage/search).
- [Node.js](https://nodejs.org/) installed (version 14 or higher) on your local machine.
- A SIP softphone client such as [Zoiper](https://www.zoiper.com/en/voip-softphone/download/current) or [Linphone](https://www.linphone.org/releases/).
- Basic familiarity with your terminal or command line interface.

### What is a softphone?

A softphone is a software application that lets you make voice calls over the internet using your computer or mobile device instead of a traditional phone. Softphones connect to SIP servers so you can make and receive calls through your SIP account.

> **ℹ️ Note:** This quickstart will use macOS or Linux commands. Windows users can use [Windows Subsystem for Linux (WSL)](https://docs.microsoft.com/en-us/windows/wsl/install) to run these commands.

## Install the Twilio CLI

The Twilio Command Line Interface (CLI) allows you to interact with the Twilio API from your terminal.

```bash
# macOS
brew tap twilio/brew && brew install twilio

# or via npm (any platform)
npm install -g twilio-cli
```

Log in to your Twilio account:

```bash
twilio login
```

## Install the Serverless Plugin

The Twilio CLI supports plugins, which give you additional control and superpowers. Install the serverless plugin to deploy functions from your local machine.

```bash
twilio plugins:install @twilio-labs/plugin-serverless
```

## Clone the Repo and Install Dependencies

```bash
git clone <repo-url>
cd stream
npm install
```

## Configure Environment Variables

Open the `.env` file and replace the placeholder values with your real Twilio credentials from the [Twilio Console](https://www.twilio.com/console):

```
ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

The remaining values can stay as-is or be customized:

| Variable | Default | What it does |
| :------- | :------ | :----------- |
| `ACCOUNT_SID` | — | Your Twilio Account SID |
| `AUTH_TOKEN` | — | Your Twilio Auth Token |
| `APP_NAME` | `SIP Quickstart` | Display name in the admin UI |
| `ADMIN_PASSWORD` | `default` | Password to log into the admin page |
| `DEFAULT_SIP_USER_PASSWORD` | `ThisIs1Password!` | Default password for demo SIP users |

> **⚠️ Security:** Never commit `.env` to version control. It is already listed in `.gitignore`.

## Deploy Your Application

The serverless plugin deploys code from your local machine to the Twilio Serverless platform. Once deployed, your application runs at a publicly accessible URL.

```bash
twilio serverless:deploy
```

This command creates a Service that houses your hosted development environment. The command outputs all the functions and assets deployed to your *dev* environment.

Run this command whenever you want to make changes to your hosted live development environment.

> **ℹ️ Note:** The URLs are unique to your instance. This will create a new Serverless service and a new development environment.
>
> If you want to know what is being deployed to your account before doing so, jump down to the [Learn More](#learn-more) section.

## Initialize Your Environment

Follow these steps to complete the setup of your SIP Domain with demo users:

### Step 1: Access the admin interface

When you deployed your application, the output presented a list of URLs. Find the URL that ends with `/admin/index.html`.

1. Open the URL in your browser — it will look like: `https://your-service-name.twil.io/admin/index.html`
2. You'll see a password prompt asking you to log in

### Step 2: Log in with default password

1. Enter the password: `default` (this is the initial `ADMIN_PASSWORD` from your `.env` file)
2. Click **Let me in** to access the admin interface

### Step 3: Initialize the application

After you log in, a message will say the following: **The SIP Quickstart requires that you set up a few things on your account**

1. Click the button that says **Initialize your application for your environment**
2. Wait for initialization to complete — this process creates:
   - A SIP Domain
   - Three demo SIP credentials (`alice`, `bob`, `charlie`)
   - A credential list
   - Necessary configurations for your SIP setup
3. The page refreshes and displays a Configuration Checklist

### Step 4: Review the configuration checklist

After initialization completes, the admin interface displays a Configuration Checklist with status indicators showing:

- SIP Domain is created
- Credential List contains 3 accounts (`alice`, `bob`, `charlie`)
- The default password for the SIP credentials (e.g., `ThisIs1Password!`)
- Your incoming phone number
- Links to the automatically initialized resources

Note: There is a failing check for the admin password, since you haven't yet changed it from the default. You'll fix that later.

> **ℹ️ Note:** The three demo users (`alice`, `bob`, and `charlie`) come pre-configured with extensions 100, 200, and 300, respectively. You use these usernames and extensions to register your SIP clients and route incoming calls.

## Explore Your Application

There is a splash page that you can now share with your team up and running at `/index.html`. Open that up in a browser.

This page displays your call-in number and your outgoing caller ID. Both of these values can be changed on the admin page.

### Register a demo SIP user

You can now register a SIP client with your domain. On this page you'll find a list of users and their registration SIP Domain. By default, the password is the same for all default users and appears on the admin page.

#### Connect your SIP account

Now let's configure a softphone client to register with your SIP Domain. You can configure all three demo users (`alice`, `bob`, `charlie`) on separate devices or softphone instances.

For the first user (Alice):

1. Download and install your chosen softphone client. This tutorial uses [Zoiper](https://www.zoiper.com/en/voip-softphone/download/current).
2. Open the softphone and select the option to add a new SIP account.
3. Enter the SIP credentials:
   - **Username**: `alice`
   - **Password**: The default SIP user password shown on your admin page (for example, `ThisIs1Password!`)
   - **Domain/Server**: The SIP Domain shown on the splash page (it looks like `your-service-name.sip.us1.twilio.com`)
   - **Transport**: UDP or TCP (either works)

> **ℹ️ Note:** The SIP Domain is derived from your deployed service domain. For example, if your service deploys to `sip-quickstart-2624-dev.twil.io`, your SIP Domain will be `sip-quickstart-2624-dev.sip.us1.twilio.com`. You can find this value on the splash page (`/index.html`) in the credentials table after initialization, or compute it by replacing `.twil.io` with `.sip.us1.twilio.com` in your service URL.

4. Save the configuration and the softphone will attempt to register with your SIP Domain
5. Verify registration: You should see a status indicating "Registered" or "Connected"

> **⚠️ Important:** Use the correct SIP Domain format. Your SIP Domain must include the `.sip.us1.twilio.com` suffix (or the appropriate regional suffix). This is the registration endpoint for your SIP clients.
>
> Using only the service name without the SIP-specific domain (for example, `your-service-name.twil.io`) will not work for SIP registration.
>
> You can check availability in the Twilio Console under the **SIP Domains** section. If it doesn't work, add an additional identifier to the domain (for example, `your-service-name-1234.sip.us1.twilio.com`).

### Test your SIP setup

Now that you have a softphone configured with your first demo user (for example, `alice`), let's test the different calling capabilities.

#### Make an outbound call to a phone number

With your softphone registered and connected:

1. Open your softphone client (the one you just configured with the `alice` credentials).
2. Dial any phone number using your softphone (for example, your mobile phone number).
3. Press the call button in your softphone to initiate the call.
4. Answer the call on your mobile phone — you should see the caller ID that was specified on the admin page.

This demonstrates that your SIP client places calls to the PSTN (Public Switched Telephone Network) through Twilio.

#### Receive an incoming call

Test receiving calls through your SIP extension:

1. From any telephone, call the incoming phone number displayed on your splash page (`/index.html`).
2. Wait for the IVR — you'll hear a prompt asking you to enter an extension.
3. Enter extension 100 (which corresponds to the `alice` user).
4. Your softphone will ring — answer the call on your softphone to connect.

This shows how the dial-by-extension menu routes incoming calls to your registered SIP clients.

<details>
<summary>Click to troubleshoot call disconnecting after entering an extension number</summary>

**Root Cause:** The `<Dial>` verb has no fallback handler when the SIP client doesn't answer or isn't registered.

**Solution:**

1. Add timeout and action handler to the `<Dial>` verb in `extension-menu.js`:

```javascript
const dial = twiml.dial({
  timeout: 30,
  action: './extension-menu'
});
dial.sip(`sip:${username}@${regionalDomainName}`);
```

2. Add dial status handling at the start of the handler:

```javascript
if (event.DialCallStatus && event.DialCallStatus !== 'completed') {
  twiml.say('The extension is unavailable');
  twiml.redirect('./extension-menu');
  return callback(null, twiml);
}
```

Verify that SIP clients are registered to your SIP domain, credentials are correct (username from `extensions.js`, password from `.env`), and extension dialing works when calling your number. If needed, redeploy with `twilio serverless:deploy` or restart your local server.
</details>

---

## Part 2 : Use with OBS and BlackHole for Streaming

This guide shows you how to capture SIP call audio in OBS Studio using BlackHole, a virtual audio driver for macOS. This setup allows you to broadcast or record your Twilio SIP calls with professional streaming software.

**What you'll accomplish:**
- Route SIP call audio from your softphone to OBS
- Maintain the ability to hear calls while recording/streaming
- Integrate with existing Twilio SIP infrastructure

### Prerequisites

Before starting, ensure you have:
- A Mac running macOS 10.13 or later
- OBS Studio installed ([download here](https://obsproject.com/))
- Your SIP softphone already configured (from the previous sections)
- Admin access to install software

---

### Step 1: Install BlackHole audio driver

BlackHole is a free, open-source virtual audio driver that routes audio between applications.

1. **Download BlackHole:**
   - Visit [https://existential.audio/blackhole/](https://existential.audio/blackhole/)
   - Download **BlackHole 2ch** (the 2-channel version is sufficient for stereo audio)

2. **Install BlackHole:**
   - Open the downloaded `.pkg` file
   - Follow the installation wizard
   - Enter your Mac password when prompted
   - Click **Install**

3. **Restart your Mac** (recommended to ensure the driver loads properly)

4. **Verify installation:**
   - Open **System Settings** → **Sound**
   - Click the **Output** tab
   - You should see **BlackHole 2ch** listed as an output device

> **⚠️ Warning:** Do NOT set BlackHole as your main system output device yet, or you won't hear any audio. We'll create a Multi-Output Device in the next step.

---

### Step 2: Create a Multi-Output Device

This device sends audio to both BlackHole (for OBS) AND your speakers/headphones (so you can hear).

1. **Open Audio MIDI Setup:**
   - Press `Cmd + Space` to open Spotlight
   - Type `Audio MIDI Setup` and press Enter
   - Or find it at `/Applications/Utilities/Audio MIDI Setup.app`

2. **Create the Multi-Output Device:**
   - Click the **+** button in the bottom-left corner
   - Select **Create Multi-Output Device**

3. **Configure the device:**
   - **Name it:** Double-click "Multi-Output Device" and rename it to `BlackHole + Speakers`
   - **Check these boxes** (in this order):
     - ✅ **Your physical audio device** (e.g., "MacBook Pro Speakers", "External Headphones", or "AirPods")
     - ✅ **BlackHole 2ch**

   > **ℹ️ Note:** The first checked device becomes the master clock. Always check your physical device first.

4. **Set as drift correction source** (if needed):
   - Right-click your physical audio device in the list
   - Select **Use This Device For Sound Output** (if available)

5. **Close Audio MIDI Setup**

**What this does:** Audio sent to "BlackHole + Speakers" goes to BOTH your speakers (so you hear it) AND BlackHole (which OBS captures).

---

### Step 3: Configure your SIP softphone audio output

Point your softphone to use the Multi-Output Device you just created.

#### Using Zoiper

1. **Open Zoiper**
2. Click **Settings** (gear icon in top-right)
3. Navigate to **Audio** tab
4. Configure these settings:
   - **Audio Output Device:** Select `BlackHole + Speakers`
   - **Ring Device:** Select `BlackHole + Speakers`
   - **Audio Input Device:** Select your **microphone** (e.g., "MacBook Pro Microphone" or your USB mic)
5. Click **OK** to save

**Test your setup:**
- Make a test call from your softphone
- You should hear the call audio in your speakers/headphones
- If you don't hear anything, verify your Multi-Output Device includes your physical speakers

---

### Step 4: Configure OBS Studio to capture SIP audio

Now configure OBS to receive the audio from BlackHole.

1. **Open OBS Studio**

2. **Open Settings:**
   - Click **Settings** in the bottom-right corner
   - Or go to **OBS** → **Settings** in the menu bar

3. **Navigate to Audio settings:**
   - Click the **Audio** tab in the left sidebar

4. **Add BlackHole as an audio source:**
   - Find an available **Mic/Auxiliary Audio** slot (e.g., "Mic/Auxiliary Audio 2")
   - Click the dropdown menu
   - Select **BlackHole 2ch**

   Example configuration:
   ```
   Mic/Auxiliary Audio:    Built-in Microphone (your voice)
   Mic/Auxiliary Audio 2:  BlackHole 2ch (SIP call audio)
   Mic/Auxiliary Audio 3:  Disabled
   ```

5. **Click Apply** and then **OK**

6. **Verify in the Audio Mixer:**
   - Look at the **Audio Mixer** panel in OBS (usually bottom-center)
   - You should see a meter labeled **Mic/Aux 2** (or whatever slot you used)
   - Make a test call — the meter should show activity when call audio plays

---

## Add AI-Powered Caller Screening with Live Dashboard

This project includes built-in AI caller screening. When someone dials your Twilio number, they're prompted to state their name and reason for calling. The responses are transcribed using OpenAI Whisper, and a live dashboard displays the caller info to hosts in real-time.

**What's included:**
- `functions/ai-caller-screening.js` — Records caller name and topic, transcribes via Whisper, routes to ext. 100
- `functions/get-caller-info.js` — In-memory API for storing and retrieving caller data
- `functions/call-status-callback.js` — Marks callers as completed when their call ends
- `functions/recording-handler.js` — Logs recording metadata from Twilio
- `assets/caller-dashboard.html` — Live dashboard with auto-refresh and localStorage persistence

### Prerequisites for AI screening

- Your existing SIP setup (from previous steps)
- An OpenAI API key ([get one here](https://platform.openai.com/api-keys))

### Step 1: Install AI dependencies

```bash
cd stream
npm install openai node-fetch@2.6.1 form-data
```

> **ℹ️ Note:** We use `node-fetch@2.6.1` specifically — v3.x is not compatible with the Twilio Functions runtime.

### Step 2: Configure environment variables

Your `.env` already contains the AI variable placeholders. Fill in your values:

```bash
OPENAI_API_KEY=your-openai-api-key-here
ENABLE_AI_SCREENING=true

# Customize these call prompts (optional)
AI_GREETING_MESSAGE="Thank you for calling. Please state your name and topic after the beep."
AI_REASON_MESSAGE="Thank you. After the beep, please dial 100 to be connected to the hosts."
```

> **⚠️ Important:** Your `AUTH_TOKEN` is also required — it authenticates the audio download from Twilio before transcription. Make sure it's set in `.env`.

### Step 3: Deploy your changes

```bash
twilio serverless:deploy
```

### Step 4: Access the dashboard

Open the dashboard URL in your browser:

```
https://your-service-name.twil.io/caller-dashboard.html
```

Keep this open while testing. You'll see a **Debug Info** panel and "No callers yet" until the first call comes in.

### Step 5: Test the complete system

1. **Call your Twilio number** from any phone
2. **First prompt:** State your name after the beep
3. **Second prompt:** State your reason for calling
4. **Dial 100** to connect to the host
5. **Check the dashboard** — caller name and topic appear in plain text

### Cost considerations

**OpenAI API costs (approximate):**
- Whisper transcription: ~$0.006 per minute of audio
- **Total per call: ~$0.003 (less than a penny)**
- **For 1,000 calls/month:** ~$3/month in AI costs

> **ℹ️ Note:** This implementation uses only OpenAI Whisper for transcription — no GPT analysis — keeping costs minimal.

### AI Screening Troubleshooting

| Problem | Fix |
| :------ | :-- |
| Transcription returns "[Could not transcribe]" | Verify `OPENAI_API_KEY` and `AUTH_TOKEN` are set in `.env`. Check OpenAI API key has credits. |
| Dashboard shows "OK" but no callers | Normal — serverless memory resets on cold start. Make a new call; it will appear. Dashboard uses localStorage to persist history across resets. |
| Calls skip AI screening | Verify `ENABLE_AI_SCREENING=true` in `.env` and redeploy. Check that your phone number webhook still points to your deployed service. |
| AUTH_TOKEN error in logs | Add `AUTH_TOKEN=your_twilio_auth_token` to `.env`. |

---

## Modify Your Application

You should definitely change that admin password. On your local machine, edit the file `.env`.

Find the entry for `ADMIN_PASSWORD` and change it to something other than default.

```bash
ADMIN_PASSWORD=your_secure_password_here
```

Now make sure your file is saved and then deploy.

```bash
twilio serverless:deploy
```

After deployment, revisit your hosted `/admin/index.html` page, use your new password, and view your all-green checks.

> **ℹ️ Note:** Anytime you make a change to your example application, remember to save and re-deploy your application.

## Learn More

Now that you've seen things working, you can explore how to further modify and extend this application to suit your needs.

### Extensions file

Head over to your local project directory and check out `assets/extensions.private.js`.

> **ℹ️ Note:** This file's extension contains `.private.js`, which for the Serverless plugin prevents public access while allowing other functions to access it.

You'll notice that the demo users have all been added here. You can also add your own users here by following the same sort of format.

> **⚠️ Warning:** If you do make a change to this file, make sure to navigate to your hosted `/admin/index.html` and create the additional users automatically.

### Dial by extension menu

Navigate to the function file located in `functions/extension-menu.js`. This Twilio Function uses the extensions file to create a menu that performs SIP dialing based on input from the caller.

The code makes heavy use of the `<Gather>` TwiML verb, which gathers digits from the user, then submits them back to the function via the `event.Digits` value. The `numDigits` parameter is set to `3` because each extension (`100`, `200`, etc.) contains three digits.

Feel free to explore and modify this file, it's all yours! Just remember you need to deploy it to see changes.

### Outbound calls

When you place an outgoing call from a SIP Device, your SIP Domain defines what happens. The Function `functions/outbound-calls.js` connects to the SIP Domain to handle this.

This function attempts to extract a number and then places a call to the PSTN, setting the `callerId` attribute on the `<Dial>` TwiML verb. The Caller ID can be changed on your hosted `/admin/index.html`.

### Everything else

During initialization, the system created a SIP Domain and added demo credentials to a new credential list. The SIP Domain enables registration, and the credential list manages registrants. The SIP API handles all of these operations.

You can locate this information on your hosted Admin page `/admin/index.html` or in the [SIP section under Programmable Voice](https://www.twilio.com/console/voice/sip/endpoints) in your console.

## Project Structure

```
stream/
├── .env                          # Your Twilio credentials (not committed)
├── package.json                  # Dependencies
├── assets/
│   ├── index.html                # Splash page — shows phone number, extensions, domain
│   ├── site.css                  # Splash page styles
│   ├── extensions.private.js     # Demo user/extension mapping
│   ├── caller-dashboard.html     # Live AI caller dashboard
│   └── admin/
│       ├── index.html            # Admin interface
│       ├── admin-client.js       # Admin frontend API client
│       ├── admin.css             # Admin styles
│       ├── actions.private.js    # SIP domain initialization logic
│       ├── shared.private.js     # Auth helpers, env variable management
│       └── statuses.private.js   # Configuration checklist checks
├── functions/
│   ├── ai-caller-screening.js    # AI caller screening — records, transcribes, routes
│   ├── call-status-callback.js   # Marks callers complete when call ends
│   ├── extension-menu.js         # IVR — routes callers by extension
│   ├── get-caller-info.js        # Caller dashboard data API
│   ├── outbound-calls.js         # Routes outbound SIP calls to PSTN
│   ├── recording-handler.js      # Logs recording metadata
│   ├── sip-configuration.js      # Returns app config as JSON
│   └── admin/
│       ├── check-status.js       # Returns checklist state
│       ├── login.js              # Admin login endpoint
│       └── perform-action.js     # Executes admin actions
└── readmes/
    └── sip-quickstart.md         # This file
```

## Next Steps

Now that you have a working SIP infrastructure, explore these resources to expand your implementation:

- [SIP Overview](https://www.twilio.com/docs/voice/sip) — Learn more about Twilio's SIP capabilities.
- [TwiML Voice: Dial](https://www.twilio.com/docs/voice/twiml/dial) — Deep dive into the Dial verb and its parameters.
- [SIP Interface API](https://www.twilio.com/docs/voice/sip/api) — Complete API reference for managing SIP domains programmatically.
- [Twilio Functions](https://www.twilio.com/docs/serverless/functions-assets/functions) — Learn more about serverless functions.
- [SIP Trunking](https://www.twilio.com/docs/sip-trunking) — Connect your existing phone system to Twilio.
