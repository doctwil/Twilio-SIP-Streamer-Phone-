exports.handler = function(context, event, callback) {
  // Log recording details
  console.log('Recording completed:', {
    recordingSid: event.RecordingSid,
    recordingUrl: event.RecordingUrl,
    recordingDuration: event.RecordingDuration,
    callSid: event.CallSid
  });
  
  // Return empty response (Twilio doesn't need TwiML here)
  callback(null, '');
};