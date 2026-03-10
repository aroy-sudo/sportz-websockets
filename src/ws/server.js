import { max } from "drizzle-orm";
import WebSocket from "ws";

function sendJson( socket, payload) {
    if (socket.readyState !== WebSocket.OPEN) return;

    socket.send(JSON.stringify(payload));
}

function broadcast(wss, payload) {
    for (const client of wss.clients) {
        if (client.readyState !== WebSocket.OPEN) {
            continue;
        }
        client.send(JSON.stringify(payload));
    }
}

export function attachWebSocketServer(server) {
    const wss = new WebSocket.Server({ 
        server,
        path: '/ws',
        maxPayload: 1024 * 1024, // 1MB
    });

    wss.on('connection', (socket) => {
        sendJson(socket, { message: 'Welcome to the Sports Match WebSocket!' });
        socket.on('error', console.error);
    });

    function broadcastMatchCreated(match) {
        broadcast(wss, { type: 'match_update', match });

    
    };
    return { wss, broadcastMatchCreated };
}