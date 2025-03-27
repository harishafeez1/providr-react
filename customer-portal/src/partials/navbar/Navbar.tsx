import { ReactNode } from 'react';

export interface INavbarProps {
  children: ReactNode;
}

export interface INavbarActionsProps {
  children: ReactNode;
}

const Navbar = ({ children }: INavbarProps) => {
  return (
    <div className="flex items-center flex-wrap md:flex-nowrap lg:items-end justify-between gap-3 lg:gap-6">
      {children}
    </div>
  );
};

export { Navbar };
