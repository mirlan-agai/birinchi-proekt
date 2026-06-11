const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Маалыматтарды кабыл алуу үчүн орнотуулар
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// SQLite3 базасын түзүү же ачуу
const db = new sqlite3.Database('./users.db', (err) => {
    if (err) console.error(err.message);
    console.log('SQLite базасына туташуу ишке ашты.');
});

// Колдонуучулар таблицасын түзүү
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT,
    lastName TEXT,
    username TEXT UNIQUE,
    password TEXT,
    phone TEXT
)`);

// КАТТАЛУУ процесси (POST суроо-талабы)
app.post('/register', (req, res) => {
    const { firstName, lastName, username, password, phone } = req.body;

    const query = `INSERT INTO users (firstName, lastName, username, password, phone) VALUES (?, ?, ?, ?, ?)`;
    
    db.run(query, [firstName, lastName, username, password, phone], (err) => {
        if (err) {
            // Эгер мындай логин базада бар болсо ката берет
            return res.send('<h2>Бул логин ээленген! Башка логин тандаңыз.</h2><a href="/register.html">Артка</a>');
        }
        res.redirect('/login.html'); // Катталгандан кийин кирүү барагына жөнөтөт
    });
});

// КИРҮҮ процесси (POST суроо-талабы)
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const query = `SELECT * FROM users WHERE username = ? AND password = ?`;

    db.get(query, [username, password], (err, row) => {
        if (err) {
            return res.send('Катачылык кетти.');
        }
        if (row) {
            // Эгер логин менен пароль туура келсе
            res.redirect('/welcome.html');
        } else {
            // Туура эмес болсо
            res.send('<h2>Логин же пароль ката!</h2><a href="/login.html">Кайра аракет кылуу</a>');
        }
    });
});

// Серверди күйгүзүү
app.listen(PORT, () => {
    console.log(`Сервер иштеди: http://localhost:${PORT}`);
});
