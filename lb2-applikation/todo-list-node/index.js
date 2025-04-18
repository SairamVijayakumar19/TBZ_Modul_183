const tasklist = require('./user/tasklist');
const bgSearch = require('./user/backgroundsearch');

async function getHtml(req) {
    let taskListHtml = await tasklist.html(req);
    return `<h2>Welcome, ` + (req.session.username || 'User') + `!</h2>` + taskListHtml + '<hr />' + bgSearch.html(req);
}

module.exports = {
    html: getHtml
}