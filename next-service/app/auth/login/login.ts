"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { parseSetCookie } from "set-cookie-parser";
import { toCookieOptions } from "../cookie-options";

export default async function login(_prevState: any, formData: FormData) {
    const res = await fetch(`${process.env.API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: formData.get('email'),
            password: formData.get('password'),
        })
    });

    if (!res.ok) {
        console.log(`login failed: ${res.status} ${await res.text()}`)
        return { error: res.status === 401 ? "Invalid credentials" : `Login failed (${res.status})` };
    }

    const jar = await cookies();
    for (const c of parseSetCookie(res.headers.getSetCookie())) {
        jar.set(c.name, c.value, toCookieOptions(c));
    }

    redirect("/");
}