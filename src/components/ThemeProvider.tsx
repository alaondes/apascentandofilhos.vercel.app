import { useEffect, useState, ReactNode } from "react";
import { db } from "../lib/firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";

interface ThemeColors {
  primaryBase: string;
  primaryLight: string;
  primaryDark: string;
  primaryBg: string;
  bgMain: string;
  textMain: string;
  textMuted: string;
  footerBg: string;
  footerText: string;
}

const defaultTheme: ThemeColors = {
  primaryBase: "#1a6496",
  primaryLight: "#2d8dc3",
  primaryDark: "#0d2b42",
  primaryBg: "#eaf4fb",
  bgMain: "#f0f4f8",
  textMain: "#222222",
  textMuted: "#6b7c93",
  footerBg: "#1a3a52",
  footerText: "#ffffff",
};

export default function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setTheme] = useState<ThemeColors>(defaultTheme);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "content", "theme"), (docSnap) => {
      if (docSnap.exists() && docSnap.data().colors) {
        setTheme({ ...defaultTheme, ...docSnap.data().colors });
      }
    }, (err) => console.error("Error fetching theme:", err));
    return () => unsub();
  }, []);

  return (
    <>
      <style>
        {`
          :root {
            --color-primary-base: ${theme.primaryBase};
            --color-primary-light: ${theme.primaryLight};
            --color-primary-dark: ${theme.primaryDark};
            --color-primary-bg: ${theme.primaryBg};
            --color-bg-main: ${theme.bgMain};
            --color-text-main: ${theme.textMain};
            --color-text-muted: ${theme.textMuted};
            --color-footer-bg: ${theme.footerBg};
            --color-footer-text: ${theme.footerText};
          }
        `}
      </style>
      {children}
    </>
  );
}
