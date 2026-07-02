import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const stores = await prisma.store.findMany()
        for (const store of stores) {
            if (store.themeConfig) {
                const config: any = typeof store.themeConfig === 'string' ? JSON.parse(store.themeConfig) : store.themeConfig
                
                if (!config.branding) config.branding = {}
                config.branding.currency = "PKR"

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
            }
        }
        return NextResponse.json({ success: true, message: "Fixed all stores" })
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message })
    }
}
