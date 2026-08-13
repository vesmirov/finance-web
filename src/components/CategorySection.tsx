import type { CategoryKind, Plan } from '../api/types';
import type { CategoryActions } from '../lib/ui';
import CategoryBlock from './CategoryBlock';

interface CategorySectionProps {
  label: string;
  labelClass: string;
  addLabel: string;
  kind: CategoryKind;
  plan: Plan;
  actions: CategoryActions;
  onAddCategory: (kind: CategoryKind) => void;
}

export default function CategorySection(props: CategorySectionProps) {
  const cats = props.plan.categories.filter((c) => c.kind === props.kind);
  return (
    <>
      <div className={props.labelClass}>{props.label}</div>
      {cats.map((cat) => (
        <CategoryBlock key={cat.id} cat={cat} plan={props.plan} actions={props.actions} />
      ))}
      <div className="add-cat" onClick={() => props.onAddCategory(props.kind)}>
        {props.addLabel}
      </div>
    </>
  );
}
