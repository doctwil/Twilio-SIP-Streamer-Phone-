// Caller info stored in Twilio Sync (persistent across all function instances)
const MAP_NAME = 'callerDashboard';
const ITEM_TTL = 86400; // 24 hours

async function ensureMap(syncService) {
  try {
    await syncService.syncMaps(MAP_NAME).fetch();
  } catch (e) {
    if (e.status === 404) {
      await syncService.syncMaps.create({ uniqueName: MAP_NAME });
    } else {
      throw e;
    }
  }
}

exports.handler = async function(context, event, callback) {
  console.log('========== GET-CALLER-INFO CALLED ==========');
  console.log('Action:', event.action || 'GET');

  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');
  response.appendHeader('Access-Control-Allow-Origin', '*');

  try {
    const client = context.getTwilioClient();
    const syncService = client.sync.v1.services('default');
    await ensureMap(syncService);
    const map = syncService.syncMaps(MAP_NAME);

    if (event.action === 'add') {
      const callerInfo = {
        callSid: event.callSid,
        from: event.from,
        name: event.name || 'Unknown',
        topic: event.topic || 'Not provided',
        timestamp: new Date().toISOString(),
        status: 'waiting'
      };

      // Upsert: try update first, create if not found
      try {
        await map.syncMapItems(event.callSid).update({
          data: callerInfo,
          itemTtl: ITEM_TTL
        });
      } catch (e) {
        if (e.status === 404) {
          await map.syncMapItems.create({
            key: event.callSid,
            data: callerInfo,
            itemTtl: ITEM_TTL
          });
        } else {
          throw e;
        }
      }

      console.log('✅ ADDED CALLER to Sync:', callerInfo);
      response.setBody({ success: true, caller: callerInfo });

    } else if (event.action === 'update') {
      try {
        const existing = await map.syncMapItems(event.callSid).fetch();
        const updated = { ...existing.data };
        updated.status = event.status || 'connected';
        if (event.name) updated.name = event.name;
        if (event.topic) updated.topic = event.topic;
        updated.connectedAt = new Date().toISOString();

        await map.syncMapItems(event.callSid).update({
          data: updated,
          itemTtl: ITEM_TTL
        });
        console.log('Updated caller status:', event.callSid, event.status);
      } catch (e) {
        console.log('Caller not found for update:', event.callSid);
      }
      response.setBody({ success: true });

    } else if (event.action === 'complete') {
      try {
        const existing = await map.syncMapItems(event.callSid).fetch();
        const updated = { ...existing.data };
        updated.status = 'completed';
        updated.completedAt = new Date().toISOString();

        await map.syncMapItems(event.callSid).update({
          data: updated,
          itemTtl: ITEM_TTL
        });
        console.log('Completed caller:', event.callSid);
      } catch (e) {
        console.log('Caller not found for complete:', event.callSid);
      }
      response.setBody({ success: true });

    } else if (event.action === 'remove') {
      try {
        await map.syncMapItems(event.callSid).remove();
      } catch (e) {
        console.log('Caller not found for remove:', event.callSid);
      }
      response.setBody({ success: true });

    } else if (event.action === 'clear') {
      // Remove all items from the Sync Map
      const items = await map.syncMapItems.list({ limit: 100 });
      await Promise.all(items.map(item => map.syncMapItems(item.key).remove()));
      console.log('Cleared all callers from Sync');
      response.setBody({ success: true });

    } else {
      // GET all callers
      const items = await map.syncMapItems.list({ limit: 100, order: 'desc' });
      const callers = items.map(item => item.data);

      callers.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      console.log('📋 RETURNING CALLERS from Sync:', callers.length);
      response.setBody({
        callers: callers,
        serverTime: new Date().toISOString(),
        memoryStatus: 'sync-persistent'
      });
    }
  } catch (error) {
    console.error('Sync error:', error);
    response.setStatusCode(500);
    response.setBody({ error: error.message });
  }

  callback(null, response);
};
