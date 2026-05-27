"use client";

import { useEffect, useState } from "react";
import { TrustMedWorkbench } from "./TrustMedWorkbench";
import { LoginPage } from "@/components/LoginPage";

const AUTH_KEY = "trust-med-authed";

export default function Home() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    setAuthed(localStorage.getItem(AUTH_KEY) === "1");
  }, []);

  function handleAuth() {
    localStorage.setItem(AUTH_KEY, "1");
    setAuthed(true);
  }

  // Avoid flash before localStorage resolves
  if (authed === null) return null;

  if (!authed) return <LoginPage onAuth={handleAuth} />;

  return <TrustMedWorkbench />;
}
