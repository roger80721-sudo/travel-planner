import { Routes, Route, HashRouter } from 'react-router-dom';
import { MobileLayout } from './components/layout/MobileLayout';

// 引入所有頁面
import { SchedulePage } from './features/schedule/SchedulePage';
import { BookingsPage } from './features/bookings/BookingsPage';
import { ExpensePage } from './features/expense/ExpensePage';
import { JournalPage } from './features/journal/JournalPage';
import { PreparationPage } from './features/preparation/PreparationPage';
import { SettingsPage } from './features/settings/SettingsPage';

function App() {
  return (
    <HashRouter>
      <Routes>
        {/* 1. 行程頁 (首頁) */}
        <Route 
          path="/" 
          element={
            <MobileLayout title="每日行程">
              <SchedulePage />
            </MobileLayout>
          } 
        />

        {/* 2. 預訂頁 */}
        <Route 
          path="/bookings" 
          element={
            <MobileLayout title="預訂管理">
              <BookingsPage />
            </MobileLayout>
          } 
        />

        {/* 3. 記帳頁 */}
        <Route 
          path="/expense" 
          element={
            <MobileLayout title="旅費分攤">
              <ExpensePage />
            </MobileLayout>
          } 
        />

        {/* 4. 日誌頁 */}
        <Route 
          path="/journal" 
          element={
            <MobileLayout title="旅行日誌">
              <JournalPage />
            </MobileLayout>
          } 
        />

        {/* 5. 準備清單頁 (注意這裡是 /preparation) */}
        <Route 
          path="/preparation" 
          element={
            <MobileLayout title="準備清單">
              <PreparationPage />
            </MobileLayout>
          } 
        />

        {/* 6. 設定頁 */}
        <Route 
          path="/settings" 
          element={
            <MobileLayout title="設定">
              <SettingsPage />
            </MobileLayout>
          } 
        />
      </Routes>
    </HashRouter>
  );
}

export default App;