import { useState, useEffect } from 'react';

interface ViaCepResult {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

interface UseViaCepReturn {
  address: {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
  } | null;
  loading: boolean;
  error: string | null;
}

export function useViaCep(cep: string): UseViaCepReturn {
  const [address, setAddress] = useState<UseViaCepReturn['address']>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      setAddress(null);
      setError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data: ViaCepResult = await res.json();
        if (data.erro) {
          setError('CEP não encontrado');
          setAddress(null);
        } else {
          setAddress({
            street: data.logradouro || '',
            neighborhood: data.bairro || '',
            city: data.localidade || '',
            state: data.uf || '',
          });
        }
      } catch {
        setError('Erro ao buscar CEP');
        setAddress(null);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [cep]);

  return { address, loading, error };
}
