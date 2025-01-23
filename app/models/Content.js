const db = require('../data/db');

class Content {
    static create(contentData) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO content 
                (lesson_id, titulo, contenido)
                VALUES (?, ?, ?)
            `;

            db.run(
                sql,
                [
                    contentData.lesson_id,
                    contentData.titulo,
                    contentData.contenido
                ],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }

    static findByLessonId(lessonId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT id, titulo, contenido, created_at
                FROM content
                WHERE lesson_id = ?
                ORDER BY created_at ASC
            `;
            
            db.all(sql, [lessonId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    static findById(id) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT id, lesson_id, titulo, contenido
                FROM content
                WHERE id = ?
            `;
            
            db.get(sql, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    static update(id, contentData) {
        return new Promise((resolve, reject) => {
            const sql = `
                UPDATE content
                SET titulo = ?, contenido = ?
                WHERE id = ?
            `;

            db.run(
                sql,
                [
                    contentData.titulo,
                    contentData.contenido,
                    id
                ],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.changes);
                }
            );
        });
    }

    static delete(id) {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM content WHERE id = ?';
            
            db.run(sql, [id], function (err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }
}

module.exports = Content; 