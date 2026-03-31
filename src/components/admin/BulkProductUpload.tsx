import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Upload, FileSpreadsheet, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import * as XLSX from 'xlsx';

interface BulkProductUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: () => void;
}

interface ParsedProduct {
  title: string;
  price: number;
  description: string;
  category_id: string;
  slug: string;
  valid: boolean;
  error?: string;
}

const generateSlug = (title: string) =>
  title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const BulkProductUpload = ({ open, onOpenChange, onImported }: BulkProductUploadProps) => {
  const [products, setProducts] = useState<ParsedProduct[]>([]);
  const [importing, setImporting] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

      const parsed: ParsedProduct[] = rows.map((row) => {
        const title = String(row['titulo'] || row['title'] || row['nome'] || row['Titulo'] || row['Title'] || row['Nome'] || '').trim();
        const priceRaw = row['preco'] || row['price'] || row['Preco'] || row['Price'] || row['valor'] || row['Valor'] || 0;
        const price = Number(String(priceRaw).replace(',', '.')) || 0;
        const description = String(row['descricao'] || row['description'] || row['Descricao'] || row['Description'] || '').trim();
        const categoryId = String(row['categoria_id'] || row['category_id'] || '').trim();
        const valid = !!title && price > 0;

        return {
          title,
          price,
          description,
          category_id: categoryId,
          slug: generateSlug(title || 'produto'),
          valid,
          error: !title ? 'Título obrigatório' : price <= 0 ? 'Preço inválido' : undefined,
        };
      });

      setProducts(parsed);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    const validProducts = products.filter(p => p.valid);
    if (validProducts.length === 0) { toast.error('Nenhum produto válido'); return; }

    setImporting(true);
    const toInsert = validProducts.map(p => ({
      title: p.title,
      price: p.price,
      description: p.description || null,
      category_id: p.category_id || null,
      slug: p.slug + '-' + Date.now().toString(36).slice(-4),
      active: true,
      featured: false,
    }));

    const { error } = await supabase.from('products').insert(toInsert);
    setImporting(false);

    if (error) {
      toast.error('Erro ao importar: ' + error.message);
    } else {
      toast.success(`${validProducts.length} produtos importados!`);
      setProducts([]);
      setFileName('');
      onImported();
      onOpenChange(false);
    }
  };

  const validCount = products.filter(p => p.valid).length;
  const invalidCount = products.filter(p => !p.valid).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" /> Importar Produtos via Planilha
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="hidden" />
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" /> Selecionar Arquivo (.xlsx ou .csv)
            </Button>
            {fileName && <p className="text-sm text-muted-foreground mt-2">📄 {fileName}</p>}
            <p className="text-xs text-muted-foreground mt-3">
              Colunas aceitas: <strong>titulo</strong> (ou title/nome), <strong>preco</strong> (ou price/valor), descricao, categoria_id
            </p>
          </div>

          {products.length > 0 && (
            <>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="h-4 w-4" /> {validCount} válidos
                </span>
                {invalidCount > 0 && (
                  <span className="flex items-center gap-1 text-destructive">
                    <AlertCircle className="h-4 w-4" /> {invalidCount} com erro
                  </span>
                )}
              </div>

              <div className="border rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="text-left p-2 text-xs font-medium">#</th>
                      <th className="text-left p-2 text-xs font-medium">Título</th>
                      <th className="text-right p-2 text-xs font-medium">Preço</th>
                      <th className="text-left p-2 text-xs font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p, i) => (
                      <tr key={i} className={`border-t ${!p.valid ? 'bg-destructive/5' : ''}`}>
                        <td className="p-2 text-xs text-muted-foreground">{i + 1}</td>
                        <td className="p-2 text-xs">{p.title || '—'}</td>
                        <td className="p-2 text-xs text-right">R$ {p.price.toFixed(2)}</td>
                        <td className="p-2 text-xs">
                          {p.valid ? (
                            <span className="text-green-600">✓</span>
                          ) : (
                            <span className="text-destructive">{p.error}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleImport} disabled={importing || validCount === 0}>
            {importing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            {importing ? 'Importando...' : `Importar ${validCount} Produtos`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkProductUpload;
