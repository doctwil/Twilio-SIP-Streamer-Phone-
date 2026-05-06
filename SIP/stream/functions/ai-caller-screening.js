const fetch = require('node-fetch');

exports.handler = async function(context, event, callback) {
  const twiml = new Twilio.twiml.VoiceResponse();
  
  // Check if AI screening is enabled
  if (context.ENABLE_AI_SCREENING !== 'true') {
    // Skip screening, go straight to extension menu
    twiml.redirect('./extension-menu');
    return callback(null, twiml);
  }
  
  const step = event.Step || 'greeting';
  
  try {
    switch(step) {
      case 'greeting':
        // Step 1: Ask for caller's name
        const greetingMsg = context.AI_GREETING_MESSAGE || 
          "Thank you for calling. Please state your full name after the beep.";
        
        twiml.say(greetingMsg);
        twiml.record({
          maxLength: 10,
          transcribe: false,
          action: './ai-caller-screening?Step=process_name',
          recordingStatusCallback: './recording-handler'
        });
        break;
        
      case 'process_name':
        // Step 2: Process name recording and ask for reason
        const nameRecordingUrl = event.RecordingUrl;
        
        // Store the name recording URL in a way we can retrieve it
        // For now, we'll pass it forward as a query parameter
        const reasonMsg = context.AI_REASON_MESSAGE || 
          "Thank you. Now please briefly describe the reason for your call.";
        
        twiml.say(reasonMsg);
        twiml.record({
          maxLength: 20,
          transcribe: false,
          action: `./ai-caller-screening?Step=analyze&NameRecording=${encodeURIComponent(nameRecordingUrl)}`,
          recordingStatusCallback: './recording-handler'
        });
        break;
        
      case 'analyze':
        // Step 3: Transcribe recordings, display on dashboard, route to extension 100
        const nameRecording = event.NameRecording;
        const reasonRecording = event.RecordingUrl;
        
        // Get transcriptions using OpenAI Whisper
        const nameText = await transcribeAudio(nameRecording, context);
        const topicText = await transcribeAudio(reasonRecording, context);
        
        // Log the recordings for later review
        console.log('Caller Info:', {
          name: nameText,
          topic: topicText,
          callSid: event.CallSid,
          from: event.From
        });
        
        // Send to dashboard
        await sendToCallerDashboard(context, {
          callSid: event.CallSid,
          from: event.From,
          name: nameText,
          topic: topicText
        });
        
        // Always route to extension 100 (Alice)
        const extensions = require(Runtime.getAssets()['/extensions.js'].path);
        const targetExtension = '100';
        const entry = extensions.find(ext => ext.extension === targetExtension);
        
        if (entry) {
          twiml.say(`Thank you. Connecting you now.`);
          
          // Update dashboard status to connected
          await sendToCallerDashboard(context, {
            callSid: event.CallSid,
            status: 'connected'
          }, 'update');
          
          // Get the domain from context
          const client = context.getTwilioClient();
          const domain = await client.sip.domains(context.SIP_DOMAIN_SID).fetch();
          const regionalDomainName = domain.domainName.replace(
            'sip.twilio.com',
            'sip.us1.twilio.com'
          );
          
          const dial = twiml.dial({
            timeout: 30,
            action: `./call-status-callback?CallSid=${event.CallSid}`
          });
          
          dial.sip(`sip:${entry.username}@${regionalDomainName}`);
        } else {
          // Fallback to menu if extension 100 not found
          twiml.say('Please hold while we connect you.');
          twiml.redirect('./extension-menu');
        }
        break;
        
      default:
        twiml.redirect('./extension-menu');
    }
    
    callback(null, twiml);
    
  } catch (error) {
    console.error('AI Screening Error:', error);
    // On error, fall back to standard extension menu
    twiml.say('Connecting you to our menu.');
    twiml.redirect('./extension-menu');
    callback(null, twiml);
  }
};

// Transcribe audio using OpenAI Whisper API
async function transcribeAudio(recordingUrl, context) {
  try {
    const openaiApiKey = context.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      console.error('OpenAI API key not configured');
      return '[Transcription unavailable]';
    }
    
    // Download the recording from Twilio
    const audioResponse = await fetch(recordingUrl + '.mp3', {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(
          context.ACCOUNT_SID + ':' + context.AUTH_TOKEN
        ).toString('base64')
      }
    });
    
    const audioBuffer = await audioResponse.buffer();
    
    // Create form data for Whisper API
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', audioBuffer, {
      filename: 'audio.mp3',
      contentType: 'audio/mpeg'
    });
    form.append('model', 'whisper-1');
    form.append('language', 'en');
    
    // Call OpenAI Whisper API
    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        ...form.getHeaders()
      },
      body: form
    });
    
    const transcription = await transcriptionResponse.json();
    return transcription.text || '[Could not transcribe]';
    
  } catch (error) {
    console.error('Transcription error:', error);
    return '[Transcription failed]';
  }
}

// Analyze caller intent using GPT
async function analyzeCallerIntent(nameText, reasonText, context) {
  try {
    const openaiApiKey = context.OPENAI_API_KEY;
    
    const prompt = `Analyze this incoming phone call:

Caller Name: ${nameText}
Reason for Call: ${reasonText}

Based on the reason for calling, determine:
1. The primary intent (sales, support, billing, general inquiry, urgent issue)
2. Priority level (high, medium, low)
3. Best extension to route to:
   - Extension 100 (Alice): General inquiries, sales
   - Extension 200 (Bob): Technical support
   - Extension 300 (Charlie): Billing, accounting

Respond in valid JSON format only:
{
  "intent": "sales|support|billing|inquiry|urgent",
  "priority": "high|medium|low",
  "suggestedExtension": "100|200|300",
  "reasoning": "brief explanation"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that analyzes phone call intents and routes calls appropriately. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 200
      })
    });
    
    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    
    // Parse the JSON response
    const analysis = JSON.parse(analysisText);
    return analysis;
    
  } catch (error) {
    console.error('Intent analysis error:', error);
    return {
      intent: 'inquiry',
      priority: 'medium',
      suggestedExtension: null,
      reasoning: 'Error in analysis'
    };
  }
}

// Send caller info to dashboard
async function sendToCallerDashboard(context, callerInfo, action = 'add') {
  try {
    const dashboardUrl = `https://${context.DOMAIN_NAME}/get-caller-info`;
    
    const params = {
      action: action,
      callSid: callerInfo.callSid
    };
    
    // Add additional fields based on action
    if (action === 'add') {
      params.from = callerInfo.from;
      params.name = callerInfo.name;
      params.topic = callerInfo.topic;
    } else if (action === 'update') {
      params.status = callerInfo.status;
      if (callerInfo.name) params.name = callerInfo.name;
      if (callerInfo.topic) params.topic = callerInfo.topic;
    }
    
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = `${dashboardUrl}?${queryString}`;
    
    console.log('📡 SENDING TO DASHBOARD:', fullUrl);
    
    const response = await fetch(fullUrl, {
      method: 'GET'
    });
    
    const responseData = await response.json();
    console.log('✅ Dashboard response:', responseData);
    console.log('Sent to dashboard:', action, callerInfo);
  } catch (error) {
    console.error('Error sending to dashboard:', error);
    // Don't fail the call if dashboard update fails
  }
}