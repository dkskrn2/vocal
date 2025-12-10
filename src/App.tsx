// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./layout/AppLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { VocalAnalysisPage } from "./pages/VocalAnalysisPage";
import { SongsPage } from "./pages/SongsPage";
import { MixingPage } from "./pages/MixingPage";
import { ReportsPage } from "./pages/ReportsPage";
import { ProfilePage } from "./pages/ProfilePage";

const App = () => {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/vocal-analysis" element={<VocalAnalysisPage />} />
          <Route path="/songs" element={<SongsPage />} />
          <Route path="/mixing" element={<MixingPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
};

export default App;
