import type { Tab } from '../lib/ui';

interface TabsProps {
  tab: Tab;
  onTab: (tab: Tab) => void;
}

export default function Tabs({ tab, onTab }: TabsProps) {
  return (
    <div className="tabs">
      <button type="button" className={tab === 'plan' ? 'tab on' : 'tab'} onClick={() => onTab('plan')}>
        Plan
      </button>
      <button
        type="button"
        className={tab === 'settings' ? 'tab on' : 'tab'}
        onClick={() => onTab('settings')}
      >
        Settings
      </button>
    </div>
  );
}
