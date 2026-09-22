const assert = require('assert');
const os = require('node:os');
const path = require('node:path');
const { app, BrowserWindow } = require('electron');
const { extractAIToolRequest } = require('./aiBridgeSecurity.cjs');

app.setPath('userData', path.join(os.tmpdir(), 'ulab-ai-bridge-dom-test-' + process.pid));
const {
  buildAIInteractionScript,
  buildAIProbeScript,
  buildAssistantTextScript,
  buildLatestUserTextScript,
  buildLatestAIToolBlockScript,
  buildHideULABControlScript,
  buildHideULABToolCallScript,
  buildHideULABAssistantRequestScript,
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

const renderedToolFixture = `<!doctype html><html><body>
<main>
<article data-message-author-role="user">
  <div class="language-ulab-tool"><pre><code>{"id":"bootstrap","action":"files.read","params":{"path":"relative/path"}}</code></pre></div>
</article>
<article data-message-author-role="assistant">
  <div class="language-ulab-tool"><pre><code>{"id":"dom-1","action":"files.read","params":{"path":"src/example.ts"}}</code></pre></div>
</article>
</main>
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
  assert.equal(probe.state, 'READY');
  assert.equal(probe.authRequired, false);
  assert.ok(probe.inputs.length >= 1);
  assert.ok(probe.sendButtons.length >= 1);

  const authPage = '<form><input type="password" autocomplete="current-password"><button aria-label="Sign in">Sign in</button></form>';
  await win.webContents.executeJavaScript('document.body.innerHTML = ' + JSON.stringify(authPage), true);
  const authProbe = await win.webContents.executeJavaScript(buildAIProbeScript(), true);
  assert.equal(authProbe.ok, true);
  assert.equal(authProbe.state, 'AUTH_REQUIRED');
  assert.equal(authProbe.authRequired, true);

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

  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(renderedToolFixture));
  const latestUser = await win.webContents.executeJavaScript(buildLatestUserTextScript(), true);
  assert.match(latestUser, /relative\/path/);
  assert.doesNotMatch(latestUser, /src\/example\.ts/);
  const renderedTool = await win.webContents.executeJavaScript(buildLatestAIToolBlockScript(), true);
  assert.match(renderedTool, /ulab-tool/);
  assert.ok(renderedTool.includes('files.read'));
  const parsedTool = extractAIToolRequest(renderedTool);
  assert.equal(parsedTool.action, 'files.read');
  assert.equal(parsedTool.params.path, 'src/example.ts');

  const controlPage = `<main>
    <article data-message-author-role="user">ULAB TOOL RESULT\\n{}</article>
    <article data-message-author-role="assistant"><pre><code>{"action":"files.list","params":{"path":"."}}</code></pre></article>
  </main>`;
  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(controlPage));
  await win.webContents.executeJavaScript(buildHideULABControlScript(), true);
  await win.webContents.executeJavaScript(buildHideULABToolCallScript(), true);
  const hiddenAssistant = await win.webContents.executeJavaScript("document.querySelector('[data-message-author-role=\\\"assistant\\\"]')?.style.display || ''", true);
  assert.equal(hiddenAssistant, 'none');
  const hiddenControl = await win.webContents.executeJavaScript("document.querySelector('[data-message-author-role=\\\"user\\\"]')?.style.display || ''", true);
  assert.equal(hiddenControl, 'none');

  const rawToolPage = `<main><article data-message-author-role="assistant">{"action":"files.list","params":{"path":"."}}</article></main>`;
  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(rawToolPage));
  const rawAssistant = await win.webContents.executeJavaScript(buildAssistantTextScript(), true);
  assert.match(rawAssistant, /files\.list/);
  const rawParsed = extractAIToolRequest(rawAssistant);
  assert.equal(rawParsed.action, 'files.list');
  await win.webContents.executeJavaScript(buildHideULABAssistantRequestScript(), true);
  const hiddenRaw = await win.webContents.executeJavaScript("document.querySelector('[data-message-author-role=\\\"assistant\\\"]')?.style.display || ''", true);
  assert.equal(hiddenRaw, 'none');

  const genericConversation = `<main>
    <article class="conversation-turn user-message"><div>I need this project edited directly.</div></article>
    <article class="conversation-turn assistant-message"><div>I can work through the host bridge.</div></article>
  </main>`;
  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(genericConversation));
  const genericUser = await win.webContents.executeJavaScript(buildLatestUserTextScript(), true);
  assert.equal(genericUser, 'I need this project edited directly.');
  const genericAssistant = await win.webContents.executeJavaScript(buildAssistantTextScript(), true);
  assert.equal(genericAssistant, 'I can work through the host bridge.');

  await win.destroy();
  console.log('AI bridge DOM tests: PASS');
  process.exit(0);
}

run().catch(error => { console.error(error); process.exit(1); });
