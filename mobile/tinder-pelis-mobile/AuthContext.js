import React, { createContext, useContext, useReducer, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const AuthContext = createContext();

const initialState = { isLoading: true, userToken: null };

function reducer(state, action) {
  switch (action.type) {
    case 'RESTORE_TOKEN':
      return { ...state, userToken: action.token, isLoading: false };
    case 'SIGN_IN':
      return { ...state, userToken: action.token };
    case 'SIGN_OUT':
      return { ...state, userToken: null };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    // try restore token from secure storage
    (async () => {
      const token = await SecureStore.getItemAsync('userToken');
      dispatch({ type: 'RESTORE_TOKEN', token });
    })();
  }, []);

  const auth = {
    state,
    signIn: async (email, password) => {
      // Example axios call to your backend
      try {
        // replace URL when backend ready
        const res = await axios.post('https://example.com/api/auth/login', { email, password });
        // assume backend returns { token }
        const token = res.data.token;
        await SecureStore.setItemAsync('userToken', token);
        dispatch({ type: 'SIGN_IN', token });
      } catch (e) {
        console.warn('login failed (placeholder):', e.message);
        // placeholder behaviour while backend not implemented: accept any creds
        const fakeToken = 'placeholder-token';
        await SecureStore.setItemAsync('userToken', fakeToken);
        dispatch({ type: 'SIGN_IN', token: fakeToken });
      }
    },
    signUp: async (email, password) => {
      try {
        await axios.post('https://example.com/api/auth/signup', { email, password });
        // after signup directly sign in
        await auth.signIn(email, password);
      } catch (e) {
        console.warn('signup failed (placeholder):', e.message);
        const fakeToken = 'placeholder-token';
        await SecureStore.setItemAsync('userToken', fakeToken);
        dispatch({ type: 'SIGN_IN', token: fakeToken });
      }
    },
    signOut: async () => {
      await SecureStore.deleteItemAsync('userToken');
      dispatch({ type: 'SIGN_OUT' });
    },
    guestSignIn: async () => {
      // for guest, you may optionally store a lightweight guest token or just flag in memory
      const guestToken = 'guest-token';
      await SecureStore.setItemAsync('userToken', guestToken);
      dispatch({ type: 'SIGN_IN', token: guestToken });
    },
  };

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);