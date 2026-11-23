import "./globals.css";

export const metadata = {
  title: "RecipeShare — recipes worth passing around",
  description: "Find, share, and rate recipes from cuisines around the world."
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
