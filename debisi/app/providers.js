'use client';

import { ApolloClient, InMemoryCache, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { ApolloProvider } from '@apollo/client';
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs';
import { AuthProvider } from '../contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import { auth } from '../config/firebase';

// ─── Build Apollo Client ONCE outside the component ──────────────────────────
// Auth link calls Firebase directly to get a fresh (auto-refreshed) token
// instead of reading from localStorage which could be expired.

function buildApolloClient() {
  const uploadLink = createUploadLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
    credentials: 'include',
    headers: {
      'apollo-require-preflight': 'true',
    },
  });

  const authLink = setContext(async (_, { headers }) => {
    let token = null;
    try {
      // getIdToken() auto-refreshes if the token has expired (1h window)
      if (auth.currentUser) {
        token = await auth.currentUser.getIdToken();
        // Keep localStorage in sync so other code can read it
        if (token) localStorage.setItem('userToken', token);
      } else {
        // Fallback: read from localStorage during initial render
        token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;
      }
    } catch {
      token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;
    }
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  });

  return new ApolloClient({
    link: authLink.concat(uploadLink),
    cache: new InMemoryCache(),
  });
}

// Singleton — created once per browser session, not on every render
const apolloClient = buildApolloClient();

// ─── Providers Component ──────────────────────────────────────────────────────

export function Providers({ children }) {
  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 4000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </ApolloProvider>
  );
}