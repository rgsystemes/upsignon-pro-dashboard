import './Toggler.css';

// PROPS = choices: {key,title,help,isCurrent}, onSelect: (choice)=>void
export function Toggler(p) {
  return (
    <div className="toggler">
      {p.choices.map((c) => {
        return (
          <div
            key={c.key}
            className={c.isCurrent ? 'current' : ''}
            onClick={() => p.onSelect(c.key)}
            title={c.help}
          >
            {c.title}
          </div>
        );
      })}
    </div>
  );
}
