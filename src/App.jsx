import { Routes, Route } from "react-router-dom";
import "./App.css";
import Sidebar from "./components/Sidebar.jsx";
import Header from "./components/Header.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import Components from "./pages/Components.jsx";
import ComponentDetails from "./pages/ComponentDetails.jsx";
import LotAnalysis from "./pages/LotAnalysis.jsx";
import Prediction from "./pages/Prediction.jsx";
import DataUpload from "./pages/DataUpload.jsx";

function App() {
  return (
    <div className="app">

      <Sidebar />

      <div className="main-area">

        <Header />

        <main className="content">

          <Routes>
            <Route path="/" element={<Dashboard />} />

            <Route
              path="/components"
              element={<Components />}
            />
            <Route
               path="/components/:id"
               element={<ComponentDetails />}
            />

            <Route
              path="/lot-analysis"
              element={<LotAnalysis />}
            />

            <Route
              path="/prediction"
              element={<Prediction />}
            />

            <Route
              path="/data-upload"
              element={<DataUpload />}
            />
          </Routes>

        </main>

      </div>

    </div>
  );
}

export default App;