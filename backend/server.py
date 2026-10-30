import asyncio
import websockets
import json
from SimConnect import SimConnect, AircraftRequests, AircraftEvents

sm = SimConnect()
aq = AircraftRequests(sm)
ae = AircraftEvents(sm)

# Lista di variabili universali valide per qualsiasi aereo in MSFS
UNIVERSAL_SIMVARS = [
    "INDICATED_ALTITUDE",
    "AIRSPEED_INDICATED",
    "PLANE_HEADING_DEGREES_MAGNETIC",
    "GEAR_HANDLE_POSITION",
    "FLAPS_HANDLE_PERCENT"
]

async def msfs_bridge(websocket):
    print("Client web connesso.")
    while True:
        try:
            payload = {}
            # Lettura dinamica delle telemetrie (MSFS -> Browser)
            for var in UNIVERSAL_SIMVARS:
                val = aq.get(var)
                payload[var] = round(val, 2) if val is not None else 0

            await websocket.send(json.dumps(payload))
            
            # Ricezione comandi dal frontend (Browser -> MSFS)
            try:
                message = await asyncio.wait_for(websocket.recv(), timeout=0.01)
                data = json.loads(message)
                if "event" in data:
                    print(f"Eseguo comando MSFS: {data['event']}")
                    evento = ae.find(data['event'])
                    evento() # Innesca l'azione su MSFS
            except asyncio.TimeoutError:
                pass

        except websockets.exceptions.ConnectionClosed:
            print("Client web disconnesso.")
            break
        except Exception as e:
            print(f"Errore: {e}")
            
        await asyncio.sleep(0.1)

async def main():
    async with websockets.serve(msfs_bridge, "localhost", 8765):
        print("Server WebSocket MSFS universale in ascolto sulla porta 8765...")
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())