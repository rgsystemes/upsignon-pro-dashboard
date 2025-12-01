export const CountingIcon = (p) => {
  let width = p.size;
  let height = (p.size * 18) / 22;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 22 18"
      fill="none"
    >
      <path d="M1 16.9374H21" stroke="#323232" strokeWidth="2" strokeLinecap="round" />
      <path d="M1.77686 1.07385V14.544" stroke="#323232" strokeWidth="2" strokeLinecap="round" />
      <path d="M19.7124 1V14.4701" stroke="#323232" strokeWidth="2" strokeLinecap="round" />
      <path d="M17.2837 5.57825L3.80775 5.57825" stroke="#323232" strokeLinecap="round" />
      <path d="M17.6929 12.3751H3.80646" stroke="#323232" strokeLinecap="round" />
      <circle cx="12.1002" cy="12.3063" r="1.50207" fill="#333333" />
      <circle cx="9.0299" cy="5.40478" r="1.50207" fill="#333333" />
      <circle cx="8.62804" cy="12.3063" r="1.50207" fill="#333333" />
      <circle cx="5.56115" cy="5.40478" r="1.50207" fill="#333333" />
      <circle cx="15.4899" cy="12.3063" r="1.50207" fill="#333333" />
    </svg>
  );
};
