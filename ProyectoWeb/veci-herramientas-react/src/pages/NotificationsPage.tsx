import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
// ICONOS LUCIDE (Estilo Industrial)
import { 
  ArrowLeft, Bell, Mail, MailOpen, Clock, 
  CheckCircle2, AlertOctagon 
} from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    api.get('/notifications').then(res => setNotifications(res.data)).catch(console.error);
  }, []);

  const markRead = async (n: any) => {
    if (n.read) return;
    try {
      await api.patch(`/notifications/${n.id}/read`);
      setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
    } catch (e) { console.error(e); }
  };

  return (
    <div className="min-h-screen bg-[#F0F0E0] p-6 font-sans selection:bg-black selection:text-[#FFDE00]">
      <div className="mx-auto max-w-4xl">
        
        {/* HEADER DE NAVEGACIÓN */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-4 border-black pb-6">
            <div className="flex items-center gap-4">
                 <div className="bg-black p-3 shadow-neo">
                    <Bell className="w-8 h-8 text-[#FFDE00]" strokeWidth={2} />
                 </div>
                 <div>
                    <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-black leading-none">
                      Alertas
                    </h1>
                    <p className="font-bold text-gray-500 uppercase text-xs tracking-widest mt-1">
                      Centro de Notificaciones
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

        {/* CONTENEDOR DE LISTA */}
        <div className="space-y-4">
          
          {notifications.length === 0 ? (
            // ESTADO VACÍO
            <div className="flex flex-col items-center justify-center border-4 border-black border-dashed bg-white/50 p-16 text-center opacity-75">
                <AlertOctagon className="mb-4 h-16 w-16 text-gray-400" strokeWidth={2} />
                <h3 className="text-2xl font-black uppercase text-gray-500">Sin Novedades</h3>
                <p className="font-bold uppercase text-gray-400">Estás al día con tus notificaciones.</p>
            </div>
          ) : (
            // LISTA DE NOTIFICACIONES
            notifications.map(n => (
              <div 
                key={n.id} 
                onClick={() => markRead(n)} 
                className={`group relative flex cursor-pointer flex-col gap-4 border-4 border-black p-6 transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo
                  ${!n.read 
                    ? 'bg-[#FFDE00] shadow-sm z-10' // No leída: Amarillo Alerta
                    : 'bg-white text-gray-600'      // Leída: Blanca
                  }`}
              >
                {/* Indicador visual de estado "NUEVO" */}
                {!n.read && (
                    <div className="absolute -right-2 -top-2 rotate-6 border-2 border-black bg-[#FF4545] px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-sm">
                        NUEVA
                    </div>
                )}

                <div className="flex items-start gap-4">
                    {/* Icono de Estado */}
                    <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center border-4 border-black 
                        ${!n.read ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
                        {n.read ? <MailOpen strokeWidth={3} /> : <Mail strokeWidth={3} />}
                    </div>

                    <div className="flex-1">
                        {/* Mensaje */}
                        <p className={`text-lg font-bold uppercase leading-tight ${!n.read ? 'text-black' : 'text-gray-500'}`}>
                            {n.message}
                        </p>
                        
                        {/* Footer de la tarjeta: Fecha y Estado */}
                        <div className="mt-3 flex items-center justify-between border-t-2 border-black/10 pt-2">
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider opacity-70">
                                <Clock className="h-3 w-3" />
                                {new Date(n.createdAt).toLocaleString()}
                            </div>
                            
                            {n.read && (
                                <div className="flex items-center gap-1 text-xs font-black uppercase text-green-600">
                                    <CheckCircle2 className="h-3 w-3" /> Leído
                                </div>
                            )}
                        </div>
                    </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}