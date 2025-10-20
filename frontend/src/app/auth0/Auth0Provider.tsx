"use client";

import { Auth0Provider } from "@auth0/auth0-react";
import { ReactNode } from "react";

export function AuthProvider({ children }: { children: ReactNode }) {
 
  const apiIdentifier = process.env.AUTH0_API_IDENTIFIER;

  return (
    <Auth0Provider
          domain={process.env.AUTH0_DOMAIN || ""}
          clientId={process.env.AUTH0_CLIENT_ID || ""}
          authorizationParams={{
            redirect_uri: window.location.origin,
            audience: apiIdentifier,
            scope: "openid profile email",
          }}
        >
          {children}
        </Auth0Provider>
  );
}
   