const db = require('../../fw/db');

async function search(req) {
    if (!req.query.userid || !req.query.terms) {
        return "Not enough information to search";
    }

    const userid = parseInt(req.query.userid, 10);
    const terms = req.query.terms;

    if (isNaN(userid)) {
        return "Invalid user ID";
    }

    let result = '';

    try {
        const stmt = await db.executeStatement(
            "SELECT ID, title, state FROM tasks WHERE userID = ? AND title LIKE ?",
            [userid, `%${terms}%`]
        );

        if (stmt.length > 0) {
            stmt.forEach(row => {
                result += `${escapeHTML(row.title)} (${escapeHTML(row.state)})<br />`;
            });
        } else {
            result = 'Keine Ergebnisse gefunden.';
        }
    } catch (err) {
        console.error('Fehler bei der Suche:', err);
        result = 'Fehler bei der Suche';
    }

    return result;
}

function escapeHTML(str) {
    return str.replace(/[&<>"']/g, function (match) {
        const escapeMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
        };
        return escapeMap[match];
    });
}

module.exports = {
    search
};
