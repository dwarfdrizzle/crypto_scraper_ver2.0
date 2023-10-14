const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serving static assets like JS and CSS
app.use('/static', express.static(path.join(__dirname, 'static')));

// Serving the main HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Frontend server started on http://localhost:${PORT}`);
});
