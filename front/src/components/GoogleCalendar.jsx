import React, { useEffect, useState } from 'react';
import { gapi } from 'gapi-script';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import { CLIENT_ID, API_KEY, SCOPES } from '../googleConfig';

const localizer = momentLocalizer(moment);

const GoogleCalendar = () => {
    const [events, setEvents] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentView, setCurrentView] = useState(Views.MONTH);

    useEffect(() => {
        const initClient = () => {
            gapi.client.init({
                apiKey: API_KEY,
                clientId: CLIENT_ID,
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
                scope: SCOPES
            }).then(() => {
                console.log('✅ Google API Initialized');

                fetchEvents(); // Chargement initial

                // 🔁 Rafraîchissement toutes les 10 secondes
                const interval = setInterval(() => {
                    console.log('🔁 Rafraîchissement automatique');
                    fetchEvents();
                }, 10000);

                // Nettoyage
                return () => clearInterval(interval);
            }).catch((error) => {
                console.error('❌ Erreur init API Google', error);
            });
        };

        gapi.load('client:auth2', initClient);
    }, []);

    const fetchEvents = async () => {
        try {
            const googleEvents = await fetchGoogleCalendarEvents();
            const backendEvents = await fetchBackendShifts();
            const allEvents = [...googleEvents, ...backendEvents];
            setEvents(allEvents);
            console.log('✅ Événements combinés :', allEvents);
        } catch (error) {
            console.error('❌ Erreur récupération événements :', error);
        }
    };

    const fetchGoogleCalendarEvents = async () => {
        try {
            const auth = gapi.auth2.getAuthInstance();
            if (!auth || !auth.isSignedIn.get()) {
                return []; // ❗ Pas connecté à Google
            }

            const accessToken = auth.currentUser.get().getAuthResponse().access_token;
            const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            const data = await res.json();
            if (data.error) {
                alert(`Erreur Google : ${data.error.message}`);
                return [];
            }

            return data.items.map(event => ({
                id: event.id,
                title: event.summary,
                start: new Date(event.start.dateTime || event.start.date),
                end: new Date(event.end.dateTime || event.end.date)
            }));
        } catch (error) {
            console.error('❌ Erreur Google fetch:', error);
            return [];
        }
    };

    const fetchBackendShifts = async () => {
        try {
            const res = await fetch('http://localhost:5001/api/personnel/shifts');
            const data = await res.json();

            const formattedShifts = data
                .filter(p => p.shiftStart && p.shiftEnd)
                .map(p => ({
                    id: p._id,
                    title: `${p.firstName} ${p.lastName} - ${p.role || 'Service'}`,
                    start: new Date(p.shiftStart),
                    end: new Date(p.shiftEnd),
                    role: p.role || ''
                }));

            return formattedShifts;
        } catch (error) {
            console.error('❌ Erreur backend:', error);
            return [];
        }
    };

    const signIn = () => {
        gapi.auth2.getAuthInstance().signIn()
            .then(() => {
                console.log("✅ Connecté à Google");
                fetchEvents();
            })
            .catch((error) => {
                console.error("❌ Connexion Google échouée :", error);
            });
    };

    const checkAuth = () => {
        const auth = gapi.auth2.getAuthInstance();
        if (auth.isSignedIn.get()) {
            const email = auth.currentUser.get().getBasicProfile().getEmail();
            alert(`Connecté en tant que : ${email}`);
        } else {
            alert("Utilisateur non connecté");
        }
    };

    const signOut = () => {
        gapi.auth2.getAuthInstance().signOut().then(() => {
            console.log('✅ Déconnecté');
            setEvents([]);
        });
    };

    const handleNavigate = (newDate) => {
        setCurrentDate(newDate);
    };

    const handleViewChange = (newView) => {
        setCurrentView(newView);
    };

    const eventPropGetter = (event) => {
        let backgroundColor = '#2ECC71';
        if (event.role) {
            if (event.role.toLowerCase().includes('médecin')) backgroundColor = '#3498DB';
            else if (event.role.toLowerCase().includes('infirmier')) backgroundColor = '#1ABC9C';
            else backgroundColor = '#F39C12';
        }

        return {
            style: {
                backgroundColor,
                color: 'white',
                borderRadius: '4px',
                padding: '4px'
            }
        };
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Calendrier Google + Backend</h2>
            <div style={{ marginBottom: '10px' }}>
                <button onClick={signIn}>🔐 Connecter à Google</button>
                <button onClick={signOut}>🚪 Déconnecter</button>
                <button onClick={checkAuth}>✅ Vérifier la connexion</button>
            </div>
            <Calendar
                localizer={localizer}
                events={events}
                date={currentDate}
                view={currentView}
                onView={handleViewChange}
                onNavigate={handleNavigate}
                views={{ month: true, week: true, day: true, agenda: true }}
                defaultView={Views.MONTH}
                style={{ height: 600 }}
                eventPropGetter={eventPropGetter}
            />
        </div>
    );
};

export default GoogleCalendar;
