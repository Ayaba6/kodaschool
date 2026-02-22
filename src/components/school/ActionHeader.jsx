import { Search, ChevronDown, Download, Upload, Plus } from 'lucide-react';

export default function ActionHeader({ title, onAdd }) {
  return (
    <div className="space-y-6 mb-8">
      <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Rechercher..." className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none" />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600">
          <Download size={16} /> Exporter
        </button>
        <button onClick={onAdd} className="flex items-center gap-2 px-6 py-2 bg-[#4F46E5] text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-100">
          <Plus size={18} /> Nouveau
        </button>
      </div>
    </div>
  );
}