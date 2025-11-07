/**
 * Generate a memorable Pigeon ID (password)
 * Format: adjective-noun-4digits (e.g., "brave-tiger-8472")
 */

const adjectives = [
  'brave',
  'calm',
  'clever',
  'cosmic',
  'daring',
  'dreamy',
  'eager',
  'fancy',
  'gentle',
  'happy',
  'jolly',
  'kind',
  'lively',
  'lucky',
  'merry',
  'noble',
  'proud',
  'quick',
  'royal',
  'shiny',
  'smart',
  'swift',
  'vivid',
  'wise',
  'witty',
  'zesty',
  'amber',
  'azure',
  'coral',
  'crimson',
  'emerald',
  'golden',
  'jade',
  'ruby',
  'silver',
  'stellar',
  'cosmic',
  'lunar',
  'solar',
  'mystic',
];

const nouns = [
  'tiger',
  'eagle',
  'dolphin',
  'phoenix',
  'dragon',
  'falcon',
  'panther',
  'wolf',
  'lion',
  'hawk',
  'bear',
  'fox',
  'owl',
  'raven',
  'swan',
  'deer',
  'comet',
  'star',
  'moon',
  'sun',
  'cloud',
  'storm',
  'breeze',
  'wave',
  'mountain',
  'river',
  'ocean',
  'forest',
  'meadow',
  'canyon',
  'glacier',
  'valley',
  'sage',
  'knight',
  'mage',
  'warrior',
  'ranger',
  'scout',
  'voyager',
  'seeker',
];

/**
 * Generate a random pigeon ID with format: adjective-noun-####
 */
export function generatePigeonId(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const numbers = Math.floor(1000 + Math.random() * 9000); // 4-digit number between 1000-9999

  return `${adjective}-${noun}-${numbers}`;
}

/**
 * Validate pigeon ID format
 */
export function isValidPigeonIdFormat(pigeonId: string): boolean {
  // Format: word-word-4digits
  const pattern = /^[a-z]+-[a-z]+-\d{4}$/;
  return pattern.test(pigeonId);
}
