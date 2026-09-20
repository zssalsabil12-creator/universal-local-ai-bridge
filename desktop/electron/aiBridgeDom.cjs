const INPUT_SELECTORS = [
  'textarea[data-testid*="message"]','textarea[placeholder*="Message"]','textarea[placeholder*="message"]',
  'textarea[placeholder*="Ask"]','textarea[placeholder*="ask"]','textarea[placeholder*="Prompt"]','textarea[placeholder*="prompt"]',
  'textarea[aria-label*="Message"]','textarea[aria-label*="message"]','textarea[name*="message"]','textarea[name*="prompt"]','textarea',
  '[contenteditable="true"][role="textbox"]','[contenteditable="true"][aria-label*="Message"]','[contenteditable="true"][aria-label*="message"]',
  '[contenteditable="true"][data-placeholder*="message"]','[contenteditable="true"]','input[type="text"][placeholder*="Message"]',
  'input[type="text"][placeholder*="message"]','input[type="text"][aria-label*="Message"]','input[placeholder*="Ask anything"]',
  '[data-testid*="textbox"]','[data-testid*="composer"] [contenteditable="true"]'
];

const SEND_SELECTORS = [
  'button[data-testid*="send"]','button[data-testid*="submit"]','button[data-testid*="ask"]',
  'button[aria-label*="Send"]','button[aria-label*="send"]','button[aria-label*="Submit"]','button[aria-label*="Ask"]',
  'button[aria-label*="Send message"]','button[aria-label*="Envoyer"]','button[aria-label*="Enviar"]','button[aria-label*="Envia"]',
  'button[aria-label*="送信"]','button[aria-label*="发送"]','button[aria-label*="Enviar mensagem"]',
  'button[title*="Send"]','button[title*="send"]','button[title*="Send message"]','button[type="submit"]'
];

const ASSISTANT_SELECTORS = [
  '[data-message-author-role="assistant"]','[data-testid*="assistant"]','[data-role="assistant"]','[role="assistant"]',
  '[aria-label*="assistant"]','[aria-label*="Assistant"]','[data-author="assistant"]','main [class*="assistant"]',
  'main [class*="response"]','main [class*="message"] [data-author="assistant"]','main article','[role="article"]'
];
function browserScript(body) {
  return '(() => {' + body + '})()';
}

function buildAIInteractionScript(text) {
  const inputSelectors = JSON.stringify(INPUT_SELECTORS);
  const sendSelectors = JSON.stringify(SEND_SELECTORS);
  return `(async () => {
    const text = ${JSON.stringify(String(text ?? ''))};
    const INPUT_SELECTORS = ${inputSelectors};
    const SEND_SELECTORS = ${sendSelectors};
    const visible = node => {
      if (!node || !node.isConnected) return false;
      const style = getComputedStyle(node);
      return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0' &&
        node.getClientRects().length > 0 && !node.disabled && !node.readOnly;
    };
    const roots = [document];
    for (let i = 0; i < roots.length; i++) {
      try { roots[i].querySelectorAll('*').forEach(node => { if (node.shadowRoot && !roots.includes(node.shadowRoot)) roots.push(node.shadowRoot); }); } catch {}
    }
    const queryAll = selectors => Array.from(new Set(roots.flatMap(root => selectors.flatMap(selector => {
      try { return Array.from(root.querySelectorAll(selector)); } catch { return []; }
    }))));
    const label = node => [node.getAttribute('aria-label'), node.getAttribute('placeholder'), node.getAttribute('data-testid'), node.getAttribute('name')]
      .filter(Boolean).join(' ').toLowerCase();
    const inputScore = node => {
      if (!visible(node)) return -1;
      const tag = node.tagName.toLowerCase();
      const meta = label(node);
      let score = tag === 'textarea' ? 50 : node.isContentEditable ? 45 : 20;
      if (/message|prompt|ask|question|chat|type/.test(meta)) score += 35;
      if (node.getBoundingClientRect().width > 220) score += 10;
      if (node.getBoundingClientRect().height > 30) score += 5;
      if (tag === 'input' && /password|email|search|login|username/.test(meta)) score -= 30;
      return score;
    };
    const inputs = queryAll(INPUT_SELECTORS).filter(visible).sort((a,b) => inputScore(b)-inputScore(a));
    const el = inputs[0];
    if (!el) return { ok:false, reason:'AI_INPUT_NOT_FOUND' };
    el.focus();
    if (el.matches('textarea,input')) {
      const ctor = el.tagName === 'INPUT' ? HTMLInputElement : HTMLTextAreaElement;
      const setter = Object.getOwnPropertyDescriptor(ctor.prototype, 'value')?.set;
      if (setter) setter.call(el, text); else el.value = text;
    } else {
      let inserted = false;
      try {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(el);
        selection?.removeAllRanges();
        selection?.addRange(range);
        inserted = document.execCommand('insertText', false, text);
      } catch {}
      if (!inserted) { el.textContent = text; el.innerText = text; }
    }
    try { el.dispatchEvent(new InputEvent('beforeinput', { bubbles:true, inputType:'insertText', data:text, composed:true })); } catch {}
    try { el.dispatchEvent(new InputEvent('input', { bubbles:true, inputType:'insertText', data:text, composed:true })); } catch { el.dispatchEvent(new Event('input',{bubbles:true})); }
    el.dispatchEvent(new Event('change', { bubbles:true, composed:true }));
    await new Promise(resolve => setTimeout(resolve, 300));

    const buttonScore = node => {
      if (!visible(node)) return -1;
      const meta = [node.getAttribute('aria-label'), node.getAttribute('title'), node.getAttribute('data-testid'), node.innerText].filter(Boolean).join(' ').trim().toLowerCase();
      let score = /send message/.test(meta) ? 100 : 0;
      if (/send|submit|ask|generate|go|envoyer|enviar|envoie|发送|送信/.test(meta)) score += 60;
      if (node.type === 'submit') score += 30;
      if (node.disabled || node.getAttribute('aria-disabled') === 'true') score -= 100;
      const r = node.getBoundingClientRect(), er = el.getBoundingClientRect();
      if (r.bottom >= er.top - 160 && r.top <= er.bottom + 160) score += 15;
      return score;
    };
    let buttons = queryAll(SEND_SELECTORS).filter(visible).sort((a,b)=>buttonScore(b)-buttonScore(a));
    let button = buttons.find(node => buttonScore(node) > 0) || null;
    const form = el.closest('form');
    if (!button && form) {
      button = Array.from(form.querySelectorAll('button')).filter(visible).sort((a,b)=>buttonScore(b)-buttonScore(a))[0] || null;
      if (!button && typeof form.requestSubmit === 'function') { form.requestSubmit(); return { ok:true, mode:'form-submit', inputTag:el.tagName }; }
    }
    if (button) { button.click(); return { ok:true, mode:'button', inputTag:el.tagName, sendControl:button.getAttribute('aria-label') || button.getAttribute('data-testid') || button.tagName }; }
    el.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',bubbles:true,cancelable:true,composed:true}));
    el.dispatchEvent(new KeyboardEvent('keyup',{key:'Enter',code:'Enter',bubbles:true,cancelable:true,composed:true}));
    return { ok:true, mode:'enter', inputTag:el.tagName };
  })()`;
}
const LOGIN_SELECTORS = [
  'input[type="password"]','input[name*="password" i]','input[autocomplete="current-password"]',
  'button[aria-label*="sign in" i]','button[aria-label*="log in" i]','button[title*="sign in" i]',
  'a[href*="/login" i]','a[href*="/signin" i]','a[href*="/auth" i]'
];

function buildAIProbeScript() {
  const inputSelectors = JSON.stringify(INPUT_SELECTORS);
  const sendSelectors = JSON.stringify(SEND_SELECTORS);
  return `(() => {
    const INPUT_SELECTORS = ${inputSelectors};
    const SEND_SELECTORS = ${sendSelectors};
    const LOGIN_SELECTORS = ${JSON.stringify(LOGIN_SELECTORS)};
    const roots = [document];
    for (let i = 0; i < roots.length; i++) {
      try { roots[i].querySelectorAll('*').forEach(node => { if (node.shadowRoot && !roots.includes(node.shadowRoot)) roots.push(node.shadowRoot); }); } catch {}
    }
    const visible = n => { if (!n || !n.isConnected) return false; const s=getComputedStyle(n); return s.display!=='none'&&s.visibility!=='hidden'&&s.opacity!=='0'&&n.getClientRects().length>0; };
    const query = selectors => Array.from(new Set(roots.flatMap(root => selectors.flatMap(selector => { try { return Array.from(root.querySelectorAll(selector)); } catch { return []; } })))).filter(visible);
    const summarize = (node, selector) => ({ selector, tag:node.tagName, editable:!!node.isContentEditable, disabled:!!node.disabled, text:(node.innerText || node.getAttribute('aria-label') || node.getAttribute('placeholder') || '').slice(0,120) });
    const inputs = query(INPUT_SELECTORS).slice(0,8);
    const sends = query(SEND_SELECTORS).slice(0,8);
    const loginControls = query(LOGIN_SELECTORS).slice(0,8);
    const assistantSelectors = [
      '[data-message-author-role="assistant"]','[data-testid*="assistant"]','[data-role="assistant"]',
      '[role="assistant"]','[aria-label*="assistant" i]','[data-author="assistant"]'
    ];
    const assistantNodes = query(assistantSelectors).filter(node => (node.innerText || '').trim()).slice(-8);
    const urlLooksAuth = /(?:^|\\/)(?:login|signin|sign-in|auth)(?:[/?#]|$)/i.test(location.pathname);
    const passwordField = query(['input[type="password"]','input[name*="password" i]','input[autocomplete="current-password"]']).length > 0;
    const authRequired = inputs.length === 0 && (urlLooksAuth || passwordField || loginControls.length > 0);
    const state = inputs.length > 0 && sends.length > 0 ? 'READY' : authRequired ? 'AUTH_REQUIRED' : 'NO_COMPOSER';
    return {
      ok:true,
      state,
      authRequired,
      url:location.href,
      title:document.title,
      inputs:inputs.map((n)=>summarize(n,'generic')),
      sendButtons:sends.map((n)=>summarize(n,'generic')),
      assistantNodes:assistantNodes.map((n)=>summarize(n,'assistant')),
      loginControls:loginControls.map((n)=>summarize(n,'login')),
      rootCount:roots.length
    };
  })()`;
}

function buildAssistantTextScript() {
  const selectors = JSON.stringify(ASSISTANT_SELECTORS);
  return `(() => {
    const SELECTORS = ${selectors};
    const roots = [document];
    for (let i = 0; i < roots.length; i++) {
      try { roots[i].querySelectorAll('*').forEach(node => { if (node.shadowRoot && !roots.includes(node.shadowRoot)) roots.push(node.shadowRoot); }); } catch {}
    }
    const visible = n => { if (!n || !n.isConnected || !n.innerText) return false; const s=getComputedStyle(n); return s.display!=='none'&&s.visibility!=='hidden'&&s.opacity!=='0'&&n.getClientRects().length>0; };
    const query = selectors => Array.from(new Set(roots.flatMap(root => selectors.flatMap(selector => { try { return Array.from(root.querySelectorAll(selector)); } catch { return []; } }))));
    const semantic = query(SELECTORS.slice(0,7)).filter(visible).filter(n => n.innerText.trim());
    const fallback = query(SELECTORS.slice(7)).filter(visible).filter(n => n.innerText.trim());
    const candidates = semantic.length ? semantic : fallback;
    let latest = null;
    for (const node of candidates) {
      if (!latest) latest = node;
      else if (latest.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING) latest = node;
    }
    return latest ? latest.innerText.trim() : '';
  })()`;
}

module.exports = { INPUT_SELECTORS, SEND_SELECTORS, ASSISTANT_SELECTORS, buildAIInteractionScript, buildAIProbeScript, buildAssistantTextScript, browserScript };
