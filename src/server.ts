import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

const app = express();
const port = 3000;

app.get('/video/:filename', (req: Request, res: Response) => {
    // Garantir que 'filename' é uma string
    const filename = Array.isArray(req.params.filename) ? req.params.filename[0] : req.params.filename;

    // Verifique se o 'filename' foi passado corretamente
    if (!filename) {
        return res.status(400).send('Nome de arquivo não fornecido.');
    }

    // Verifica o caminho completo para o vídeo
    const videoPath = path.join(__dirname, '../videos', filename);
    console.log('Caminho do vídeo:', videoPath);

    // Verifica se o arquivo realmente existe
    if (!fs.existsSync(videoPath)) {
        return res.status(404).send('Arquivo não encontrado.');
    }

    // Pega informações sobre o arquivo
    fs.stat(videoPath, (err, stats) => {
        if (err) {
            return res.status(404).send('Arquivo não encontrado.');
        }

        const { range } = req.headers;
        const videoSize = stats.size;
        const CHUNK_SIZE = 10 ** 6; // Tamanho do pedaço do vídeo em bytes (1MB)

        const start = Number(range?.replace(/\D/g, '')) || 0;
        const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

        const stream = fs.createReadStream(videoPath, { start, end });

        // Envia os cabeçalhos adequados para um stream de vídeo
        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${videoSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': end - start + 1,
            'Content-Type': 'video/mp4', // ou outro tipo de vídeo, conforme necessário
        });

        stream.pipe(res);
    });
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor de vídeos rodando em http://localhost:${port}`);
});
