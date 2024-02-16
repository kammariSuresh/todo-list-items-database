import express from 'express'
import bodyParser from 'body-parser'
import  sqlite3  from 'sqlite3';
// const express = require('express');
// const bodyParser = require('body-parser');
// const sqlite3 = require('sqlite3').verbose();
sqlite3.verbose()
const app = express();
const port = 5000;

// Middleware to enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Connect to SQLite3 database
const db = new sqlite3.Database('./todo.db');
// Create tasks table if not exists
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        done BOOLEAN NOT NULL DEFAULT 0
    )`);
});

app.use(bodyParser.json());

// Get all tasks
app.get('/tasks', (req, res) => {
    db.all('SELECT * FROM tasks', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });

});

// Add a new task
app.post('/tasks', (req, res) => {
    const { title, done } = req.body;
    
    db.run('INSERT INTO tasks (title, done) VALUES (?, ?)', [title, done], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, title, done });
    });
});

// Update a task
app.put('/tasks/:id', (req, res) => {
    const { title, done } = req.body;
    const id = req.params.id;
    db.run('UPDATE tasks SET title = ?, done = ? WHERE id = ?', [title, done, id], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ id, title, done });
    });
});

// Delete a task
app.delete('/tasks/:id', (req, res) => {
    const id = req.params.id;
    
    db.run('DELETE FROM tasks WHERE id = ?', id, function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: 'Task deleted successfully', id });
    });
});



// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
