// Universal Local AI Bridge - Content Script
// Injected into AI chat pages to detect and interact with AI responses

console.log('[ULAB Content] Content script loaded on:', window.location.href);

// Detect AI provider
function detectProvider() {
  const hostname = window.location.hostname;
  
  if (hostname.includes('chat.openai.com') || hostname.includes('chatgpt.com')) {
    return 'chatgpt';
  } else if (hostname.includes('gemini.google.com')) {
    return 'gemini';
  } else if (hostname.includes('claude.ai')) {
    return 'claude';
  } else if (hostname.includes('chat.deepseek.com')) {
    return 'deepseek';
  }
  
  return 'unknown';
}

const provider = detectProvider();
console.log('[ULAB Content] Detected provider:', provider);

// Listen for messages from extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[ULAB Content] Message from extension:', message);
  
  if (message.type === 'get_provider') {
    sendResponse({ provider: provider });
  } else if (message.type === 'inject_context') {
    injectContext(message.context);
    sendResponse({ success: true });
  } else if (message.type === 'read_response') {
    const response = readLatestResponse();
    sendResponse({ response: response });
  }
  
  return true;
});

// Inject context into chat input
function injectContext(context) {
  const provider = detectProvider();
  let inputSelector = '';
  
  switch (provider) {
    case 'chatgpt':
      inputSelector = '#prompt-textarea, textarea[placeholder*="Message"]';
      break;
    case 'gemini':
      inputSelector = '.ql-editor, [contenteditable="true"]';
      break;
    case 'claude':
      inputSelector = '.ProseMirror, [contenteditable="true"]';
      break;
    case 'deepseek':
      inputSelector = 'textarea, [contenteditable="true"]';
      break;
    default:
      console.log('[ULAB Content] Unknown provider, cannot inject context');
      return;
  }
  
  const input = document.querySelector(inputSelector);
  
  if (!input) {
    console.error('[ULAB Content] Could not find chat input');
    return;
  }
  
  // Set value
  if (input.tagName === 'TEXTAREA') {
    input.value = context;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  } else {
    input.textContent = context;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
  
  console.log('[ULAB Content] Context injected successfully');
}

// Read latest AI response
function readLatestResponse() {
  const provider = detectProvider();
  let responseSelector = '';
  
  switch (provider) {
    case 'chatgpt':
      responseSelector = '[data-message-author-role="assistant"]:last-of-type';
      break;
    case 'gemini':
      responseSelector = '.response-container:last-of-type';
      break;
    case 'claude':
      responseSelector = '.font-claude-message:last-of-type';
      break;
    case 'deepseek':
      responseSelector = '.message-item.assistant:last-of-type';
      break;
    default:
      return null;
  }
  
  const responseEl = document.querySelector(responseSelector);
  
  if (!responseEl) {
    console.log('[ULAB Content] No response found');
    return null;
  }
  
  return responseEl.textContent.trim();
}

// Notify extension that content script is ready
chrome.runtime.sendMessage({
  type: 'content_ready',
  provider: provider
});

console.log('[ULAB Content] Content script initialized');
