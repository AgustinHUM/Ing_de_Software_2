import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Share,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  ScrollView,
} from "react-native";
import { ActivityIndicator, Text, Divider } from "react-native-paper";
import { useTheme } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import GradientButton from "../components/GradientButton";
import Seleccionable from "../components/Seleccionable";
import * as SecureStore from "expo-secure-store";
import { getGroupUsersById } from "../src/services/api";
import ErrorOverlay from "../components/ErrorOverlay";
import * as Clipboard from 'expo-clipboard';
import Pusher from 'pusher-js/react-native';
import { createMatchingSession, joinMatchingSession, startMatching, getGroupSession } from '../src/services/api';
import { useAuth } from "../AuthContext";

const APPBAR_HEIGHT = 60;
const APPBAR_BOTTOM_INSET = 10;

// Genres available for selection
const allGenres = [
  "Action",
  "Action & Adventure", 
  "Adventure",
  "Animation",
  "Anime",
  "Biography",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Fantasy",
  "Food",
  "Game Show",
  "History",
  "Horror",
  "Kids",
  "Music",
  "Musical",
  "Mystery",
  "Nature",
  "News",
  "Reality",
  "Romance",
  "Sci-Fi & Fantasy",
  "Science Fiction",
  "Soap",
  "Sports",
  "Supernatural",
  "Talk",
  "Thriller",
  "Travel",
  "TV Movie",
  "War",
  "War & Politics",
  "Western"
];

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

  const groupRef = useMemo(() => {
    return state.user.groups.find(item => item.id === groupId);
  },[state.user.groups, groupId]);

  // --- Fetch initial members once (replaces the old polling) ---
  useEffect(() => {
    let cancelled = false;
    async function fetchMembers() {
      try {
        setLoading(true);
        if (!groupId) return;
        const token = await SecureStore.getItemAsync("userToken");
        if (!token) return;
        
        // Get current user email from token
        try {
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          setCurrentUserEmail(tokenData.email);
        } catch (e) {
          console.log("Error parsing token for email:", e);
        }
        
        // Check for existing session
        try {
          const existingSession = await getGroupSession(groupId, token);
          if (existingSession && existingSession.session_id) {
            console.log("Found existing session:", existingSession.session_id);
            
            // Check if current user is already in the participants
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            const userEmail = tokenData.email;
            
            // If the API response shows we're a participant but our local state doesn't, 
            // it means we need to restore our participation status
            if (existingSession.participants && existingSession.participants[userEmail]) {
              console.log("Current user is already a participant in the session");
            }
            
            setSessionData(existingSession);
          }
        } catch (e) {
          // No existing session, which is fine
          console.log("No existing session found");
        }
        
        const list = await getGroupUsersById(groupId, token);
        if (!cancelled && Array.isArray(list)) {
          setMembers(list);
          if (groupRef.members != list.length) {
            updateUser({groups:state.user.groups.map(group => group.id != groupId ? group : {...group,members:list.length})});
          }
          outageShownRef.current = false; // volvió a responder OK
        }
      } catch (e) {
        console.log("getGroupUsers error:", e?.message || e);
        if (isGenericBackendError(e) && !outageShownRef.current) {
          setShowGenericError(true);     // se autocierrra a los 5s
          outageShownRef.current = true;
        }
      } finally {
        setLoading(false);
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

useEffect(() => {
  if (!groupId) return;          // subscribe by internal id (not joinCode)
  let pusher = null;
  let channel = null;
  let mounted = true;
  const goStart = () => navigation.navigate("Home");
  const goSwipe = () => navigation.navigate("GroupSwiping", { groupId, groupName, startWithoutPrefs });

  (async () => {
    try {
      // enable pusher debug logs (helps a lot when troubleshooting)
      Pusher.logToConsole = true;

      pusher = new Pusher('fcb8b1c83278ac43036d', {
        cluster: 'sa1',
        // forceTLS: true, // uncomment if your app requires TLS
      });

      console.log('Pusher init, connection state:', pusher.connection.state);

      // subscribe to internal-id channel
      channel = pusher.subscribe(`group-${groupId}`);

      // debug connection state changes
      pusher.connection.bind('state_change', (states) => {
        console.log('Pusher state change:', states);
      });
      pusher.connection.bind('connected', () => {
        console.log('Pusher connected, socket id:', pusher.connection.socket_id);
      });
      pusher.connection.bind('error', (err) => {
        console.log('Pusher connection error', err);
      });

      // bind the event
      channel.bind('new-member', (payload) => {
        try {
          // defensive parsing and logging
          const data = typeof payload === 'string' ? (() => {
            try { return JSON.parse(payload); } catch { return payload; }
          })() : payload;

          console.log('PUSHER EVENT new-member payload:', JSON.stringify(data));

          const name = data?.username || (data?.email ? data.email.split('@')[0] : 'User');
          const email = data?.email ?? null;

          if (!mounted) return;
          setMembers(prev => {
            const exists = prev.some(m => (email && m.email === email));
            if (exists) {
              return prev;
            }
            updateUser({groups:state.user.groups.map(group => group.id != groupId ? group : {...group,members:group.members + 1})});
            return [...prev, { email, username: name }];
          });

        } catch (err) {
          console.log('pusher event handling error', err);
        }
      });

      // Handle session creation event
      channel.bind('session-created', (payload) => {
        try {
          const data = typeof payload === 'string' ? (() => {
            try { return JSON.parse(payload); } catch { return payload; }
          })() : payload;

          console.log('PUSHER EVENT session-created payload:', JSON.stringify(data));

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
          console.log('session-created event handling error', err);
        }
      });

      // Handle participant joining session
      channel.bind('participant-joined', (payload) => {
        try {
          const data = typeof payload === 'string' ? (() => {
            try { return JSON.parse(payload); } catch { return payload; }
          })() : payload;

          console.log('PUSHER EVENT participant-joined payload:', JSON.stringify(data));

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
            console.log("Updated session after participant joined:", updatedSession);
            return updatedSession;
          });

        } catch (err) {
          console.log('participant-joined event handling error', err);
        }
      });

      // Handle participant ready (after selecting genres)
      channel.bind('participant-ready', (payload) => {
        try {
          const data = typeof payload === 'string' ? (() => {
            try { return JSON.parse(payload); } catch { return payload; }
          })() : payload;

          console.log('PUSHER EVENT participant-ready payload:', JSON.stringify(data));

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
              console.log("No session or participant not found for ready event");
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
            console.log("Updated session after participant ready:", updatedSession);
            return updatedSession;
          });

        } catch (err) {
          console.log('participant-ready event handling error', err);
        }
      });

      // Handle matching-started event
      channel.bind('matching-started', (payload) => {
        try {
          const data = typeof payload === 'string' ? (() => {
            try { return JSON.parse(payload); } catch { return payload; }
          })() : payload;

          console.log('PUSHER EVENT matching-started payload:', JSON.stringify(data));

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
            console.log("Session updated for matching start, navigating to swiping...");
            
            // Navigate using the session ID from the current session data
            setTimeout(() => {
              const navParams = { 
                sessionId: prev.session_id,
                groupId: groupId,
                groupName: groupName
              };
              console.log("Navigating to GroupSwiping with params:", navParams);
              navigation.navigate("GroupSwiping", navParams);
            }, 100);
            
            return updatedSession;
          });

        } catch (err) {
          console.log('matching-started event handling error', err);
        }
      });

      // Handle session end/cleanup
      channel.bind('session-ended', (payload) => {
        try {
          const data = typeof payload === 'string' ? (() => {
            try { return JSON.parse(payload); } catch { return payload; }
          })() : payload;

          console.log('PUSHER EVENT session-ended payload:', JSON.stringify(data));

          if (!mounted) return;
          
          // Clear session data and activities
          setSessionData(null);
          setSessionActivities([]);

        } catch (err) {
          console.log('session-ended event handling error', err);
        }
      });

      // Handle session cleanup
      channel.bind('session-cleanup', (payload) => {
        try {
          const data = typeof payload === 'string' ? (() => {
            try { return JSON.parse(payload); } catch { return payload; }
          })() : payload;

          console.log('PUSHER EVENT session-cleanup payload:', JSON.stringify(data));

          if (!mounted) return;
          
          // Clear session data and activities
          setSessionData(null);
          setSessionActivities([]);

        } catch (err) {
          console.log('session-cleanup event handling error', err);
        }
      });

    } catch (err) {
      console.log('Pusher setup error', err);
    }
  })();

  return () => {
    mounted = false;
    try {
      if (channel) {
        channel.unbind_all && channel.unbind_all();
        pusher && pusher.unsubscribe && pusher.unsubscribe(`group-${groupId}`);
      }
      if (pusher) {
        pusher.disconnect && pusher.disconnect();
      }
    } catch (e) {
      console.log('Pusher cleanup error', e);
    }
  };
}, [groupId]);


  // Matching session functions: inlined join logic where used

<<<<<<< HEAD
  const renderItem = ({ item }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 6,
      }}
    >
=======
  // Genre selection functions
  const toggleGenre = (genre, selected) => {
    console.log("Toggling genre:", genre, "selected:", selected);
    if (selected) {
      setSelectedGenres(prev => [...prev, genre]);
    } else {
      setSelectedGenres(prev => prev.filter(g => g !== genre));
    }
  };

  // handleGenreModalSubmit logic will be inlined where used

  // handleGenreModalClose logic will be inlined where used

  const handleGenreSubmit = async (genres) => {
    try {
      setSessionActionLoading(true);
      const token = await SecureStore.getItemAsync("userToken");
      
      if (creatingSession) {
        // Creator: Create session first, then join it
        console.log("Creating new session for group:", groupId);
        const response = await createMatchingSession(groupId, token);
        const sessionId = response.session_id;
        console.log("Created session:", sessionId, "now joining with genres:", genres);
        await joinMatchingSession(sessionId, genres, token);
        setCreatedSessionId(sessionId);
      } else {
        // Other users: Join existing session
        console.log("Joining existing session:", sessionData?.session_id, "with genres:", genres);
        await joinMatchingSession(sessionData.session_id, genres, token);
      }
      
      setShowGenreModal(false);
      setSelectedGenres([]);
      setCreatingSession(false);
    } catch (error) {
      console.error("Error in handleGenreSubmit:", error);
      Alert.alert("Error", error.message || "Failed to join session");
    } finally {
      setSessionActionLoading(false);
    }
  };

  const handleStartMatching = async () => {
    try {
      setSessionActionLoading(true);
      const token = await SecureStore.getItemAsync("userToken");
      await startMatching(sessionData.session_id, token);
      // Navigate to GroupSwiping screen
      navigation.navigate("GroupSwiping", { sessionId: sessionData.session_id });
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
          console.log("Opening genre modal for session creation");
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
            // Only ever called when a session exists
            console.log("Opening genre modal to join session:", sessionData.session_id);
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
        console.log("Opening genre modal for session creation");
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

  const renderItem = ({ item }) => {
    const participantStyle = getParticipantStyle(item.email);
    
    // Find the most recent session activity for this user
    const userActivity = sessionActivities
      .filter(activity => activity.email === item.email)
      .sort((a, b) => b.timestamp - a.timestamp)[0]; // Most recent first
    
    // Determine the display message
    const displayMessage = userActivity ? userActivity.message : "Has joined your group";
    
    return (
>>>>>>> rama_agustin
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.12)",
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 14,
            maxWidth: "60%",
            ...participantStyle,
          }}
        >
          <Text style={{ color: textColor, fontWeight: "800" }} numberOfLines={1}>
            {item.username || item.email || "User"}
          </Text>
        </View>
        <Text style={{ color: textColor, opacity: 0.85 }}>
          {displayMessage}
        </Text>
      </View>
    );
  };


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

            </View>

            {/* Separador */}
            <View
              style={{
                height: 1,
                backgroundColor: "rgba(255,255,255,0.2)",
                marginTop: 24,
              }}
            />

            {/* Lista de miembros (actualizada en tiempo real vía Pusher) */}
            <FlatList
              data={members}
              keyExtractor={(u, i) => (u.email || u.username || `m${i}`)}
              renderItem={renderItem}
              ListEmptyComponent={
                <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 20 }} />
              }
              ListFooterComponent={
                members.length === 1 ? (
                  <View style={{ marginTop: 16, alignItems: "center" }}>
                    <Text style={{ color: textColor, opacity: 0.8, fontStyle: "italic" }}>
                      Waiting for others to join...
                    </Text>
                  </View>
                ) : null
              }
              contentContainerStyle={{ paddingBottom: 16 }}
            />
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
                  style={{ paddingVertical: 18, borderRadius: 16 }}
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

      {/* Genre Selection Modal */}
      <Modal
        visible={showGenreModal}
        animationType="slide"
        onRequestClose={() => {
          setSelectedGenres([]);
          setShowGenreModal(false);
          setCreatingSession(false);
        }}
        transparent={false}
      >
        <View style={{ flex: 1, flexDirection:'column', padding: 25, paddingVertical: Platform.OS === 'ios' ? 70 : 35, backgroundColor: theme.colors.background }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ width: 40 }} />
            <Text style={{ color: theme.colors.text, fontWeight: '700', fontSize: 18, textAlign: 'center', flex: 1 }}>Select Genres</Text>
            <TouchableOpacity
              onPress={() => handleGenreSubmit(selectedGenres)}
              disabled={sessionActionLoading}
            >
              <Text style={{ color: theme.colors.primary, fontSize: 16, fontWeight: '600', opacity: sessionActionLoading ? 0.5 : 1 }}>
                {selectedGenres.length > 0 ? (sessionActionLoading ? 'Joining...' : 'Join') : 'Skip'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <Divider
            style={{
              backgroundColor: theme.colors.primary,
              width: "100%",
              height: 5,
              borderRadius: 5,
            }}
          />
          
          <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
            {allGenres.map(genre => (
              <View key={genre} style={{ marginTop: 12 }}>
                <Seleccionable
                  label={genre}
                  initialSelected={selectedGenres.includes(genre)}
                  onSelect={(selected) => toggleGenre(genre, selected)}
                  width='100%'
                  fontSize={18}
                />
              </View>
            ))}
          </ScrollView>
          
          <Divider
            style={{
              backgroundColor: theme.colors.primary,
              width: "100%",
              height: 5,
              borderRadius: 5,
              marginBottom: 16
            }}
          />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
