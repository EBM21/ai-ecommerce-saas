import prisma from '../src/lib/prisma'

async function main() {
    const stores = await prisma.store.findMany()
    for (const store of stores) {
        if (store.themeConfig) {
            const config: any = typeof store.themeConfig === 'string' ? JSON.parse(store.themeConfig) : store.themeConfig
            
            // Fix currency
            if (!config.branding) config.branding = {}
            config.branding.currency = "PKR"

            // Fix hero blocks
            if (config.blocks) {
                config.blocks = config.blocks.map((block: any) => {
                    if (block.type === 'hero-modern') {
                        block.type = 'hero-split'
                        if (block.props.bgImage) {
                            block.props.imageUrl = block.props.bgImage
                            delete block.props.bgImage
                        }
                    } else if (block.type === 'hero-split') {
                        if (block.props.bgImage) {
                            block.props.imageUrl = block.props.bgImage
                            delete block.props.bgImage
                        }
                    }
                    return block
                })
            }

            await prisma.store.update({
                where: { id: store.id },
                data: { themeConfig: config }
            })
            console.log(`Fixed store ${store.id}`)
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect())
