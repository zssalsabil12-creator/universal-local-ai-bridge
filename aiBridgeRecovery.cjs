function shouldRecoverBridgeControl(assistantText) {
  const text = String(assistantText || '').trim();
  if (!text || text.length > 12000) return false;
  const lower = text.toLowerCase();
  const fence = String.fromCharCode(96).repeat(3) + 'ulab-tool';
  if (lower.includes(fence)) return false;

  const hasToolMention = lower.includes('ulab tool') || lower.includes('ulab tools') || lower.includes('files.write') || lower.includes('files.create') || lower.includes('terminal.execute') || lower.includes('native tools') || lower.includes('required tools') || lower.includes('requested tools');
  const hasUnavailable = lower.includes('unavailable') || lower.includes('not available') || lower.includes('not accessible') || lower.includes('missing tools');
  const hasAccessRefusal = (lower.includes('cannot') || lower.includes("can’t") || lower.includes("can't") || lower.includes('do not have') || lower.includes("don't have")) && (lower.includes('access') || lower.includes('modify') || lower.includes('write') || lower.includes('create') || lower.includes('run') || lower.includes('execute'));
  const asksForLocalInput = (lower.includes('please') || lower.includes('kindly')) && (lower.includes('send') || lower.includes('upload') || lower.includes('paste') || lower.includes('provide')) && (lower.includes('file') || lower.includes('output') || lower.includes('command') || lower.includes('code'));

  const arabicRefusal = text.includes('لا أستطيع') || text.includes('لا أملك') || text.includes('لا يمكنني');
  const arabicLocalAction = text.includes('الملف') || text.includes('المشروع') || text.includes('الجهاز') || text.includes('تعديل') || text.includes('تنفيذ') || text.includes('تشغيل') || text.includes('الوصول') || text.includes('أدوات');
  const arabicUnavailable = text.includes('أدوات') && (text.includes('غير متاحة') || text.includes('غير متوفرة') || text.includes('لا تتضمن'));
  const arabicAsks = (text.includes('أرسل') || text.includes('ارسل') || text.includes('زوّدني') || text.includes('زودني') || text.includes('يمكنك')) && (text.includes('الملف') || text.includes('المحتوى') || text.includes('الكود') || text.includes('الناتج') || text.includes('الأمر'));

  return (hasToolMention && (hasUnavailable || hasAccessRefusal)) || hasAccessRefusal || asksForLocalInput || (arabicRefusal && arabicLocalAction) || arabicUnavailable || arabicAsks;
}

module.exports = { shouldRecoverBridgeControl };
