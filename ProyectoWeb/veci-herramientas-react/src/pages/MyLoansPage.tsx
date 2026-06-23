import { useState } from 'react';
import { useLoans } from '../context/LoansContext';
import { Link } from 'react-router-dom';
// Importamos solo los iconos necesarios para el diseño visual
import { 
  ArrowLeft, ArrowRightLeft, ShieldAlert, Calendar, User, 
  Clock, CheckCircle2, XCircle, PackageOpen, PackageCheck, Truck 
} from 'lucide-react';

export default function MyLoansPage() {
  const { myRequests, incomingRequests, loading, updateLoanStatus } = useLoans();
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent');

  // Componente visual para las etiquetas de estado
  const StatusBadge = ({ status }: { status: string }) => {
    // Mapeo de estilos neubrutalistas
    const styles: Record<string, string> = {
      pending: 'bg-[#FFDE00] text-black border-black',
      approved: 'bg-[#23A0FF] text-white border-black',
      active: 'bg-[#00F0FF] text-black border-black',
      rejected: 'bg-[#FF4545] text-white border-black',
      returned: 'bg-black text-white border-black',
    };
    
    // Mapeo de textos
    const labels: Record<string, string> = {
      pending: 'PENDIENTE',
      approved: 'APROBADO',
      active: 'EN USO',
      rejected: 'RECHAZADO',
      returned: 'DEVUELTO',
    };

    // Mapeo de iconos visuales
    const icons: Record<string, any> = {
      pending: <Clock className="w-3 h-3" strokeWidth={3} />,
      approved: <CheckCircle2 className="w-3 h-3" strokeWidth={3} />,
      active: <Truck className="w-3 h-3" strokeWidth={3} />,
      rejected: <XCircle className="w-3 h-3" strokeWidth={3} />,
      returned: <PackageCheck className="w-3 h-3" strokeWidth={3} />,
    };

    return (
      <span className={`flex items-center gap-1 px-2 py-1 text-xs font-black uppercase border-2 ${styles[status] || 'bg-gray-100 border-gray-400'}`}>
        {icons[status]}
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#F0F0E0] p-6 font-sans">
      <div className="mx-auto max-w-5xl">
        
        {/* HEADER DE NAVEGACIÓN */}
        <div className="mb-8 border-b-4 border-black pb-4">
          <Link
            to="/dashboard"
            className="group mb-2 inline-flex items-center gap-2 text-sm font-black uppercase tracking-wider text-black hover:underline"
          >
            <ArrowLeft strokeWidth={4} className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
            Volver al Dashboard
          </Link>

          <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-black">
            Mis Préstamos
          </h1>
        </div>

        {/* TABS DE NAVEGACIÓN (Estilo Bloque) */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row">
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex-1 border-4 border-black p-4 text-center font-black uppercase tracking-wider transition-all
              ${activeTab === 'sent' 
                ? 'bg-black text-white shadow-neo translate-x-[-2px] translate-y-[-2px]' 
                : 'bg-white text-black hover:bg-gray-50'
              }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ArrowRightLeft strokeWidth={3} className="h-5 w-5" />
              Solicitudes Enviadas
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('received')}
            className={`flex-1 border-4 border-black p-4 text-center font-black uppercase tracking-wider transition-all
              ${activeTab === 'received' 
                ? 'bg-black text-white shadow-neo translate-x-[-2px] translate-y-[-2px]' 
                : 'bg-white text-black hover:bg-gray-50'
              }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ShieldAlert strokeWidth={3} className="h-5 w-5" />
              Solicitudes Recibidas
            </div>
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <Clock className="mb-4 h-12 w-12 animate-spin" strokeWidth={2} />
            <p className="font-black uppercase text-xl">Cargando préstamos...</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* --- TAB 1: SOLICITUDES ENVIADAS --- */}
            {activeTab === 'sent' ? (
              myRequests.length === 0 ? (
                <div className="border-4 border-dashed border-black bg-white p-12 text-center opacity-50">
                  <PackageOpen className="mx-auto mb-4 h-16 w-16" strokeWidth={2} />
                  <p className="font-bold uppercase text-gray-500">No has solicitado herramientas aún.</p>
                </div>
              ) : (
                myRequests.map((loan) => (
                  <div key={loan.id} className="group relative flex flex-col justify-between gap-4 border-4 border-black bg-white p-6 shadow-neo hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-hover transition-all md:flex-row md:items-center">
                    <div>
                      <h3 className="mb-2 text-2xl font-black uppercase leading-none text-black">
                        {loan.tool?.name || 'HERRAMIENTA'}
                      </h3>
                      <div className="flex flex-wrap gap-3 text-sm font-bold text-gray-600">
                        <span className="flex items-center gap-1 border-2 border-transparent bg-gray-100 px-2 py-0.5 group-hover:border-black transition-colors">
                          <Calendar className="h-4 w-4" />
                          {new Date(loan.startDate).toLocaleDateString()} - {new Date(loan.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={loan.status} />
                  </div>
                ))
              )
            ) : (
              
              // --- TAB 2: SOLICITUDES RECIBIDAS ---
              incomingRequests.length === 0 ? (
                <div className="border-4 border-dashed border-black bg-white p-12 text-center opacity-50">
                   <ShieldAlert className="mx-auto mb-4 h-16 w-16" strokeWidth={2} />
                   <p className="font-bold uppercase text-gray-500">No tienes solicitudes pendientes.</p>
                </div>
              ) : (
                incomingRequests.map((loan) => (
                  <div key={loan.id} className="border-4 border-black bg-white shadow-neo transition-all hover:shadow-neo-hover">
                    
                    {/* Header Tarjeta */}
                    <div className="flex items-center justify-between border-b-4 border-black bg-gray-100 p-4">
                      <div className="flex flex-col">
                        <h3 className="text-xl font-black uppercase leading-tight">{loan.tool?.name}</h3>
                        <span className="flex items-center gap-1 text-xs font-bold uppercase text-gray-500">
                          <User className="h-3 w-3" /> Solicitante: {loan.requester?.name || 'Usuario'}
                        </span>
                      </div>
                      <StatusBadge status={loan.status} />
                    </div>

                    {/* Cuerpo Tarjeta */}
                    <div className="p-6">
                      <div className="mb-6 flex items-center gap-3">
                        <div className="border-2 border-black bg-[#FFDE00] p-2 shadow-sm">
                           <Calendar className="h-6 w-6 text-black" strokeWidth={3} />
                        </div>
                        <div className="text-sm font-bold uppercase">
                           <p>DEL: {new Date(loan.startDate).toLocaleDateString()}</p>
                           <p>AL: {new Date(loan.endDate).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {/* Botones de Acción */}
                      {loan.status === 'pending' && (
                        <div className="flex gap-4 border-t-4 border-black pt-6">
                          <button
                            onClick={() => updateLoanStatus(loan.id, 'rejected')}
                            className="flex-1 border-4 border-black py-3 font-black uppercase text-red-600 hover:bg-red-50 hover:shadow-neo-sm transition-all flex items-center justify-center gap-2"
                          >
                            <XCircle strokeWidth={3} className="h-5 w-5" /> Rechazar
                          </button>
                          <button
                            onClick={() => updateLoanStatus(loan.id, 'approved')}
                            className="flex-1 border-4 border-black bg-[#23A0FF] py-3 font-black uppercase text-white hover:bg-[#40AFFF] hover:shadow-neo-sm transition-all flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 strokeWidth={3} className="h-5 w-5" /> Aprobar
                          </button>
                        </div>
                      )}

                      {loan.status === 'approved' && (
                        <div className="mt-2 border-t-4 border-black pt-6">
                          <button
                            onClick={() => updateLoanStatus(loan.id, 'active')}
                            className="w-full border-4 border-black bg-[#00F0FF] py-4 font-black uppercase text-black hover:bg-[#4CFFFF] hover:shadow-neo-sm transition-all flex items-center justify-center gap-2"
                          >
                            <Truck strokeWidth={3} className="h-5 w-5" /> Entregar Herramienta (Activar)
                          </button>
                        </div>
                      )}

                      {loan.status === 'active' && (
                        <div className="mt-2 border-t-4 border-black pt-6">
                          <button
                            onClick={() => updateLoanStatus(loan.id, 'returned')}
                            className="w-full border-4 border-black bg-black py-4 font-black uppercase text-white hover:bg-gray-800 hover:shadow-neo-sm transition-all flex items-center justify-center gap-2"
                          >
                            <PackageCheck strokeWidth={3} className="h-5 w-5" /> Confirmar Devolución
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}