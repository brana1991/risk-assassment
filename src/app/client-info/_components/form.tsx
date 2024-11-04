'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '../_actions/index';
import { useFormState } from 'react-dom';
import { FormError } from '@/components/ui/form-message';

export const initialFormState = {
  errors: {
    name: [],
    address: [],
    identityNumber: [],
    pib: [],
    responsiblePerson: [],
  },
};

export const Form = () => {
  const [state, formAction] = useFormState(createClient, initialFormState);

  return (
    <form action={formAction} className="flex flex-col gap-7 w-1/2 mt-16">
      <div className="grid gap-2 flex-col relative">
        <Label className="row-start-1 row-end-2">Naziv Firme</Label>
        <Input
          type="text"
          className="row-start-2 row-end-3"
          placeholder="Ime preduzeca"
          name="company-name"
        />
        {state?.errors.name && <FormError> {state?.errors.name}</FormError>}
      </div>
      <div className="grid gap-2 flex-col relative">
        <Label className="row-start-1 row-end-2">Adresa firme</Label>
        <Input
          type="text"
          className="row-start-2 row-end-3"
          placeholder="Adresa firme"
          name="company-address"
        />
        {state?.errors.address && <FormError> {state?.errors.address}</FormError>}
      </div>
      <div className="grid gap-2 flex-col relative">
        <Label className="row-start-1 row-end-2">Maticni broj</Label>
        <Input
          type="number"
          className="row-start-2 row-end-3"
          placeholder="Maticni broj"
          name="identity-number"
        />
        {state?.errors.identityNumber && <FormError> {state?.errors.identityNumber}</FormError>}
      </div>
      <div className="grid gap-2 flex-col relative">
        <Label className="row-start-1 row-end-2">PIB</Label>
        <Input
          type="number"
          className="row-start-2 row-end-3"
          placeholder="PIB"
          name="pib-number"
        />
        {state?.errors.pib && <FormError> {state?.errors.pib}</FormError>}
      </div>
      <div className="grid gap-2 flex-col relative">
        <Label className="row-start-1 row-end-2">Odgovorno lice</Label>
        <Input
          type="text"
          className="row-start-2 row-end-3"
          placeholder="Odgovorno lice"
          name="responsible-person"
        />
        {state?.errors.responsiblePerson && (
          <FormError> {state?.errors.responsiblePerson}</FormError>
        )}
      </div>
      <button type="submit">registruj</button>
    </form>
  );
};
