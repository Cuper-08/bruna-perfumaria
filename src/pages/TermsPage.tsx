import StoreLayout from '@/components/layout/StoreLayout';

const TermsPage = () => {
  return (
    <StoreLayout>
      <div className="container mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold mb-2">Termos de Uso</h1>
        <p className="text-sm text-muted-foreground mb-8">Última atualização: 06 de Maio de 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-lg font-semibold mb-2">1. Aceitação</h2>
            <p className="text-muted-foreground">
              Ao usar o site da Bruna Perfumaria (CNPJ 10.474.012/0001-01), você concorda com estes
              Termos. Se não concordar, por favor não utilize o serviço.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">2. Pedidos</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Os pedidos são confirmados após o pagamento (online) ou aceite (na entrega).</li>
              <li>Reservamo-nos o direito de cancelar pedidos com indícios de fraude.</li>
              <li>A disponibilidade dos produtos está sujeita a estoque.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">3. Pagamento</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Aceitamos PIX, Cartão (online), Dinheiro na entrega e Cartão na entrega.</li>
              <li>Pagamentos online são processados pela Asaas (parceiro autorizado pelo Banco Central).</li>
              <li>Em caso de pagamento na entrega, é necessário ter o valor exato ou solicitar troco.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">4. Entrega</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Entregamos em raio máximo de 10 km da loja (Jardim Danfer, São Paulo).</li>
              <li>O valor da taxa é R$ 5,00 até 5 km e + R$ 1,00 por km adicional.</li>
              <li>Prazo médio de entrega: 30 a 90 minutos após confirmação do pedido.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">5. Trocas e devoluções</h2>
            <p className="text-muted-foreground">
              De acordo com o Código de Defesa do Consumidor, você pode solicitar a devolução em até
              7 dias após o recebimento, desde que o produto esteja em sua embalagem original e sem
              uso. Produtos de higiene pessoal e perfumaria que tenham sido abertos não podem ser
              devolvidos por questões sanitárias.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">6. Responsabilidades</h2>
            <p className="text-muted-foreground">
              A Bruna Perfumaria se compromete a entregar produtos conforme descrito. Não nos
              responsabilizamos por uso indevido dos produtos pelo cliente. Atrasos por força maior
              (chuva forte, bloqueio de via, etc.) serão comunicados via WhatsApp.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">7. Foro</h2>
            <p className="text-muted-foreground">
              Estes Termos são regidos pelas leis brasileiras. Eventuais disputas serão resolvidas no
              foro da comarca de São Paulo — SP.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">8. Contato</h2>
            <p className="text-muted-foreground">
              WhatsApp: (11) 94577-8994 — Endereço: Rua Pastoril de Itapetininga, 541, Jardim Danfer,
              São Paulo — SP.
            </p>
          </section>
        </div>
      </div>
    </StoreLayout>
  );
};

export default TermsPage;
