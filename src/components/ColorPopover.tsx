import type { PlanCategory } from '../api/types';
import { PALETTE } from '../lib/palette';

interface ColorPopoverProps {
  cat: PlanCategory;
  allCats: PlanCategory[];
  onPick: (slot: number) => void;
}

export default function ColorPopover({ cat, allCats, onPick }: ColorPopoverProps) {
  return (
    <span className="pal-pop">
      {PALETTE.map((hex, i) => {
        const slot = i + 1;
        const mine = slot === cat.color;
        const owner = allCats.find((c) => c.color === slot && c.id !== cat.id);
        const used = owner !== undefined;
        const title = mine ? 'current' : used ? `taken: ${owner.name}` : 'free';
        return (
          <i
            key={slot}
            className={'pal-i' + (used ? ' used' : '') + (mine ? ' mine' : '')}
            style={{ background: hex }}
            title={title}
            onClick={() => {
              if (!used) onPick(slot);
            }}
          />
        );
      })}
    </span>
  );
}
