const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./models/User');

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

mongoose.connect('mongodb://localhost:27017/tresraya')
    .then(() => {
        console.log("Conexion a la base de datos realizada");
    })
    .catch(error => {
        console.error('Error al conectarse a la base de datos', error);
    });

app.get("/login", (req, res) => {
    res.render('login', { error: null });
})

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('login', { error: 'Usuario o contraseña incorrecto' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.render('login', { error: 'Usuario o contraseña incorrecto' });
        }

        res.redirect('/juego');
    } catch (error) {
        console.error(error);
        res.render('login', { error: 'Error de conexion a la base de datos' });
    }
});

app.get("/register", (req, res) => {
    res.render('register', { error: null });
})

app.post('/register', async (req, res) => {
    try {
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        });
        await newUser.save();
        res.render('login', { error: null });
    } catch (error) {
        console.log(error);
        res.render('register', { error: 'Error al guardar el usuario' });
    }
});

app.get("/juego", (req, res) => {
    res.render('juego', { error: 'null' });})

server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});