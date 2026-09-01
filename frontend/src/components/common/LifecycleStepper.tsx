import React from 'react';
import { LifecycleStage } from '../../types';
import { Check, ArrowRight } from 'lucide-react';

interface LifecycleStepperProps {
  currentStage: LifecycleStage;
  onSelectStage?: (stage: LifecycleStage) => void;
  interactive?: boolean;
}

export const stages: { stage: LifecycleStage; label: string; desc: string }[] = [
  { stage: 'REGISTERED', label: '1. Registered', desc: 'Added to system' },
  { stage: 'AVAILABLE', label: '2. Available', desc: 'Ready for work' },
  { stage: 'ASSIGNED', label: '3. Assigned', desc: 'Operator linked' },
  { stage: 'IN_OPERATION', label: '4. In Operation', desc: 'Active on jobsite' },
  { stage: 'UNDER_MAINTENANCE', label: '5. Maintenance', desc: 'Service required' },
  { stage: 'RENTAL', label: '6. Rental', desc: 'Leased out' },
  { stage: 'RETIRED', label: '7. Retired', desc: 'Decommissioned' },
];

export const LifecycleStepper: React.FC<LifecycleStepperProps> = ({
  currentStage,
  onSelectStage,
  interactive = false,
}) => {
  const currentIndex = stages.findIndex((s) => s.stage === currentStage);

  return (
    <div className="w-full py-3">
      <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
        {stages.map((item, idx) => {
          const isCurrent = item.stage === currentStage;
          const isPassed = idx < currentIndex;
          const isPending = idx > currentIndex;

          return (
            <button
              key={item.stage}
              disabled={!interactive}
              onClick={() => onSelectStage && onSelectStage(item.stage)}
              className={`text-left p-2.5 rounded border transition-all ${
                isCurrent
                  ? 'bg-[#ffcd00]/15 border-[#ffcd00] ring-1 ring-[#ffcd00]'
                  : isPassed
                  ? 'bg-[#18231d] border-emerald-900/50 text-emerald-400'
                  : 'bg-[#161718] border-[#2a2c2d] text-gray-400'
              } ${interactive ? 'hover:border-gray-400 cursor-pointer' : 'cursor-default'}`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={`font-mono text-[11px] font-bold ${isCurrent ? 'text-[#ffcd00]' : ''}`}>
                  {item.label}
                </span>
                {isPassed && <Check size={13} className="text-emerald-400" />}
                {isCurrent && <span className="w-2 h-2 rounded-full bg-[#ffcd00] animate-ping" />}
              </div>
              <div className="text-[10px] text-gray-400 font-sans truncate">{item.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
