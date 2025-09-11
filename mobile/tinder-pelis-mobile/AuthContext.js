// AuthContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const AuthContext = createContext();

// added isNewUser to initial state
const initialState = { isLoading: true, userToken: null, isNewUser: false };

function reducer(state, action) {
  switch (action.type) {
    case 'RESTORE_TOKEN':
      return { ...state, userToken: action.token, isLoading: false, isNewUser: false };
    case 'SIGN_IN':
      return { ...state, userToken: action.token, isNewUser: false };
    // new case for sign up (marks user as new)
    case 'SIGN_UP':
      return { ...state, userToken: action.token, isNewUser: true };
    case 'SIGN_OUT':
      return { ...state, userToken: null, isNewUser: false };
    case 'CLEAR_NEW_USER':
      return { ...state, isNewUser: false };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    // try restore token from secure storage
    (async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        dispatch({ type: 'RESTORE_TOKEN', token });
      } catch (err) {
        console.warn('restore token failed:', err?.message ?? err);
        dispatch({ type: 'RESTORE_TOKEN', token: null });
      }
    })();
  }, []);

  const auth = {
    state,

    /**
     * signIn
     * returns { success: boolean, message?: string }
     */
signIn: async (email, password) => {
  try {
    const res = await axios.post('http://192.168.1.7:5000/login', { email, password });  /* Ip de tu compu */

    if (res.status >= 200 && res.status < 300 && res.data?.access_token) {
      const token = res.data.access_token; // 👈 usamos access_token del backend
      await SecureStore.setItemAsync('userToken', token);
      dispatch({ type: 'SIGN_IN', token });
      return { success: true };
    }

    const msg = res.data?.error || res.data?.message || `Unexpected response (${res.status})`;
    return { success: false, message: msg };
  } catch (e) {
    if (e.response) {
      const status = e.response.status;
      const serverMsg = e.response.data?.error || e.response.data?.message || `HTTP ${status}`;
      console.warn('login failed with status', status, serverMsg);
      return { success: false, message: serverMsg };
    } else {
      console.warn('login request failed:', e.message);
      return { success: false, message: e.message || 'Network error' };
    }
  }
},
    /**
     * signUp
     * returns { success: boolean, message?: string }
     * minimal change: only mark user as signed up if backend returns token (or 2xx)
     */
signUp: async (email, username, password) => {
  try {
    const res = await axios.post('http://192.168.1.7:5000/register', { /* Ip de tu compu */
      email,
      username,
      password,
    });

    if (res.status >= 200 && res.status < 300) {
      return { success: true, message: res.data?.message || 'Registro exitoso' };
    }

    const msg = res.data?.error || res.data?.message || `Unexpected response (${res.status})`;
    return { success: false, message: msg };
  } catch (e) {
    if (e.response) {
      const status = e.response.status;
      const serverMsg = e.response.data?.error || e.response.data?.message || `HTTP ${status}`;
      console.warn('signup failed with status', status, serverMsg);
      return { success: false, message: serverMsg };
    } else {
      console.warn('signup request failed:', e.message);
      return { success: false, message: e.message || 'Network error' };
    }
  }
},

    signOut: async () => {
      try {
        await SecureStore.deleteItemAsync('userToken');
      } catch (e) {
        console.warn('delete token failed:', e?.message ?? e);
      } finally {
        dispatch({ type: 'SIGN_OUT' });
      }
    },

    guestSignIn: async () => {
      const guestToken = 'guest-token';
      await SecureStore.setItemAsync('userToken', guestToken);
      dispatch({ type: 'SIGN_IN', token: guestToken });
      return { success: true };
    },

    clearNewUser: () => {
      dispatch({ type: 'CLEAR_NEW_USER' });
    },
  };

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
