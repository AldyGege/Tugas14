const express = require('express')
const app = express()
const port = 3000

const bodyPs = require('body-parser');
app.use(bodyPs.urlencoded({ extended: false }))
app.use(bodyPs.json());

const transmisiRouter = require('./routes/transmisi');
app.use('/api/transmisi', transmisiRouter);

const kendaraanRouter = require('./routes/kendaraan');
app.use('/api/kendaraan', kendaraanRouter);

app.listen(port, () => {
    console.log(`Aplikasi Aldy Geming Berjalan di http:://localhost:${port}`)
})