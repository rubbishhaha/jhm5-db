-- Migration: Remove automated test message from dialogues
-- This deletes any dialogues rows containing the known test marker.

DELETE FROM dialogues WHERE message LIKE '%Hello from automated test%';

-- Note: This migration will be run on next deploy; it is idempotent.
