const db = require('../../fw/db');

async function search(req) {
    if (req.query.userid === undefined || req.query.terms === undefined){
        return "Not enough information to search";
    }

    let userid = req.query.userid;
    let terms = req.query.terms;
    let result = '';

    let stmt = await db.executeStatement(
        "SELECT ID, title, state FROM tasks WHERE userID = ? AND title LIKE ?",
        [userid, `%${terms}%`]
      );
            
    if (stmt.length > 0) {
        stmt.forEach(function(row) {
            result += row.title+' ('+row.state+')<br />';
        });
    }

    return result;
}

module.exports = {
    search: search
};