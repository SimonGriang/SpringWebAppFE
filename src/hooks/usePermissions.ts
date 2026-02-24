import { useAuth } from "../auth/AuthContext";

export function usePermissions() {
  const { permissionProfile } = useAuth(); // direkt aus deinem bestehenden AuthContext

  return {
    // Company-weite Aktionen – prüft ob Action in companyPermissions enthalten
    can: (action: string): boolean =>
      permissionProfile?.companyPermissions.includes(action) ?? false,

    // Mitarbeiter-spezifische Aktionen
    canForEmployee: (action: string, employeeId: number): boolean =>
      permissionProfile?.employeePermissions[action]?.includes(employeeId) ?? false,

    // Sonderfall eigene Arbeitszeiten
    isOwnProfile: (employeeId: number): boolean =>
      permissionProfile?.employeeId === employeeId,

    isLoaded: permissionProfile !== null,
  };
}