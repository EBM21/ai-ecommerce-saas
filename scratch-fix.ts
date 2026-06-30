import prisma from './src/lib/prisma';
import { PRE_BUILT_THEMES } from './src/lib/themes/pre-built';

async function fixStoreConfigs() {
  const stores = await prisma.store.findMany();
  
  for (const store of stores) {
    if (store.themeConfig) {
      let config: any = store.themeConfig;
      if (typeof config === 'string') {
        try { config = JSON.parse(config); } catch (e) {}
      }
      
      // If it looks like the broken onboarding structure
      if (config.theme && config.currency && !config.branding) {
        const themeMap: Record<string, string> = {
          'dark-minimal': 'theme-minimal-store',
          'light-clean': 'theme-beauty-blush',
          'warm-earthy': 'theme-home-haven',
          'neon-bold': 'theme-urban-street',
        };
        const mappedThemeId = themeMap[config.theme] || 'theme-minimal-store';
        const prebuilt = PRE_BUILT_THEMES.find(t => t.id === mappedThemeId) || PRE_BUILT_THEMES[0];
        
        const newConfig = {
          ...prebuilt.config,
          branding: {
            ...prebuilt.config.branding,
            storeName: store.name,
            currency: config.currency
          },
          // carry over categories if they are used somewhere else later
          categories: config.categories || []
        };
        
        await prisma.store.update({
          where: { id: store.id },
          data: { themeConfig: newConfig as any }
        });
        
        console.log(`Fixed config for store ${store.name}`);
      } else {
        console.log(`Store ${store.name} config looks OK or doesn't match broken pattern.`);
      }
    }
  }
}

fixStoreConfigs().then(() => {
  console.log('Done');
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
