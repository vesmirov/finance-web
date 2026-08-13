// Row at rest: dense text, click to edit.

type RowViewProps =
  | {
      variant: 'income';
      name: string;
      det: string;
      usd: string;
      missing: boolean;
      onClick: () => void;
    }
  | {
      variant: 'expense';
      name: string;
      nat: string;
      per: string;
      pctLabel: string;
      usd: string;
      missing: boolean;
      onClick: () => void;
    };

export default function RowView(props: RowViewProps) {
  const usdClass = props.missing ? ' warn' : '';
  const usdTitle = props.missing ? 'No rate — this row counts as 0' : undefined;
  if (props.variant === 'income') {
    return (
      <div className="inc-row" title="Click to edit" onClick={props.onClick}>
        <span className="inc-name">{props.name}</span>
        <span className="inc-det">{props.det}</span>
        <span className="spacer" />
        <span className={'row-usd' + usdClass} title={usdTitle}>
          {props.usd}
        </span>
      </div>
    );
  }
  return (
    <div className="exp-row" title="Click to edit" onClick={props.onClick}>
      <span className="exp-name">{props.name}</span>
      <span className="exp-nat">{props.nat}</span>
      <span className="exp-per">{props.per}</span>
      <span className="exp-pct">{props.pctLabel}</span>
      <span className={'exp-usd' + usdClass} title={usdTitle}>
        {props.usd}
      </span>
    </div>
  );
}
