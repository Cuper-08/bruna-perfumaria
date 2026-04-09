import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Package, ArrowLeft, Copy, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Tables<'orders'> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!id) return;
    supabase.from('orders').select('*').eq('id', id).single()
      .then(({ data }) => {
        setOrder(data);
        setLoading(false);
      });
  }, [id]);

  // Poll for payment updates (PIX and card online)
  useEffect(() => {
    if (!order || order.payment_status !== 'pending') return;
    if (order.payment_method !== 'pix' && order.payment_method !== 'cartao_online') return;
    const interval = setInterval(async () => {
      const { data } = await supabase.from('orders').select('payment_status, pix_qr_code, pix_copy_paste').eq('id', order.id).single();
      if (data && (data.payment_status !== 'pending' || data.pix_qr_code)) {
        setOrder(prev => prev ? { ...prev, ...data } : prev);
        if (data.payment_status === 'paid') clearInterval(interval);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [order]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Pedido não encontrado</p>
        <Button onClick={() => navigate('/')}>Voltar à Loja</Button>
      </div>
    );
  }

  const paymentMethodLabel: Record<string, string> = {
    pix: 'PIX',
    cartao_online: 'Cartão Online',
    dinheiro_entrega: 'Dinheiro na Entrega',
    cartao_entrega: 'Cartão na Entrega',
  };

  const items = Array.isArray(order.items) ? order.items as Array<{ title: string; quantity: number; price: number }> : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Pedido Confirmado!</h1>
          <p className="text-muted-foreground">Pedido #{order.order_number}</p>
        </motion.div>

        {/* Card online area */}
        {order.payment_method === 'cartao_online' && order.payment_status === 'pending' && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-2xl p-6 mb-6 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-3 text-blue-600">
              <Clock className="h-5 w-5" />
              <span className="font-medium">Aguardando Pagamento com Cartão</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Clique no botão abaixo para acessar a página de pagamento segura do Asaas e concluir sua compra.
            </p>
            {order.invoice_url ? (
              <a
                href={order.invoice_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                <ExternalLink className="h-4 w-4" />
                Pagar com Cartão
              </a>
            ) : (
              <div className="py-4 space-y-2">
                <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="text-sm text-muted-foreground">Gerando link de pagamento...</p>
              </div>
            )}
          </motion.div>
        )}

        {/* PIX area */}
        {order.payment_method === 'pix' && order.payment_status === 'pending' && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-2xl p-6 mb-6 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-3 text-amber-600">
              <Clock className="h-5 w-5" />
              <span className="font-medium">Aguardando Pagamento PIX</span>
            </div>
            {order.pix_qr_code ? (
              <div className="space-y-4">
                <img src={`data:image/png;base64,${order.pix_qr_code}`} alt="QR Code PIX" className="w-48 h-48 mx-auto rounded-xl" />
                {order.pix_copy_paste && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Ou copie o código:</p>
                    <div className="flex items-center gap-2 bg-muted rounded-xl p-3">
                      <code className="text-xs flex-1 break-all text-foreground">{order.pix_copy_paste.slice(0, 60)}...</code>
                      <Button size="icon" variant="ghost" onClick={() => {
                        navigator.clipboard.writeText(order.pix_copy_paste || '');
                      }}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 space-y-3">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="text-sm text-muted-foreground">Gerando QR Code PIX...</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Payment confirmed */}
        {order.payment_status === 'paid' && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 text-center">
            <p className="text-green-700 font-medium">✅ Pagamento confirmado!</p>
          </div>
        )}

        {/* Order summary */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Resumo</h2>
          </div>
          <div className="space-y-3 mb-4">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-foreground">{item.quantity}x {item.title}</span>
                <span className="text-muted-foreground">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>R$ {Number(order.subtotal).toFixed(2).replace('.', ',')}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Entrega</span><span>R$ {Number(order.delivery_fee).toFixed(2).replace('.', ',')}</span></div>
            <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
              <span>Total</span><span className="text-primary">R$ {Number(order.total).toFixed(2).replace('.', ',')}</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border text-sm text-muted-foreground">
            <p>Pagamento: {paymentMethodLabel[order.payment_method] || order.payment_method}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" className="flex-1 rounded-xl gap-2" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" /> Voltar à Loja
          </Button>
        </div>
      </div>
    </div>
  );
}
