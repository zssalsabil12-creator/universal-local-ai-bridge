const EN_LOCAL_WORK_RE = /\b(?:work|edit|modify|change|create|add|remove|delete|update|write|fix|build|test|run|implement|open|read|inspect|analy[sz]e|develop)\b/i;
const AR_LOCAL_WORK_RE = /(?:اعمل|العمل|اشتغل|أكمل|اكمل|واصل|تابع|طور|طوّر|تطوير|حسّن|حسن|تحسين|عدل|تعديل|عدّل|أنشئ|انشئ|إنشاء|أضف|اضف|احذف|غير|غيّر|حدّث|اكتب|كتابة|افتح|اقرأ|افحص|اختبر|شغّل|شغل|نفذ|نفّذ|طبّق|صمّم|صمم|أنجز|أنجز|أنشئ|انشئ)/i;

function isLocalProjectWorkRequest(userText) {
  const text = String(userText || '').trim();
  if (!text || text.length > 12000) return false;
  return EN_LOCAL_WORK_RE.test(text) || AR_LOCAL_WORK_RE.test(text);
}

module.exports = { isLocalProjectWorkRequest };
