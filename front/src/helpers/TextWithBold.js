import React from 'react';

/**
 * Component that parses a text with ** markers to make it bold
 */
export const TextWithBold = ({ text }) => {
  if (!text || typeof text !== 'string') {
    return text;
  }

  const parts = text.split(/(\*\*.*?\*\*)/g);

  return (
    <span>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const boldText = part.slice(2, -2);
          return <strong key={index}>{boldText}</strong>;
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
};
