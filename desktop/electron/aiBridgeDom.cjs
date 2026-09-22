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

function buildInstallULABSanitizerScript() {
  return '(() => {' +
    'const INTERNAL_MARKERS = ["ULAB Desktop bridge is active","ULAB BRIDGE BOOTSTRAP","ULAB ACTIVE WORK TASK","ULAB TOOL RESULT","ULAB EXECUTION RECOVERY","ULAB WORKSPACE CONTEXT"];' +
    'const actions = new Set(["workspace.session","files.read","files.list","files.search","files.propose","files.create","files.write","files.delete","git.status","git.diff","git.commit","git.push","terminal.execute","testing.run","context.build","audit.log","task.progress","task.complete"]);' +
    'const normalize = value => String(value || "").replaceAll("\\n", " ").replaceAll("\\r", " ").trim();' +
    'const roots = () => { const list=[document]; for(let i=0;i<list.length;i++){ try{ list[i].querySelectorAll("*").forEach(node=>{ if(node.shadowRoot && !list.includes(node.shadowRoot)) list.push(node.shadowRoot); }); }catch{} } return list; };' +
    'const collect=(root,selector)=>{ try{return Array.from(root.querySelectorAll(selector));}catch{return[];} };' +
    'const hide=node=>{ if(!node || node.nodeType!==1) return; try{ node.style.setProperty("display","none","important"); node.setAttribute("data-ulab-hidden","true"); }catch{} };' +
    'const assistantLike=node=>{ const meta=[node.getAttribute?.("data-message-author-role"),node.getAttribute?.("data-role"),node.getAttribute?.("data-author"),node.getAttribute?.("role"),node.getAttribute?.("aria-label"),node.getAttribute?.("data-testid"),node.className].filter(Boolean).join(" ").toLowerCase(); return /assistant|response|model/.test(meta); };' +
    'const inspect=()=>{ const allRoots=roots(); const messageNodes=[]; const codeNodes=[]; for(const root of allRoots){ messageNodes.push(...collect(root,"[data-message-author-role]"),...collect(root,"[data-role]"),...collect(root,"[data-author]"),...collect(root,"[role=\\\"assistant\\\"]"),...collect(root,"[role=\\\"article\\\"]"),...collect(root,"main article"),...collect(root,"main [data-testid*=\\\"message\\\"]")); codeNodes.push(...collect(root,"pre"),...collect(root,"pre code"),...collect(root,"[data-language]"),...collect(root,"[data-code-language]")); } for(const node of Array.from(new Set(messageNodes))){ const text=normalize(node.innerText||node.textContent); if(!text||text.length>180000) continue; if(INTERNAL_MARKERS.some(marker=>text.includes(marker))){hide(node);continue;} if(assistantLike(node)){ const matches=text.match(/\\{[\\s\\S]{0,65536}\\}/g)||[]; for(const candidate of matches){ try{ const parsed=JSON.parse(candidate); if(parsed && typeof parsed==="object" && actions.has(parsed.action)){hide(node);break;} }catch{} } } } for(const node of Array.from(new Set(codeNodes))){ const raw=normalize(node.textContent||node.innerText); if(!raw||raw.length>70000) continue; if(INTERNAL_MARKERS.some(marker=>raw.includes(marker))){hide(node.closest("pre")||node);continue;} try{ const parsed=JSON.parse(raw); if(parsed && typeof parsed==="object" && actions.has(parsed.action)){ let target=node; for(let i=0;target&&i<8;i++,target=target.parentElement){ if(assistantLike(target)){hide(target);break;} } } }catch{} } return {ok:true}; };' +
    'inspect();' +
    'if(!window.__ULAB_SANITIZER_INSTALLED__){ window.__ULAB_SANITIZER_INSTALLED__=true; const observer=new MutationObserver(()=>{clearTimeout(window.__ULAB_SANITIZER_TIMER__);window.__ULAB_SANITIZER_TIMER__=setTimeout(inspect,35);}); try{observer.observe(document.documentElement,{childList:true,subtree:true,characterData:true});}catch{} }' +
    'return {ok:true,installed:true};' +
  '})()';
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
    const metaOf = node => [
      node?.getAttribute?.('data-message-author-role'),
      node?.getAttribute?.('data-role'),
      node?.getAttribute?.('data-author'),
      node?.getAttribute?.('aria-label'),
      node?.getAttribute?.('class'),
      node?.getAttribute?.('id')
    ].filter(Boolean).join(' ').toLowerCase();

    const semantic = query(SELECTORS.slice(0,7))
      .filter(visible)
      .filter(n => n.innerText.trim())
      .filter(n => !/user|human|system/.test(metaOf(n)));

    const fallback = query(SELECTORS.slice(7))
      .filter(visible)
      .filter(n => n.innerText.trim())
      .filter(n => !/user|human|system/.test(metaOf(n)));

    // Remove nested generic containers so one assistant turn is not counted
    // several times when a provider wraps its message in multiple articles.
    const dedupeNested = candidates => candidates.filter((node, index, all) => {
      return !all.some((other, j) => j !== index && node.parentElement && other.contains(node));
    });

    const candidates = dedupeNested(semantic.length ? semantic : fallback);
    let latest = null;
    for (const node of candidates) {
      if (!latest) latest = node;
      else if (latest.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING) latest = node;
    }
    return latest ? latest.innerText.trim() : '';
  })()`;
}

function buildLatestUserTextScript() {
  return `(() => {
    const roots = [document];
    for (let i = 0; i < roots.length; i++) {
      try {
        const all = roots[i].querySelectorAll('*');
        for (let j = 0; j < all.length; j++) {
          if (all[j].shadowRoot && !roots.includes(all[j].shadowRoot)) roots.push(all[j].shadowRoot);
        }
      } catch {}
    }

    const collect = selectors => {
      const out = [];
      for (const root of roots) {
        for (const selector of selectors) {
          try { out.push(...root.querySelectorAll(selector)); } catch {}
        }
      }
      return Array.from(new Set(out));
    };

    const textOf = node => String(node?.innerText || node?.textContent || '').trim();
    const metaOf = node => [
      node?.getAttribute?.('data-message-author-role'),
      node?.getAttribute?.('data-role'),
      node?.getAttribute?.('data-author'),
      node?.getAttribute?.('aria-label'),
      node?.getAttribute?.('class'),
      node?.getAttribute?.('id')
    ].filter(Boolean).join(' ').toLowerCase();

    const explicitUsers = collect([
      '[data-message-author-role="user"]',
      '[data-role="user"]',
      '[data-author="user"]',
      '[aria-label*="user message" i]',
      '[aria-label*="human message" i]',
      '[class*="user-message" i]',
      '[class*="message-user" i]',
      '[data-testid*="user-message" i]'
    ]).filter(node => {
      const text = textOf(node);
      const meta = metaOf(node);
      return text && text.length <= 20000 && !/assistant|system/.test(meta);
    });

    const assistantNodes = collect([
      '[data-message-author-role="assistant"]',
      '[data-role="assistant"]',
      '[data-author="assistant"]',
      '[aria-label*="assistant" i]',
      '[class*="assistant-message" i]',
      '[class*="message-assistant" i]',
      '[data-testid*="assistant" i]'
    ]);

    // Fallback for providers that expose generic conversation articles without
    // a user/assistant role attribute. Prefer the latest generic article that
    // is not inside or marked as an assistant node.
    let fallback = collect([
      'main article',
      'main [role="article"]',
      '[role="article"]'
    ]).filter(node => {
      const text = textOf(node);
      const meta = metaOf(node);
      if (!text || text.length > 20000) return false;
      if (/assistant|system/.test(meta)) return false;
      return true;
    });

    // Remove nested duplicates: when both a wrapper and its child are matched,
    // keep the outermost conversation item unless the child has explicit user metadata.
    fallback = fallback.filter((node, index, all) => {
      if (/user|human/.test(metaOf(node))) return true;
      return !all.some((other, j) => j !== index && node.parentElement && other.contains(node));
    });

    const pickLatest = candidates => {
      let latest = null;
      for (const node of candidates) {
        if (!latest || (latest.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING)) {
          latest = node;
        }
      }
      return latest;
    };

    const explicitLatest = pickLatest(explicitUsers);
    if (explicitLatest) return textOf(explicitLatest);

    // Generic fallback: if the latest conversation item is not an assistant
    // item, treat it as the latest human turn.
    const latestAssistant = pickLatest(assistantNodes);
    const latestGeneric = pickLatest(fallback);
    if (latestGeneric) {
      const genericText = textOf(latestGeneric);
      const genericMeta = metaOf(latestGeneric);
      const isAssistant = /assistant/.test(genericMeta) || (
        latestAssistant &&
        (latestAssistant === latestGeneric || latestAssistant.contains(latestGeneric) || latestGeneric.contains(latestAssistant))
      );
      if (!isAssistant && genericText) return genericText;
    }

    return '';
  })()`;
}

function buildHideULABControlScript() {
  return `(() => {
    const markers = ['ULAB BRIDGE BOOTSTRAP','ULAB ACTIVE WORK TASK','ULAB TOOL RESULT','ULAB EXECUTION RECOVERY'];
    const normalize = value => String(value || '').replace(/\\s+/g, ' ').trim();
    const roots = [document];
    for (let i = 0; i < roots.length; i++) {
      try {
        const all = roots[i].querySelectorAll('*');
        for (let j = 0; j < all.length; j++) {
          if (all[j].shadowRoot && !roots.includes(all[j].shadowRoot)) roots.push(all[j].shadowRoot);
        }
      } catch {}
    }
    const nodes = [];
    for (const root of roots) {
      try {
        nodes.push(...root.querySelectorAll('[data-message-author-role="user"], [data-role="user"], [data-author="user"], [role="user"], main article, [role="article"]'));
      } catch {}
    }
    for (const node of Array.from(new Set(nodes))) {
      const text = normalize(node.innerText || node.textContent);
      const marked = markers.some(marker => text.startsWith(marker));
      if (!marked) continue;
      try {
        node.style.setProperty('display', 'none', 'important');
        node.setAttribute('data-ulab-control', 'true');
      } catch {}
    }
    return { ok:true };
  })()`;
}

function buildHideULABToolCallScript() {
  return `(() => {
    const allowedActions = new Set(['files.read','files.list','files.search','files.propose','files.create','files.write','files.delete','git.status','git.diff','git.commit','git.push','terminal.execute','testing.run','context.build','audit.log','workspace.session','task.progress','task.complete']);
    const roots = [document];
    for (let i = 0; i < roots.length; i++) {
      try { roots[i].querySelectorAll('*').forEach(node => { if (node.shadowRoot && !roots.includes(node.shadowRoot)) roots.push(node.shadowRoot); }); } catch {}
    }
    const nodes = [];
    for (const root of roots) {
      try { nodes.push(...root.querySelectorAll('pre, pre code, [data-language], [data-code-language]')); } catch {}
    }
    for (const node of Array.from(new Set(nodes))) {
      const raw = String(node.textContent || node.innerText || '').trim();
      let parsed = null;
      try { parsed = JSON.parse(raw); } catch {}
      const action = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed.action : null;
      if (!allowedActions.has(action)) continue;
      let current = node;
      for (let depth = 0; current && depth < 10; depth++, current = current.parentElement) {
        const meta = [current.getAttribute?.('data-message-author-role'), current.getAttribute?.('data-role'), current.getAttribute?.('role'), current.getAttribute?.('class'), current.getAttribute?.('aria-label')].filter(Boolean).join(' ').toLowerCase();
        if (/assistant|response/.test(meta)) {
          try { current.style.setProperty('display', 'none', 'important'); current.setAttribute('data-ulab-tool-call', 'true'); } catch {}
          break;
        }
      }
    }
    return { ok:true };
  })()`;
}

function buildHideULABAssistantRequestScript() {
  return `(() => {
    const allowedActions = new Set(['files.read','files.list','files.search','files.propose','files.create','files.write','files.delete','git.status','git.diff','git.commit','git.push','terminal.execute','testing.run','context.build','audit.log','workspace.session','task.progress','task.complete']);
    const roots = [document];
    for (let i = 0; i < roots.length; i++) {
      try { roots[i].querySelectorAll('*').forEach(node => { if (node.shadowRoot && !roots.includes(node.shadowRoot)) roots.push(node.shadowRoot); }); } catch {}
    }
    const selectors = ['[data-message-author-role="assistant"]','[data-role="assistant"]','[data-author="assistant"]','[role="assistant"]','[aria-label*="assistant" i]','[data-testid*="assistant" i]','main article','main [role="article"]'];
    const nodes = [];
    for (const root of roots) {
      for (const selector of selectors) {
        try { nodes.push(...root.querySelectorAll(selector)); } catch {}
      }
    }
    const parseCandidate = raw => {
      try {
        const parsed = JSON.parse(String(raw || '').trim());
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) && allowedActions.has(parsed.action) ? parsed : null;
      } catch { return null; }
    };
    for (const node of Array.from(new Set(nodes)).reverse()) {
      const text = String(node.innerText || node.textContent || '').trim();
      if (!text || text.length > 65536) continue;
      let tool = parseCandidate(text);
      if (!tool) {
        const fenceMark = String.fromCharCode(96).repeat(3);
        const match = text.match(new RegExp(fenceMark + '(?:ulab-tool|json)?\\\\s*([\\\\s\\\\S]*?)' + fenceMark, 'i'));
        if (match) tool = parseCandidate(match[1]);
      }
      if (!tool) continue;
      try { node.style.setProperty('display','none','important'); node.setAttribute('data-ulab-tool-call','true'); } catch {}
      return { ok:true, hidden:true, action:tool.action };
    }
    return { ok:true, hidden:false };
  })()`;
}

function buildLatestAIToolBlockScript() {
  const selectors = JSON.stringify(ASSISTANT_SELECTORS);
  return `(() => {
    const SELECTORS = ${selectors};
    const roots = [document];
    for (let i = 0; i < roots.length; i++) {
      try {
        const all = roots[i].querySelectorAll('*');
        for (let j = 0; j < all.length; j++) {
          if (all[j].shadowRoot && !roots.includes(all[j].shadowRoot)) roots.push(all[j].shadowRoot);
        }
      } catch {}
    }

    const query = selectors => {
      const out = [];
      for (let r = 0; r < roots.length; r++) {
        for (let s = 0; s < selectors.length; s++) {
          try {
            const nodes = roots[r].querySelectorAll(selectors[s]);
            for (let i = 0; i < nodes.length; i++) out.push(nodes[i]);
          } catch {}
        }
      }
      return out;
    };

    const allowedActions = new Set([
      'files.read','files.list','files.search','files.propose',
      'files.create','files.write','files.delete','git.status','git.diff','git.commit','git.push',
      'terminal.execute','testing.run','context.build','audit.log','workspace.session','task.progress','task.complete'
    ]);
    const fenceMark = String.fromCharCode(96).repeat(3);
    const fence = fenceMark + 'ulab-tool\\n';

    // Search all rendered code blocks, then choose the latest valid ULAB request.
    // Some providers do not place the <pre> inside the semantic assistant node.
    const blocks = query(['pre', 'pre code', '[data-language]', '[data-code-language]']);
    const isAssistantBlock = node => {
      let current = node;
      for (let depth = 0; current && depth < 12; depth++, current = current.parentElement) {
        const attrs = [
          current.getAttribute && current.getAttribute('data-message-author-role'),
          current.getAttribute && current.getAttribute('data-role'),
          current.getAttribute && current.getAttribute('role'),
          current.getAttribute && current.getAttribute('aria-label'),
          current.getAttribute && current.getAttribute('class'),
          current.getAttribute && current.getAttribute('id')
        ].filter(Boolean).join(' ').toLowerCase();
        if (/assistant|assistant-message|assistant-response|response-container/.test(attrs)) return true;
        if (/user-message|message-author-user|role user/.test(attrs)) return false;
      }
      return false;
    };
    for (let i = blocks.length - 1; i >= 0; i--) {
      const block = blocks[i];
      if (!isAssistantBlock(block)) continue;
      const raw = String(block.textContent || block.innerText || '').trim();
      if (!raw || raw.length > 65536) continue;

      const p1 = block.parentElement;
      const p2 = p1 && p1.parentElement;
      const marker = [
        block.getAttribute('class'),
        block.getAttribute('data-language'),
        block.getAttribute('data-code-language'),
        block.getAttribute('aria-label'),
        block.getAttribute('title'),
        p1 ? String(p1.innerText || '') : '',
        p2 ? String(p2.innerText || '') : ''
      ].filter(Boolean).join(' ');

      let parsed = null;
      try { parsed = JSON.parse(raw); } catch {}
      const structured = !!parsed && typeof parsed === 'object' && !Array.isArray(parsed) &&
        allowedActions.has(parsed.action) &&
        (parsed.params === undefined || (parsed.params && typeof parsed.params === 'object' && !Array.isArray(parsed.params)));
      if (!structured && !/ulab[-\\s]?tool/i.test(marker)) continue;

      return fence + raw + '\\n' + fenceMark;
    }
    return '';
  })()`;
}

module.exports = { INPUT_SELECTORS, SEND_SELECTORS, ASSISTANT_SELECTORS, buildAIInteractionScript, buildAIProbeScript, buildAssistantTextScript, buildLatestUserTextScript, buildLatestAIToolBlockScript, buildHideULABControlScript, buildHideULABToolCallScript, buildHideULABAssistantRequestScript, buildInstallULABSanitizerScript, browserScript };
