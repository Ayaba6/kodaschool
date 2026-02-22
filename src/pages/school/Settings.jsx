import React from 'react';
import { School, Shield, Bell, Palette } from 'lucide-react';

export default function Settings({ school }) {
  return (
    <div className="max-w-2xl space-y-8">
      <h2 className="text-3xl font-black italic">Configuration de l'établissement</h2>
      <div className="space-y-4">
        {[
          { icon: School, title: "Infos École", desc: "Nom, adresse, logo et réseaux sociaux" },
          { icon: Shield, title: "Sécurité & Accès", desc: "Gestion des comptes staff et permissions" },
          { icon: Palette, title: "Personnalisation", desc: "Couleurs de l'interface et thèmes" }
        ].map((item, i) => (
          <button key={i} className="w-full flex items-center gap-6 p-6 bg-white border border-slate-100 rounded-[24px] hover:border-[#5551FF] transition-all text-left group">
            <div className="p-4 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-indigo-50 group-hover:text-[#5551FF] transition-all">
              <item.icon size={24}/>
            </div>
            <div>
              <p className="font-black text-slate-900">{item.title}</p>
              <p className="text-sm text-slate-500 font-medium">{item.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}