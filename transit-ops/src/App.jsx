import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './routes/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Drivers from './pages/Drivers';
import Trips from './pages/Trips';
import Maintenance from './pages/Maintenance';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import ErrorPage from './pages/ErrorPage';

import { USER_ROLES } from './constants';

export default function App() {
  const allRoles = Object.values(USER_ROLES);
  
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Pages */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              
              {/* Core Application Protected Pages */}
              <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                {/* Dashboard & Trips: Accessible to everyone */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/trips" element={<Trips />} />
                
                {/* Vehicles: Manager, Safety, Finance */}
                <Route
                  path="/vehicles"
                  element={
                    <ProtectedRoute allowedRoles={[USER_ROLES.FLEET_MANAGER, USER_ROLES.SAFETY_OFFICER, USER_ROLES.FINANCIAL_ANALYST]}>
                      <Vehicles />
                    </ProtectedRoute>
                  }
                />
                
                {/* Drivers & Maintenance: Manager and Safety Officer only */}
                <Route
                  path="/drivers"
                  element={
                    <ProtectedRoute allowedRoles={[USER_ROLES.FLEET_MANAGER, USER_ROLES.SAFETY_OFFICER]}>
                      <Drivers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/maintenance"
                  element={
                    <ProtectedRoute allowedRoles={[USER_ROLES.FLEET_MANAGER, USER_ROLES.SAFETY_OFFICER]}>
                      <Maintenance />
                    </ProtectedRoute>
                  }
                />
                
                {/* Fuel & Expenses: Manager and Financial Analyst only */}
                <Route
                  path="/expenses"
                  element={
                    <ProtectedRoute allowedRoles={[USER_ROLES.FLEET_MANAGER, USER_ROLES.FINANCIAL_ANALYST]}>
                      <Expenses />
                    </ProtectedRoute>
                  }
                />
                
                {/* Reports: Manager and Financial Analyst only */}
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute allowedRoles={[USER_ROLES.FLEET_MANAGER, USER_ROLES.FINANCIAL_ANALYST]}>
                      <Reports />
                    </ProtectedRoute>
                  }
                />

                {/* Profile & Settings: Everyone */}
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* Error Views */}
              <Route path="/401" element={<ErrorPage code={401} />} />
              <Route path="/403" element={<ErrorPage code={403} />} />
              <Route path="/404" element={<ErrorPage code={404} />} />
              <Route path="*" element={<ErrorPage code={404} />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
