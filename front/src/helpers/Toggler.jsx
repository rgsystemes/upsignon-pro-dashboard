import './Toggler.css';

// PROPS = choices: {key,title,help,isCurrent}, onSelect: (choice)=>void
export function Toggler(p) {
  return (
    <div className="toggler">
      {p.choices.map((c, i) => {
        return (
          <div
            key={c.key}
            className={c.isCurrent ? 'current' : ''}
            style={i === p.choices.length - 1 ? {} : { borderRight: '1px solid #2c5384' }}
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
