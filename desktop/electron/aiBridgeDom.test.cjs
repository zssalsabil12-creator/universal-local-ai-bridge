const assert = require('assert');
const { app, BrowserWindow } = require('electron');
const {
  buildAIInteractionScript,
  buildAIProbeScript,
  buildAssistantTextScript,
} = require('./aiBridgeDom.cjs');

const fixture = `<!doctype html><html><body>
<form id="composer">
<textarea id="message" placeholder="Message"></textarea>
<button id="send" type="submit" aria-label="Send message">Send</button>
</form>
<main id="conversation"><article data-message-author-role="assistant">First reply</article></main>
<script>
composer.addEventListener('submit', event => {
  event.preventDefault();
  const reply = document.createElement('article');
  reply.setAttribute('data-message-author-role', 'assistant');
  reply.textContent = message.value;
  conversation.appendChild(reply);
});
</script>
</body></html>`;

async function wait(ms) { await new Promise(resolve => setTimeout(resolve, ms)); }
async function run() {
  await app.whenReady();
  const win = new BrowserWindow({ show:false, webPreferences:{ contextIsolation:true, nodeIntegration:false, sandbox:true } });
  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(fixture));

  const sent = await win.webContents.executeJavaScript(buildAIInteractionScript('Bridge smoke message'), true);
  assert.equal(sent.ok, true);
  assert.ok(['button','form-submit','enter'].includes(sent.mode));
  await wait(50);
  const body = await win.webContents.executeJavaScript("document.querySelectorAll('[data-message-author-role=\"assistant\"]')[1]?.innerText || \"\"", true);
  assert.equal(body, 'Bridge smoke message');

  const probe = await win.webContents.executeJavaScript(buildAIProbeScript(), true);
  assert.equal(probe.ok, true);
  assert.ok(probe.inputs.length >= 1);
  assert.ok(probe.sendButtons.length >= 1);

  await win.webContents.executeJavaScript(`document.body.innerHTML = '<main id="conversation"><div id="host"></div></main>';\
const host=document.getElementById('host'); const shadow=host.attachShadow({mode:'open'});\
shadow.innerHTML='<div><div id="editor" contenteditable="true" role="textbox" aria-label="Message"></div><button id="shadow-send" aria-label="Send message">Send</button></div>';\
shadow.getElementById('shadow-send').addEventListener('click',()=>{const r=document.createElement('article');r.setAttribute('data-message-author-role','assistant');r.textContent=shadow.getElementById('editor').innerText;document.getElementById('conversation').appendChild(r);});`, true);

  const shadowSent = await win.webContents.executeJavaScript(buildAIInteractionScript('Shadow DOM message'), true);
  assert.equal(shadowSent.ok, true);
  assert.equal(shadowSent.mode, 'button');
  await wait(50);
  const latest = await win.webContents.executeJavaScript(buildAssistantTextScript(), true);
  assert.equal(latest, 'Shadow DOM message');

  const shadowProbe = await win.webContents.executeJavaScript(buildAIProbeScript(), true);
  assert.equal(shadowProbe.ok, true);
  assert.ok(shadowProbe.rootCount >= 2);
  assert.ok(shadowProbe.inputs.some(item => item.editable === true));

  await win.destroy();
  if (process.platform !== 'darwin') app.quit();
  console.log('AI bridge DOM tests: PASS');
}

run().catch(error => { console.error(error); app.exit(1); });
