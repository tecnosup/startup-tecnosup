import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Servicos from "@/components/landing/Servicos";
import Planos from "@/components/landing/Planos";
import SistemasWeb from "@/components/landing/SistemasWeb";
import Cases from "@/components/landing/Cases";
import TecnoApp from "@/components/landing/TecnoApp";
import Contato from "@/components/landing/Contato";
import Footer from "@/components/landing/Footer";
import ScrollReveal from "@/components/ScrollReveal";

export default function Home() {
  return (
    <>
      <ScrollReveal />
      <Navbar />
      <main>
        {/* Bloco 1: Apresentação */}
        <Hero />

        {/* Bloco 2: Assistência Técnica */}
        <Servicos />
        <Planos />

        {/* Bloco 3: Sistemas Web */}
        <SistemasWeb />
        <Cases />

        {/* Bloco 4: Produto próprio */}
        <TecnoApp />

        {/* Bloco 5: Conversão final */}
        <Contato />
      </main>
      <Footer />
    </>
  );
}
