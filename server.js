const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// POST /run
// body: { input: string }
app.post('/run', (req, res) => {
    const input = (req.body && req.body.input) ? req.body.input : '';
    const exePath = path.join(__dirname, 'gec2025.exe');

    // Spawn the executable
    const child = spawn(exePath, [], { cwd: __dirname });

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    child.stdout.on('data', (chunk) => {
        res.write(chunk);
    });

    child.stderr.on('data', (chunk) => {
        res.write(chunk);
    });

    child.on('close', (code) => {
        res.write(`\n[process exited with code ${code}]`);
        res.end();
    });

    // Write input and close stdin
    if (input && child.stdin.writable) {
        child.stdin.write(input);
    }
    if (child.stdin.writable) child.stdin.end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Run server listening on http://localhost:${PORT}`);
});
