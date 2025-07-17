import { useState, useEffect, useRef } from 'react';

// Mock WebSocket implementation since socket.io-client is not available
// In production, this would be replaced with actual WebSocket connection
export default function useWebSocket(roomId) {
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState(null);
    const socketRef = useRef(null);

    useEffect(() => {
        if (!roomId) return;

        // Simulate connection for development
        const simulateConnection = () => {
            console.log(`Mock WebSocket connected for room: order_${roomId}`);
            setIsConnected(true);
        };

        // Simulate connection delay
        const connectionTimeout = setTimeout(simulateConnection, 1000);

        // Cleanup
        return () => {
            clearTimeout(connectionTimeout);
            setIsConnected(false);
        };
    }, [roomId]);

    // Mock send message function
    const sendMessage = (messageData) => {
        if (isConnected) {
            console.log('Mock WebSocket sending message:', messageData);
            // In real implementation, this would emit to server
            // For now, we'll just log it
        } else {
            console.error('Mock WebSocket not connected. Cannot send message.');
        }
    };

    return { isConnected, lastMessage, sendMessage };
}