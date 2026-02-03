const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../assets/icon.png');
const outputDir = path.join(__dirname, '../build-resources');
const outputPath = path.join(outputDir, 'icon.ico');

// ICO format requires specific sizes
const sizes = [256, 128, 64, 48, 32, 16];

async function convertIcon() {
    try {
        console.log('🔄 Converting icon.png to icon.ico...');

        // Create output directory if it doesn't exist
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
            console.log('✅ Created build-resources directory');
        }

        // For Windows ICO, we'll use the standard approach: 
        // Create a 256x256 PNG and let electron-builder handle ICO conversion
        // Or we can create multiple sizes and manually construct ICO

        // Simple approach: Just copy the PNG with proper sizing
        // Electron-builder can work with high-res PNG files
        await sharp(inputPath)
            .resize(256, 256)
            .toFile(outputPath.replace('.ico', '.png'));

        // For proper ICO support, let's create an actual ICO file
        // ICO is a container format, we'll create it manually
        const images = await Promise.all(
            sizes.map(size =>
                sharp(inputPath)
                    .resize(size, size)
                    .png()
                    .toBuffer()
            )
        );

        // Simple ICO header construction
        // ICO files start with: Reserved(2) + Type(2) + Count(2)
        const header = Buffer.alloc(6);
        header.writeUInt16LE(0, 0);      // Reserved
        header.writeUInt16LE(1, 2);      // Type: 1 for ICO
        header.writeUInt16LE(sizes.length, 4); // Number of images

        // Image directory entries (16 bytes each)
        const dirEntries = [];
        let imageOffset = 6 + (sizes.length * 16);

        for (let i = 0; i < sizes.length; i++) {
            const size = sizes[i];
            const imageData = images[i];
            const entry = Buffer.alloc(16);

            entry.writeUInt8(size === 256 ? 0 : size, 0);  // Width (0 means 256)
            entry.writeUInt8(size === 256 ? 0 : size, 1);  // Height
            entry.writeUInt8(0, 2);                         // Colors (0 = no palette)
            entry.writeUInt8(0, 3);                         // Reserved
            entry.writeUInt16LE(1, 4);                      // Color planes
            entry.writeUInt16LE(32, 6);                     // Bits per pixel
            entry.writeUInt32LE(imageData.length, 8);       // Image size
            entry.writeUInt32LE(imageOffset, 12);           // Image offset

            dirEntries.push(entry);
            imageOffset += imageData.length;
        }

        // Combine everything
        const icoFile = Buffer.concat([
            header,
            ...dirEntries,
            ...images
        ]);

        fs.writeFileSync(outputPath, icoFile);

        console.log('✅ Icon converted successfully!');
        console.log(`   Output: ${outputPath}`);
        console.log(`   Sizes included: ${sizes.join('x, ')}x`);
    } catch (error) {
        console.error('❌ Icon conversion failed:', error.message);
        console.log('\n💡 Fallback: Using PNG file instead (electron-builder supports PNG)');

        // Fallback: Just create a high-res PNG
        try {
            await sharp(inputPath)
                .resize(512, 512)
                .toFile(outputPath.replace('.ico', '-fallback.png'));

            // Also create an ICO from just the 256x256 version
            const png256 = await sharp(inputPath).resize(256, 256).png().toBuffer();

            // Minimal ICO with single 256x256 image
            const header = Buffer.alloc(6);
            header.writeUInt16LE(0, 0);
            header.writeUInt16LE(1, 2);
            header.writeUInt16LE(1, 4);

            const dirEntry = Buffer.alloc(16);
            dirEntry.writeUInt8(0, 0);  // 0 = 256px
            dirEntry.writeUInt8(0, 1);
            dirEntry.writeUInt8(0, 2);
            dirEntry.writeUInt8(0, 3);
            dirEntry.writeUInt16LE(1, 4);
            dirEntry.writeUInt16LE(32, 6);
            dirEntry.writeUInt32LE(png256.length, 8);
            dirEntry.writeUInt32LE(22, 12);

            const simpleIco = Buffer.concat([header, dirEntry, png256]);
            fs.writeFileSync(outputPath, simpleIco);

            console.log('✅ Created fallback ICO file');
        } catch (fallbackError) {
            console.error('❌ Fallback also failed:', fallbackError.message);
            process.exit(1);
        }
    }
}

convertIcon();
