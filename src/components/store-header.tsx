import { ThemeConfig } from "@/types/theme-types"
import { NovaHeader, MinimalHeader, EnigmaHeader } from "./store-layouts"

export function StoreHeader({ 
    theme, 
    user, 
    domain, 
    isPreview,
    baseUrl = ""
}: { 
    theme: ThemeConfig, 
    user?: any, 
    domain: string, 
    isPreview?: boolean,
    baseUrl?: string
}) {
    const { layoutId } = theme

    const props = { theme, user, domain, isPreview, baseUrl }

    if (layoutId === 'minimal') {
        return <MinimalHeader {...props} />
    }

    if (layoutId === 'enigma') {
        return <EnigmaHeader {...props} />
    }

    return <NovaHeader {...props} />
}
