import HeroSection from "@/components/HeroSection";
import CategoryShowcase from "@/components/CategoryShowcase";

export default function Home() {
  return (
    <main>
      <HeroSection />

      <CategoryShowcase />

      {/* Placeholder for the features / product sections below the fold */}
      <section
        id="features"
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#F2DEC7" }}
      >
        <p
          className="text-sm tracking-widest uppercase"
          style={{ color: "#ABA66F" }}
        >
          More sections coming soon…
        </p>
      </section>
    </main>
  );
}
