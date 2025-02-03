import NavBar from "./components/NavBar";
import HeroSection from "./components/HeroSection";
import FeaturesSection from "./components/FeaturesSection";
import FAQ from "./components/FAQ";
import MainFooter from "./components/MainFooter";

export default function Home() {
  return (
    <div className="m-auto sm:max-w-7xl">
      <NavBar />
      <HeroSection />
      <FeaturesSection />
      <FAQ />
      <MainFooter />
    </div>
  );
}
