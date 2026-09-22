const assert = require('assert');
const { shouldRecoverBridgeControl } = require('./aiBridgeRecovery.cjs');

const exact = [
  'نعم، أستطيع العمل على المشروع إذا كانت أدوات ULAB الخاصة بالملفات متاحة لي في هذه الجلسة.',
  'لكن حاليًا الأدوات التي وصلتني لا تتضمن أدوات ULAB التنفيذية مثل files.write وfiles.create وterminal.execute؛ لذلك لا أستطيع أن أدّعي أنني أستطيع تعديل الملفات مباشرة الآن.',
  'إذا أصبحت أدوات ULAB متاحة في الجلسة، أستطيع مباشرةً إنشاء ملفات جديدة وتعديل الملفات الموجودة وتشغيل الاختبارات.'
].join('\\n');

assert.equal(shouldRecoverBridgeControl(exact), true);
assert.equal(shouldRecoverBridgeControl('I can work directly through the host bridge.'), false);
assert.equal(shouldRecoverBridgeControl('The requested tools are unavailable in this session.'), true);
assert.equal(shouldRecoverBridgeControl('```ulab-tool\\n{"action":"files.read","params":{"path":"x"}}\\n```'), false);
assert.equal(shouldRecoverBridgeControl('لا أستطيع تعديل الملف مباشرة، أرسل لي الملف من فضلك.'), true);
console.log('AI bridge recovery tests: PASS');
