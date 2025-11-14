/**
 * MBTI Selector Component
 * Interactive grid for selecting one of 16 MBTI personality types
 */

interface MBTISelectorProps {
  value: string;
  onChange: (mbti: string) => void;
}

const MBTI_TYPES = [
  // Analysts
  {
    type: 'INTJ',
    name: 'Architect',
    category: 'Analyst',
    color:
      'bg-purple-100 border-purple-300 hover:bg-purple-200 dark:bg-purple-900/20 dark:border-purple-700 dark:hover:bg-purple-800/30',
  },
  {
    type: 'INTP',
    name: 'Logician',
    category: 'Analyst',
    color:
      'bg-purple-100 border-purple-300 hover:bg-purple-200 dark:bg-purple-900/20 dark:border-purple-700 dark:hover:bg-purple-800/30',
  },
  {
    type: 'ENTJ',
    name: 'Commander',
    category: 'Analyst',
    color:
      'bg-purple-100 border-purple-300 hover:bg-purple-200 dark:bg-purple-900/20 dark:border-purple-700 dark:hover:bg-purple-800/30',
  },
  {
    type: 'ENTP',
    name: 'Debater',
    category: 'Analyst',
    color:
      'bg-purple-100 border-purple-300 hover:bg-purple-200 dark:bg-purple-900/20 dark:border-purple-700 dark:hover:bg-purple-800/30',
  },

  // Diplomats
  {
    type: 'INFJ',
    name: 'Advocate',
    category: 'Diplomat',
    color:
      'bg-green-100 border-green-300 hover:bg-green-200 dark:bg-green-900/20 dark:border-green-700 dark:hover:bg-green-800/30',
  },
  {
    type: 'INFP',
    name: 'Mediator',
    category: 'Diplomat',
    color:
      'bg-green-100 border-green-300 hover:bg-green-200 dark:bg-green-900/20 dark:border-green-700 dark:hover:bg-green-800/30',
  },
  {
    type: 'ENFJ',
    name: 'Protagonist',
    category: 'Diplomat',
    color:
      'bg-green-100 border-green-300 hover:bg-green-200 dark:bg-green-900/20 dark:border-green-700 dark:hover:bg-green-800/30',
  },
  {
    type: 'ENFP',
    name: 'Campaigner',
    category: 'Diplomat',
    color:
      'bg-green-100 border-green-300 hover:bg-green-200 dark:bg-green-900/20 dark:border-green-700 dark:hover:bg-green-800/30',
  },

  // Sentinels
  {
    type: 'ISTJ',
    name: 'Logistician',
    category: 'Sentinel',
    color:
      'bg-blue-100 border-blue-300 hover:bg-blue-200 dark:bg-blue-900/20 dark:border-blue-700 dark:hover:bg-blue-800/30',
  },
  {
    type: 'ISFJ',
    name: 'Defender',
    category: 'Sentinel',
    color:
      'bg-blue-100 border-blue-300 hover:bg-blue-200 dark:bg-blue-900/20 dark:border-blue-700 dark:hover:bg-blue-800/30',
  },
  {
    type: 'ESTJ',
    name: 'Executive',
    category: 'Sentinel',
    color:
      'bg-blue-100 border-blue-300 hover:bg-blue-200 dark:bg-blue-900/20 dark:border-blue-700 dark:hover:bg-blue-800/30',
  },
  {
    type: 'ESFJ',
    name: 'Consul',
    category: 'Sentinel',
    color:
      'bg-blue-100 border-blue-300 hover:bg-blue-200 dark:bg-blue-900/20 dark:border-blue-700 dark:hover:bg-blue-800/30',
  },

  // Explorers
  {
    type: 'ISTP',
    name: 'Virtuoso',
    category: 'Explorer',
    color:
      'bg-amber-100 border-amber-300 hover:bg-amber-200 dark:bg-amber-900/20 dark:border-amber-700 dark:hover:bg-amber-800/30',
  },
  {
    type: 'ISFP',
    name: 'Adventurer',
    category: 'Explorer',
    color:
      'bg-amber-100 border-amber-300 hover:bg-amber-200 dark:bg-amber-900/20 dark:border-amber-700 dark:hover:bg-amber-800/30',
  },
  {
    type: 'ESTP',
    name: 'Entrepreneur',
    category: 'Explorer',
    color:
      'bg-amber-100 border-amber-300 hover:bg-amber-200 dark:bg-amber-900/20 dark:border-amber-700 dark:hover:bg-amber-800/30',
  },
  {
    type: 'ESFP',
    name: 'Entertainer',
    category: 'Explorer',
    color:
      'bg-amber-100 border-amber-300 hover:bg-amber-200 dark:bg-amber-900/20 dark:border-amber-700 dark:hover:bg-amber-800/30',
  },
];

export function MBTISelector({ value, onChange }: MBTISelectorProps) {
  return (
    <div className="space-y-6">
      {/* Grid of MBTI types */}
      <div className="grid grid-cols-4 gap-3">
        {MBTI_TYPES.map((mbti) => {
          const isSelected = value === mbti.type;
          return (
            <button
              key={mbti.type}
              type="button"
              onClick={() => onChange(mbti.type)}
              className={`
                flex flex-col items-center justify-center rounded-lg border-2 p-4 transition-all
                ${mbti.color}
                ${
                  isSelected
                    ? 'ring-2 ring-brand-purple ring-offset-2 ring-offset-surface scale-105'
                    : 'border-opacity-50'
                }
              `}
            >
              <span className="text-lg font-bold text-text-primary">{mbti.type}</span>
              <span className="text-xs text-text-secondary">{mbti.name}</span>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border-2 border-purple-300 bg-purple-100 dark:border-purple-700 dark:bg-purple-900/20" />
          <span className="text-text-secondary">Analyst</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border-2 border-green-300 bg-green-100 dark:border-green-700 dark:bg-green-900/20" />
          <span className="text-text-secondary">Diplomat</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border-2 border-blue-300 bg-blue-100 dark:border-blue-700 dark:bg-blue-900/20" />
          <span className="text-text-secondary">Sentinel</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border-2 border-amber-300 bg-amber-100 dark:border-amber-700 dark:bg-amber-900/20" />
          <span className="text-text-secondary">Explorer</span>
        </div>
      </div>
    </div>
  );
}
