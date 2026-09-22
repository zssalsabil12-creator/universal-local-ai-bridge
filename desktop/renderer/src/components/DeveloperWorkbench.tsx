import { useEffect, useState } from 'react';
import { Code2, RefreshCw, Pencil, Save, X } from 'lucide-react';
import type { ProjectIndex } from '../utils/fileSystem';

interface DeveloperWorkbenchProps {
  index: ProjectIndex | null;
  selectedFile: string | null;
  fileContent: string;
  activity?: Array<{ timestamp: number; status: string; action: string; path?: string }>;
  workspaceRevision?: number;
  onRefresh?: () => void;
  refreshing?: boolean;
  onOpenFile?: (path: string) => void;
  onSaveFile?: (path: string, content: string) => Promise<boolean>;
}

function extOf(path: string) {
  const dot = path.lastIndexOf('.');
  return dot > -1 ? path.slice(dot + 1).toUpperCase() : 'TEXT';
}

export default function DeveloperWorkbench({
  index, selectedFile, fileContent, activity = [], workspaceRevision = 0,
  onRefresh, refreshing, onOpenFile, onSaveFile,
}: DeveloperWorkbenchProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(fileContent);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(fileContent);
    setEditing(false);
  }, [selectedFile, fileContent]);

  const dirty = draft !== fileContent;
  const lines = fileContent ? fileContent.split('\n') : [];

  if (!index) {    return (
      <div className="h-full flex items-center justify-center p-6 text-center">
        <div>
          <Code2 className="w-10 h-10 text-[#334155] mx-auto mb-3" />
          <p className="text-sm font-semibold text-white">Code Workspace</p>
          <p className="text-[11px] text-[#64748b] mt-2">Open a project to inspect and edit its files.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#08090e] text-white min-h-0">
      <div className="px-3 py-2 border-b border-[#202433] bg-[#0c0d13] flex items-center gap-2">
        <Code2 className="w-4 h-4 text-indigo-300" />
        <div className="min-w-0">
          <p className="text-[11px] font-black">Code</p>
          <p className="text-[8px] text-[#64748b] truncate" dir="ltr">{index.rootName}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[8px] text-[#64748b]">Revision {workspaceRevision}</span>
          <span className="text-[8px] text-[#64748b]">{activity.length} activities</span>
          {selectedFile && !editing && (
            <button onClick={() => setEditing(true)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[9px] text-[#aab7cc] border border-white/[0.08] bg-white/[0.03] hover:text-white hover:bg-white/[0.07]">
              <Pencil className="w-3 h-3" /> Edit
            </button>
          )}
          {selectedFile && editing && (
            <>
              <button onClick={() => { setDraft(fileContent); setEditing(false); }} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[9px] text-[#aab7cc] border border-white/[0.08] bg-white/[0.03]">
                <X className="w-3 h-3" /> Cancel
              </button>
              <button
                onClick={async () => {
                  if (!onSaveFile || !selectedFile || saving || !dirty) return;
                  setSaving(true);
                  const ok = await onSaveFile(selectedFile, draft);
                  setSaving(false);
                  if (ok) setEditing(false);
                }}
                disabled={!dirty || saving || !onSaveFile}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-semibold text-white bg-indigo-500/80 hover:bg-indigo-500 disabled:opacity-35"
              >
                <Save className="w-3 h-3" /> {saving ? 'Saving…' : 'Save'}
              </button>
            </>
          )}
          <button onClick={onRefresh} disabled={refreshing} className="p-1.5 rounded-lg text-[#8b9ab5] hover:bg-white/[0.06] disabled:opacity-40" title="Refresh workspace">
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      <div className="px-2.5 py-2 border-b border-[#202433] bg-[#0b0c11] flex items-center gap-2">
        <Code2 className="w-3.5 h-3.5 text-indigo-300" />
        <span className="text-[10px] font-bold truncate" dir="ltr">{selectedFile || 'No file selected'}</span>
        {selectedFile && <span className="ml-auto text-[8px] text-[#53627a]">{extOf(selectedFile)} · {lines.length} lines{dirty ? ' · unsaved' : ''}</span>}
      </div>
      <div className="flex-1 min-h-0 overflow-auto bg-[#08090e] font-mono text-[9px] leading-4">
        {selectedFile && fileContent ? (
          editing ? (
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              spellCheck={false}
              wrap="off"
              className="w-full h-full min-h-full resize-none border-0 outline-none bg-[#08090e] text-[#cbd5e1] p-3 font-mono text-[9px] leading-4"
              dir="ltr"
              aria-label="Edit selected project file"
            />
          ) : (
            <div className="min-w-max p-2">
              {lines.map((line, i) => (
                <div key={i} className="flex hover:bg-white/[0.025]">
                  <span className="w-9 shrink-0 text-right pr-2 text-[#40506a] select-none">{i + 1}</span>
                  <code className="whitespace-pre text-[#aab7cc]">{line || ' '}</code>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="h-full flex items-center justify-center p-6 text-center">
            <div>
              <Code2 className="w-7 h-7 text-[#334155] mx-auto mb-2" />
              <p className="text-[10px] text-[#64748b]">Select a file from the project tree to inspect its current contents.</p>
              {selectedFile && <button onClick={() => onOpenFile?.(selectedFile)} className="mt-2 text-[9px] text-cyan-300 hover:text-cyan-200">Load selected file</button>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}