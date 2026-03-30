import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OrderItem {
  title: string;
  quantity: number;
  price: number;
}

interface OrderAddress {
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  cep?: string;
}

interface OrderData {
  order_number: number;
  customer_name: string;
  customer_phone: string;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: string;
  payment_status: string;
  needs_change?: boolean;
  change_for?: number;
  address: OrderAddress;
  notes?: string;
  created_at: string;
}

const paymentLabels: Record<string, string> = {
  pix: 'PIX',
  cartao_online: 'Cartão Online',
  dinheiro_entrega: 'Dinheiro na Entrega',
  cartao_entrega: 'Cartão na Entrega',
};

const OrderReceiptPrint = ({ order }: { order: OrderData }) => {
  const addr = order.address;

  return (
    <div className="printable-receipt hidden print:block">
      <div className="text-center mb-2">
        <p className="font-bold text-base">BRUNA PERFUMARIA</p>
        <p className="text-[10px]">Av. Olavo Egídio, 1570 - Tucuruvi</p>
        <p className="text-[10px]">Tel: (11) 94577-8994</p>
      </div>

      <div className="receipt-divider" />

      <p className="font-bold text-center">PEDIDO #{order.order_number}</p>
      <p className="text-center text-[10px]">
        {format(new Date(order.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
      </p>

      <div className="receipt-divider" />

      <p className="font-bold">{order.customer_name}</p>
      <p>{order.customer_phone}</p>
      {addr && (
        <p className="text-[10px]">
          {addr.street}, {addr.number}
          {addr.complement ? ` - ${addr.complement}` : ''}
          {addr.neighborhood ? ` - ${addr.neighborhood}` : ''}
          {addr.city ? `, ${addr.city}` : ''}
          {addr.cep ? ` - ${addr.cep}` : ''}
        </p>
      )}

      <div className="receipt-divider" />

      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left text-[10px]">Item</th>
            <th className="text-center text-[10px]">Qtd</th>
            <th className="text-right text-[10px]">Valor</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, i) => (
            <tr key={i}>
              <td className="text-[10px]">{item.title}</td>
              <td className="text-center text-[10px]">{item.quantity}</td>
              <td className="text-right text-[10px]">R$ {(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="receipt-divider" />

      <div className="flex justify-between text-[10px]">
        <span>Subtotal:</span>
        <span>R$ {Number(order.subtotal).toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-[10px]">
        <span>Taxa de Entrega:</span>
        <span>R$ {Number(order.delivery_fee).toFixed(2)}</span>
      </div>
      <div className="flex justify-between font-bold">
        <span>TOTAL:</span>
        <span>R$ {Number(order.total).toFixed(2)}</span>
      </div>

      <div className="receipt-divider" />

      <p className="text-[10px]">
        <strong>Pagamento:</strong> {paymentLabels[order.payment_method] || order.payment_method}
      </p>
      <p className="text-[10px]">
        <strong>Status:</strong> {order.payment_status === 'paid' ? 'PAGO' : order.payment_status === 'delivery_payment' ? 'PGTO NA ENTREGA' : 'PENDENTE'}
      </p>
      {order.payment_method === 'dinheiro_entrega' && order.needs_change && order.change_for && (
        <p className="text-[10px] font-bold">TROCO PARA: R$ {Number(order.change_for).toFixed(2)}</p>
      )}

      {order.notes && (
        <>
          <div className="receipt-divider" />
          <p className="text-[10px]"><strong>Obs:</strong> {order.notes}</p>
        </>
      )}

      <div className="receipt-divider" />
      <p className="text-center text-[10px] mt-2">Obrigada pela preferência! 🌸</p>
    </div>
  );
};

export default OrderReceiptPrint;
