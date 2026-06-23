import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

// --- INTERFAZ ACTUALIZADA ---
// Agregamos 'category', 'type', 'owner' y ajustamos 'status' según tu backend
export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;        // <--- Faltaba esto
  type: 'loan' | 'sale';   // <--- Faltaba esto
  price: number;
  status: string;          // O puedes ser más específico: 'available' | 'borrowed' | ...
  available: boolean;
  image?: string;
  ownerId: string;
  owner?: {                // Para mostrar el nombre del dueño
    id: string;
    name: string;
  };
}

interface ToolsContextType {
  tools: Tool[];
  loading: boolean;
  error: string | null;
  successMessage: string | null; // Agregado para feedback visual
  fetchTools: () => Promise<void>;
  fetchUnavailableTools: () => Promise<Tool[]>; // Agregado para la vista de no disponibles
  addTool: (toolData: Omit<Tool, 'id' | 'status' | 'available' | 'ownerId'>) => Promise<boolean>;
  updateTool: (id: string, toolData: Partial<Tool>) => Promise<boolean>;
  deleteTool: (id: string) => Promise<boolean>;
  requestLoan: (data: { toolId: string; startDate: string; endDate: string }) => Promise<boolean>; // Agregado para usarlo desde el modal
}

const ToolsContext = createContext<ToolsContextType | undefined>(undefined);

export const ToolsProvider = ({ children }: { children: ReactNode }) => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const { token } = useAuth();

  // Función auxiliar para limpiar mensajes
  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const fetchTools = async () => {
    setLoading(true);
    try {
      const response = await api.get<Tool[]>('/tools');
      // Filtramos solo las herramientas aprobadas y disponibles si es necesario
      // O asumimos que el backend ya filtra.
      setTools(response.data);
    } catch (err: any) {
      console.error(err);
      setError('Error al cargar herramientas');
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener herramientas no disponibles (prestadas/vendidas)
  const fetchUnavailableTools = async () => {
    try {
      // Nota: Asegúrate de tener este endpoint o filtrar en el frontend
      // Si el backend no tiene endpoint específico, podrías filtrar 'tools' aquí mismo
      const response = await api.get<Tool[]>('/tools'); 
      return response.data.filter(t => !t.available); 
    } catch (err) {
      return [];
    }
  };

  useEffect(() => {
    if (token) fetchTools();
  }, [token]);

  const addTool = async (toolData: any) => {
    clearMessages();
    try {
      const response = await api.post('/tools', toolData);
      setTools([...tools, response.data]);
      setSuccessMessage('Herramienta creada con éxito');
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear herramienta');
      return false;
    }
  };

  const updateTool = async (id: string, toolData: Partial<Tool>) => {
    clearMessages();
    try {
      const response = await api.patch(`/tools/${id}`, toolData);
      setTools(tools.map(t => t.id === id ? { ...t, ...response.data } : t));
      return true;
    } catch (err) {
      setError('Error al actualizar herramienta');
      return false;
    }
  };

  const deleteTool = async (id: string) => {
    try {
      await api.delete(`/tools/${id}`);
      setTools(tools.filter(t => t.id !== id));
      return true;
    } catch (err) {
      setError('Error al eliminar herramienta');
      return false;
    }
  };

  // Función integrada para solicitar préstamo desde el contexto de herramientas
  const requestLoan = async (data: { toolId: string; startDate: string; endDate: string }) => {
    clearMessages();
    try {
      await api.post('/loans', data);
      setSuccessMessage('Solicitud enviada correctamente');
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al solicitar préstamo');
      return false;
    }
  };

  return (
    <ToolsContext.Provider value={{ 
      tools, 
      loading, 
      error, 
      successMessage,
      fetchTools, 
      fetchUnavailableTools,
      addTool, 
      updateTool, 
      deleteTool,
      requestLoan
    }}>
      {children}
    </ToolsContext.Provider>
  );
};

export const useTools = () => {
  const context = useContext(ToolsContext);
  if (!context) throw new Error('useTools debe usarse dentro de un ToolsProvider');
  return context;
};