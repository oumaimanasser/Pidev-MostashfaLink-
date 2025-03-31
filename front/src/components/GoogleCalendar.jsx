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
    const [currentView, setCurrentView] = useState(Views.MONTH); // 👈 nouvelle vue active

    useEffect(() => {
        const initClient = () => {
            gapi.client.init({
                apiKey: API_KEY,
                clientId: CLIENT_ID,
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
                scope: SCOPES
            }).then(() => {
                console.log('✅ Google API Initialized');
                fetchEvents();
            }).catch((error) => {
                console.error('❌ Erreur lors de l\'initialisation de l\'API Google', error);
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
            console.error('❌ Erreur lors de la récupération des événements :', error);
            alert(`Erreur lors de la récupération des événements : ${error.message}`);
        }
    };

    const fetchGoogleCalendarEvents = async () => {
        try {
            const accessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
            const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            const data = await res.json();

            if (data.error) {
                console.error('❌ Erreur lors de la récupération des événements Google :', data.error);
                alert(`Erreur Google : ${data.error.message}`);
                return [];
            }

            const formattedEvents = data.items.map(event => ({
                id: event.id,
                title: event.summary,
                start: new Date(event.start.dateTime || event.start.date),
                end: new Date(event.end.dateTime || event.end.date)
            }));

            console.log('✅ Événements Google récupérés :', formattedEvents);
            return formattedEvents;
        } catch (error) {
            console.error('❌ Erreur lors de la requête Google :', error);
            return [];
        }
    };

    const fetchBackendShifts = async () => {
        try {
            const res = await fetch('http://localhost:5001/api/personnel');
            const data = await res.json();

            const formattedShifts = data.map(item => ({
                id: item._id,
                title: `${item.firstName} ${item.lastName} - ${item.role}`,
                start: new Date(item.shiftStart),
                end: new Date(item.shiftEnd)
            }));

            console.log('✅ Événements backend récupérés :', formattedShifts);
            return formattedShifts;
        } catch (error) {
            console.error('❌ Erreur lors de la requête backend :', error);
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
                console.error("❌ Erreur lors de la connexion :", error);
                alert(`Erreur lors de la connexion : ${error.error}`);
            });
    };

    const checkAuth = () => {
        const auth = gapi.auth2.getAuthInstance();
        if (auth.isSignedIn.get()) {
            console.log("✅ Utilisateur connecté :", auth.currentUser.get().getBasicProfile().getEmail());
            alert(`Connecté en tant que : ${auth.currentUser.get().getBasicProfile().getEmail()}`);
        } else {
            console.log("❌ Utilisateur non connecté");
            alert("Utilisateur non connecté");
        }
    };

    const signOut = () => {
        gapi.auth2.getAuthInstance().signOut().then(() => {
            console.log('✅ Déconnecté de Google');
            setEvents([]);
        }).catch((error) => {
            console.error('❌ Erreur lors de la déconnexion', error);
        });
    };

    const handleNavigate = (newDate) => {
        console.log(`Navigating to ${newDate}`);
        setCurrentDate(newDate);
    };

    const handleViewChange = (newView) => {
        console.log(`Vue changée : ${newView}`);
        setCurrentView(newView);
    };

    return (
        <div style={{ height: 500 }}>
            <h2>Calendrier Google</h2>
            <div>
                <button onClick={signIn}>Connecter à Google</button>
                <button onClick={signOut}>Déconnecter</button>
                <button onClick={checkAuth}>Vérifier la connexion</button>
            </div>
            <Calendar
                localizer={localizer}
                events={events}
                date={currentDate}
                view={currentView}
                onView={handleViewChange}
                onNavigate={handleNavigate}
                views={{
                    month: true,
                    week: true,
                    day: true,
                    agenda: true
                }}
                defaultView={Views.MONTH}
                style={{ height: 500, margin: '20px' }}
                eventPropGetter={(event) => ({
                    style: {
                        backgroundColor: event.title.includes('Médecin') ? '#3498DB' : '#2ECC71',
                        color: 'white',
                        borderRadius: '4px',
                        padding: '5px'
                    }
                })}
            />
        </div>
    );
};

export default GoogleCalendar;
