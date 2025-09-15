import React, { useEffect, useRef } from "react";

// Expects props: clientId, onCredential
const GoogleLoginButton = ({ clientId, onCredential }) => {
  const divRef = useRef(null);

  useEffect(() => {
    if (!clientId) {
      if (divRef.current) {
        divRef.current.innerHTML =
          '<div class="text-xs text-red-600">Missing VITE_GOOGLE_CLIENT_ID</div>';
      }
      return;
    }

    // Load Google script if not already
    const existing = document.getElementById("google-identity-services");
    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.id = "google-identity-services";
      script.onload = () => {
        console.debug("Google Identity script loaded");
        initialize();
      };
      document.head.appendChild(script);
    } else if (window.google && window.google.accounts) {
      console.debug("Google Identity script already present");
      initialize();
    }

    function initialize() {
      if (!window.google || !divRef.current) return;
      console.debug("Initializing google.accounts.id for client", clientId);
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          console.debug("Received Google credential");
          onCredential && onCredential(response.credential);
        },
        use_fedcm_for_prompt: true,
      });
      window.google.accounts.id.renderButton(divRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "signin_with",
        logo_alignment: "left",
      });
      console.debug("Google button rendered");
    }
  }, [clientId, onCredential]);

  return <div ref={divRef} />;
};

export default GoogleLoginButton;
