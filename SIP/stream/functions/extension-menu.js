const assets = Runtime.getAssets();
const extensions = require(assets['/extensions.js'].path);
exports.handler = async function (context, event, callback) {
  const twiml = new Twilio.twiml.VoiceResponse();
  if (event.Digits === undefined) {
    twiml
      .gather({ action: './extension-menu' })
      .say(
        'Please enter the extension of your party, or press 0 for a list of all extensions'
      );
  } else if (event.Digits === '0') {
    const gather = twiml.gather({ action: './extension-menu', numDigits: '3' });
    for (const entry of extensions) {
      gather.say(`For ${entry.name}, press ${entry.extension}`);
    }
  } else {
    const client = context.getTwilioClient();
    // Verify context is set up?
    const entry = extensions.find((ext) => ext.extension === event.Digits);
    if (entry) {
      const domain = await client.sip.domains(context.SIP_DOMAIN_SID).fetch();
      const { username } = entry;
      
      // Optional: Play caller info to the receiving party
      const callerInfo = event.CallerInfo || 'an incoming call';
      
      twiml.say(`Connecting to extension ${event.Digits}`);
      
      const dial = twiml.dial({
        timeout: 30,
        action: `./call-status-callback?CallSid=${event.CallSid}`
      });
      
      // You could use <Say> before dial to announce caller
      // twiml.say(`Incoming call from ${callerInfo}`);
      
      const regionalDomainName = domain.domainName.replace(
        'sip.twilio.com',
        'sip.us1.twilio.com'
      );
      dial.sip(`sip:${username}@${regionalDomainName}`);
    } else {
      twiml.say(`Extension ${event.Digits} is not found`);
      twiml.redirect('./extension-menu');
    }
  }
  return callback(null, twiml);
};
