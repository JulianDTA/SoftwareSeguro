import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
// ICONOS LUCIDE (Limpios: Se eliminó 'User')
import { 
  ArrowLeft, Star, MessageSquare, ShieldCheck, 
  MapPin, Wrench, Quote 
} from 'lucide-react';

export default function UserProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [uRes, rRes] = await Promise.all([
          api.get(`/users/${id}`),
          api.get(`/reviews/user/${id}`)
        ]);
        setProfileUser(uRes.data);
        setReviews(rRes.data);
      } catch (e) {
        alert('Usuario no encontrado');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const rating = useMemo(() => {
    if (!reviews.length) return 0;
    return (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);
  }, [reviews]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#F0F0E0] p-6 text-center">
        <div className="border-4 border-black bg-[#FFDE00] p-6 shadow-neo animate-pulse">
            <h2 className="text-2xl font-black uppercase">Cargando Expediente...</h2>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F0F0E0] p-6 font-sans selection:bg-black selection:text-[#FFDE00]">
      <div className="mx-auto max-w-6xl">
        
        {/* BOTÓN VOLVER */}
        <button 
            onClick={() => navigate(-1)} 
            className="group mb-8 inline-flex items-center gap-2 border-4 border-black bg-white px-4 py-2 text-xs font-black uppercase shadow-neo transition-all hover:bg-black hover:text-white hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-hover"
        >
            <ArrowLeft strokeWidth={4} className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
            Volver
        </button>
        
        {/* --- TARJETA DE PERFIL (EXPEDIENTE) --- */}
        <div className="mb-12 border-4 border-black bg-white shadow-neo">
            
            {/* Header del Expediente */}
            <div className="flex flex-col md:flex-row border-b-4 border-black">
                
                {/* Avatar / Foto */}
                <div className="flex w-full md:w-64 items-center justify-center bg-[#23A0FF] p-8 border-b-4 md:border-b-0 md:border-r-4 border-black relative overflow-hidden">
                     {/* Patrón de fondo */}
                     <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]"></div>
                     
                     <div className="h-32 w-32 border-4 border-black bg-white flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10">
                        <span className="text-6xl font-black text-black">
                            {profileUser.name.charAt(0).toUpperCase()}
                        </span>
                     </div>
                </div>

                {/* Info Principal */}
                <div className="flex-1 p-6 md:p-8 flex flex-col justify-center bg-white relative">
                    <div className="absolute top-4 right-4 bg-[#FFDE00] border-2 border-black px-2 py-1 text-[10px] font-black uppercase">
                        ID: {profileUser.id.slice(0,8)}
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black uppercase leading-none mb-2">{profileUser.name}</h1>
                    <div className="flex flex-wrap gap-4 items-center">
                        <span className="flex items-center gap-1 text-sm font-bold uppercase text-gray-500">
                            <ShieldCheck className="w-4 h-4" /> Miembro Verificado
                        </span>
                        <span className="flex items-center gap-1 text-sm font-bold uppercase text-gray-500">
                            <MapPin className="w-4 h-4" /> Vecindario Central
                        </span>
                    </div>

                    {/* Stats Bar */}
                    <div className="mt-6 flex items-center gap-6 border-t-4 border-black pt-6">
                        <div>
                            <span className="block text-[10px] font-black uppercase text-gray-400">Reputación</span>
                            <div className="flex items-center gap-2">
                                <span className="text-3xl font-black text-black">{rating}</span>
                                <div className="flex text-[#FFDE00]">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-5 h-5 ${i < Math.round(Number(rating)) ? 'fill-current text-black' : 'text-gray-300'}`} strokeWidth={2} />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="h-10 w-1 bg-black/10"></div>
                        <div>
                             <span className="block text-[10px] font-black uppercase text-gray-400">Reseñas</span>
                             <span className="text-3xl font-black text-black">{reviews.length}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* --- GRID DE CONTENIDO --- */}
        <div className="grid gap-8 md:grid-cols-2">
          
          {/* COLUMNA 1: RESEÑAS */}
          <div>
            <div className="mb-4 flex items-center gap-2 border-b-4 border-black pb-2">
                <MessageSquare className="w-6 h-6" strokeWidth={3} />
                <h2 className="text-2xl font-black uppercase italic">Lo que dicen sus vecinos</h2>
            </div>
            
            {reviews.length === 0 ? (
                <div className="border-4 border-black border-dashed bg-white p-8 text-center opacity-50">
                    <p className="font-bold uppercase text-gray-500">Sin reseñas registradas aún.</p>
                </div>
            ) : (
              <div className="space-y-6">
                {reviews.map(r => (
                  <div key={r.id} className="relative border-4 border-black bg-white p-6 shadow-neo">
                    <Quote className="absolute top-4 right-4 w-8 h-8 text-gray-200 rotate-180" fill="currentColor" />
                    
                    <div className="flex justify-between items-start mb-4 border-b-2 border-gray-100 pb-2">
                      <span className="font-black uppercase text-sm bg-black text-white px-2 py-1">
                        {r.reviewer?.name || 'ANÓNIMO'}
                      </span>
                      <div className="flex text-[#FFDE00]">
                        {'★'.repeat(r.rating).split('').map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current text-black" />
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-lg font-bold italic text-gray-700 leading-relaxed">
                      "{r.comment}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* COLUMNA 2: CATÁLOGO */}
          <div>
            <div className="mb-4 flex items-center gap-2 border-b-4 border-black pb-2">
                <Wrench className="w-6 h-6" strokeWidth={3} />
                <h2 className="text-2xl font-black uppercase italic">Catálogo Personal</h2>
            </div>
            
            {(!profileUser.tools || profileUser.tools.length === 0) ? (
                 <div className="border-4 border-black border-dashed bg-white p-8 text-center opacity-50">
                    <p className="font-bold uppercase text-gray-500">Este usuario no tiene herramientas.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                {profileUser.tools.map((t: any) => (
                    <div key={t.id} className="group flex items-center justify-between border-4 border-black bg-white p-4 shadow-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo transition-all">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-black flex items-center justify-center">
                                <Wrench className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-black uppercase text-sm md:text-base leading-none group-hover:underline">{t.name}</h3>
                                <span className="text-[10px] font-bold uppercase text-gray-400">ID: {t.id.slice(0,4)}</span>
                            </div>
                        </div>
                        <span className="border-2 border-black bg-[#F0F0E0] px-2 py-1 text-[10px] font-black uppercase tracking-wider">
                            {t.category}
                        </span>
                    </div>
                ))}
                </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}