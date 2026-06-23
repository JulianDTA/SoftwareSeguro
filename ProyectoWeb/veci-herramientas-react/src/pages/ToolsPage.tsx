import { useState, useEffect, useMemo, type FormEvent } from 'react';
import { useTools, type Tool } from '../context/ToolsContext';
import { useAuth } from '../context/AuthContext';
import { useLoans } from '../context/LoansContext';
import { Link, useNavigate } from 'react-router-dom';
// ICONOS LUCIDE (Limpios)
import { 
  Search, Filter, Plus, Wrench, ArrowLeft, Tag, Calendar, 
  DollarSign, X, AlertCircle, ShoppingBag, 
  Megaphone, PackageOpen, User 
} from 'lucide-react';

export default function ToolsPage() {
  // --- LÓGICA ORIGINAL ---
  // CORRECCIÓN AQUÍ: Quitamos 'successMessage' que no se usaba
  const { tools, fetchTools, addTool, loading, error: toolsError } = useTools();
  const { user } = useAuth();
  const { createLoan } = useLoans();
  const navigate = useNavigate();

  // Estados locales
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('all');

  const [isCreating, setIsCreating] = useState(false);
  const [newTool, setNewTool] = useState({
    name: '',
    description: '',
    category: 'Carpintería',
    type: 'loan' as 'loan' | 'sale',
    price: 0,
  });

  // Estados del Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [loanDates, setLoanDates] = useState({ startDate: '', endDate: '' });
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    fetchTools();
  }, []);

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const query = searchQuery.toLowerCase();
      const toolName = tool.name ? tool.name.toLowerCase() : '';
      const toolDesc = tool.description ? tool.description.toLowerCase() : '';
      
      const matchesText = toolName.includes(query) || toolDesc.includes(query);
      const matchesCategory = filterCategory ? tool.category === filterCategory : true;
      const matchesType = filterType === 'all' ? true : tool.type === filterType;

      return matchesText && matchesCategory && matchesType;
    });
  }, [tools, searchQuery, filterCategory, filterType]);

  // --- HANDLERS ---

  const handleSubmitTool = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTool.name || !newTool.category) return;

    setIsCreating(true);
    const finalPrice = newTool.type === 'sale' ? Number(newTool.price) : 0;

    const success = await addTool({
      ...newTool,
      price: finalPrice,
    });

    if (success) {
      alert('TU HERRAMIENTA HA SIDO ENVIADA PARA REVISIÓN.');
      setNewTool({
        name: '', description: '', category: 'Carpintería', type: 'loan', price: 0,
      });
    }
    setIsCreating(false);
  };

  const handleOpenRequestModal = (tool: Tool) => {
    setSelectedTool(tool);
    setLoanDates({ startDate: '', endDate: '' });
    setShowModal(true);
  };

  const handleRequestLoan = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedTool || !loanDates.startDate || !loanDates.endDate) return;

    setIsRequesting(true);
    const success = await createLoan(selectedTool.id, loanDates.startDate, loanDates.endDate);
    setIsRequesting(false);

    if (success) {
      alert('SOLICITUD ENVIADA CON ÉXITO');
      setShowModal(false);
    } else {
      alert('ERROR AL SOLICITAR PRÉSTAMO');
    }
  };

  const handleBuy = (tool: Tool) => {
    navigate(`/chat?userId=${tool.ownerId}&toolId=${tool.id}`);
  };

  // --- DISEÑO NEUBRUTALISTA ---
  return (
    <div className="min-h-screen bg-[#F0F0E0] p-6 font-sans selection:bg-black selection:text-[#FFDE00]">
      <div className="mx-auto max-w-7xl">
        
        {/* HEADER DE NAVEGACIÓN */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-4 border-black pb-6">
            <div>
                <Link to="/dashboard" className="group inline-flex items-center gap-2 font-black uppercase text-sm hover:underline mb-2">
                    <ArrowLeft strokeWidth={4} className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
                    VOLVER AL PANEL
                </Link>
                <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter text-black leading-none">
                    Catálogo
                </h1>
            </div>
            
            <div className="flex gap-2">
                <div className="bg-black text-white px-4 py-2 font-mono text-xs font-bold uppercase flex items-center gap-2">
                    <PackageOpen strokeWidth={3} className="w-4 h-4" />
                    TOTAL: {filteredTools.length}
                </div>
                {toolsError && (
                    <div className="bg-red-500 text-white border-2 border-black px-4 py-2 font-mono text-xs font-bold uppercase flex items-center gap-2">
                        <AlertCircle strokeWidth={3} className="w-4 h-4" /> ERROR
                    </div>
                )}
            </div>
        </div>

        {/* --- FORMULARIO --- */}
        <div className="mb-12 border-4 border-black bg-[#FFDE00] p-6 md:p-8 shadow-neo relative group transition-all hover:shadow-neo-hover">
            <div className="absolute -top-4 left-4 sm:left-8 bg-black text-white px-4 py-1 font-black uppercase text-sm transform -rotate-1 group-hover:rotate-0 transition-transform z-10 flex items-center gap-2">
                <Megaphone strokeWidth={3} className="w-4 h-4" />
                Nueva Publicación
            </div>
            
            <form onSubmit={handleSubmitTool} className="grid gap-6 md:grid-cols-2 lg:grid-cols-12 mt-4">
                <div className="lg:col-span-4">
                    <label className="block text-xs font-black uppercase mb-2 tracking-widest">Nombre del Objeto</label>
                    <div className="relative">
                        <input type="text" required value={newTool.name} onChange={e => setNewTool({...newTool, name: e.target.value})} 
                            className="w-full p-3 pl-10 border-4 border-black rounded-none focus:shadow-neo focus:outline-none transition-all font-bold placeholder-gray-500 bg-white" 
                            placeholder="EJ. TALADRO MARTILLO" />
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" strokeWidth={3} />
                    </div>
                </div>
                
                <div className="lg:col-span-3">
                    <label className="block text-xs font-black uppercase mb-2 tracking-widest">Categoría</label>
                    <div className="relative">
                        <select value={newTool.category} onChange={e => setNewTool({...newTool, category: e.target.value})}
                            className="w-full p-3 border-4 border-black rounded-none appearance-none bg-white font-bold cursor-pointer hover:bg-gray-50 focus:shadow-neo focus:outline-none">
                            <option>Carpintería</option><option>Jardinería</option><option>Cocina</option><option>Camping</option><option>Electrónica</option><option>Otro</option>
                        </select>
                        <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" strokeWidth={3} />
                    </div>
                </div>

                <div className="lg:col-span-3">
                    <label className="block text-xs font-black uppercase mb-2 tracking-widest">Tipo</label>
                    <div className="relative">
                        <select value={newTool.type} onChange={e => setNewTool({...newTool, type: e.target.value as any})}
                            className="w-full p-3 border-4 border-black rounded-none appearance-none bg-white font-bold cursor-pointer hover:bg-gray-50 focus:shadow-neo focus:outline-none">
                            <option value="loan">PRÉSTAMO</option>
                            <option value="sale">VENTA</option>
                        </select>
                        <ShoppingBag className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" strokeWidth={3} />
                    </div>
                </div>

                <div className="lg:col-span-2">
                     {newTool.type === 'sale' ? (
                        <div className="w-full animate-in fade-in zoom-in duration-200">
                            <label className="block text-xs font-black uppercase mb-2 tracking-widest">Precio ($)</label>
                            <input type="number" min="0" value={newTool.price} onChange={e => setNewTool({...newTool, price: Number(e.target.value)})}
                                className="w-full p-3 border-4 border-black rounded-none focus:shadow-neo focus:outline-none font-bold bg-white text-right" />
                        </div>
                    ) : (
                        <div className="w-full opacity-50 cursor-not-allowed">
                             <label className="block text-xs font-black uppercase mb-2 tracking-widest">Precio</label>
                             <input type="text" disabled value="GRATIS" 
                                className="w-full p-3 border-4 border-black rounded-none bg-gray-200 font-bold text-center text-gray-500" />
                        </div>
                    )}
                </div>

                <div className="lg:col-span-12">
                    <label className="block text-xs font-black uppercase mb-2 tracking-widest">Descripción</label>
                    <textarea value={newTool.description} onChange={e => setNewTool({...newTool, description: e.target.value})}
                        className="w-full p-3 border-4 border-black rounded-none min-h-[80px] focus:shadow-neo focus:outline-none font-bold placeholder-gray-500 bg-white resize-none" 
                        rows={2} placeholder="DETALLES TÉCNICOS, ESTADO, ETC." />
                </div>

                <div className="lg:col-span-12 flex justify-end">
                    <button type="submit" disabled={isCreating} 
                        className="w-full md:w-auto bg-black text-white px-8 py-4 font-black uppercase tracking-wider hover:bg-gray-800 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[6px_6px_0px_0px_#ffffff] transition-all disabled:opacity-70 flex items-center justify-center gap-2">
                        {isCreating ? <AlertCircle className="animate-spin" /> : <Plus strokeWidth={4} />}
                        {isCreating ? 'PROCESANDO...' : 'PUBLICAR AHORA'}
                    </button>
                </div>
            </form>
        </div>

        {/* --- BARRA DE CONTROL --- */}
        <div className="sticky top-4 z-30 mb-8 bg-[#F0F0E0]/95 backdrop-blur-md p-2 border-b-4 border-black md:border-none">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <Search strokeWidth={4} className="w-6 h-6 text-black" />
                    </div>
                    <input type="text" placeholder="BUSCAR..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        className="w-full p-4 pl-14 border-4 border-black rounded-none bg-white font-black placeholder-gray-400 focus:outline-none focus:shadow-neo transition-all uppercase" />
                </div>
                
                <div className="flex gap-2">
                    <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                        className="p-4 border-4 border-black rounded-none bg-white font-bold uppercase cursor-pointer hover:bg-gray-50 focus:shadow-neo focus:outline-none w-1/2 md:w-auto">
                        <option value="">TODAS LAS CAT.</option><option>Carpintería</option><option>Jardinería</option><option>Cocina</option><option>Camping</option><option>Electrónica</option>
                    </select>

                    <select value={filterType} onChange={e => setFilterType(e.target.value)}
                        className={`p-4 border-4 border-black rounded-none font-black uppercase cursor-pointer focus:shadow-neo focus:outline-none w-1/2 md:w-auto
                        ${filterType === 'all' ? 'bg-white text-black' : filterType === 'loan' ? 'bg-[#FF90E8] text-black' : 'bg-[#00F0FF] text-black'}`}>
                        <option value="all">TODO</option><option value="loan">PRÉSTAMOS</option><option value="sale">VENTAS</option>
                    </select>
                </div>
            </div>
        </div>

        {/* --- GRID DE RESULTADOS --- */}
        <div className="min-h-[300px]">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 opacity-50">
                 <AlertCircle className="animate-spin w-12 h-12 mb-4" strokeWidth={2} />
                 <p className="font-black text-2xl uppercase">CARGANDO INVENTARIO...</p>
             </div>
          ) : filteredTools.length === 0 ? (
             <div className="border-4 border-black border-dashed p-12 text-center opacity-50 bg-white">
                 <Wrench className="w-16 h-16 mx-auto mb-4" strokeWidth={2} />
                 <h2 className="text-2xl font-black uppercase">Sin resultados</h2>
                 <p className="font-bold uppercase">Intenta ajustar los filtros de búsqueda</p>
             </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredTools.map((tool) => (
                <div key={tool.id} className="bg-white border-4 border-black shadow-neo flex flex-col justify-between group h-full hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-neo-hover transition-all duration-200">
                  
                  {/* CUERPO DE TARJETA */}
                  <div className="p-6 relative flex-1">
                    <div className={`absolute -top-4 -right-4 border-4 border-black px-3 py-1 font-black text-xs uppercase shadow-sm transform group-hover:rotate-6 transition-transform z-10
                        ${tool.type === 'sale' ? 'bg-[#00F0FF]' : 'bg-[#FF90E8]'}`}>
                        {tool.type === 'sale' ? `VENTA $${tool.price}` : 'PRÉSTAMO'}
                    </div>

                    <div className="mb-4 w-14 h-14 bg-black flex items-center justify-center">
                        <Wrench className="text-white w-7 h-7" strokeWidth={3} />
                    </div>
                    
                    <h3 className="text-2xl font-black uppercase leading-none mb-3 break-words">
                        {tool.name}
                    </h3>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className="bg-[#F0F0E0] px-2 py-1 text-xs font-bold uppercase border-2 border-black">
                            {tool.category}
                        </span>
                    </div>
                    
                    <p className="text-sm font-bold text-gray-500 line-clamp-3 leading-relaxed border-t-2 border-black pt-3 border-dashed">
                        {tool.description}
                    </p>
                  </div>

                  {/* FOOTER */}
                  <div className="p-4 bg-gray-50 border-t-4 border-black flex flex-col gap-3">
                    <div className="flex justify-between items-center text-xs font-black uppercase text-gray-500">
                         <span className="flex items-center gap-1"><User className="w-3 h-3" /> Dueño: {tool.owner?.name || 'DESCONOCIDO'}</span>
                    </div>

                    {user?.userId !== tool.ownerId ? (
                        tool.type === 'sale' ? (
                          <button onClick={() => handleBuy(tool)} 
                            className="w-full bg-[#00F0FF] border-2 border-black py-3 font-black uppercase hover:bg-[#4CFFFF] hover:shadow-neo-sm transition-all flex items-center justify-center gap-2">
                            <DollarSign strokeWidth={4} className="w-4 h-4" /> COMPRAR
                          </button>
                        ) : (
                          <button onClick={() => handleOpenRequestModal(tool)} 
                            className="w-full bg-[#FFDE00] border-2 border-black py-3 font-black uppercase hover:bg-[#FFE55C] hover:shadow-neo-sm transition-all flex items-center justify-center gap-2">
                            <Calendar strokeWidth={4} className="w-4 h-4" /> SOLICITAR
                          </button>
                        )
                    ) : (
                        <div className="w-full bg-gray-200 border-2 border-gray-400 border-dashed py-3 font-bold uppercase text-center text-gray-400 cursor-not-allowed">
                            TU ARTÍCULO
                        </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL --- */}
      {showModal && selectedTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
          <div className="w-full max-w-lg bg-white border-4 border-black shadow-[10px_10px_0px_0px_#ffffff] p-8 relative">
            <button onClick={() => setShowModal(false)} 
                className="absolute top-4 right-4 bg-red-500 border-2 border-black text-white hover:bg-red-600 hover:rotate-90 transition-all p-1">
                <X strokeWidth={4} className="w-6 h-6" />
            </button>

            <h2 className="text-4xl font-black uppercase mb-2 italic">Solicitar</h2>
            <div className="mb-8">
                <span className="font-bold text-sm uppercase text-gray-500">Herramienta:</span>
                <div className="text-2xl font-black bg-[#FFDE00] text-black inline-block px-3 py-1 border-2 border-black transform -rotate-1 mt-1">
                    {selectedTool.name}
                </div>
            </div>
            
            <form onSubmit={handleRequestLoan} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black uppercase mb-2">Desde</label>
                  <input type="date" required value={loanDates.startDate} onChange={e => setLoanDates({...loanDates, startDate: e.target.value})} 
                    className="w-full p-3 border-4 border-black rounded-none focus:shadow-neo focus:outline-none font-bold bg-gray-50 uppercase" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase mb-2">Hasta</label>
                  <input type="date" required value={loanDates.endDate} onChange={e => setLoanDates({...loanDates, endDate: e.target.value})} 
                    className="w-full p-3 border-4 border-black rounded-none focus:shadow-neo focus:outline-none font-bold bg-gray-50 uppercase" />
                </div>
              </div>
              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 border-4 border-black font-black uppercase hover:bg-gray-100 transition-colors">
                    CANCELAR
                </button>
                <button type="submit" disabled={isRequesting} className="flex-1 py-4 bg-black text-white border-4 border-black font-black uppercase hover:bg-gray-800 hover:shadow-neo-sm transition-all disabled:opacity-70">
                    {isRequesting ? 'ENVIANDO...' : 'CONFIRMAR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}