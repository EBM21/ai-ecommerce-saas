const fs = require('fs');

let content = fs.readFileSync('src/lib/themes/pre-built.ts', 'utf8');

const generateId = () => Math.random().toString(36).substring(2, 9);

function addBlocks(content, themeName, headerType, footerType) {
    const searchString = `...createBaseConfig("${themeName}"`;
    const searchIndex = content.indexOf(searchString);
    if (searchIndex === -1) {
        console.log("Could not find", themeName);
        return content;
    }
    
    // Find the 'blocks: [' after the searchString
    const blocksIndex = content.indexOf('blocks: [', searchIndex);
    if (blocksIndex === -1) return content;
    
    const insertHeaderIndex = blocksIndex + 'blocks: ['.length;
    
    const headerBlock = `\n                {
                    id: generateId(),
                    type: '${headerType}',
                    props: { showLogo: true, links: [{ label: 'Shop', href: '/collection' }, { label: 'About', href: '/about' }] },
                    animation: { entrance: 'none', hover: 'none' },
                    styles: { paddingTop: '0px', paddingBottom: '0px' }
                },`;
                
    content = content.slice(0, insertHeaderIndex) + headerBlock + content.slice(insertHeaderIndex);
    
    // Find the end of this blocks array. We can look for the next `]\n        }\n    },` or similar.
    // Actually, looking for `]\n        }\n    },` or `]\n        }\n    }`
    const endBlockIndex1 = content.indexOf(']\n        }\n    },', insertHeaderIndex);
    const endBlockIndex2 = content.indexOf(']\n        }\n    }', insertHeaderIndex);
    
    let insertFooterIndex = -1;
    if (endBlockIndex1 !== -1 && (endBlockIndex2 === -1 || endBlockIndex1 < endBlockIndex2)) {
        insertFooterIndex = endBlockIndex1;
    } else if (endBlockIndex2 !== -1) {
        insertFooterIndex = endBlockIndex2;
    }
    
    if (insertFooterIndex !== -1) {
        const footerBlock = `,\n                {
                    id: generateId(),
                    type: '${footerType}',
                    props: { text: "© 2026 ${themeName}", showSocial: true },
                    animation: { entrance: 'none', hover: 'none' },
                    styles: { paddingTop: '0px', paddingBottom: '0px' }
                }\n            `;
        content = content.slice(0, insertFooterIndex) + footerBlock + content.slice(insertFooterIndex);
    } else {
        console.log("Could not find end of blocks for", themeName);
    }
    
    return content;
}

const themes = [
    { name: 'Tech Nova', layout: 'nova', footer: 'footer-nova' },
    { name: 'Beauty Blush', layout: 'minimal', footer: 'footer-minimal' },
    { name: 'Urban Street', layout: 'enigma', footer: 'footer-enigma' },
    { name: 'Home Haven', layout: 'minimal', footer: 'footer-minimal' },
    { name: 'Fitness Pro', layout: 'enigma', footer: 'footer-enigma' },
    { name: 'Essentials', layout: 'minimal', footer: 'footer-minimal' },
    { name: 'Luxe', layout: 'enigma', footer: 'footer-enigma' },
    { name: 'Organic Market', layout: 'nova', footer: 'footer-nova' },
    { name: 'Cyber Edge', layout: 'enigma', footer: 'footer-enigma' },
    { name: 'Zen Wellness', layout: 'minimal', footer: 'footer-minimal' },
    { name: 'Gourmet', layout: 'enigma', footer: 'footer-enigma' },
    { name: 'Adventure Co', layout: 'nova', footer: 'footer-nova' },
    { name: 'Playful', layout: 'nova', footer: 'footer-nova' },
    { name: 'The Artisan', layout: 'minimal', footer: 'footer-minimal' },
    { name: 'CloudSync', layout: 'enigma', footer: 'footer-enigma' }
];

for (const t of themes) {
    const headerType = t.layout === 'minimal' ? 'header-minimal' : 'header-nova';
    content = addBlocks(content, t.name, headerType, t.footer);
}

fs.writeFileSync('src/lib/themes/pre-built.ts', content);
console.log("Done");
