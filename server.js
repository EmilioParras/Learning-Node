import { createServer } from 'node:http';
import { json } from 'node:stream/consumers';
import { randomUUID } from 'node:crypto';

const port = process.env.PORT ?? 3000;

const users = [
    { id: 1, name: 'Emi' },
    { id: 2, name: 'Juan' },
]

const server = createServer( async (req, res) => {
    const { url, method } = req;
    const [pathName, queryString] = url.split('?');

    const searchParams = new URLSearchParams(queryString);
    console.log(searchParams.get('limit'));

    if (req.method === 'GET') {
        if (pathName === '/') {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            return res.end('Hola, bienvenido a mi servidor en Node.js');
        }

        if (pathName === '/users') {
            const limit = Number(searchParams.get('limit')) || users.length;
            const offset = Number(searchParams.get('offset')) || 0;
            const paginatedUsers = users.slice(offset, offset + limit);

            return sendJSON(res, 200, paginatedUsers);
        }
    }

    if (req.method === 'POST') {
        if (pathName === '/users') {
            const body = await json(req);

            if (!body.name) {
                return sendJSON(res, 400, { message: 'Name is required' });
            }

            const newUser = {
                name: body.name,
                id: randomUUID(),
            };

            users.push(newUser);
            return sendJSON(res, 201, { message: 'User created'});
        }
    }
    return sendJSON(res, 404, { message: 'Route not found' });
});

function sendJSON(res, statusCode, data ) {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify(data));
}

server.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});