import clsx from 'clsx';
import { Children, cloneElement, isValidElement, memo, ReactNode, useState } from 'react';
import { IAccordionItemProps } from './';

interface IAccordionProps {
  className?: string; // Optional className for custom styling
  children: ReactNode;
  allowMultiple?: boolean; // Allow multiple items to be open at the same time
}

const AccordionComponent = ({ className, children, allowMultiple }: IAccordionProps) => {
  const [openIndices, setOpenIndices] = useState<number[]>([]);

  const handleItemClick = (index: number) => {
    setOpenIndices((prevIndices) =>
      prevIndices.includes(index)
        ? prevIndices.filter((i) => i !== index)
        : allowMultiple
          ? [...prevIndices, index]
          : [index]
    );
  };

  const modifiedChildren = Children.map(children, (child, index) => {
    if (isValidElement<IAccordionItemProps>(child)) {
      return cloneElement<IAccordionItemProps>(child, {
        isOpen: openIndices.includes(index),
        onClick: () => handleItemClick(index)
      });
    }
    return child;
  });

  return <div className={clsx('accordion', className && className)}>{modifiedChildren}</div>;
};

const Accordion = memo(AccordionComponent);
export { Accordion, type IAccordionProps };
