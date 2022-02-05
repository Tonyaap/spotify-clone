import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'

export default async function middleWare(req) {
    //token will exist if user is logged in
  const token = await getToken({ req, secret: process.env.JWT_SECRET })

  const {pathname} = req.nextUrl

  //allow the request if the following is true...
// 1) if token exists
// 2) the token exists
if (pathname.includes('/api/auth') || token)  {
    return NextResponse.next();
}

// redirect to login if no token
    if (!token && pathname !== '/login') {
        return NextResponse.redirect('/login')
    }
}
