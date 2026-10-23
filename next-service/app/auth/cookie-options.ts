import { Cookie } from "set-cookie-parser";

// Turns a parsed Nest "Set-Cookie" header into the options object Next's cookie APIs expect.
export function toCookieOptions(c: Cookie) {
    return {
        path: c.path,
        maxAge: c.maxAge,
        expires: c.expires,
        httpOnly: c.httpOnly,
        secure: c.secure,
        sameSite: c.sameSite?.toLowerCase() as 'lax' | 'strict' | 'none' | undefined, // parser gives "Lax", Next wants 'lax
    };
}