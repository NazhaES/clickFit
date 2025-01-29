const http = require('http');
const fs = require('fs');
const path = require('path');

// Serve Static Files
function serveStaticFile(filePath, contentType, res) {
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(500);
            res.end('Server Error');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
}

// Handle File Uploads
function handleFileUpload(req, res) {
    const boundary = req.headers['content-type'].split('; ')[1].replace('boundary=', '');
    let body = '';

    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        const parts = body.split(`--${boundary}`).filter(part => part.includes('Content-Disposition'));
        const uploadDir = path.join(__dirname, 'upload_images');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

        parts.forEach(part => {
            const match = part.match(/filename="(.+?)"/);
            if (match) {
                const filename = match[1];
                const fileContent = part.split('\r\n\r\n')[1].split('\r\n--')[0];
                const filePath = path.join(uploadDir, filename);
                fs.writeFileSync(filePath, fileContent, 'binary');
            }
        });

        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Files uploaded successfully.');
    });
}

// Create HTTP Server
const server = http.createServer((req, res) => {
    // Set CORS headers for all responses
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Add a GET handler for `/upload`
    if (req.method === 'GET' && req.url === '/upload') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('This route is for file uploads. Please use POST to upload files.');
        return;
    }

    if (req.method === 'POST' && req.url === '/upload') {
        handleFileUpload(req, res);
    } else if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
        serveStaticFile(path.join(__dirname, '../frontend/index.html'), 'text/html', res);
    } else if (req.method === 'GET' && req.url.endsWith('.css')) {
        serveStaticFile(path.join(__dirname, '../frontend', req.url), 'text/css', res);
    } else if (req.method === 'GET' && req.url.endsWith('.js')) {
        serveStaticFile(path.join(__dirname, '../frontend', req.url), 'application/javascript', res);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

// Start Server
server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});