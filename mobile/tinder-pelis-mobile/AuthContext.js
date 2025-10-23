// AuthContext.js
import React, { createContext, useContext, useReducer, useEffect, useState, useCallback, useRef } from 'react';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from './src/services/api';
const AuthContext = createContext();

const initialState = { isLoading: true, userToken: null, user: null };
const signedOutState = { isLoading: false, userToken: null, user: null };

function reducer(state, action) {
  switch (action.type) {
    case 'RESTORE_TOKEN':
      return { ...state, userToken: action.token, user: action.user, isLoading: false };
    case 'SIGN_IN':
      return { ...state, userToken: action.token, user: action.user, isLoading: false };
    case 'SIGN_OUT':
      return { ...signedOutState };
    case 'UPDATE_USER':
      return { ...state, user: action.user };
    default:
      return state;
  }
}

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
        const email = await SecureStore.getItemAsync('lastLoginEmail');
        const name = await SecureStore.getItemAsync('userName');
        const storedFormPending = await SecureStore.getItemAsync('formPending');
        const user = email ? { 
          email, 
          name: name || email.split('@')[0], 
          formPending: storedFormPending === 'true' 
        } : null;
        dispatch({ type: 'RESTORE_TOKEN', token, user }); 
      } catch {
        dispatch({ type: 'RESTORE_TOKEN', token: null, user: null });
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
      let data = null;
      try {data = await res.json();} catch {}
      console.log(data);
      if (!res.ok) {
        let msg = null;
        try { msg = data?.msg || `HTTP ${res.status}`; } catch {}
        console.log(msg);
        throw new Error(msg);
      }

      
      const token = data?.id_token || data?.access_token || 'session-ok';
      const user = {
        email: email,
        name: data?.nombre_cuenta || email.split('@')[0],
        formPending: data?.formulario_pendiente 
      };

      try {
        await SecureStore.setItemAsync('userToken', token);
        await SecureStore.setItemAsync('lastLoginEmail', email);
        await SecureStore.setItemAsync('userName', user.name);
        await SecureStore.setItemAsync('formPending', String(user.formPending));
      } catch (e) {
        console.warn('Error guardando token/email en SecureStore', e);
      }

      dispatch({ type: 'SIGN_IN', token, user });
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
        const msg = data?.msg || `HTTP ${res.status}`;
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
          await SecureStore.deleteItemAsync('lastLoginEmail');
        }
      } catch (e) {
        console.warn('Error limpiando SecureStore en signOut', e);
      }
    });
  }

  function guestSignIn() {
    const token = `guest_${Math.random().toString(36).slice(2)}_${Date.now()}`;
    const user = { email: 'guest@moviemingle.com', name: 'Guest' };
    dispatch({ type: 'SIGN_IN', token, user });
    return { token };
  }

  async function setFormPendingAsync(formPending) {
    try {
      await SecureStore.setItemAsync('formPending', String(formPending));
      const updatedUser = { ...state.user, formPending };
      dispatch({ type: 'SIGN_IN', token: state.userToken, user: updatedUser });
    } catch (e) {
      console.warn('Error updating formPending in SecureStore', e);
    }
  }


  function updateUser(update) {
    const updatedUser = typeof update === 'function' ? update(state.user) : { ...(state.user || {}), ...update };
    dispatch({ type: 'UPDATE_USER', user: updatedUser });
  }

  const value = {
    state,
    busy,
    setBusy,
    withBusy,
    signIn,
    signUp,
    signOut,
    guestSignIn,
    setFormPendingAsync,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
