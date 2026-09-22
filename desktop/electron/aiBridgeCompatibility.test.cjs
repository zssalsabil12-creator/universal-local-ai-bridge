const assert = require('assert');
const {
  BRIDGE_PROTOCOL_VERSION,
  createBridgeNonce,
  buildHandshakePrompt,
  isHandshakeAck,
  buildCompatibilityResult,
} = require('./aiBridgeCompatibility.cjs');

const nonce = createBridgeNonce();
assert.match(nonce, /^[a-z0-9-]+$/);
assert.ok(buildHandshakePrompt(nonce).includes('ULAB_BRIDGE_ACK:' + nonce));
assert.equal(isHandshakeAck('ULAB_BRIDGE_ACK:' + nonce, nonce), true);
assert.equal(isHandshakeAck('ULAB_BRIDGE_ACK:wrong', nonce), false);

const checks = {
  agent:{status:'passed'}, ai_page:{status:'passed'}, auth:{status:'passed'},
  composer:{status:'passed'}, parser:{status:'passed'}, sanitizer:{status:'passed'},
  assistant_reader:{status:'passed'}, handshake:{status:'passed'},
};
const result = buildCompatibilityResult(checks, {live:true});
assert.equal(result.ok, true);
assert.equal(result.protocolVersion, BRIDGE_PROTOCOL_VERSION);
console.log('AI bridge compatibility tests: PASS');