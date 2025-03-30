const db = require('./fw/db');

const bcrypt = require('bcrypt');

async function migratePasswords() {
    const conn = await db.connectDB();
    const [users] = await conn.execute('SELECT id, password FROM users');

    for (const user of users) {
        // Nur hashen, wenn das Passwort noch nicht gehasht ist (optional)
        if (!user.password.startsWith('$2b$')) {
            const hashed = await bcrypt.hash(user.password, 10);
            await conn.execute('UPDATE users SET password = ? WHERE id = ?', [hashed, user.id]);
            console.log(`✔️ User ${user.id} gehasht`);
        } else {
            console.log(`⏩ User ${user.id} bereits gehasht`);
        }
    }

    console.log('✅ Alle Klartext-Passwörter wurden gehasht.');
    process.exit(); // Script sauber beenden
}

migratePasswords();
