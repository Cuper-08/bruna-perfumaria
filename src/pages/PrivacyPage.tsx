import StoreLayout from '@/components/layout/StoreLayout';
import PageHeader from '@/components/layout/PageHeader';

const PrivacyPage = () => {
  return (
    <StoreLayout>
      <PageHeader title="Privacidade" />
      <div className="container mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold mb-2">Política de Privacidade</h1>
        <p className="text-sm text-muted-foreground mb-8">Última atualização: 06 de Maio de 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-lg font-semibold mb-2">1. Quem somos</h2>
            <p className="text-muted-foreground">
              Bruna Perfumaria, CNPJ 10.474.012/0001-01, sediada na Rua Pastoril de Itapetininga, 541,
              Jardim Danfer, São Paulo — SP. Telefone (11) 94577-8994. Esta Política descreve como
              tratamos os seus dados pessoais em conformidade com a Lei Geral de Proteção de Dados
              (LGPD — Lei 13.709/2018).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">2. Quais dados coletamos</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li><strong>Identificação:</strong> nome completo, CPF (apenas para pagamentos online).</li>
              <li><strong>Contato:</strong> telefone, WhatsApp.</li>
              <li><strong>Entrega:</strong> endereço completo (CEP, rua, número, bairro, cidade, estado).</li>
              <li><strong>Localização:</strong> coordenadas GPS aproximadas, apenas com sua autorização explícita.</li>
              <li><strong>Pedido:</strong> produtos comprados, valores, forma de pagamento, status.</li>
              <li><strong>Técnicos:</strong> endereço IP, tipo de navegador, cookies.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">3. Para que usamos</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Processar e entregar seus pedidos.</li>
              <li>Calcular taxa de entrega com base na distância até a loja.</li>
              <li>Gerar cobranças via PIX ou cartão (parceiro Asaas).</li>
              <li>Comunicar sobre o status do pedido via WhatsApp.</li>
              <li>Cumprir obrigações legais (fiscais e tributárias).</li>
              <li>Prevenir fraudes e garantir a segurança da loja.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">4. Compartilhamento</h2>
            <p className="text-muted-foreground">
              Seus dados são compartilhados apenas com:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li><strong>Asaas</strong> — para processar pagamentos online (CPF, nome, valor).</li>
              <li><strong>Supabase</strong> — provedor da nossa infraestrutura de banco de dados.</li>
              <li><strong>Autoridades</strong> — quando exigido por lei.</li>
            </ul>
            <p className="text-muted-foreground mt-2">Não vendemos seus dados a terceiros.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">5. Cookies</h2>
            <p className="text-muted-foreground">
              Usamos cookies essenciais para o funcionamento do site (carrinho, sessão, preferências).
              Não utilizamos cookies de rastreamento de terceiros sem o seu consentimento.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">6. Seus direitos (LGPD)</h2>
            <p className="text-muted-foreground mb-2">Você pode, a qualquer momento:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Confirmar a existência de tratamento dos seus dados.</li>
              <li>Acessar os dados que temos sobre você.</li>
              <li>Corrigir dados incompletos ou desatualizados.</li>
              <li>Solicitar a exclusão dos dados (quando aplicável).</li>
              <li>Revogar o consentimento.</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              Para exercer qualquer direito, entre em contato pelo WhatsApp <strong>(11) 94577-8994</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">7. Segurança</h2>
            <p className="text-muted-foreground">
              Adotamos medidas técnicas e administrativas para proteger seus dados, incluindo
              criptografia em trânsito (HTTPS), autenticação por papéis e políticas de acesso restrito
              (Row Level Security). Em caso de incidente, comunicaremos a ANPD e os titulares afetados.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">8. Retenção</h2>
            <p className="text-muted-foreground">
              Mantemos os dados de pedidos pelo prazo legal (5 anos para fins fiscais). Dados de
              navegação são apagados automaticamente após 30 dias.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">9. Alterações</h2>
            <p className="text-muted-foreground">
              Esta política pode ser atualizada. Mudanças serão comunicadas no site.
            </p>
          </section>
        </div>
      </div>
    </StoreLayout>
  );
};

export default PrivacyPage;
