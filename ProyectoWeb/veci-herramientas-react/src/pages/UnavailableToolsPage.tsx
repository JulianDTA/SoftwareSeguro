import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios'; 
// ICONOS LUCIDE (Limpios)
import { 
  ArrowLeft, Archive, User, 
  Ban, CheckCircle2, History 
} from 'lucide-react';

export default function UnavailableToolsPage() {
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Asumiendo que existe este endpoint basado en tu Vue original
    api.get('/tools/unavailable')
       .then(res => setTools(res.data))
       .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F0F0E0] p-6 font-sans selection:bg-black selection:text-[#FFDE00]">
      <div className="mx-auto max-w-6xl">
        
        {/* HEADER DE NAVEGACIÓN */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-4 border-black pb-6">
            <div className="flex items-center gap-4">
                 <div className="bg-black p-3 shadow-neo">
                    <Archive className="w-8 h-8 text-white" strokeWidth={2} />
                 </div>
                 <div>
                    <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-black leading-none">
                      Historial
                    </h1>
                    <p className="font-bold text-gray-500 uppercase text-xs tracking-widest mt-1">
                      Inventario No Disponible
                    </p>
                 </div>
            </div>
            
            <Link 
                to="/dashboard" 
                className="group flex items-center gap-2 border-4 border-black bg-white px-4 py-2 text-xs font-black uppercase shadow-neo transition-all hover:bg-black hover:text-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
                <ArrowLeft strokeWidth={4} className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
                Volver al Panel
            </Link>
        </div>

        {/* CONTENEDOR PRINCIPAL */}
        <div className="border-4 border-black bg-white p-6 md:p-8 shadow-neo">
           
           {/* Barra de Estado */}
           <div className="mb-8 flex flex-wrap gap-4 border-b-4 border-black pb-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase">
                    <div className="h-3 w-3 border-2 border-black bg-[#FF4545]"></div> Vendido
                </div>
                <div className="flex items-center gap-2 text-xs font-black uppercase">
                    <div className="h-3 w-3 border-2 border-black bg-[#FF90E8]"></div> En Préstamo
                </div>
           </div>

           {/* GRID */}
           {loading ? (
             <div className="flex flex-col items-center justify-center py-20 opacity-50">
                 <History className="animate-spin w-12 h-12 mb-4" strokeWidth={2} />
                 <p className="font-black text-2xl uppercase">Consultando Archivo...</p>
             </div>
           ) : tools.length === 0 ? (
             <div className="flex flex-col items-center justify-center border-4 border-black border-dashed bg-gray-50 p-16 text-center">
                 <CheckCircle2 className="mb-4 h-16 w-16 text-gray-400" strokeWidth={2} />
                 <h3 className="text-2xl font-black uppercase text-gray-500">Archivo Vacío</h3>
                 <p className="font-bold uppercase text-gray-400">Todas las herramientas están disponibles actualmente.</p>
             </div>
           ) : (
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tools.map(tool => (
                  <div key={tool.id} className="relative group overflow-hidden border-4 border-black bg-gray-100 p-6 transition-all hover:bg-white hover:shadow-neo">
                    
                    {/* CINTA */}
                    <div className={`absolute -right-12 top-6 w-48 rotate-45 border-y-2 border-black py-1 text-center text-[10px] font-black uppercase tracking-widest text-black shadow-sm z-10
                        ${tool.type === 'sale' ? 'bg-[#FF4545]' : 'bg-[#FF90E8]'}`}>
                        {tool.type === 'sale' ? 'VENDIDO' : 'PRESTADO'}
                    </div>

                    {/* Contenido */}
                    <div className="opacity-60 group-hover:opacity-100 transition-opacity">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center border-4 border-black bg-white">
                            <Ban className="h-6 w-6 text-black" strokeWidth={3} />
                        </div>

                        <h3 className="mb-2 text-xl font-black uppercase leading-none text-gray-800 line-through decoration-4 decoration-black/20">
                            {tool.name}
                        </h3>
                        
                        <p className="mb-4 text-sm font-bold uppercase text-gray-500 line-clamp-2">
                            {tool.description}
                        </p>

                        <div className="flex items-center gap-2 border-t-4 border-black pt-4 text-xs font-black uppercase text-black">
                            <User className="h-4 w-4" />
                            <span>Dueño: {tool.owner?.name || 'DESCONOCIDO'}</span>
                        </div>
                    </div>

                    {/* Patrón de fondo */}
                    <div className="absolute inset-0 pointer-events-none opacity-5 bg-[repeating-linear-gradient(45deg,#000,#000_10px,transparent_10px,transparent_20px)]"></div>
                  </div>
                ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}