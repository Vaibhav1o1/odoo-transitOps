import React, { createContext, useContext, useState, useEffect } from 'react';
import { USER_ROLES } from '../constants';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failedLoginModalOpen, setFailedLoginModalOpen] = useState(false);
  const [failedAttemptDetails, setFailedAttemptDetails] = useState(null);

  useEffect(() => {
    // Check local storage for fake JWT
    const token = localStorage.getItem('transitops_token');
    const savedUser = localStorage.getItem('transitops_user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simple validation for mock error states
    if (password.toLowerCase() === 'wrong' || password.length < 4) {
      setLoading(false);
      
      // Get browser info
      const userAgent = navigator.userAgent;
      const browserName = userAgent.includes('Chrome') ? 'Google Chrome' :
                          userAgent.includes('Firefox') ? 'Mozilla Firefox' :
                          userAgent.includes('Safari') ? 'Apple Safari' : 'Web Browser';
                          
      // Trigger the Failed Login Email Modal
      setFailedAttemptDetails({
        email,
        time: new Date().toLocaleString(),
        ipAddress: '198.51.100.42',
        browser: `${browserName} (Windows NT 10.0; Win64; x64)`,
      });
      setFailedLoginModalOpen(true);
      
      throw new Error('Invalid email or password. Hint: Enter password other than "wrong"');
    }

    // Determine mock role based on email input
    let role = USER_ROLES.FLEET_MANAGER;
    let name = 'Alex Mercer';
    
    const emailLower = email.toLowerCase();
    if (emailLower.includes('driver')) {
      role = USER_ROLES.DRIVER;
      name = 'John Doe';
    } else if (emailLower.includes('safety')) {
      role = USER_ROLES.SAFETY_OFFICER;
      name = 'Officer Sarah Connor';
    } else if (emailLower.includes('finance') || emailLower.includes('analyst')) {
      role = USER_ROLES.FINANCIAL_ANALYST;
      name = 'Claire Redfield';
    }

    const mockUser = {
      id: `USR-${Math.floor(Math.random() * 9000 + 1000)}`,
      name,
      email,
      role,
    };

    localStorage.setItem('transitops_token', 'mock_jwt_token_xyz_123');
    localStorage.setItem('transitops_user', JSON.stringify(mockUser));
    setUser(mockUser);
    setLoading(false);
    return mockUser;
  };

  const logout = () => {
    localStorage.removeItem('transitops_token');
    localStorage.removeItem('transitops_user');
    setUser(null);
  };

  const updateProfile = (updatedFields) => {
    if (!user) return;
    const updatedUser = { ...user, ...updatedFields };
    localStorage.setItem('transitops_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateProfile,
        failedLoginModalOpen,
        setFailedLoginModalOpen,
        failedAttemptDetails,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
