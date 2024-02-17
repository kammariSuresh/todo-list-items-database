
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 9999;

// Middleware to enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH'); // Include PATCH method
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
        done BOOLEAN  FALSE
    )`);
});

app.use(bodyParser.json());

// Get all tasks
app.get('/tasks', (req, res) => {
    // console.log(req, res)
    db.all('SELECT * FROM tasks', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        // console.log(rows)
        // const rowsItem = rows.map(each => [{id: each.id, title:each.title, done: true}])
        res.json(rows);

    });

});

// Add a new task
app.post('/tasks', (req, res) => {
    const { title, done } = req.body;
    // console.log(title,done)
    db.get("SELECT COUNT(*) as count FROM tasks", function(err, row) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        // If tasks table is empty, set id to 1
        const id = row.count === 0 ? 1 : row.count + 1;
        const isTrue = false
        db.run('INSERT INTO tasks (id, title, done) VALUES (?, ?, ?)', [id, title, isTrue], function(err) {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
            res.json({ id, title, done });
    });
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
