import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "RecipeShare — recipes worth passing around",
  description: "Find, share, and rate recipes from cuisines around the world."
};

export default function RootLayout({ children }) {
  return <html lang="en"><body><Providers>{children}</Providers></body></html>;
}
