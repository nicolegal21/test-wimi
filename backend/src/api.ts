import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import router from './routes/main.router';

const PORT = 3000;
export const app = express();

app.use(bodyParser.json({limit: '50mb'}));

app.use('/', router);

export const server =  http.createServer(app).listen(PORT, () => {
    console.log(`Server running:${PORT}`);
});