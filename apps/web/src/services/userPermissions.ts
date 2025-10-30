import { getUserVibes } from './userService';

export async function getPermissionControls(): Promise<boolean> {
  const vibes = await getUserVibes();
  return vibes > 50; // Basic controls entry
}

export async function getPermissionGroupChat(): Promise<boolean> {
  const vibes = await getUserVibes();
  return vibes > 100; // Group chat entry
}

export async function getPermissionDirectMessage(): Promise<boolean> {
  const vibes = await getUserVibes();
  return vibes > 200; // Direct message entry
}

export async function getPermissionOmniverse(): Promise<boolean> {
  const vibes = await getUserVibes();
  // return vibes > 300; // Omniverse entry
  return vibes > 100; // Omniverse entry, temporarily set to 100 until we have more users.
}
