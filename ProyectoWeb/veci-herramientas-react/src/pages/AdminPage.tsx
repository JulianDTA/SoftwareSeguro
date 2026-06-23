import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
// ICONOS LUCIDE (Limpios)
import { 
  ShieldAlert, Check, X, ArrowLeft, 
  Loader2, FileCheck 
} from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingTools, setPendingTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchPending();
  }, [user, navigate]);

  const fetchPending = async () => {
    try {
      const res = await api.get('/tools/pending');
      setPendingTools(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const decideTool = async (id: string, status: 'approved' | 'rejected') => {
    if (!window.confirm(`¿Confirmar acción: ${status === 'approved' ? 'APROBAR' : 'RECHAZAR'}?`)) return;
    try {
      await api.patch(`/tools/${id}/status`, { status });
      setPendingTools(prev => prev.filter(t => t.id !== id));
    } catch (e) {
      alert('Error al actualizar estado');
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F0E0] p-6 font-sans selection:bg-black selection:text-[#FFDE00]">
      <div className="mx-auto max-w-6xl">
        
        {/* HEADER */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-4 border-black pb-6">
          <div className="flex items-center gap-4">
             <div className="bg-black p-3 shadow-neo">
                <ShieldAlert className="w-8 h-8 text-[#FFDE00]" strokeWidth={2} />
             </div>
             <div>
                <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-black leading-none">
                  Panel Admin
                </h1>
                <p className="font-bold text-gray-500 uppercase text-xs tracking-widest mt-1">
                  Control de Calidad & Moderación
                </p>
             </div>
          </div>
          
          <Link 
            to="/dashboard" 
            className="group flex items-center gap-2 border-4 border-black bg-white px-4 py-2 text-xs font-black uppercase shadow-neo transition-all hover:bg-black hover:text-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            <ArrowLeft strokeWidth={4} className="h-4 w-4" /> Volver al Dashboard
          </Link>
        </div>

        {/* CONTENEDOR PRINCIPAL */}
        <div className="border-4 border-black bg-white shadow-neo">
          
          {/* Barra de Título de la Sección */}
          <div className="flex items-center justify-between border-b-4 border-black bg-black p-4 text-white">
            <h2 className="flex items-center gap-2 text-xl font-black uppercase">
              <FileCheck className="h-6 w-6" /> Solicitudes Pendientes
            </h2>
            <div className="bg-[#FFDE00] px-3 py-1 text-black font-black border-2 border-white">
              {pendingTools.length}
            </div>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
                <Loader2 className="animate-spin w-12 h-12 mb-4" strokeWidth={2} />
                <p className="font-black text-2xl uppercase">Cargando Datos...</p>
            </div>
          ) : (
            pendingTools.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-center">
                <div className="mb-4 border-4 border-black bg-[#00F0FF] p-6 shadow-neo rotate-2">
                    <Check className="h-12 w-12 text-black" strokeWidth={4} />
                </div>
                <h3 className="text-3xl font-black uppercase">Todo al día</h3>
                <p className="mt-2 font-bold uppercase text-gray-500">No hay herramientas esperando revisión.</p>
              </div>
            ) : (
              <div className="divide-y-4 divide-black">
                {pendingTools.map(tool => (
                  <div key={tool.id} className="flex flex-col gap-6 p-6 transition-colors hover:bg-gray-50 md:flex-row md:justify-between">
                    
                    {/* Información de la Herramienta */}
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-2xl font-black uppercase leading-none">{tool.name}</h3>
                        <span className="border-2 border-black bg-[#F0F0E0] px-2 py-1 text-[10px] font-black uppercase tracking-wider">
                          {tool.category}
                        </span>
                        {tool.type && (
                             <span className={`border-2 border-black px-2 py-1 text-[10px] font-black uppercase tracking-wider 
                                ${tool.type === 'sale' ? 'bg-[#00F0FF]' : 'bg-[#FF90E8]'}`}>
                                {tool.type === 'sale' ? 'Venta' : 'Préstamo'}
                             </span>
                        )}
                      </div>
                      
                      <p className="max-w-2xl text-sm font-bold text-gray-600 border-l-4 border-gray-300 pl-3 italic">
                        "{tool.description}"
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs font-black uppercase text-gray-500">
                        <div className="h-4 w-4 bg-black rounded-full"></div>
                        Propietario: <span className="bg-black text-white px-1">{tool.owner?.name || 'Desconocido'}</span>
                      </div>
                    </div>

                    {/* Botones de Acción */}
                    <div className="flex flex-shrink-0 items-center gap-3 md:flex-col md:justify-center">
                      <button 
                        onClick={() => decideTool(tool.id, 'approved')} 
                        className="group flex w-full items-center justify-center gap-2 border-4 border-black bg-[#00F0FF] px-6 py-3 font-black uppercase text-black shadow-sm transition-all hover:bg-[#4CFFFF] hover:shadow-neo-sm hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-0 active:translate-y-0 active:shadow-none"
                      >
                        <Check strokeWidth={4} className="h-5 w-5" /> Aprobar
                      </button>
                      
                      <button 
                        onClick={() => decideTool(tool.id, 'rejected')} 
                        className="group flex w-full items-center justify-center gap-2 border-4 border-black bg-[#FF4545] px-6 py-3 font-black uppercase text-white shadow-sm transition-all hover:bg-red-600 hover:shadow-neo-sm hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-0 active:translate-y-0 active:shadow-none"
                      >
                        <X strokeWidth={4} className="h-5 w-5" /> Rechazar
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}