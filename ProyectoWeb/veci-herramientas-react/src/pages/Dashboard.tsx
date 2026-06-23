import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
// Importamos iconos profesionales
import { 
  Bell, 
  MessageSquare, 
  ShieldAlert, 
  Wrench, 
  Handshake, 
  User, 
  History, 
  LogOut,
  LayoutGrid
} from 'lucide-react';

export default function Dashboard() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F0F0E0] p-6 md:p-12 font-sans selection:bg-black selection:text-white">
      <div className="mx-auto max-w-7xl">
        
        {/* --- HEADER --- */}
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b-4 border-black pb-8">
          
          {/* Bienvenida */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <LayoutGrid className="w-8 h-8 md:w-10 md:h-10 text-black" strokeWidth={3} />
              <span className="font-bold text-sm bg-black text-white px-2 py-1 uppercase tracking-widest">Dashboard</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase italic leading-none text-black">
              Hola, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">
                {user?.name?.split(' ')[0] || 'Vecino'}
              </span>
            </h1>
          </div>

          {/* Botones de Acción Rápida */}
          <div className="flex flex-wrap gap-4">
            <Link 
              to="/notifications" 
              className="btn-neo bg-[#FFDE00] hover:bg-[#FFE55C]"
            >
              <Bell strokeWidth={3} className="w-5 h-5" />
              <span className="hidden sm:inline">Alertas</span>
            </Link>

            <Link 
              to="/chat" 
              className="btn-neo bg-[#FF90E8] hover:bg-[#FFAFF0]"
            >
              <MessageSquare strokeWidth={3} className="w-5 h-5" />
              <span className="hidden sm:inline">Chat</span>
            </Link>

            {isAdmin && (
              <Link 
                to="/admin" 
                className="btn-neo bg-[#7e22ce] text-white hover:bg-[#9642e0]"
              >
                <ShieldAlert strokeWidth={3} className="w-5 h-5" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}
          </div>
        </div>

        {/* --- GRID DE NAVEGACIÓN --- */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          
          {/* TARJETA 1: CATÁLOGO */}
          <Link 
            to="/tools" 
            className="group relative overflow-hidden bg-[#23A0FF] p-10 card-neo hover:bg-[#40AFFF]"
          >
            <div className="relative z-10 flex flex-col items-start h-full justify-between gap-8">
              <div className="w-16 h-16 bg-white border-4 border-black flex items-center justify-center shadow-neo-sm group-hover:rotate-12 transition-transform">
                <Wrench strokeWidth={3} className="w-8 h-8 text-black" />
              </div>
              <div>
                <h2 className="text-3xl font-black uppercase text-white drop-shadow-[3px_3px_0_rgba(0,0,0,1)] mb-2">
                  Catálogo
                </h2>
                <p className="font-bold text-black bg-white/90 px-2 py-1 inline-block text-sm border-2 border-black">
                  EXPLORAR HERRAMIENTAS
                </p>
              </div>
            </div>
            {/* Patrón de fondo */}
            <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-white/20 rounded-full border-4 border-black opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </Link>

          {/* TARJETA 2: MIS PRÉSTAMOS */}
          <Link 
            to="/my-loans" 
            className="group relative overflow-hidden bg-[#00F0FF] p-10 card-neo hover:bg-[#4CFFFF]"
          >
            <div className="relative z-10 flex flex-col items-start h-full justify-between gap-8">
              <div className="w-16 h-16 bg-white border-4 border-black flex items-center justify-center shadow-neo-sm group-hover:-rotate-12 transition-transform">
                <Handshake strokeWidth={3} className="w-8 h-8 text-black" />
              </div>
              <div>
                <h2 className="text-3xl font-black uppercase text-black mb-2">
                  Préstamos
                </h2>
                <p className="font-bold text-white bg-black px-2 py-1 inline-block text-sm">
                  GESTIONAR SOLICITUDES
                </p>
              </div>
            </div>
          </Link>

          {/* TARJETA 3: MI PERFIL */}
          {user && (
            <Link 
              to={`/user/${user.userId}`} 
              className="group relative overflow-hidden bg-[#FFDE00] p-10 card-neo hover:bg-[#FFE55C]"
            >
              <div className="relative z-10 flex flex-col items-start h-full justify-between gap-8">
                <div className="w-16 h-16 bg-white border-4 border-black flex items-center justify-center shadow-neo-sm group-hover:scale-110 transition-transform">
                  <User strokeWidth={3} className="w-8 h-8 text-black" />
                </div>
                <div>
                  <h2 className="text-3xl font-black uppercase text-black mb-2">
                    Mi Perfil
                  </h2>
                  <p className="font-bold text-black border-b-4 border-black inline-block text-sm pb-1">
                    VER REPUTACIÓN
                  </p>
                </div>
              </div>
            </Link>
          )}

          {/* TARJETA 4: HISTORIAL (Ancho completo) */}
          <Link 
            to="/unavailable" 
            className="sm:col-span-2 lg:col-span-3 card-neo bg-white p-8 flex flex-col md:flex-row items-center justify-between gap-6 group hover:bg-gray-50"
          >
            <div className="flex items-center gap-6">
              <div className="bg-gray-200 p-4 border-4 border-black shadow-neo-sm group-hover:bg-gray-300 transition-colors">
                <History strokeWidth={3} className="w-10 h-10 text-gray-700" />
              </div>
              <div className="text-left">
                <h2 className="text-2xl font-black uppercase text-gray-800">
                  Historial / No Disponibles
                </h2>
                <p className="font-bold text-gray-500 text-sm mt-1">
                  CONSULTA EL REGISTRO DE ITEMS VENDIDOS O PRESTADOS
                </p>
              </div>
            </div>
            
            <div className="bg-black text-white px-6 py-2 font-black uppercase text-sm border-2 border-transparent group-hover:border-black group-hover:bg-transparent group-hover:text-black transition-all">
              Ver Historial &rarr;
            </div>
          </Link>

        </div>

        {/* --- LOGOUT --- */}
        <div className="mt-16 text-center">
          <button 
            onClick={handleLogout} 
            className="btn-neo bg-[#FF4545] text-white hover:bg-[#FF6B6B] w-full md:w-auto"
          >
            <LogOut strokeWidth={3} className="w-5 h-5" />
            CERRAR SESIÓN
          </button>
        </div>

      </div>
    </div>
  );
}