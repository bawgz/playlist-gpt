import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

export const authOptions = {
    providers: [
        SpotifyProvider({
            authorization: "https://accounts.spotify.com/authorize?scope=user-read-email,playlist-modify-public,playlist-modify-private",
            clientId: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET
        }),
    ],
    callbacks: {
        async jwt({ token, account }) {
            // Persist the OAuth access_token to the token right after signin
            if (account) {
                token.accessToken = account.access_token
            }
            return token
        },
        async session({ session, token, user }) {
            // Send properties to the client, like an access_token from a provider.
            session.accessToken = token.accessToken
            console.log("session");
            console.log(session);
            return session
        }
    }
}
export default NextAuth(authOptions);