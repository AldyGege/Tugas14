const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs')
const connection = require('../config/database');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images')
    },
    filename: (req, file, cb) => {
        console.log(file)
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('Jenis File Tidak Diizinkan'), false)
    }
}
const upload = multer({ storage: storage, fileFilter: fileFilter })


router.get('/', function(req, res) {
    connection.query('select a.nama_kendaraan, b.nama_transmisi as transmisi ' + 'from kendaraan a join transmisi b' + 'on b.id_transmisi order by a.no_pol desc', function(err, rows) {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Server Failed',
                error: err
            })
        } else {
            return res.status(200).json({
                status: true,
                message: 'Data kendaraan',
                data: rows
            })
        }
    })
})

router.post('/store', upload.single("gambar_kendaraan"), [
    body('no_pol').notEmpty(),
    body('nama_kendaraan').notEmpty(),
    body('id_transmisi').notEmpty(),

], (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(422).json({
            error: error.array()
        })
    }
    let Data = {
        no_pol: req.body.no_pol,
        nama_kendaraan: req.body.nama_kendaraan,
        id_transmisi: req.body.id_transmisi,
        gambar_kendaraan: req.file.filename
    }
    connection.query('insert into kendaraan set ?', Data, function(err, rows) {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Server Error',
                error: err
            })
        } else {
            return res.status(201).json({
                status: true,
                message: 'Success..!',
                data: rows[0]
            })
        }
    })
})

router.get('/(:no_pol)', function(req, res) {
    let no_pol = req.params.no_pol;
    connection.query(`SELECT a.nama_kendaraan, b.nama_transmisi as transmisi FROM kendaraan a
    JOIN transmisi b ON a.id_transmisi = b.id_transmisi WHERE a.no_pol = ${no_pol}`, function(err, rows) {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Server Error',
            })
        }
        if (rows.length <= 0) {
            return res.status(404).json({
                status: false,
                message: 'Not Found',
            })
        } else {
            return res.status(200).json({
                status: true,
                message: 'Data kendaraan',
                data: rows[0]
            })
        }
    })
})

router.patch('/update/(:no_pol)', upload.single("gambar_kendaraan"), [
    body('no_pol').notEmpty(),
    body('nama_kendaraan').notEmpty(),
    body('id_transmisi').notEmpty(),
], (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(422).json({
            error: error.array()
        });
    }

    let no_pol = req.params.no_pol;
    let gambar_kendaraan = req.file ? req.file.filename : null;
    connection.query(`SELECT * FROM kendaraan WHERE no_pol='${no_pol}'`, function(err, rows) {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Server Error',
            })
        }
        if (rows.length <= 0) {
            return res.status(404).json({
                status: false,
                message: 'Not Found',
            })
        }
        const namaFileLama = rows[0].gambar_kendaraan;
        if (namaFileLama && gambar_kendaraan) {
            const pathFileLama = path.join(__dirname, '../public/images', namaFileLama);
            fs.unlinkSync(pathFileLama);
        }
        let Data = {
            no_pol: req.body.no_pol,
            nama_kendaraan: req.body.nama_kendaraan,
            id_transmisi: req.body.id_transmisi,
            gambar_kendaraan: gambar_kendaraan,
        }
        connection.query(`update kendaraan set ? where no_pol='${no_pol}'`, Data, function(err, rows) {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: 'Server Error',
                })
            } else {
                return res.status(200).json({
                    status: true,
                    message: 'Update Success..!'
                })
            }
        })
    })
})

router.delete('/delete/(:no_pol)', function(req, res) {
    let no_pol = req.params.no_pol;
    connection.query(`SELECT a.nama_kendaraan, b.nama_transmisi as transmisi FROM kendaraan a
    JOIN transmisi b ON a.id_transmisi = b.id_transmisi WHERE a.no_pol = ${no_pol}`, function(err, rows) {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Server Error'
            })
        }
        if (rows.length <= 0) {
            return res.status(404).json({
                status: false,
                message: 'Not Found'
            })
        }
        const namaFileLama = rows[0].gambar_kendaraan;

        if (namaFileLama && gambar_kendaraan) {
            const pathFileLama = path.join(__dirname, '../public/images', namaFileLama);
            fs.unlinkSync(pathFileLama);
        }
        connection.query(`delete from kendaraan where no_pol = ${no_pol}`, function(err, rows) {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: 'Server Error'
                })
            } else {
                return res.status(200).json({
                    status: true,
                    message: 'Data Has been delete'
                })
            }
        })
    })
})

module.exports = router;