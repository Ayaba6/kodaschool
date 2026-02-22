import React, { useState, useEffect, useRef } from 'react';
import { Plus, MapPin, X, Calendar as CalendarIcon, Trash2, Edit2, Eye, ZoomIn, ZoomOut, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function Schedule({ school }) {
  const printRef = useRef();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [editingSlot, setEditingSlot] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [zoom, setZoom] = useState(1);

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  const getSubjectColor = (subjectName) => {
    if (!subjectName) return { bg: 'bg-transparent', text: 'text-slate-400' };
    const colors = [
      { bg: 'bg-indigo-100', text: 'text-indigo-800' },
      { bg: 'bg-rose-100', text: 'text-rose-800' },
      { bg: 'bg-amber-100', text: 'text-amber-800' },
      { bg: 'bg-emerald-100', text: 'text-emerald-800' },
      { bg: 'bg-sky-100', text: 'text-sky-800' },
      { bg: 'bg-violet-100', text: 'text-violet-800' },
    ];
    let hash = 0;
    for (let i = 0; i < subjectName.length; i++) hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  useEffect(() => { if (school?.id) fetchInitialData(); }, [school?.id]);
  useEffect(() => { if (selectedClass) fetchSchedules(); }, [selectedClass]);

  async function fetchInitialData() {
    const { data: sub } = await supabase.from('subjects').select('id, name, code').eq('school_id', school.id);
    const { data: tea } = await supabase.from('profiles').select('id, first_name, last_name').eq('school_id', school.id).eq('role', 'teacher');
    const { data: cls } = await supabase.from('classes').select('id, name').eq('school_id', school.id);
    setSubjects(sub || []); setTeachers(tea || []); setClasses(cls || []);
    if (cls?.length > 0) setSelectedClass(cls[0].id);
  }

  async function fetchSchedules() {
    const { data } = await supabase.from('schedules').select(`*, subject:subjects(name, code), teacher:profiles(first_name, last_name)`).eq('class_id', selectedClass);
    setSchedules(data || []);
  }

  const getSlotContent = (day, time) => {
    return schedules.find(s => {
      const slotStart = parseInt(s.start_time.split(':')[0]);
      const slotEnd = parseInt(s.end_time.split(':')[0]);
      const currentTime = parseInt(time.split(':')[0]);
      return s.day === day && currentTime >= slotStart && currentTime < slotEnd;
    });
  };

  const handleGeneratePreview = async () => {
    const element = printRef.current;
    const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' });
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 297, (canvas.height * 297) / canvas.width);
    setPreviewUrl(pdf.output('bloburl'));
    setIsPreviewOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const slotData = {
      school_id: school.id, class_id: selectedClass, subject_id: formData.get('subject_id'),
      teacher_id: formData.get('teacher_id'), day: formData.get('day'),
      start_time: formData.get('start_time'), end_time: formData.get('end_time'), room: formData.get('room')
    };
    const { error } = editingSlot ? await supabase.from('schedules').update(slotData).eq('id', editingSlot.id) : await supabase.from('schedules').insert([slotData]);
    if (!error) { setIsModalOpen(false); setEditingSlot(null); fetchSchedules(); }
  };

  return (
    <div className="space-y-6 bg-slate-50 p-6 rounded-[40px]">
      
      {/* HEADER */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-5 rounded-[24px] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-900 text-white rounded-xl"><CalendarIcon size={22} /></div>
          <div>
            <h2 className="text-lg font-black italic text-slate-900 uppercase leading-none mb-1">Gestion Planning</h2>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="text-[10px] font-black text-[#5551FF] bg-transparent outline-none uppercase tracking-widest cursor-pointer">
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button onClick={() => setZoom(Math.max(0.4, zoom - 0.1))} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-slate-500 hover:text-[#5551FF]"><ZoomOut size={14}/></button>
            <span className="text-[10px] font-black w-10 text-center text-slate-600">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(Math.min(1.5, zoom + 0.1))} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-slate-500 hover:text-[#5551FF]"><ZoomIn size={14}/></button>
          </div>
          <button onClick={handleGeneratePreview} className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase italic"><Eye size={16} /> Aperçu</button>
          <button onClick={() => { setEditingSlot(null); setIsModalOpen(true); }} className="flex items-center gap-2 px-5 py-3 bg-[#5551FF] text-white rounded-xl text-[10px] font-black uppercase italic tracking-wider shadow-lg"><Plus size={16} /> Ajouter</button>
        </div>
      </div>

      {/* GRILLE D'EMPLOI DU TEMPS */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-x-auto">
        <div ref={printRef} className="p-8 bg-white min-w-max">
          <table className="w-full border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-50">
                <th className="w-24 border border-slate-200 bg-white"></th>
                {days.map(day => (
                  <th key={day} className="border border-slate-200 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] py-4" style={{ minWidth: `${zoom * 160}px` }}>{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((time) => (
                <tr key={time} style={{ height: `${zoom * 7}rem` }}>
                  {/* HEURES GREY LUXURY */}
                  <td className="relative border border-slate-200 w-24 bg-slate-50">
                    <div className="absolute -top-3 left-2 right-2 py-1.5 bg-slate-500 rounded shadow-lg z-20">
                        <span className="block text-center font-black text-white italic tracking-tighter" style={{ fontSize: `${zoom * 0.75}rem` }}>
                        {time}
                        </span>
                    </div>
                  </td>
                  
                  {days.map(day => {
                    const slot = getSlotContent(day, time);
                    const isStart = slot?.start_time.substring(0, 5) === time;
                    const color = slot ? getSubjectColor(slot.subject?.name) : { bg: 'bg-transparent', text: '' };

                    return (
                      <td key={`${day}-${time}`} className={`border border-slate-200 p-0 relative transition-colors ${color.bg}`}>
                        {slot && (
                          <div className="h-full w-full flex flex-col items-center justify-center p-3 relative group/card text-center">
                            {/* CONTENU RÉPÉTÉ ET CENTRÉ */}
                            <div className="w-full overflow-hidden">
                              <p className={`font-black uppercase leading-tight tracking-tight ${color.text}`} style={{ fontSize: `${zoom * 0.85}rem` }}>
                                {slot.subject?.code || slot.subject?.name}
                              </p>
                              <p className="font-bold text-slate-500 italic uppercase tracking-tighter truncate opacity-80" style={{ fontSize: `${zoom * 0.55}rem` }}>
                                {slot.teacher?.last_name}
                              </p>
                            </div>
                            
                            <div className="mt-2">
                              <span className="text-[10px] font-black text-slate-400 flex items-center justify-center gap-1 border border-black/5 px-2 py-0.5 rounded bg-white/20" style={{ fontSize: `${zoom * 0.5}rem` }}>
                                <MapPin size={Math.max(8, zoom * 10)} /> {slot.room || '---'}
                              </span>
                            </div>

                            {/* BOUTONS ACTIONS (SUR CELLULE START SEULEMENT) */}
                            {isStart && (
                              <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity bg-white/90 p-1 rounded shadow-sm z-30">
                                <button onClick={() => { setEditingSlot(slot); setIsModalOpen(true); }} className="text-slate-600 hover:text-[#5551FF] p-0.5"><Edit2 size={10} /></button>
                                <button onClick={async () => { if(confirm("Supprimer ?")) { await supabase.from('schedules').delete().eq('id', slot.id); fetchSchedules(); }}} className="text-slate-600 hover:text-rose-600 p-0.5"><Trash2 size={10} /></button>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL APERÇU PDF DANS UNE MODAL */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-white">
              <h3 className="text-lg font-black italic text-slate-900 uppercase">Aperçu Impression</h3>
              <div className="flex items-center gap-3">
                <a href={previewUrl} download="Emploi_du_temps.pdf" className="flex items-center gap-2 px-6 py-2.5 bg-[#5551FF] text-white rounded-xl text-[10px] font-black uppercase shadow-lg">
                    <Download size={14} /> Télécharger
                </a>
                <button onClick={() => setIsPreviewOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><X size={24}/></button>
              </div>
            </div>
            <div className="flex-1 bg-slate-200 p-4">
              <iframe src={previewUrl} className="w-full h-full rounded shadow-2xl border-none" title="PDF"></iframe>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AJOUT / ÉDITION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
             <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-black italic text-slate-900 uppercase tracking-tighter">Édition Créneau</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <select name="subject_id" defaultValue={editingSlot?.subject_id} required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                  <option value="">Matière</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <select name="teacher_id" defaultValue={editingSlot?.teacher_id} required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                  <option value="">Professeur</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.last_name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <select name="day" defaultValue={editingSlot?.day} className="px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <input name="start_time" type="time" defaultValue={editingSlot?.start_time || "08:00"} className="px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
                <input name="end_time" type="time" defaultValue={editingSlot?.end_time || "10:00"} className="px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
              </div>
              <input name="room" defaultValue={editingSlot?.room} placeholder="SALLE (EX: A203)" className="w-full px-5 py-4 bg-slate-900 text-white rounded-xl font-black italic border-none uppercase" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border border-slate-200 rounded-xl font-bold text-slate-500 uppercase text-xs">Annuler</button>
                <button type="submit" className="flex-[2] py-4 bg-[#5551FF] text-white rounded-xl font-black italic uppercase text-xs shadow-lg">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}