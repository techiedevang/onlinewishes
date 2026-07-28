import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Eraser, Check } from 'lucide-react';

interface SignaturePanelProps {
  signatureUrl: string | undefined;
  onChange: (url: string) => void;
}

export function SignaturePanel({ signatureUrl, onChange }: SignaturePanelProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);

  const clear = () => {
    sigCanvas.current?.clear();
    onChange('');
  };

  const save = () => {
    if (sigCanvas.current?.isEmpty()) {
      onChange('');
    } else {
      onChange(sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png') || '');
    }
  };

  return (
    <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Sign Your Name</h4>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={clear}
            className="flex items-center space-x-1 px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-xs hover:bg-slate-300 dark:hover:bg-slate-600"
          >
            <Eraser className="w-3 h-3" />
            <span>Clear</span>
          </button>
          <button
            type="button"
            onClick={save}
            className="flex items-center space-x-1 px-2 py-1 bg-emerald-500 text-white rounded text-xs hover:bg-emerald-600"
          >
            <Check className="w-3 h-3" />
            <span>Save</span>
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 overflow-hidden" style={{ height: 150 }}>
        {signatureUrl ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <img src={signatureUrl} alt="Signature" className="max-h-full max-w-full object-contain" />
            <button 
              onClick={clear}
              className="absolute inset-0 w-full h-full bg-slate-900/50 flex items-center justify-center opacity-0 hover:opacity-100 text-white font-bold transition-opacity"
            >
              Click to Edit
            </button>
          </div>
        ) : (
          <SignatureCanvas
            ref={sigCanvas}
            penColor="black"
            canvasProps={{ className: 'w-full h-full' }}
            onEnd={save}
          />
        )}
      </div>
      <p className="text-[10px] text-slate-500 mt-2 text-center">Draw your signature above to add a personal touch to the final page.</p>
    </div>
  );
}
