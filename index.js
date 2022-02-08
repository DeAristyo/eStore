const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const eStoreRouter = require('./routers/estoreRouter');

app.use('/estore', eStoreRouter);

app.listen(PORT, () => console.log(`API RUNNING at http://localhost:${PORT}`));