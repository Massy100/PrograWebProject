"use client";

import { Auth0Provider } from "@auth0/auth0-react";
import { ReactNode } from "react";

export function AuthProvider({ children }: { children: ReactNode }) {
 
  const apiIdentifier = process.env.NEXT_PUBLIC_AUTH0_API_IDENTIFIER;

  const dom = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
  const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;

  return (
    <Auth0Provider
          domain={dom || ""}
          clientId={clientId || ""}
          useRefreshTokens={true}
          cacheLocation="localstorage"
          authorizationParams={{
            redirect_uri: "http://localhost:3000/",
            audience: apiIdentifier,
            scope: "openid profile email",
          }}
        >
          {children}
        </Auth0Provider>
  );
}
   