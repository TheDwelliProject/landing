import NavBar from "./components/NavBar";
import "./App.css";
import HeaderSection from "./components/HeaderSection";
import FeaturesSection from "./components/FeaturesSection";

function App() {
  return (
    <>
      <div className="container mx-auto">
        <NavBar />
        <HeaderSection />
        <FeaturesSection />
      </div>
    </>
  );
}

export default App;
