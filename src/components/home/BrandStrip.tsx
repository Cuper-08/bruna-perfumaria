// Strip estática de marcas — texto editorial em vez de logos (pode evoluir para SVGs depois)
const brands = ['Granado', 'Eudora', 'O Boticário', 'Natura', 'Avon', 'Quem Disse Berenice', 'Vult', 'Ruby Rose'];

const BrandStrip = () => {
  return (
    <section className="py-16 md:py-20 bg-bruna-cream border-y border-border/40 overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <p className="eyebrow text-center mb-8">Marcas que amamos</p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 md:gap-x-14 lg:gap-x-20 gap-y-5">
          {brands.map((brand) => (
            <span
              key={brand}
              className="font-display text-xl md:text-2xl lg:text-3xl text-foreground/30 hover:text-foreground/75 transition-colors duration-500 tracking-wide italic"
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
