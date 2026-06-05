import { useContext } from "react";
import { SiteConfigContext, type SiteConfigValue } from "../context/SiteConfigContext";

export function useSiteConfig(): SiteConfigValue {
  const context = useContext(SiteConfigContext);
  if (!context) {
    throw new Error("useSiteConfig must be used within a SiteConfigProvider");
  }
  return context;
}
