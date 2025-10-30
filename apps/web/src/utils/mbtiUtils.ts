export const getMBTIDescription = (mbti: string): string => {
  const descriptions: { [key: string]: string } = {
    ISTJ: 'Inspector',
    ISFJ: 'Protector',
    INFJ: 'Advocate',
    INTJ: 'Architect',
    ISTP: 'Crafter',
    ISFP: 'Artist',
    INFP: 'Mediator',
    INTP: 'Thinker',
    ESTP: 'Persuader',
    ESTJ: 'Director',
    ESFP: 'Performer',
    ESFJ: 'Caregiver',
    ENFP: 'Champion',
    ENFJ: 'Giver',
    ENTP: 'Debater',
    ENTJ: 'Commander',
  };
  return descriptions[mbti] || '';
};

export const mbtiOptions = [
  { value: 'ISTJ', label: 'ISTJ - Inspector' },
  { value: 'ISFJ', label: 'ISFJ - Protector' },
  { value: 'INFJ', label: 'INFJ - Advocate' },
  { value: 'INTJ', label: 'INTJ - Architect' },
  { value: 'ISTP', label: 'ISTP - Crafter' },
  { value: 'ISFP', label: 'ISFP - Artist' },
  { value: 'INFP', label: 'INFP - Mediator' },
  { value: 'INTP', label: 'INTP - Thinker' },
  { value: 'ESTP', label: 'ESTP - Persuader' },
  { value: 'ESTJ', label: 'ESTJ - Director' },
  { value: 'ESFP', label: 'ESFP - Performer' },
  { value: 'ESFJ', label: 'ESFJ - Caregiver' },
  { value: 'ENFP', label: 'ENFP - Champion' },
  { value: 'ENFJ', label: 'ENFJ - Giver' },
  { value: 'ENTP', label: 'ENTP - Debater' },
  { value: 'ENTJ', label: 'ENTJ - Commander' },
];
