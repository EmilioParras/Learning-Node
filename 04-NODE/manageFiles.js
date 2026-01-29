import { readFile, writeFile } from 'node:fs/promises';

const content = await readFile('./archivo.txt', 'utf-8');
console.log(content);
await writeFile('./archivo2.txt', content);
console.log('Archivo copiado con exito');