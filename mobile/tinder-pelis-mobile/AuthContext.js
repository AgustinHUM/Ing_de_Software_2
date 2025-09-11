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
        const res = await axios.post('http://localhost:5000/login', { email, password });
        // success only if status is 2xx and token exists
        if (res.status >= 200 && res.status < 300 && res.data?.token) {
          const token = res.data.token;
          await SecureStore.setItemAsync('userToken', token);
          dispatch({ type: 'SIGN_IN', token });
          return { success: true };
        }
        // unexpected but non-throwing response
        const msg = res.data?.message || `Unexpected response (${res.status})`;
        return { success: false, message: msg };
      } catch (e) {
        // axios error: check response if present
        if (e.response) {
          // backend responded with non-2xx
          const status = e.response.status;
          const serverMsg = e.response.data?.message || e.response.data || `HTTP ${status}`;
          console.warn('login failed with status', status, serverMsg);
          return { success: false, message: serverMsg };
        } else {
          // network / other error
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
        const res = await axios.post('http://localhost:5000/register', {
          email,
          username,
          password,
        });

        if (res.status >= 200 && res.status < 300) {
          // if backend returns token immediately after register use it
          const token = res.data?.token ?? null;
          if (token) {
            await SecureStore.setItemAsync('userToken', token);
            dispatch({ type: 'SIGN_UP', token });
            return { success: true };
          }
          // If backend doesn't return a token but registration was successful,
          // you might want to require the user to log in — here we don't create a token.
          // Return success but without signing in automatically:
          return { success: true, message: 'Registered successfully. Please log in.' };
        }

        const msg = res.data?.message || `Unexpected response (${res.status})`;
        return { success: false, message: msg };
      } catch (e) {
        if (e.response) {
          const status = e.response.status;
          const serverMsg = e.response.data?.message || e.response.data || `HTTP ${status}`;
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
