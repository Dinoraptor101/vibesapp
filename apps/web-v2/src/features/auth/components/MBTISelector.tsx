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
    color: 'bg-mbti-analyst-bg border-mbti-analyst-border hover:bg-mbti-analyst-hover',
  },
  {
    type: 'INTP',
    name: 'Logician',
    category: 'Analyst',
    color: 'bg-mbti-analyst-bg border-mbti-analyst-border hover:bg-mbti-analyst-hover',
  },
  {
    type: 'ENTJ',
    name: 'Commander',
    category: 'Analyst',
    color: 'bg-mbti-analyst-bg border-mbti-analyst-border hover:bg-mbti-analyst-hover',
  },
  {
    type: 'ENTP',
    name: 'Debater',
    category: 'Analyst',
    color: 'bg-mbti-analyst-bg border-mbti-analyst-border hover:bg-mbti-analyst-hover',
  },

  // Diplomats
  {
    type: 'INFJ',
    name: 'Advocate',
    category: 'Diplomat',
    color: 'bg-mbti-diplomat-bg border-mbti-diplomat-border hover:bg-mbti-diplomat-hover',
  },
  {
    type: 'INFP',
    name: 'Mediator',
    category: 'Diplomat',
    color: 'bg-mbti-diplomat-bg border-mbti-diplomat-border hover:bg-mbti-diplomat-hover',
  },
  {
    type: 'ENFJ',
    name: 'Protagonist',
    category: 'Diplomat',
    color: 'bg-mbti-diplomat-bg border-mbti-diplomat-border hover:bg-mbti-diplomat-hover',
  },
  {
    type: 'ENFP',
    name: 'Campaigner',
    category: 'Diplomat',
    color: 'bg-mbti-diplomat-bg border-mbti-diplomat-border hover:bg-mbti-diplomat-hover',
  },

  // Sentinels
  {
    type: 'ISTJ',
    name: 'Logistician',
    category: 'Sentinel',
    color: 'bg-mbti-sentinel-bg border-mbti-sentinel-border hover:bg-mbti-sentinel-hover',
  },
  {
    type: 'ISFJ',
    name: 'Defender',
    category: 'Sentinel',
    color: 'bg-mbti-sentinel-bg border-mbti-sentinel-border hover:bg-mbti-sentinel-hover',
  },
  {
    type: 'ESTJ',
    name: 'Executive',
    category: 'Sentinel',
    color: 'bg-mbti-sentinel-bg border-mbti-sentinel-border hover:bg-mbti-sentinel-hover',
  },
  {
    type: 'ESFJ',
    name: 'Consul',
    category: 'Sentinel',
    color: 'bg-mbti-sentinel-bg border-mbti-sentinel-border hover:bg-mbti-sentinel-hover',
  },

  // Explorers
  {
    type: 'ISTP',
    name: 'Virtuoso',
    category: 'Explorer',
    color: 'bg-mbti-explorer-bg border-mbti-explorer-border hover:bg-mbti-explorer-hover',
  },
  {
    type: 'ISFP',
    name: 'Adventurer',
    category: 'Explorer',
    color: 'bg-mbti-explorer-bg border-mbti-explorer-border hover:bg-mbti-explorer-hover',
  },
  {
    type: 'ESTP',
    name: 'Entrepreneur',
    category: 'Explorer',
    color: 'bg-mbti-explorer-bg border-mbti-explorer-border hover:bg-mbti-explorer-hover',
  },
  {
    type: 'ESFP',
    name: 'Entertainer',
    category: 'Explorer',
    color: 'bg-mbti-explorer-bg border-mbti-explorer-border hover:bg-mbti-explorer-hover',
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
          <div className="h-4 w-4 rounded border-2 border-mbti-analyst-border bg-mbti-analyst-bg" />
          <span className="text-text-secondary">Analyst</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border-2 border-mbti-diplomat-border bg-mbti-diplomat-bg" />
          <span className="text-text-secondary">Diplomat</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border-2 border-mbti-sentinel-border bg-mbti-sentinel-bg" />
          <span className="text-text-secondary">Sentinel</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border-2 border-mbti-explorer-border bg-mbti-explorer-bg" />
          <span className="text-text-secondary">Explorer</span>
        </div>
      </div>
    </div>
  );
}
