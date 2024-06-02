'use client';
import { useFormState } from 'react-dom';
import { signIn } from './actions';

const initialFormState = {
  errors: {
    userName: [],
    password: [],
  },
};

export const SignInForm = () => {
  const [state, formAction] = useFormState(signIn, initialFormState);

  return (
    <form action={formAction}>
      <h1>Sign in</h1>
      <div>
        <div>
          <label htmlFor="userName">User Name</label>
          <input type="text" name="userName" id="userName" placeholder="Enter your name" />
          <p aria-live="polite">{state?.errors.userName}</p>
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input type="password" name="password" id="password" placeholder="Enter your password" />
          <p aria-live="polite">{state?.errors.password}</p>
        </div>
        <button type="submit">Sign-in</button>
      </div>
    </form>
  );
};
