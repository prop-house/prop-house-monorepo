import clsx from 'clsx';
import React from 'react';

interface CardProps {
  title: string;
  classes?: string | string[];
  children: React.ReactNode;
}

const Card = (props: CardProps) => {
  const { title, classes, children } = props;
  return (
    <div
      className={clsx(
        'bg-purple-200 rounded p-6 m-5 flex flex-col max-w-lg w-80',
        classes
      )}
    >
      <div className="font-bold text-gray-700 text-center mb-10">{title}</div>
      {children}
    </div>
  );
};

export default Card;
