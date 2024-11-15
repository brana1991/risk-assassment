'use client';

import { signUp } from './actions';
import { useFormState } from 'react-dom';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const initialFormState = {
  errors: {
    userName: [],
    password: [],
    email: [],
    workingGroupDocuments: [],
    neutralPersonDocuments: [],
  },
};

export const SignUpForm = () => {
  const [state, formAction] = useFormState(signUp, initialFormState);

  return (
    <form action={formAction} className="max-w-lg mx-auto p-5 flex-1">
      <h1 className="text-2xl  my-5">Sign Up</h1>
      <div className="relative z-0 w-full mb-8 group">
        <Label className="flex mb-3">User Name</Label>
        <Input type="text" name="userName" id="userName" placeholder=" " />
        <p aria-live="polite" className="text-red-500">
          {state?.errors.userName}
        </p>
      </div>
      <div className="relative z-0 w-full mb-8 group">
        <Label className="flex mb-3">Password</Label>
        <Input type="password" name="password" id="password" placeholder=" " />
        <p aria-live="polite" className="text-red-500">
          {state?.errors.password}
        </p>
      </div>
      <div className="relative z-0 w-full mb-8 group">
        <Label className="flex mb-3">Email</Label>
        <Input type="email" name="email" id="email" placeholder=" " />
        <p aria-live="polite" className="text-red-500">
          {state?.errors.email}
        </p>
      </div>
      <div className="relative z-0 w-full mb-8 group">
        <Label className="flex mb-3">Ovlascenja i odluke o radnoj grupi</Label>
        <Input
          type="file"
          name="workingGroupDocuments"
          id="workingGroupDocuments"
          accept="image/*"
          multiple
        />
        <p aria-live="polite" className="text-red-500">
          {state?.errors.workingGroupDocuments}
        </p>
      </div>
      <div className="relative z-0 w-full mb-8 group">
        <Label className="flex mb-3">Ovlascenja i odluke o radnoj grupi</Label>
        <Input
          type="file"
          name="neutralPersonDocuments"
          id="neutralPersonDocuments"
          accept="image/*"
          multiple
        />
        <p aria-live="polite" className="text-red-500">
          {state?.errors.neutralPersonDocuments}
        </p>
      </div>
      <button
        type="submit"
        className="text-white w-full bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >
        Sign-in
      </button>
    </form>
  );
};
