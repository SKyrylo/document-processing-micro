"use client";

import { GoogleLoginButton } from "react-social-login-buttons";
import login from "./login"
import { useActionState } from "react";

export default function Login() {
    const [state, formAction] = useActionState(login, { error: "" })
    return (
        <form action={formAction}>
            <div className="h-screen flex items-center justify-center flex-col gap-5">
                <input 
                type='email' 
                name='email' 
                placeholder='Email' 
                className={`input input-bordered w-full max-w-xs ${
                    state?.error && 'input-error'
                }`}
                />
                <input
                type='password'
                name='password'
                placeholder='Password'
                className={`input input-bordered w-full max-w-xs ${
                    state?.error && 'input-error'
                }`}
                />
                {state?.error}
                <button type='submit' className='btn btn-primary'>
                    Login
                </button>
                <a href='/auth/register'>
                    Register
                </a>
                <div className='flex'>
                    <GoogleLoginButton onClick={() => 
                        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`
                    } />
                </div>
            </div>
        </form>
    )
}