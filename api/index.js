try {
    const app = require('../backend/server');
    module.exports = app;
} catch (err) {
    console.error("Vercel Entry Error:", err);
    module.exports = (req, res) => {
        res.status(500).send(`
            <h1>Vercel Entry Error</h1>
            <p><strong>Message:</strong> ${err.message}</p>
            <pre>${err.stack}</pre>
        `);
    };
}
