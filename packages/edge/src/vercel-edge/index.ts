import { AuthStatus, Base } from '@clerk/backend-core';
import { NextResponse } from 'next/server';

import { ClerkAPI } from './ClerkAPI';
import {
  WithAuthNextMiddlewareHandler,
  WithAuthMiddlewareCallback,
} from './types';
import { getAuthData } from './utils/getAuthData';

/**
 *
 * Required implementations for the runtime:
 * 1. Import Key
 * 2. Verify Signature
 * 3. Decode Base64
 * 4. ClerkAPI export with fetcher implementation
 * 5. Fetch Interstitial
 *
 */

const importKey = async (jwk: JsonWebKey, algorithm: Algorithm) => {
  return await crypto.subtle.importKey('jwk', jwk, algorithm, true, ['verify']);
};

const verifySignature = async (
  algorithm: Algorithm,
  key: CryptoKey,
  signature: Uint8Array,
  data: Uint8Array,
) => {
  return await crypto.subtle.verify(algorithm, key, signature, data);
};

const decodeBase64 = (base64: string) => atob(base64);

/** Base initialization */

const vercelEdgeBase = new Base(importKey, verifySignature, decodeBase64);

/** Export standalone verifySessionToken */

export const verifySessionToken = vercelEdgeBase.verifySessionToken;

/** Export ClerkBackendAPI API client */

export { ClerkAPI } from './ClerkAPI';

async function fetchInterstitial() {
  const response = await ClerkAPI.fetchInterstitial<Response>();
  return response.text();
}

/** Export middleware wrapper */

type WithAuthOptions = {
  authorizedParties?: string[];
  loadUser?: boolean;
  loadSession?: boolean;
};

export function withAuth(
  handler: WithAuthNextMiddlewareHandler<WithAuthOptions>,
  options: WithAuthOptions = {
    authorizedParties: [],
    loadSession: false,
    loadUser: false,
  },
): WithAuthNextMiddlewareHandler {
  return async function clerkAuth(req, event) {
    const { status, interstitial, sessionClaims } =
      await vercelEdgeBase.getAuthState({
        cookieToken: req.cookies['__session'],
        clientUat: req.cookies['__client_uat'],
        headerToken: req.headers.get('authorization'),
        origin: req.headers.get('origin'),
        host: req.headers.get('host') as string,
        userAgent: req.headers.get('user-agent'),
        forwardedPort: req.headers.get('x-forwarded-port'),
        forwardedHost: req.headers.get('x-forwarded-host'),
        referrer: req.headers.get('referrer'),
        authorizedParties: options.authorizedParties,
        fetchInterstitial,
      });

    if (status === AuthStatus.SignedOut) {
      return handler(req, event);
    }

    if (status === AuthStatus.Interstitial) {
      return new NextResponse(interstitial, {
        headers: { 'Content-Type': 'text/html' },
        status: 401,
      });
    }

    if (status === AuthStatus.SignedIn) {
      const { auth, user, session } = await getAuthData(req, {
        ...sessionClaims,
        options,
      });

      req.auth = auth;
      req.user = user;
      req.session = session;

      return await handler(req, event);
    }
  };
}
