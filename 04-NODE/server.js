import { createServer } from 'node:http';
import { json } from 'node:stream/consumers';
import { randomUUID } from 'node:crypto';

const port = process.env.PORT ?? 3000;

const users = [
    { id: 1, name: 'Emilio', username: 'user', email: 'email123', phone: '12345678', bio: 'my bio' },
    { id: 2, name: 'Juan', username: 'user', email: 'email123', phone: '12345678', bio: 'my bio' },
    { id: 3, name: 'Pedro', username: 'user', email: 'email123', phone: '12345678', bio: 'my bio' },
]

const server = createServer( async (req, res) => {
    const { url, method } = req;
    const [pathName, queryString] = url.split('?');

    const searchParams = new URLSearchParams(queryString);

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

        if (pathName === '/user') {
            const idParam = Number(searchParams.get('id'));
            
            if (!idParam) { return sendJSON(res, 400, { message: 'User ID is required' }); }

            const id = Number(idParam);
            const user = users.find(u => u.id === id);

            if (!user) { return sendJSON(res, 404, { message: 'User not found' }); }

            return sendJSON(res, 200, user);
        }
    }

    if (req.method === 'POST') {
        if (pathName === '/users') {
            const body = await json(req);

            if (!body.name) { return sendJSON(res, 400, { message: 'Name is required' }); }
            
            if (!body.phone) { return sendJSON(res, 400, { message: 'Phone is required' }); }

            if (!body.username) { return sendJSON(res, 400, { message: 'Username is required' }); }

            const newUser = {
                name: body.name,
                username: body.username,
                id: randomUUID(),
                email: body.email,
                phone: body.phone || '',
                bio: body.bio || ''
            };

            users.push(newUser);
            return sendJSON(res, 201, { message: 'User created'});
        }
    }

    if (req.method === 'DELETE') {
        if (pathName === '/user') {
            const idParam = Number(searchParams.get('id'));

            if (!idParam) { return sendJSON(res, 400, { message: 'User ID is required'}); }

            const id = Number(idParam);
            const userId = users.find(u => u.id === id);

            if (!userId) { return sendJSON(res, 404, { message: 'User not found' });  }

            users.splice(users.indexOf(userId), 1);
            return sendJSON(res, 200, { message: 'User deleted' });
        }
        
    }    

    if (req.method === 'PATCH') {
        if (pathName === '/user') {

            const idParam = Number(searchParams.get('id'));
            if (!idParam) { return sendJSON(res, 400, { message: 'User ID is required' }) }

            const id = Number(idParam);
            const user = users.find(u => u.id === id);
            if (!user) { return sendJSON(res, 404, { message: 'User not found' }) }

            try {
                const body = await json(req);
                let changesMade = false;

                const allowFields = ['username', 'email', 'phone', 'bio'];
                for (const field of Object.keys(body)) {
                    if (allowFields.includes(field)) {
                        user[field] = body[field];
                        changesMade = true
                    }
                }

                if (!changesMade) { return sendJSON(res, 400, { message: 'No valid fields to update' }); }

                return sendJSON(res, 200, { message: 'User updated', user });  
            } catch (error) {
                return sendJSON(res, 400, { message: 'Invalid JSON body' });
            }
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