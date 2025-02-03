import NavBar from "./components/NavBar";
import HeaderSection from "./components/HeaderSection";
import FeaturesSection from "./components/FeaturesSection";
import FAQ from "./components/FAQ";

export default function Home() {
  return (
    <div className="m-auto sm:max-w-7xl">
      <NavBar />
      <HeaderSection />
      <FeaturesSection />
      <FAQ />
    </div>
  );
}
