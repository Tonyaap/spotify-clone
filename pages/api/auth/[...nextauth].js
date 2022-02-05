import NextAuth from "next-auth"
import SpotifyProvider from "next-auth/providers/spotify"
import spotifyApi, { LOGIN_URL } from "../../../lib/spotify"

async function refreshAccessToken(token) {
  try {
    spotifyApi.setAccessToken(token.accessToken);
    spotifyApi.setRefreshToken(token.refreshToken);
    const { body: refreshedToken } = await spotifyApi.refreshAccessToken()
    console.log('REFRESHTOKEN IS', refreshedToken);

    return {
      ...token,
      accessToken: refreshedToken.access_token,
      accessTokenExpires: Date.now + refreshedToken.expires_in * 1000, // = 1 hour as 3600 returns from api
      refreshToken: refreshedToken.refresh_token ?? token.refreshToken,
      // replace with new one if you got it
    }

  }
  catch (error) {
    console.error(error);

    return {
      ...token,
      error: 'refreshAccesTokenError'
    }
  }
}

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    SpotifyProvider({
      clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
      authorization: LOGIN_URL,
    }),
    // ...add more providers here
  ],
  secret: process.env.JWT_SECRET,
  pages: {
    signIn: '/login'
  },
  callbacks: {
    async jwt({token, account, user}){
      //initial sign in
        if(account && user) {
          return {
            ...token,
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            username: account.providerAccountId,
            accessTokenExpires: account.expires_at * 1000,
            // times a 1000 because it uses milliseconds
          }
        }
        // return previous token if accesstoken hasn't expired yet
        if (Date.now() < token.accessTokenExpires) {
          console.log("TOKEN IS VALID");
          return token;
        }
        // acces token has expired, so we need to refresh it
        console.log('TOKEN HAS EXPIRED, REFRESHING...');
        return await refreshAccessToken(token)
    },

    async session({session, token}) {
      session.user.accessToken = token.accessToken;
      session.user.refreshToken = token.refreshToken;
      session.user.username = token.username;

      return session;
    }
  }
})
