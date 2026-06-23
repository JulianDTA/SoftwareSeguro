import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
// ICONOS LUCIDE
import { 
  Send, MessageSquare, User, ArrowLeft, Search, 
  MoreVertical, Phone, DollarSign 
} from 'lucide-react';

export default function ChatPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [contacts, setContacts] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Contexto de venta
  const currentToolId = searchParams.get('toolId');
  const targetUserId = searchParams.get('userId');
  const [currentTool, setCurrentTool] = useState<any>(null);

  useEffect(() => {
    fetchContacts();
    const interval = setInterval(() => {
      fetchContacts();
      if (activeChat) fetchMessages(activeChat.id);
    }, 3000);
    return () => clearInterval(interval);
  }, [activeChat]);

  // Inicialización (si vengo de "Comprar")
  useEffect(() => {
    const init = async () => {
      if (currentToolId) {
        try {
          const res = await api.get(`/tools/${currentToolId}`);
          setCurrentTool(res.data);
        } catch (e) { console.error(e); }
      }
      if (targetUserId) {
        try {
          const res = await api.get(`/users/${targetUserId}`);
          setActiveChat(res.data); // Establecer chat activo temporalmente
        } catch (e) { console.error(e); }
      }
    };
    init();
  }, [currentToolId, targetUserId]);

  useEffect(() => {
    if (activeChat) fetchMessages(activeChat.id);
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchContacts = async () => {
    try {
      const res = await api.get('/messages/contacts');
      setContacts(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchMessages = async (contactId: string) => {
    try {
      const res = await api.get(`/messages/conversation/${contactId}`);
      setMessages(res.data);
    } catch (e) { console.error(e); }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;
    
    try {
      await api.post('/messages', { receiverId: activeChat.id, content: newMessage });
      setMessages([...messages, { 
        id: Date.now(), content: newMessage, senderId: user?.userId, createdAt: new Date().toISOString() 
      }]);
      setNewMessage('');
    } catch (e) { console.error(e); }
  };

  const markAsSold = async () => {
    if (!currentToolId || !window.confirm('¿Confirmas que has vendido esta herramienta?')) return;
    try {
      await api.patch(`/tools/${currentToolId}/sell`);
      await api.post('/messages', { 
        receiverId: activeChat.id, 
        content: `✅ He marcado "${currentTool?.name}" como VENDIDO. ¡Gracias!` 
      });
      alert('Venta registrada');
      navigate('/dashboard');
    } catch (e) { alert('Error al registrar venta'); }
  };

  // --- DISEÑO NEUBRUTALISTA ---
  return (
    <div className="flex h-screen flex-col bg-[#F0F0E0] p-4 font-sans md:p-6">
       
       {/* HEADER */}
       <div className="mb-4 flex items-center justify-between border-b-4 border-black pb-4">
        <div className="flex items-center gap-4">
            <Link 
                to="/dashboard" 
                className="group flex items-center gap-2 border-4 border-black bg-white px-4 py-2 text-xs font-black uppercase hover:bg-black hover:text-white transition-colors shadow-neo hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
            >
             <ArrowLeft strokeWidth={4} className="h-4 w-4" /> VOLVER
            </Link>
            <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-black">
                Mensajes
            </h1>
        </div>
       </div>

       {/* CONTENEDOR PRINCIPAL */}
       <div className="flex flex-1 overflow-hidden border-4 border-black bg-white shadow-neo">
         
         {/* SIDEBAR (Lista de Contactos) */}
         <div className={`flex w-full flex-col border-r-4 border-black bg-gray-50 md:w-80 ${activeChat ? 'hidden md:flex' : 'flex'}`}>
            <div className="border-b-4 border-black bg-[#FFDE00] p-4 font-black uppercase tracking-widest text-sm flex justify-between items-center">
                <span>Contactos ({contacts.length})</span>
                <Search className="w-4 h-4" strokeWidth={3} />
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {contacts.map(contact => (
                <div key={contact.id} onClick={() => setActiveChat(contact)}
                  className={`group relative w-full border-4 border-black p-4 text-left transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo cursor-pointer
                  ${activeChat?.id === contact.id ? 'bg-black text-white' : 'bg-white text-black'}`}>
                  
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 border-2 flex items-center justify-center font-black text-lg
                        ${activeChat?.id === contact.id ? 'bg-white text-black border-white' : 'bg-black text-white border-black'}`}>
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black uppercase truncate">{contact.name}</p>
                      <p className={`text-xs font-bold truncate ${activeChat?.id === contact.id ? 'text-gray-400' : 'text-gray-500'}`}>
                        {contact.lastMessage || '...'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
         </div>

         {/* CHAT AREA */}
         <div className={`relative flex flex-1 flex-col bg-[#E5E5E5] ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
           {activeChat ? (
             <>
               {/* HEADER DEL CHAT ACTIVO */}
               <div className="flex items-center justify-between border-b-4 border-black bg-white p-4 shadow-sm z-10">
                 <div className="flex items-center gap-3">
                    <button onClick={() => setActiveChat(null)} className="border-2 border-black p-1 hover:bg-gray-200 md:hidden">
                        <ArrowLeft className="h-5 w-5" strokeWidth={3} />
                    </button>
                    <div className="h-10 w-10 border-4 border-black bg-[#FF90E8] flex items-center justify-center">
                        <User className="h-5 w-5 text-black" strokeWidth={3} />
                    </div>
                    <h2 className="font-black uppercase text-lg leading-none">{activeChat.name}</h2>
                 </div>

                 <div className="flex items-center gap-2">
                    {/* Botón de Venta (Si soy dueño) */}
                    {currentTool && currentTool.ownerId === user?.userId && (
                        <button onClick={markAsSold} 
                            className="border-4 border-black bg-[#00F0FF] px-4 py-2 text-xs font-black uppercase hover:bg-[#4CFFFF] hover:shadow-neo-sm transition-all flex items-center gap-2">
                            <DollarSign strokeWidth={3} className="w-4 h-4" /> VENDER
                        </button>
                    )}
                    <button className="hidden md:block border-4 border-black bg-white p-2 hover:bg-gray-100">
                        <Phone className="w-5 h-5" strokeWidth={3} />
                    </button>
                 </div>
               </div>

               {/* LISTA DE MENSAJES */}
               <div className="flex-1 space-y-6 overflow-y-auto p-6 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]">
                 {messages.map(msg => {
                    const isMe = msg.senderId === user?.userId;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`relative max-w-[85%] md:max-w-[60%]`}>
                                <div className={`
                                  border-4 border-black p-4 text-sm font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                                  ${isMe ? 'bg-[#23A0FF] text-white' : 'bg-white text-black'}
                                `}>
                                  {msg.content}
                                </div>
                            </div>
                        </div>
                    );
                 })}
                 <div ref={messagesEndRef} />
               </div>

               {/* INPUT AREA */}
               <form onSubmit={sendMessage} className="border-t-4 border-black bg-white p-4 flex gap-3">
                 <button type="button" className="hidden md:block border-4 border-black bg-gray-100 p-3 hover:bg-gray-200 transition-colors">
                    <MoreVertical strokeWidth={3} />
                 </button>
                 
                 <input 
                    type="text" 
                    value={newMessage} 
                    onChange={e => setNewMessage(e.target.value)}
                    className="flex-1 border-4 border-black bg-gray-50 p-3 font-bold uppercase placeholder-gray-400 focus:bg-white focus:outline-none focus:shadow-neo transition-all rounded-none" 
                    placeholder="ESCRIBE AQUÍ..." 
                 />
                 
                 <button type="submit" className="border-4 border-black bg-black p-3 text-white shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none hover:bg-gray-800 transition-all">
                    <Send className="h-6 w-6" strokeWidth={3} />
                 </button>
               </form>
             </>
           ) : (
             <div className="flex flex-1 flex-col items-center justify-center bg-[#F0F0E0] p-8 text-center">
                <div className="mb-6 rotate-3 border-4 border-black bg-[#FFDE00] p-6 shadow-neo">
                    <MessageSquare className="h-16 w-16 text-black" strokeWidth={2} />
                </div>
                <h2 className="text-3xl font-black uppercase">Centro de Mensajes</h2>
                <p className="font-bold uppercase text-gray-500">Selecciona un chat para comenzar.</p>
             </div>
           )}
         </div>
       </div>
    </div>
  );
}