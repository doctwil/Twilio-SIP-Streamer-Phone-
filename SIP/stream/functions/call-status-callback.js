const fetch = require('node-fetch');

exports.handler = async function(context, event, callback) {
  const twiml = new Twilio.twiml.VoiceResponse();

  // Log call status changes
  console.log('Call Status Update:', {
    callSid: event.CallSid,
    callStatus: event.CallStatus,
    dialCallStatus: event.DialCallStatus,
    from: event.From,
    to: event.To
  });
  
  // Update dashboard when call completes
  if (event.CallStatus === 'completed' || event.CallStatus === 'busy' || event.CallStatus === 'no-answer' || event.CallStatus === 'failed') {
    try {
      const dashboardUrl = `https://${context.DOMAIN_NAME}/get-caller-info`;
      const params = new URLSearchParams({
        action: 'complete',
        callSid: event.CallSid
      }).toString();
      
      await fetch(`${dashboardUrl}?${params}`, {
        method: 'GET'
      });
      
      console.log('Updated dashboard for completed call:', event.CallSid);
    } catch (error) {
      console.error('Error updating dashboard:', error);
    }
  }
  
  // When either party hangs up, end the entire call cleanly
  if (event.DialCallStatus === 'completed' || event.DialCallStatus === 'busy' ||
      event.DialCallStatus === 'no-answer' || event.DialCallStatus === 'failed' ||
      event.DialCallStatus === 'canceled') {
    twiml.hangup();
  } else {
    // For in-progress calls (e.g. hold), keep the caller alive with silence
    twiml.pause({ length: 120 });
    twiml.redirect(`./call-status-callback?CallSid=${event.CallSid}`);
  }

  callback(null, twiml);
};
