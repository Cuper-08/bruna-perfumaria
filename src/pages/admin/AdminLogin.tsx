import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Lock, Mail } from 'lucide-react';
import brunaLogo from '@/assets/bruna-logo.webp';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, isAdmin, loading: authLoading } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [isAdmin, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error);
      } else {
        navigate('/admin');
      }
    } catch {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary text-lg font-semibold">Carregando...</div>
      </div>
    );
  }

  if (isAdmin) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bruna-pink via-background to-bruna-cream p-4">
      <Card className="w-full max-w-sm border-border/50 shadow-2xl rounded-2xl animate-fade-in overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-bruna-red via-bruna-gold to-bruna-red" />
        <CardHeader className="text-center pb-2 pt-8">
          <img src={brunaLogo} alt="Bruna Perfumaria" className="h-16 mx-auto mb-4 object-contain" />
          <p className="text-sm text-muted-foreground font-medium">Painel Administrativo</p>
        </CardHeader>
        <CardContent className="pb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@bruna.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 rounded-xl"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 rounded-xl"
                  required
                />
              </div>
            </div>
            {error && (
              <p className="text-sm text-destructive text-center bg-destructive/10 rounded-xl py-2 px-3">{error}</p>
            )}
            <Button type="submit" className="w-full bg-bruna-dark hover:bg-bruna-red text-white rounded-xl shadow-md hover:shadow-lg transition-all" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
