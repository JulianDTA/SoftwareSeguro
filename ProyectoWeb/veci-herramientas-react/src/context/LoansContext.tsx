import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

// Interfaz corregida: Agregamos 'active' al status
export interface Loan {
  id: string;
  toolId: string;
  requesterId: string;
  ownerId: string;
  startDate: string;
  endDate: string;
  // AQUÍ ESTABA EL ERROR: Faltaba 'active'
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'returned';
  tool?: {
    name: string;
    price: number;
    image?: string;
  };
  requester?: {
    name: string;
    email: string;
  }; 
}

interface LoansContextType {
  loans: Loan[];
  myRequests: Loan[];      
  incomingRequests: Loan[];
  loading: boolean;
  createLoan: (toolId: string, startDate: string, endDate: string) => Promise<boolean>;
  updateLoanStatus: (loanId: string, status: string) => Promise<boolean>;
  refreshLoans: () => Promise<void>;
}

const LoansContext = createContext<LoansContextType | undefined>(undefined);

export const LoansProvider = ({ children }: { children: ReactNode }) => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(false);
  const { token, user } = useAuth();

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const res = await api.get('/loans/my-loans'); 
      setLoans(res.data);
    } catch (error) {
      console.error("Error cargando préstamos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchLoans();
  }, [token]);

  const myRequests = loans.filter(l => l.requesterId === user?.userId);
  const incomingRequests = loans.filter(l => l.ownerId === user?.userId);

  const createLoan = async (toolId: string, startDate: string, endDate: string) => {
    try {
      await api.post('/loans', { toolId, startDate, endDate });
      await fetchLoans();
      return true;
    } catch { return false; }
  };

  const updateLoanStatus = async (loanId: string, status: string) => {
    try {
      await api.patch(`/loans/${loanId}/status`, { status });
      await fetchLoans();
      return true;
    } catch (error) {
      return false;
    }
  };

  return (
    <LoansContext.Provider value={{ 
      loans, 
      myRequests, 
      incomingRequests, 
      loading, 
      createLoan, 
      updateLoanStatus,
      refreshLoans: fetchLoans 
    }}>
      {children}
    </LoansContext.Provider>
  );
};

export const useLoans = () => useContext(LoansContext)!;