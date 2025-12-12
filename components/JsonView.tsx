import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { StudySet } from '../types';

interface JsonViewProps {
  data: StudySet;
}

const JsonView: React.FC<JsonViewProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-slate-900 rounded-xl shadow-lg overflow-hidden border border-slate-700">
        <div className="flex justify-between items-center px-6 py-3 bg-slate-800 border-b border-slate-700">
          <span className="text-slate-400 text-sm font-mono">output.json</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy JSON'}
          </button>
        </div>
        <pre className="p-6 overflow-x-auto text-sm font-mono text-emerald-400 leading-relaxed">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default JsonView;
