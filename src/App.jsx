import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import BrandsIndex from './pages/BrandsIndex';
import BrandPage from './pages/BrandPage';
import KeyboardsIndex from './pages/KeyboardsIndex';
import ProductPage from './pages/ProductPage';
import TechIndex from './pages/TechIndex';
import TechPage from './pages/TechPage';
import GamesIndex from './pages/GamesIndex';
import GamePage from './pages/GamePage';
import EsportsPage from './pages/EsportsPage';
import RankingsPage from './pages/RankingsPage';
import ComparePage from './pages/ComparePage';
import SearchPage from './pages/SearchPage';
import NotFound from './pages/NotFound';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="brands" element={<BrandsIndex />} />
          <Route path="brands/:brandId" element={<BrandPage />} />
          <Route path="keyboards" element={<KeyboardsIndex />} />
          <Route path="keyboards/:productId" element={<ProductPage />} />
          <Route path="tech" element={<TechIndex />} />
          <Route path="tech/:termId" element={<TechPage />} />
          <Route path="games" element={<GamesIndex />} />
          <Route path="games/:gameId" element={<GamePage />} />
          <Route path="esports" element={<EsportsPage />} />
          <Route path="rankings" element={<RankingsPage />} />
          <Route path="compare" element={<ComparePage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
