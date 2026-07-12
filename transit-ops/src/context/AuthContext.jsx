import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import emailjs from '@emailjs/browser';
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
    
    try {
      const response = await axios.post('http://localhost:5001/api/login', { email, password });
      
      const { token, user: loggedInUser } = response.data;
      
      localStorage.setItem('transitops_token', token);
      localStorage.setItem('transitops_user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      setLoading(false);
      return loggedInUser;
    } catch (error) {
      setLoading(false);
      
      // Keep the failed login modal logic for UI feedback
      const userAgent = navigator.userAgent;
      const browserName = userAgent.includes('Chrome') ? 'Google Chrome' :
                          userAgent.includes('Firefox') ? 'Mozilla Firefox' :
                          userAgent.includes('Safari') ? 'Apple Safari' : 'Web Browser';
                          
      const attemptDetails = {
        email,
        time: new Date().toLocaleString(),
        ipAddress: '198.51.100.42', // Mock IP
        browser: `${browserName} (Windows NT 10.0; Win64; x64)`,
      };
                          
      setFailedAttemptDetails(attemptDetails);
      setFailedLoginModalOpen(true);
      
      // Send EmailJS alert for failed login
      // NOTE: User must replace placeholders with actual EmailJS keys
      try {
        await emailjs.send(
          'service_mc9uw9f',
          'template_djp48vx',
          {
            attempt_email: attemptDetails.email,
            attempt_time: attemptDetails.time,
            attempt_ip: attemptDetails.ipAddress,
            attempt_browser: attemptDetails.browser,
            to_email: 'admintransitops@gmail.com'
          },
          {
            publicKey: 'jAq6UPnvsgDpNYPrW'
          }
        );
        console.log('Failed login alert email sent successfully.');
      } catch (emailError) {
        console.error('Failed to send email alert:', emailError);
        if (emailError && typeof emailError === 'object') {
          console.error('EmailJS Error Status:', emailError.status);
          console.error('EmailJS Error Message:', emailError.text);
        }
      }
      
      throw new Error(error.response?.data?.error || 'Invalid email or password');
    }
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
