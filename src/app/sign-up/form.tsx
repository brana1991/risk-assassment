'use client';
import { CSSProperties } from 'react';
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
    <form
      action={formAction}
      className="max-w-lg mx-auto p-5 flex-1"
      style={
        {
          '--tw-bg-opacity': '1',
          backgroundColor: ' rgb(17 24 39 / var(--tw-bg-opacity))',
        } as CSSProperties
      }
    >
      <h1 className="text-2xl text-white my-5">Sign-up</h1>
      <div className="relative z-0 w-full mb-8 group">
        <input
          type="text"
          name="userName"
          id="userName"
          className="block py-2.5 px-0 w-full text-white text-sm bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          placeholder=" "
        />
        <label
          htmlFor="userName"
          className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
        >
          User Name
        </label>
        <p aria-live="polite" className="text-red-500">
          {state?.errors.userName}
        </p>
      </div>
      <div className="relative z-0 w-full mb-8 group">
        <input
          type="password"
          className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          name="password"
          id="password"
          placeholder=" "
        />
        <label
          htmlFor="password"
          className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
        >
          Password
        </label>
        <p aria-live="polite" className="text-red-500">
          {state?.errors.password}
        </p>
      </div>
      <div className="relative z-0 w-full mb-8 group">
        <input
          type="email"
          className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          name="email"
          id="email"
          placeholder=" "
        />
        <label
          htmlFor="email"
          className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
        >
          email
        </label>
        <p aria-live="polite" className="text-red-500">
          {state?.errors.email}
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
