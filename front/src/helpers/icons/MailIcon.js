export const MailIcon = (p) => {
  const width = p.size;
  const height = (p.size * 17) / 22;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 22 17"
      fill="none"
    >
      <path
        d="M18.8269 0.75H2.67308C1.61099 0.75 0.75 1.61099 0.75 2.67308V14.2115C0.75 15.2736 1.61099 16.1346 2.67308 16.1346H18.8269C19.889 16.1346 20.75 15.2736 20.75 14.2115V2.67308C20.75 1.61099 19.889 0.75 18.8269 0.75Z"
        stroke="#323232"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.82715 3.8269L10.7502 9.21152L17.6733 3.8269"
        stroke="#323232"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
