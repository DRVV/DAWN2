export default function handler(req, res) {
    if (req.method === 'POST') {
        const graphData = req.body;

        res.status(200).json({message: 'Graph data recieved successfully.'});

    } else {
        res.status(405).json({ message: 'Method not allowed'});
    }
}