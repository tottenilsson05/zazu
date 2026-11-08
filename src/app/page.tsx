import { About } from "@/components/About";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { MemeVault } from "@/components/MemeVault";
import { MotionProvider } from "@/components/MotionProvider";
import { Nav } from "@/components/Nav";
import { PfpMaker } from "@/components/PfpMaker";
import { TokenPanel } from "@/components/TokenPanel";
import { World } from "@/components/World";

export default function Home() {
  return (
    <MotionProvider>
      <World />
      <Nav />
      <main>
        <Hero />
        <About />
        <MemeVault />
        <PfpMaker />
        <TokenPanel />
      </main>
      <Footer />
    </MotionProvider>
  );
}
