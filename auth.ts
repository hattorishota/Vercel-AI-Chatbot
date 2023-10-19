// NextAuthを使うための設定ファイル
import NextAuth, { type DefaultSession } from 'next-auth'
import GoogleProvider from "next-auth/providers/google";

declare module 'next-auth' {
  interface Session {
    user: {
      /** The user's id. */
      id: string
    } & DefaultSession['user']
  }
}

export const {
  handlers: { GET, POST },
  auth,
  CSRF_experimental // will be removed in future
} = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }),
  ],
  secret: process.env.NEXT_PUBLIC_SECRET,
  callbacks: {
    jwt({ token, profile }) {
      if (profile) {
        token.id = profile.id
        token.image = profile.avatar_url || profile.picture
      }
      return token
    },
    async signIn({ account, profile }: { account: any | null; profile?: any }) {
      if (account?.provider === "google") {
        console.log("account:" + account);
        console.log("profile:" + profile);
        return Promise.resolve(profile?.email_verified && (profile?.email?.endsWith("@crowdworks.co.jp") ?? false));
      }
      return Promise.resolve(true); // Do different verification for other providers that don't have `email_verified`
    },
    authorized({ auth }) {
      return !!auth?.user // this ensures there is a logged in user for -every- request
    }
  },
  pages: {
    signIn: '/sign-in' // overrides the next-auth default signin page https://authjs.dev/guides/basics/pages
  }
})
