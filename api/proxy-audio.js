import fetch from 'node-fetch';

export default async function handler(req, res) {
    const { url } = req.query;

    if (!url) {
        return res.status(400).send('Missing "url" query parameter.');
    }

    // Basic URL validation
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return res.status(400).send('Invalid URL protocol. Must be http or https.');
    }

    try {
        const response = await fetch(url);

        if (!response.ok) {
            // Forward the status from the upstream server
            return res.status(response.status).send(`Failed to fetch audio: ${response.statusText}`);
        }

        // Set appropriate headers for streaming the audio
        // Crucially, set Access-Control-Allow-Origin to allow your frontend to access it
        res.setHeader('Access-Control-Allow-Origin', '*'); // Or specific origin like 'https://cassracp.github.io'
        res.setHeader('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
        res.setHeader('Content-Length', response.headers.get('content-length'));
        
        // Stream the audio back to the client
        response.body.pipe(res);

    } catch (error) {
        console.error('Proxy audio error:', error);
        res.status(500).send('Internal Server Error during audio proxy.');
    }
}
