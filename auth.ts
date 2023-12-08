// NextAuthを使うための設定ファイル
import NextAuth, { type DefaultSession } from 'next-auth'
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

export const isDevelopment = (): boolean => process.env.NODE_ENV === 'development';
declare module 'next-auth' {
  interface Session {
    user: {
      /** The user's id. */
      id: string
      sub: string,
    } & DefaultSession['user']
  }
}

let googleClient: Object;

if (isDevelopment()) {
  googleClient = {
    clientId: process.env.GOOGLE_CLIENT_ID_LOCAL,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET_LOCAL
  }
} else {
  googleClient = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET
  }
}

export const {
  handlers: { GET, POST },
  auth,
  CSRF_experimental // will be removed in future
} = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET
    }),
    GoogleProvider(googleClient)
  ],
  // secret: process.env.NEXT_PUBLIC_SECRET,
  callbacks: {
    jwt({ token, profile }) {
      if (profile) {
        token.id = String(profile.sub);
        token.image = profile.picture
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
