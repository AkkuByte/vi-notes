import { useEffect, useRef } from 'react';

// Define the shape of our telemetry data
export interface KeystrokeMetadata {
  timestamp: number;
  actionType: string;
  timeDelta: number; // Milliseconds since the last keystroke
}

const BATCH_SIZE = 20;

export function useKeystrokeMonitor(sessionId?: string, userId?: string) {
  // We use a ref to store the last time to calculate deltas without triggering re-renders
  const lastKeystrokeTime = useRef<number>(Date.now());
  const batch = useRef<KeystrokeMetadata[]>([]);

  useEffect(() => {
    if (!sessionId || !userId) return;

    const flushBatch = async () => {
      if (batch.current.length === 0) return;
      
      const eventsToSend = [...batch.current];
      batch.current = []; // Clear immediately to avoid duplicates

      try {
        await fetch(`${import.meta.env.VITE_API_URL}/api/telemetry`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            userId,
            events: eventsToSend
          })
        });
        console.log(`📤 Synced ${eventsToSend.length} telemetry events.`);
      } catch (err) {
        console.error('Failed to send telemetry batch', err);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const now = Date.now();
      const timeDelta = now - lastKeystrokeTime.current;
      lastKeystrokeTime.current = now;

      // Categorize the keypress for behavioral analysis
      let actionType = 'character';
      
      if (event.key === 'Backspace' || event.key === 'Delete') {
        actionType = 'deletion';
      } else if (event.key === 'Enter') {
        actionType = 'newline';
      } else if (event.key === ' ') {
        actionType = 'space';
      } else if (event.ctrlKey || event.metaKey) {
        if (event.key === 'v') actionType = 'paste';
        else if (event.key === 'c') actionType = 'copy';
        else actionType = 'command';
      } else if (event.key.length > 1) { 
        // Catches arrows, shift, caps lock, etc.
        actionType = 'navigation/modifier';
      }

      const metadata: KeystrokeMetadata = {
        timestamp: now,
        actionType,
        timeDelta,
      };

      batch.current.push(metadata);

      if (batch.current.length >= BATCH_SIZE) {
        flushBatch();
      }
    };

    // Attach the listener to the entire window
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup function to prevent memory leaks if the component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      flushBatch(); // Flush any remaining events on unmount/chat change
    };
  }, [sessionId, userId]);
}