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
    const userid = parseInt(req.session.userid, 10);

    // Eingaben validieren
    if (!title || !state || isNaN(userid)) {
        html += `<p>Fehlende oder ungültige Eingaben.</p>`;
        html += `<a href="/">Zurück zur Übersicht</a>`;
        return html;
    }

    try {
        const conn = await db.connectDB();

        if (!id) {
            // INSERT mit vorbereiteten Platzhaltern
            await conn.execute(
                'INSERT INTO tasks (title, state, userID) VALUES (?, ?, ?)',
                [title, state, userid]
            );
            html += `<p>Task "${escapeHTML(title)}" wurde erfolgreich erstellt.</p>`;
        } else {
            const taskId = parseInt(id, 10);
            if (isNaN(taskId)) {
                html += `<p>Ungültige Task-ID.</p>`;
            } else {
                // UPDATE mit vorbereiteten Platzhaltern
                await conn.execute(
                    'UPDATE tasks SET title = ?, state = ? WHERE ID = ? AND userID = ?',
                    [title, state, taskId, userid]
                );
                html += `<p>Task "${escapeHTML(title)}" wurde erfolgreich aktualisiert.</p>`;
            }
        }
    } catch (err) {
        console.error('[Fehler bei Task-Verarbeitung]:', err);
        html += `<p>Fehler beim Speichern: ${escapeHTML(err.message)}</p>`;
    }

    html += `<a href="/">Zurück zur Übersicht</a>`;
    return html;
}

module.exports = { html: getHtml };
