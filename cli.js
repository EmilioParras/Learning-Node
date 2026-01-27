import { readdir, stat } from 'node:fs/promises';
import{ join } from 'node:path';

// Obtener lista de archivos en el directorio actual
const dir = process.argv[2] ?? '.';

// Formateo los tamaños
const formatSize = (size) => {
    if (size < 1024) {
        return `${size}B`;
    } else if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(2)}KB`;
    }    
};

// Obtengo los nombres de los archivos
const files = await readdir(dir);

// Recupero la información de cada archivo
const entries = await Promise.all(
    files.map(async (name) => {
        const fullPath = join(dir, name);
        const info = await stat(fullPath);

        return {
            name,
            isDirectory: info.isDirectory(),
            size: formatSize(info.size),
        }
    })
)

for (const entry of entries) {
    const icon = entry.isDirectory ? '📁' : '📄';
    const size = entry.isDirectory ? '-' : entry.size;
    console.log(`${icon} | {${entry.name}} | {${size}}`);
}