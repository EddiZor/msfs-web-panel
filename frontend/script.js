const ws = new WebSocket("ws://localhost:8765");

const elAirspeed = document.getElementById("val-airspeed");
const elAltitude = document.getElementById("val-altitude");
const elHeading = document.getElementById("val-heading");
const elGear = document.getElementById("val-gear");
const elFlaps = document.getElementById("val-flaps");

ws.onopen = () => {
    console.log("Connesso al backend MSFS.");
    document.body.classList.remove('disconnected');
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.AIRSPEED_INDICATED !== undefined) {
        elAirspeed.innerText = String(Math.round(data.AIRSPEED_INDICATED)).padStart(3, '0');
    }
    if (data.INDICATED_ALTITUDE !== undefined) {
        elAltitude.innerText = String(Math.round(data.INDICATED_ALTITUDE)).padStart(5, '0');
    }
    if (data.PLANE_HEADING_DEGREES_MAGNETIC !== undefined) {
        elHeading.innerText = String(Math.round(data.PLANE_HEADING_DEGREES_MAGNETIC)).padStart(3, '0');
    }
    if (data.GEAR_HANDLE_POSITION !== undefined) {
        elGear.innerText = data.GEAR_HANDLE_POSITION === 1.0 ? "DN" : "UP";
    }
    if (data.FLAPS_HANDLE_PERCENT !== undefined) {
        elFlaps.innerText = Math.round(data.FLAPS_HANDLE_PERCENT * 100);
    }
};

ws.onclose = () => {
    console.log("Disconnesso dal backend.");
    document.body.classList.add('disconnected');
};

// Funzione per l'invio dei comandi al backend Python
function sendCommand(eventId) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ event: eventId }));
    } else {
        console.warn("WebSocket disconnesso: impossibile inviare il comando.");
    }
}