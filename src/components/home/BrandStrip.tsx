// Strip estática de marcas — texto editorial em vez de logos (pode evoluir para SVGs depois)
const brands = ['Granado', 'Eudora', 'O Boticário', 'Natura', 'Avon', 'Quem Disse Berenice', 'Vult', 'Ruby Rose'];

const BrandStrip = () => {
  return (
    <section className="py-12 md:py-16 bg-bruna-cream border-y border-border/40 overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <p className="eyebrow text-center mb-6">Marcas que amamos</p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 md:gap-x-16 gap-y-4">
          {brands.map((brand) => (
            <span
              key={brand}
              className="font-display text-lg md:text-2xl text-foreground/35 hover:text-foreground/70 transition-colors duration-500 tracking-wide italic"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandStrip;
