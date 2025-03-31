const db = require('./fw/db');

function escapeHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

async function getHtml(req) {
    let html = '';
    const { id, title, state } = req.body;
    const userid = req.session.userid;


    if (title && state && userid) {
        const conn = await db.connectDB();

        try {
            if (!id) {
                await conn.execute(
                    'INSERT INTO tasks (title, state, userID) VALUES (?, ?, ?)',
                    [title, state, userid]
                );
                html += `<p>Task "${escapeHTML(title)}" wurde erfolgreich erstellt.</p>`;
            } else {
                await conn.execute(
                    'UPDATE tasks SET title = ?, state = ? WHERE ID = ? AND userID = ?',
                    [title, state, id, userid]
                );
                html += `<p>Task "${escapeHTML(title)}" wurde erfolgreich aktualisiert.</p>`;
            }
        } catch (err) {
            html += `<p>Fehler beim Speichern: ${escapeHTML(err.message)}</p>`;
        }
    } else {
        html += `<p>Fehlende Eingaben.</p>`;
    }

    html += `<a href="/">Zurück zur Übersicht</a>`;
    return html;
}

module.exports = { html: getHtml };
