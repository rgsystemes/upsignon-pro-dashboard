export const TableColSortIcon = (p) => {
  const width = (p.size * 10) / 13;
  const height = p.size;
  const sorting = p.sorting;
  return (
    <span onClick={p.onClick} style={{ display: 'inline-block', marginLeft: 5, cursor: 'pointer' }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        viewBox="0 0 10 13"
        fill="none"
      >
        <path
          d="M9.17222 4.55L4.69444 0L0.216667 4.55C0.0722224 4.69444 0 4.83889 0 5.05556C0 5.27222 0.0722224 5.41667 0.216667 5.56111C0.361111 5.70556 0.505556 5.77778 0.722222 5.77778H8.66667C8.88333 5.77778 9.02778 5.70556 9.17222 5.56111C9.31667 5.41667 9.38889 5.2 9.38889 5.05556C9.38889 4.91111 9.31667 4.69444 9.17222 4.55Z"
          fill="black"
          fillOpacity={sorting === 1 ? '1' : '0.36'}
        />
        <path
          d="M0.216667 8.45L4.69444 13L9.17222 8.45C9.31667 8.30556 9.38889 8.08889 9.38889 7.94444C9.38889 7.8 9.31667 7.58333 9.17222 7.43889C9.02778 7.29444 8.88333 7.22222 8.66667 7.22222H0.722222C0.505556 7.22222 0.361111 7.29444 0.216667 7.43889C0.0722224 7.58333 0 7.8 0 7.94444C0 8.08889 0.0722224 8.30556 0.216667 8.45Z"
          fill="black"
          fillOpacity={sorting === -1 ? '1' : '0.36'}
        />
      </svg>
    </span>
  );
};
