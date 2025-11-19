import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Share,
  Alert,
  Image,
  ScrollView
} from "react-native";
import { ActivityIndicator, Text, Divider } from "react-native-paper";
import { useTheme } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import GradientButton from "../components/GradientButton";
import Seleccionable from "../components/Seleccionable";
import * as SecureStore from "expo-secure-store";
import ErrorOverlay from "../components/ErrorOverlay";
import * as Clipboard from 'expo-clipboard';
import Pusher from 'pusher-js/react-native';
import { createMatchSession, joinMatchSession, startMatchSession, getGroupSession, getGroupUsersById, leaveGroup } from '../src/services/api';
import { useAuth } from "../AuthContext"; 
import LoadingOverlay from "../components/LoadingOverlay";
import LoadingBox from "../components/LoadingBox";
import GenreSelector from "../components/GenreSelector";
import { localAvatars } from "./Profile";

const APPBAR_HEIGHT = 60;
const APPBAR_BOTTOM_INSET = 10;

// helper: id interno -> código lindo
const toJoinCode = (groupId) => groupId * 7 + 13;

export default function GroupCode({ navigation, route }) {
  const theme = useTheme();
  const { top, bottom } = useSafeAreaInsets();
  const textColor = theme.colors?.text ?? "#fff";
  const {state,updateUser} = useAuth();
  // Params posibles:
  const codeParam = route?.params?.code;            // flujo viejo (join code)
  const groupIdParam = route?.params?.groupId;      // flujo nuevo (desde Groups)
  const groupNameParam = route?.params?.groupName;

  // groupId a usar: prioridad al param nuevo; si no, lo calculamos desde code
  const groupId = useMemo(() => {
    if (Number.isFinite(groupIdParam)) return groupIdParam;
    const n = Number(codeParam);
    if (Number.isFinite(n)) return Math.floor((n - 13) / 7);
    return null;
  }, [groupIdParam, codeParam]);

  // código lindo que mostramos: si vino id, lo generamos; si no, usamos codeParam
  const joinCode = useMemo(() => {
    if (Number.isFinite(groupIdParam)) return toJoinCode(groupIdParam);
    const n = Number(codeParam);
    return Number.isFinite(n) ? n : null;
  }, [groupIdParam, codeParam]);

  const [groupName, setGroupName] = useState(groupNameParam ?? "Group");
  const [members, setMembers] = useState([]);       // [{email, username}]
  const [startWithoutPrefs, setStartWithoutPrefs] = useState(true);

  // Error overlay (solo para errores genéricos del back)
  const [showGenericError, setShowGenericError] = useState(false);
  const outageShownRef = useRef(false); // evita overlay repetido durante la misma caída
  const [loading, setLoading] = useState(false);

  // Matching session state
  const [sessionData, setSessionData] = useState(null);
  const [showGenreModal, setShowGenreModal] = useState(false);
  // Track if modal is for creating a session (creator flow)
  const [creatingSession, setCreatingSession] = useState(false);
  // Store the sessionId just created (for immediate join)
  const [createdSessionId, setCreatedSessionId] = useState(null);
  const [sessionActionLoading, setSessionActionLoading] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  
  // Genre selection state
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [sessionActivities, setSessionActivities] = useState([]); // [{message, timestamp, email}]

  const isGenericBackendError = (err) => {
    const msg = (err?.msg || "").toLowerCase();
    return (
      msg.startsWith("http ") ||       // "HTTP 500", etc.
      msg.includes("timeout") ||       // "Request timeout"
      msg.includes("no response") ||   // "No response from server"
      msg === "request error"
    );
  };

  // retry helpers for avatars (per-email)
  const reloadMapRef = useRef({});           // keeps per-email retry counts
  const [reloadTick, setReloadTick] = useState(0);
  const MAX_AVATAR_RETRIES = 5;

  const groupRef = useMemo(() => {
    return state.user.groups.find(item => item.id === groupId);
  },[state.user.groups, groupId]);

  const [waiting, setWaiting] = useState(false);
  
  useEffect(() => {
    setWaiting(true);
    if (members.length > 0) {
      const timer = setTimeout(() => {
        setWaiting(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [members]);


  // --- Fetch initial members once (replaces the old polling) ---
  useEffect(() => {
    let cancelled = false;
    async function fetchMembers() {
      try {
        if (!groupId) return;
        const token = await SecureStore.getItemAsync("userToken");
        if (!token) return;
        
        // Get current user email from token
        try {
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          setCurrentUserEmail(tokenData.email);
        } catch (e) {
          //console.log("Error parsing token for email:", e);
        }
        
        // Check for existing session
        try {
          const existingSession = await getGroupSession(groupId, token);
          if (existingSession && existingSession.session_id) {
            //console.log("Found existing session:", existingSession.session_id);
            
            // Check if current user is already in the participants
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            const userEmail = tokenData.email;
            
            // If the API response shows we're a participant but our local state doesn't, 
            // it means we need to restore our participation status
            if (existingSession.participants && existingSession.participants[userEmail]) {
              //console.log("Current user is already a participant in the session");
            }
            
            setSessionData(existingSession);
          }
        } catch (e) {
          // No existing session, which is fine
          //console.log("No existing session found");
        }
        
        const list = await getGroupUsersById(groupId, token);
        if (!cancelled && Array.isArray(list)) {
          console.log("Fetched group members:", list);
          setMembers(list);
          // Update member count in state when we get authoritative member list
          updateUser({groups:state.user.groups.map(group => group.id != groupId ? group : {...group,members:list.length})});
          outageShownRef.current = false; // volvió a responder OK
        }
      } catch (e) {
        //console.log("getGroupUsers error:", e?.message || e);
        if (isGenericBackendError(e) && !outageShownRef.current) {
          setShowGenericError(true);     // se autocierrra a los 5s
          outageShownRef.current = true;
        }
      } 
    }

    if (groupId) {
      fetchMembers(); // carga inicial
    } else {
      setMembers([]);
    }

    return () => {
      cancelled = true;
    };
  }, [groupId]);

  const userRef = useRef(state.user);
  useEffect(() => { userRef.current = state.user; }, [state.user]);

  // Pusher references
  const channelRef = useRef(null);
  const pusherRef = useRef(null);

  const currentUserEmailRef = useRef(currentUserEmail);
  useEffect(() => { currentUserEmailRef.current = currentUserEmail; }, [currentUserEmail]);

  // helper to safely parse payloads (keeps code DRY)
  const parsePayload = (payload) => {
    if (!payload) return null;
    if (typeof payload === 'string') {
      try { return JSON.parse(payload); } catch { return payload; }
    }
    return payload;
  };

  useEffect(() => {
    if (!groupId) return;
    let mounted = true;

    (async () => {
      try {
        Pusher.logToConsole = true;

        // if there's an existing pusher instance, tear it down first (avoid duplicate connections)
        try {
          if (pusherRef.current) {
            pusherRef.current.disconnect && pusherRef.current.disconnect();
            channelRef.current = null;
            pusherRef.current = null;
          }
        } catch (_) {}

        const pusher = new Pusher('fcb8b1c83278ac43036d', {
          cluster: 'sa1',
          // forceTLS: true,
        });
        pusherRef.current = pusher;

        const channel = pusher.subscribe(`group-${groupId}`);
        channelRef.current = channel;

        // Generic connection logging
        pusher.connection.bind('error', (err) => {
          // keep it quiet in production, but helpful while debugging
          console.warn('Pusher connection error', err);
        });

        // --- new-member ---
        const onNewMember = (payload) => {
          const data = parsePayload(payload);
          if (!data) return;
          const email = data.email ?? null;
          const username = data.username ?? (email ? email.split('@')[0] : 'User');

          // We require an email (or some unique id) to avoid duplicates
          if (!email) {
            console.warn('[pusher] Ignoring new-member without email:', data);
            return;
          }

          // check that user still belongs to this group (use latest user state)
          const user = userRef.current;
          if (!user || !Array.isArray(user.groups) || !user.groups.some(g => g.id === groupId)) return;

          if (!mounted) return;
          setMembers(prev => {
            // dedupe by email 
            if (prev.some(m => m.email === email)) return prev;
            const next = [...prev, { email, username }];
            
            // Update the member count based on the actual member list size
            updateUser(prevUser => ({
              ...prevUser,
              groups: prevUser.groups.map(g => 
                g.id === groupId ? { ...g, members: next.length } : g
              )
            }));
            
            return next;
          });
        };

        channel.bind('new-member', onNewMember);

        // --- member-left ---
        const onMemberLeft = (payload) => {
          const data = parsePayload(payload);
          if (!data) return;
          const email = data.email ?? null;
          if (!email) {
            console.warn('[pusher] Ignoring member-left without email:', data);
            return;
          }

          const user = userRef.current;
          if (!user || !Array.isArray(user.groups) || !user.groups.some(g => g.id === groupId)) return;

          if (!mounted) return;
          
          // Update members list first to get accurate count
          setMembers(prev => {
            const next = prev.filter(m => m.email !== email);
            if (next.length === prev.length) return prev; // nothing removed
            
            // Then update the member count based on the filtered list
            updateUser(prevUser => ({
              ...prevUser,
              groups: prevUser.groups.map(g => {
                if (g.id === groupId) {
                  return { ...g, members: next.length };
                }
                return g;
              })
            }));
            
            return next;
          });
        };

        channel.bind('member-left', onMemberLeft);

        // Handle session creation event
        channel.bind('session-created', (payload) => {
          try {
            const data = typeof payload === 'string' ? (() => {
              try { return JSON.parse(payload); } catch { return payload; }
            })() : payload;

            if (!mounted) return;
            
            // Update session data with the created session
            setSessionData({
              session_id: data.session_id,
              creator_email: data.creator_email,
              status: 'waiting_for_participants',
              participants: {},
              group_id: groupId
            });

            // Add session activity for the creator
            setSessionActivities(prev => [...prev, {
              message: data.message || "created a session",
              timestamp: new Date(),
              email: data.creator_email,
              action: data.action || 'created_session'
            }]);

          } catch (err) {
            //console.log('session-created event handling error', err);
          }
        });

        // Handle participant joining session
        channel.bind('participant-joined', (payload) => {
          try {
            const data = typeof payload === 'string' ? (() => {
              try { return JSON.parse(payload); } catch { return payload; }
            })() : payload;

            if (!mounted) return;
            
            // Add session activity
            setSessionActivities(prev => [...prev, {
              message: data.message || "joined the session",
              timestamp: new Date(),
              email: data.email,
              action: data.action || 'joined_session'
            }]);
            
            setSessionData(prev => {
              if (!prev) return prev;
              const updatedSession = {
                ...prev,
                participants: {
                  ...prev.participants,
                  [data.email]: {
                    username: data.username,
                    status: 'joined',
                    joined_at: new Date().toISOString()
                  }
                }
              };
              return updatedSession;
            });

          } catch (err) {
            //console.log('participant-joined event handling error', err);
          }
        });

        // Handle participant ready (after selecting genres)
        channel.bind('participant-ready', (payload) => {
          try {
            const data = typeof payload === 'string' ? (() => {
              try { return JSON.parse(payload); } catch { return payload; }
            })() : payload;

            if (!mounted) return;
            
            // Add session activity
            setSessionActivities(prev => [...prev, {
              message: data.message || "is ready to match",
              timestamp: new Date(),
              email: data.email,
              action: data.action || 'ready_to_match'
            }]);
            
            setSessionData(prev => {
              if (!prev || !prev.participants[data.email]) {
                return prev;
              }
              const updatedSession = {
                ...prev,
                participants: {
                  ...prev.participants,
                  [data.email]: {
                    ...prev.participants[data.email],
                    status: 'ready'
                  }
                }
              };
              return updatedSession;
            });

          } catch (err) {
            //console.log('participant-ready event handling error', err);
          }
        });

        // Handle matching-started event
        channel.bind('matching-started', (payload) => {
          try {
            const data = typeof payload === 'string' ? (() => {
              try { return JSON.parse(payload); } catch { return payload; }
            })() : payload;

            if (!mounted) return;
            
            // Add session activity
            setSessionActivities(prev => [...prev, {
              message: data.message || "Matching started!",
              timestamp: new Date(),
              email: null, // System message
              action: data.action || 'started_matching'
            }]);
            
            setSessionData(prev => {
              if (!prev) return prev;
              const updatedSession = {
                ...prev,
                status: 'matching',
                movies: data.movies || []
              };
              
              // Navigate using the session ID from the current session data
              setTimeout(() => {
                const navParams = { 
                  sessionId: prev.session_id,
                  groupId: groupId,
                  groupName: groupName,
                  isSoloSession: false
                };
                navigation.navigate("GroupSwiping", navParams);
              }, 100);
              
              return updatedSession;
            });

          } catch (err) {
            //console.log('matching-started event handling error', err);
          }
        });

        // Handle session end/cleanup
        channel.bind('session-ended', (payload) => {
          try {
            const data = typeof payload === 'string' ? (() => {
              try { return JSON.parse(payload); } catch { return payload; }
            })() : payload;

            if (!mounted) return;
            
            // Clear session data and activities
            setSessionData(null);
            setSessionActivities([]);

          } catch (err) {
            //console.log('session-ended event handling error', err);
          }
        });

        // Handle session cleanup
        channel.bind('session-cleanup', (payload) => {
          try {
            const data = typeof payload === 'string' ? (() => {
              try { return JSON.parse(payload); } catch { return payload; }
            })() : payload;

            if (!mounted) return;
            
            // Clear session data and activities
            setSessionData(null);
            setSessionActivities([]);

          } catch (err) {
            //console.log('session-cleanup event handling error', err);
          }
        });

        try {
          const token = await SecureStore.getItemAsync("userToken");
          if (token && mounted) {
            const list = await getGroupUsersById(groupId, token);
            if (!mounted) return;

            // normalize server list and dedupe (email required)
            const serverList = Array.isArray(list) ? list.filter(u => u && u.email).map(u => ({ email: u.email, username: u.username || u.email.split('@')[0] })) : [];

            // merge existing `members` (from any events that arrived before fetch) with serverList
            setMembers(prev => {
              const map = new Map();
              // prefer server version if exists (server authoritative)
              serverList.forEach(u => map.set(u.email, u));
              (prev || []).forEach(u => {
                if (u && u.email && !map.has(u.email)) {
                  map.set(u.email, u); // keep event-only entries if server didn't include them
                }
              });
              return Array.from(map.values());
            });

            outageShownRef.current = false;
          }
        } catch (e) {
          // fetch error handled elsewhere in your code
          console.warn('error fetching initial members', e);
        }

      } catch (err) {
        console.warn('Pusher setup error', err);
      }
    })();

    return () => {
      mounted = false;
      try {
        if (channelRef.current) {
          // unbind specific handlers (if available)
          try { channelRef.current.unbind('new-member'); } catch (e) {}
          try { channelRef.current.unbind('member-left'); } catch (e) {}
          // fallback to unbind_all if supported by your pusher client
          try { channelRef.current.unbind_all && channelRef.current.unbind_all(); } catch (e) {}
        }
        if (pusherRef.current) {
          try { pusherRef.current.unsubscribe && pusherRef.current.unsubscribe(`group-${groupId}`); } catch (e) {}
          try { pusherRef.current.disconnect && pusherRef.current.disconnect(); } catch (e) {}
        }
      } catch (e) {
        console.warn('Pusher cleanup error', e);
      } finally {
        channelRef.current = null;
        pusherRef.current = null;
      }
    };
  }, [groupId]);


  // Genre selection functions
  const toggleGenre = (genre, selected) => {
    if (selected) {
      setSelectedGenres(prev => [...prev, genre]);
    } else {
      setSelectedGenres(prev => prev.filter(g => g !== genre));
    }
  };

  const handleGenreSubmit = async (genres) => {
    try {
      setSessionActionLoading(true);
      const token = await SecureStore.getItemAsync("userToken");
      
      if (creatingSession) {
        // Creator: Create session first, then join it
        const response = await createMatchSession(groupId, token);
        const sessionId = response.session_id;
        await joinMatchSession(sessionId, genres, token);
        setCreatedSessionId(sessionId);
      } else {
        // Other users: Join existing session
        await joinMatchSession(sessionData.session_id, genres, token);
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to submit genres");
    }
  }

  const handleStartMatching = async () => {
    try {
      setSessionActionLoading(true);
      const token = await SecureStore.getItemAsync("userToken");
      await startMatchSession(sessionData.session_id, token);
      // Navigate to GroupSwiping screen
      navigation.navigate("GroupSwiping", { sessionId: sessionData.session_id, isSoloSession:false, groupName:groupName });
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to start matching");
    } finally {
      setSessionActionLoading(false);
    }
  };

  // Determine what button to show
  const getSessionButton = () => {
    if (!sessionData) {
      // No session exists - show "Start Session" for everyone
      return {
        text: "Start Session",
        action: () => {
          setCreatingSession(true);
          setShowGenreModal(true);
        },
        disabled: sessionActionLoading
      };
    }

    const isCreator = sessionData.creator_email === currentUserEmail;
    const isParticipant = currentUserEmail && sessionData.participants?.[currentUserEmail];
    
    if (sessionData.status === "waiting_for_participants") {
      if (isCreator) {
        const readyCount = Object.values(sessionData.participants || {})
          .filter(p => p.status === "ready").length;
        return {
          text: readyCount > 0 ? "Start Match" : "Waiting for participants...",
          action: handleStartMatching,
          disabled: sessionActionLoading || readyCount === 0
        };
      } else if (!isParticipant) {
        return {
          text: "Join Session",
          action: () => {
            setCreatingSession(false);
            setShowGenreModal(true);
          },
          disabled: sessionActionLoading
        };
      } else {
        return {
          text: "Waiting for match to start...",
          action: null,
          disabled: true
        };
      }
    } else if (sessionData.status === "matching") {
      return {
        text: "Go to Matching",
        action: () => Alert.alert("Info", "Matching screen will be implemented next"),
        disabled: false
      };
    }

    return {
      text: "Start Session",
      action: () => {
        setShowGenreModal(true);
      },
      disabled: sessionActionLoading
    };
  };

  // Get participant status styling
  const getParticipantStyle = (memberEmail) => {
    if (!sessionData) return {};
    
    const participant = sessionData.participants?.[memberEmail];
    const isCreator = sessionData.creator_email === memberEmail;
    
    if (isCreator) {
      return { borderWidth: 2, borderColor: theme.colors?.primary ?? "#FF8A00" };
    } else if (participant?.status === "ready") {
      return { borderWidth: 2, borderColor: theme.colors?.secondary ?? "#FFC300" };
    } else if (participant?.status === "joined") {
      return { borderWidth: 1, borderColor: theme.colors?.primary ?? "#FF8A00", opacity: 0.7 };
    }
    
    return {};
  };

  const renderMemberRow = (item, index) => {
    const participantStyle = getParticipantStyle(item.email);
    const userKeyBase = item.email || item.username || JSON.stringify(item);
    const retryCount = reloadMapRef.current[userKeyBase] || 0;
    const rowKey = `${userKeyBase}-${item.avatar || 0}-${retryCount}`;

    // Find the most recent session activity for this user
    const userActivity = sessionActivities
      .filter(activity => activity.email === item.email)
      .sort((a, b) => b.timestamp - a.timestamp)[0]; // Most recent first

    const displayMessage = userActivity ? userActivity.message : "Has joined your group";

    // safe avatar lookup with fallback
    const avatarIndex = Number.isFinite(item?.avatar) ? item.avatar : 0;
    console.log('Avatar index for member', item.username, ':', item.avatar);
    const avatarSource = (localAvatars && localAvatars[avatarIndex] && localAvatars[avatarIndex].avatar) ? localAvatars[avatarIndex].avatar : localAvatars[3].avatar;
    //console.log('Rendering member row:', item.username, 'Avatar source:', avatarSource);
    return (
      <View key={rowKey} style={{ marginVertical: 6 }}>
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.12)",
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 14,
            width: "100%",
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
            ...participantStyle,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex:1}}>
            {waiting ? (
              <LoadingBox style={{ width:48, height:48, marginRight: 24, borderRadius:99 }} />
            ) : (
              <Image
                source={ avatarSource }
                defaultSource={ localAvatars[0].avatar }
                style={{ width: 48, height: 48, marginRight: 24, borderRadius:99 }}
                resizeMode="contain"
                onError={() => {
                  const emailKey = userKeyBase;
                  const tries = (reloadMapRef.current[emailKey] || 0) + 1;
                  if (tries <= MAX_AVATAR_RETRIES) {
                    reloadMapRef.current[emailKey] = tries;
                    // bump reloadTick after a small backoff so the row remounts
                    setTimeout(() => setReloadTick(t => t + 1), 200 * tries);
                  } else {
                    console.warn(`Failed to load avatar for ${emailKey} after ${tries} attempts.`);
                  }
                }}
              />
            )}
            <Text style={{ color: textColor, fontWeight: "800" }} numberOfLines={1}>
              {item.username || item.email || "User"}
            </Text>
          </View>

          <Text style={{ color: textColor, opacity: 0.85 }}>
            {displayMessage}
          </Text>
        </View>
      </View>
    );
  };

  const handleLeaveGroup = () => {
    Alert.alert(
      "Leave Group",
      'Are you sure you want to leave this group?',
      [
        { text: "Cancel", style: "cancel" }, 
        { text: "Leave", style: "destructive", onPress: async () => {
            try {
              setLoading(true);
              const token = await SecureStore.getItemAsync("userToken");
              if (!token || !groupId) {
                throw new Error("Missing auth token or group ID");
              }
              await leaveGroup(groupId, token);

              // Unsubscribe from pusher/channel immediately — we don't care about updates anymore
              try {
                if (channelRef.current) {
                  channelRef.current.unbind_all && channelRef.current.unbind_all();
                }
                if (pusherRef.current) {
                  pusherRef.current.unsubscribe && pusherRef.current.unsubscribe(`group-${groupId}`);
                  pusherRef.current.disconnect && pusherRef.current.disconnect();
                }
              } catch (e) {
                //console.log('pusher unsubscribe error', e);
              } finally {
                channelRef.current = null;
                pusherRef.current = null;
              }

              updateUser({groups:state.user.groups.filter(group => group.id != groupId)});
              navigation.navigate("Groups");
            } catch (e) {
              //console.log("leaveGroup error:", e?.message || e);
              Alert.alert("Error", "Could not leave the group. Please try again later.");
            } finally {
              setLoading(false); }
          } 
        }
      ]
    );
  }

  const codeLabel = (joinCode ?? "------").toString().toUpperCase();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      {/* Overlay de error genérico */}
      <ErrorOverlay
        visible={showGenericError}
        onHide={() => setShowGenericError(false)}
      />
      <LoadingOverlay visible={loading} />
      <View
        style={{
          flex: 1,
          paddingHorizontal: 20,
          paddingTop: top + 8,
          paddingBottom: bottom + APPBAR_BOTTOM_INSET + APPBAR_HEIGHT + 16,
        }}
      >
        
        {/* Header simple */}
        <View style={{ flexDirection: "row", alignItems: "center", height: 48 }}>
          <TouchableOpacity onPress={() => navigation.navigate("Groups")} style={{ padding: 8 }}>
            <MaterialCommunityIcons name="chevron-left" size={28} color={textColor} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ textAlign: "center", fontSize: 22, fontWeight: "700", color: textColor }}>
              {groupName}
            </Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        <View style={{ height: 24 }} />

        <Text style={{ fontSize: 18, textAlign: "center", color: textColor, opacity: 0.9 }}>
          Use the code below to invite{"\n"}friends to your group
        </Text>

        <View style={{ height: 24 }} />

        {/* Si no hay params válidos */}
        {!groupId ? (
          <>
            <View style={{ alignItems: "center", marginTop: 12 }}>
              <Text style={{ color: textColor, opacity: 0.85, textAlign: "center" }}>
                No group selected. Please open this screen from “My Groups”.
              </Text>
            </View>
            <View style={{ height: 20 }} />
            <GradientButton onPress={() => navigation.navigate("Groups")} style={{ paddingVertical: 16, borderRadius: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: "900", textAlign: "center" }}>
                Go to My Groups
              </Text>
            </GradientButton>
          </>
        ) : (
          <>
            {/* Caja grande con el código */}
            <View
              style={{
                alignSelf: "center",
                paddingVertical: 28,
                paddingHorizontal: 32,
                borderRadius: 18,
                backgroundColor: theme.colors?.surface ?? "rgba(33,5,65,1)",
                borderWidth: 3,
                borderColor: theme.colors?.primary ?? "rgba(255,138,0,1)",
                minWidth: 220,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 44,
                  fontWeight: "900",
                  letterSpacing: 3,
                  color: textColor,
                }}
              >
                {codeLabel}
              </Text>
            </View>

            {/* Acciones opcionales */}
            <View
              style={{
                marginTop: 14,
                flexDirection: "row",
                gap: 16,
                justifyContent: "center",
              }}
            >
              {/* Copy button */}
              <TouchableOpacity
                onPress={async () => { await Clipboard.setStringAsync(codeLabel); }}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  backgroundColor: theme.colors?.accent ?? "rgba(50,23,68,1)",
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons name="content-copy" size={18} color={textColor} style={{ marginRight: 8 }} />
                  <Text style={{ color: textColor, fontWeight: "700" }}>Copy</Text>
                </View>
              </TouchableOpacity>

              {/* Share button */}
              <TouchableOpacity
                onPress={async () => {
                  try {
                    await Share.share({ message: `Join my group with this code: ${codeLabel}` });
                  } catch {}
                }}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  backgroundColor: theme.colors?.accent ?? "rgba(50,23,68,1)",
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons name="share-variant" size={18} color={textColor} style={{ marginRight: 8 }} />
                  <Text style={{ color: textColor, fontWeight: "700" }}>Share</Text>
                </View>
              </TouchableOpacity>

              {/* Trash (Leave group) small button - red */}
              <TouchableOpacity
                onPress={handleLeaveGroup}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                  backgroundColor: '#FF4444',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons name="trash-can-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#fff', fontWeight: "700" }}>Leave</Text>
                </View>
              </TouchableOpacity>

            </View>

            {/* Separador */}
            <View
              style={{
                height: 1,
                backgroundColor: "rgba(255,255,255,0.2)",
                marginTop: 24,
              }}
            />

            <ScrollView
              contentContainerStyle={{ paddingBottom: 16 }}
              // include reloadTick in key to force remount of ScrollView if retries change
              key={`members-scroll-${reloadTick}`}
              showsVerticalScrollIndicator={false}
            >
              {members.length === 0 ? (
                <>
                  <LoadingBox style={{width:'100%', height:60,borderRadius:15, alignSelf:'center', marginVertical:8}} />
                  <LoadingBox style={{width:'100%', height:60,borderRadius:15, alignSelf:'center', marginVertical:8}} />
                  <LoadingBox style={{width:'100%', height:60,borderRadius:15, alignSelf:'center', marginVertical:8}} />
                </>
              ) : (
                members.map((m, i) => renderMemberRow(m, i))
              )}

              {members.length === 1 && (
                <View style={{ alignItems: "center", marginTop: 8 }}>
                  <Text style={{ color: textColor, opacity: 0.8, fontStyle: "italic" }}>
                    Waiting for others to join...
                  </Text>
                </View>
              )}
            </ScrollView>

            <View
              style={{
                height: 1,
                backgroundColor: "rgba(255,255,255,0.2)",
              }}
            />

            <View style={{ height: 20 }} />

            {/* Session Management Button */}
            {(() => {
              const sessionButton = getSessionButton();
              return (
                <GradientButton 
                  onPress={sessionButton.action}
                  disabled={sessionButton.disabled}
                  loading={sessionActionLoading}
                >
                  {sessionButton.text}
                </GradientButton>
              );
            })()}

            {/* Session Status Info */}
            {sessionData && (
              <View style={{ marginTop: 16 }}>
                <Text style={{ color: textColor, opacity: 0.8, textAlign: 'center' }}>
                  Session Status: {sessionData.status.replace('_', ' ')}
                </Text>
                {sessionData.status === 'waiting_for_participants' && (
                  <Text style={{ color: textColor, opacity: 0.6, textAlign: 'center', fontSize: 12, marginTop: 4 }}>
                    {Object.values(sessionData.participants || {}).filter(p => p.status === 'ready').length} participants ready
                  </Text>
                )}
              </View>
            )}
          </>
        )}
      </View>

      <GenreSelector 
        visible={showGenreModal}
        onClose={() => setShowGenreModal(false)}
        onSubmit={async (genres) => {
          const token = await SecureStore.getItemAsync("userToken");
          if (creatingSession) {
            const response = await createMatchSession(groupId, token);
            await joinMatchSession(response.session_id, genres, token);
          } else if (sessionData) {
            await joinMatchSession(sessionData.session_id, genres, token);
          }
          setShowGenreModal(false);
        }}
        loading={sessionActionLoading}
      />
    </KeyboardAvoidingView>
  );
}
