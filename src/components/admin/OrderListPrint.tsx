import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Tables } from '@/integrations/supabase/types';

type Order = Tables<'orders'>;

interface OrderItem {
  title: string;
  quantity: number;
  price: number;
}

const statusLabels: Record<string, string> = {
  received: 'Novo',
  preparing: 'Preparando',
  out_for_delivery: 'Em Entrega',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

const OrderListPrint = ({ orders }: { orders: Order[] }) => {
  return (
    <div className="printable-receipt hidden print:block">
      <div className="text-center mb-2">
        <p className="font-bold text-base">BRUNA PERFUMARIA</p>
        <p className="text-[10px]">Lista de Pedidos</p>
        <p className="text-[10px]">{format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
      </div>
      <div className="receipt-divider" />

      {orders.map((order, idx) => {
        const items = (Array.isArray(order.items) ? order.items : []) as unknown as OrderItem[];
        return (
          <div key={order.id}>
            <div className="flex justify-between font-bold text-[11px]">
              <span>#{order.order_number}</span>
              <span>{statusLabels[order.order_status]}</span>
            </div>
            <p className="text-[10px]">{order.customer_name} • {order.customer_phone}</p>
            {items.map((item, i) => (
              <p key={i} className="text-[10px]">{item.quantity}x {item.title}</p>
            ))}
            <p className="text-[10px] font-bold text-right">Total: R$ {Number(order.total).toFixed(2)}</p>
            {idx < orders.length - 1 && <div className="receipt-divider" />}
          </div>
        );
      })}

      <div className="receipt-divider" />
      <p className="text-center text-[10px] font-bold">{orders.length} pedido(s)</p>
    </div>
  );
};

export default OrderListPrint;
