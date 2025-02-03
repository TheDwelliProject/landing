import NavBar from "./components/NavBar";
import "./App.css";
import HeaderSection from "./components/HeaderSection";
import FeaturesSection from "./components/FeaturesSection";
import FAQ from "./components/FAQ";

function App() {
  return (
    <div className="m-auto sm:max-w-7xl">
      <NavBar />
      <HeaderSection />
      <FeaturesSection />
      <FAQ />
    </div>
  );
}

export default App;
