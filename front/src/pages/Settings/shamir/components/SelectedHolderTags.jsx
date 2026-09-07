import './SelectedHolderTags.css';

export const SelectedHolderTags = (p) => {
  const { holders, onRemoveHolder } = p;
  return (
    <div className="selectedHolderTagsContainer">
      {p.holders.map((h) => {
        return (
          <div className="selectedHolderTag" key={h.id}>
            <span className="hint14Regular">{h.email}</span>
            <span className="tagRemove" onClick={() => onRemoveHolder(h.id)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="9"
                height="9"
                viewBox="0 0 9 9"
                fill="none"
              >
                <path
                  d="M9 0.90675L8.09325 0L4.5 3.59325L0.90675 0L0 0.90675L3.59325 4.5L0 8.09325L0.90675 9L4.5 5.40675L8.09325 9L9 8.09325L5.40675 4.5L9 0.90675Z"
                  fill="#323232"
                />
              </svg>
            </span>
          </div>
        );
      })}
    </div>
  );
};
