import { getUserVibes } from './userService';

// Permission threshold configuration constants
const CONTROLS_ENTRY_VIBES_THRESHOLD = 50; // Basic controls entry
const GROUP_CHAT_ENTRY_VIBES_THRESHOLD = 100; // Group chat entry
const DIRECT_MESSAGE_ENTRY_VIBES_THRESHOLD = 200; // Direct message entry
// Omniverse entry, temporarily set to 100 until we have more users. Change to 300 when ready.
const OMNIVERSE_ENTRY_VIBES_THRESHOLD = 100;

export async function getPermissionControls(): Promise<boolean> {
  const vibes = await getUserVibes();
  return vibes > CONTROLS_ENTRY_VIBES_THRESHOLD;
}

export async function getPermissionGroupChat(): Promise<boolean> {
  const vibes = await getUserVibes();
  return vibes > GROUP_CHAT_ENTRY_VIBES_THRESHOLD;
}

export async function getPermissionDirectMessage(): Promise<boolean> {
  const vibes = await getUserVibes();
  return vibes > DIRECT_MESSAGE_ENTRY_VIBES_THRESHOLD;
}

export async function getPermissionOmniverse(): Promise<boolean> {
  const vibes = await getUserVibes();
  return vibes > OMNIVERSE_ENTRY_VIBES_THRESHOLD;
}
