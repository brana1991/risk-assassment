'use client';
import { signUp } from './actions';
import { useFormState } from 'react-dom';

const initialFormState = {
  errors: {
    userName: [],
    password: [],
    email: [],
  },
};

export const SignUpForm = () => {
  const [state, formAction] = useFormState(signUp, initialFormState);

  return (
    <form action={formAction}>
      <h1>Register</h1>
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
        <div>
          <label htmlFor="email">Email</label>
          <input type="email" name="email" id="email" placeholder="Enter your email" />
          <p aria-live="polite">{state?.errors.email}</p>
        </div>
        <button type="submit">Register</button>
      </div>
    </form>
  );
};
