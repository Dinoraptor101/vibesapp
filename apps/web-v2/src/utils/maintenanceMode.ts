/**
 * Maintenance Mode Helper
 * Check if maintenance mode is enabled
 */

export function isMaintenanceModeEnabled(): boolean {
  const maintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE;
  return maintenanceMode === 'true' || maintenanceMode === true;
}
