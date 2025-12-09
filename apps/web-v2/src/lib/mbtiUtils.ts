/**
 * MBTI Personality Type Utilities
 * Provides human-readable names for MBTI personality types
 */

export const MBTI_TYPES: Record<string, string> = {
  INTJ: 'Architect',
  INTP: 'Logician',
  ENTJ: 'Commander',
  ENTP: 'Debater',
  INFJ: 'Advocate',
  INFP: 'Mediator',
  ENFJ: 'Protagonist',
  ENFP: 'Campaigner',
  ISTJ: 'Logistician',
  ISFJ: 'Defender',
  ESTJ: 'Executive',
  ESFJ: 'Consul',
  ISTP: 'Virtuoso',
  ISFP: 'Adventurer',
  ESTP: 'Entrepreneur',
  ESFP: 'Entertainer',
};

/**
 * Get the human-readable name for an MBTI personality type
 * @param mbtiType - The MBTI type code (e.g., "INTP")
 * @returns The human-readable name (e.g., "Logician") or the original type if not found
 */
export function getMBTITypeName(mbtiType: string): string {
  return MBTI_TYPES[mbtiType.toUpperCase()] || mbtiType;
}
