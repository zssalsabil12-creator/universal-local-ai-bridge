function isUsableAIWebContents(aiView) {
  if (!aiView?.webContents || aiView.webContents.isDestroyed()) return false;
  const url = aiView.webContents.getURL();
  return !!url && url !== 'about:blank';
}

module.exports = { isUsableAIWebContents };
