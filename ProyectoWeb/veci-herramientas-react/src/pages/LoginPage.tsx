import { ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FF90E8] p-6 font-sans">
      <div className="relative w-full max-w-md bg-white p-8 md:p-12 border-4 border-black shadow-neo">

        <div className="absolute -top-6 -right-6 bg-[#FFDE00] border-4 border-black p-3 shadow-neo-sm transform rotate-3 z-10 hidden sm:block">
          <div className="flex items-center gap-2">
            <ShieldCheck strokeWidth={3} className="w-5 h-5 text-black" />
            <span className="font-black uppercase text-xs tracking-widest text-black">Veci App</span>
          </div>
        </div>

        <div className="mb-10 text-center">
          <h1 className="text-5xl font-black uppercase italic text-black leading-none mb-3">
            Veci-Herramientas
          </h1>
          <div className="inline-block bg-black text-white px-4 py-1 text-sm font-black uppercase tracking-wider">
            INICIAR SESIÓN
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={login}
            className="group w-full flex items-center justify-center gap-3 p-4 border-4 border-black shadow-neo bg-[#23A0FF] text-white font-black uppercase tracking-wider text-lg hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-neo-hover active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
          >
            Iniciar sesión con Keycloak
            <ArrowRight strokeWidth={4} className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="text-center text-xs text-gray-500 mt-6">
            Serás redirigido al portal de autenticación centralizado.<br />
            Si ya iniciaste sesión en otra aplicación del sistema, entrarás automáticamente.
          </p>
        </div>
      </div>
    </div>
  );
}
