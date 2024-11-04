import { PropsWithChildren } from 'react';

export const FormError = ({ children }: PropsWithChildren) => {
  return (
    <p className="text-[0.7rem] font-medium text-destructive absolute row-start-3 row-end-4 mt-1">
      {children}
    </p>
  );
};
