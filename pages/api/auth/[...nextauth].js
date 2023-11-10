import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import axios from 'axios';

export const authOptions = {
    providers: [
        SpotifyProvider({
            authorization: "https://accounts.spotify.com/authorize?scope=user-read-email,playlist-modify-public,playlist-modify-private",
            clientId: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET
        }),
    ],
    callbacks: {
        async jwt({ token, user, account, profile, isNewUser }) {
            // Initial sign in
            if (account) {
                console.log("___________initial signin babyyyyyyyyy________________");
                console.log(account);
                return {
                    accessToken: account.access_token,
                    accessTokenExpires: account.expires_at,
                    refreshToken: account.refresh_token,
                }
            }

            console.log("Token: ");
            console.log(token);

            if (Date.now() < token.accessTokenExpires) {
                return token;
            }

            console.log("refreshing the token");
            const tokenURL = 'https://accounts.spotify.com/api/token';
            const data = {
                grant_type: 'refresh_token',
                refresh_token: token.refreshToken,
            };
            const options = {
                headers: {
                    Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            };

            console.log("DATA: ");
            console.log(data);

            console.log("OPTIONS: ");
            console.log(options);

            const response = await axios.post(
                tokenURL,
                data,
                options
            );

            var updatedTokenData = response.data;

            console.log("updated token: ");
            console.log(updatedTokenData);

            // Update the token with the new values
            token.accessToken = updatedTokenData.access_token;
            token.accessTokenExpires = Date.now() + updatedTokenData.expires_in * 1000;

            return token;
        },
        async session({ session, token, user }) {
            // Send properties to the client, like an access_token from a provider.
            console.log("-------- Im in the session function-----------------");
            console.log(JSON.stringify(token));
            session.accessToken = token.accessToken
            console.log("session");
            console.log(session);
            return session
        }
    }
}
export default NextAuth(authOptions);