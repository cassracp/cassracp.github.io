const { readFileSync } = require('fs');
const { join } = require('path');

const MARKER_BAT = '---START-BAT---';
const MARKER_SQL_U8 = '---START-SQL-U8---';
const MARKER_SQL_W1252 = '---START-SQL-W1252---';
const MARKER_END = '---END-PAYLOADS---';

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    try {
        const { batContent, sqlU8Content, sqlW1252Content } = req.body;

        if (!batContent || !sqlU8Content || !sqlW1252Content) {
            return res.status(400).json({ error: 'Missing one or more content parts (batContent, sqlU8Content, sqlW1252Content).' });
        }

        // Load the pre-compiled Go wrapper.exe
        const wrapperPath = join(__dirname, 'wrapper.exe');
        let wrapperExeBuffer;
        try {
            wrapperExeBuffer = readFileSync(wrapperPath);
        } catch (error) {
            console.error('Error reading wrapper.exe:', error);
            return res.status(500).json({ error: 'Failed to load wrapper.exe. Ensure it is present in the api directory.' });
        }

        // Convert string contents to buffers
        const batBuffer = Buffer.from(batContent, 'utf8');
        const sqlU8Buffer = Buffer.from(sqlU8Content, 'utf8');
        const sqlW1252Buffer = Buffer.from(sqlW1252Content, 'utf8');

        // Concatenate all parts
        const finalExeBuffer = Buffer.concat([
            wrapperExeBuffer,
            Buffer.from(MARKER_BAT),
            batBuffer,
            Buffer.from(MARKER_SQL_U8),
            sqlU8Buffer,
            Buffer.from(MARKER_SQL_W1252),
            sqlW1252Buffer,
            Buffer.from(MARKER_END),
        ]);

        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', 'attachment; filename="ScriptsUnificados.exe"');
        res.send(finalExeBuffer);

    } catch (error) {
        console.error('Error generating executable:', error);
        res.status(500).json({ error: 'Failed to generate executable.', details: error.message });
    }
};
