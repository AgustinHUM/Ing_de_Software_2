// AuthContext.js
import React, { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';

const AuthContext = createContext();

const initialState = { isLoading: true, userToken: null };
const signedOutState = { isLoading: false, userToken: null };

function reducer(state, action) {
  switch (action.type) {
    case 'RESTORE_TOKEN':
      return { ...state, userToken: action.token, isLoading: false };
    case 'SIGN_IN':
      return { ...state, userToken: action.token, isLoading: false };
    case 'SIGN_OUT':
      return { ...signedOutState };
    default:
      return state;
  }
}

const API_URL = 'http://172.20.10.10:5000';

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const [busy, setBusy] = useState(false);

  const withBusy = useCallback(async (fn) => {
    setBusy(true);
    try {
      return await fn();
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        dispatch({ type: 'RESTORE_TOKEN', token });
      } catch {
        dispatch({ type: 'RESTORE_TOKEN', token: null });
      }
    })();
  }, []);

  async function signIn(email, password) {
    return withBusy(async () => {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try { const j = await res.json(); msg = j?.error || j?.detail || msg; } catch {}
        throw new Error(msg);
      }

      const data = await res.json();
      const token = data?.access_token || 'session-ok';

      try {
        await SecureStore.setItemAsync('userToken', token);
        await SecureStore.setItemAsync('lastLoginEmail', email);
      } catch (e) {
        console.warn('Error guardando token/email en SecureStore', e);
      }

      dispatch({ type: 'SIGN_IN', token });
      return { data };
    });
  }

  async function signUp(email, nombre, password) {
    return withBusy(async () => {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username: nombre, password }),
      });

      let data = null;
      try { data = await res.json(); } catch {}

      if (!res.ok) {
        const msg = data?.error || data?.detail || `HTTP ${res.status}`;
        throw new Error(msg);
      }

      return { status: data?.status || 'OK' };
    });
  }

  async function signOut() {
    return withBusy(async () => {
      dispatch({ type: 'SIGN_OUT' });

      try {
        await SecureStore.deleteItemAsync('userToken');

        const email = await SecureStore.getItemAsync('lastLoginEmail');
        if (email) {
          const safeEmail = email.toLowerCase().replace(/[^a-z0-9._-]/g, '_');
          const key = `firstLoginDone__${safeEmail}`;
          await SecureStore.deleteItemAsync(key);
          await SecureStore.deleteItemAsync('lastLoginEmail');
        }
      } catch (e) {
        console.warn('Error limpiando SecureStore en signOut', e);
      }
    });
  }

  function guestSignIn() {
    const token = `guest_${Math.random().toString(36).slice(2)}_${Date.now()}`;
    dispatch({ type: 'SIGN_IN', token });
    return { token };
  }

  const value = { state, busy, setBusy, withBusy, signIn, signUp, signOut, guestSignIn };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
