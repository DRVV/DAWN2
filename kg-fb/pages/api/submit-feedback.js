import fs from 'fs';
import path from 'path';
import { escape } from 'querystring';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const feedbackData = req.body;

    // df
    const filePath = path.join(process.cwd(), 'data', 'feedback.json')

    // read existing
    let feedbackArray = [];
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath);
      feedbackArray = JSON.parse(fileData);

    }

    feedbackArray.push(feedbackData);

    fs.writeFileSync(filePath, JSON.stringify(feedbackArray, null, 2));

    res.status(200).json({message: 'Feedback submitted successfully.'});

  } else {
    res.status(405).json({message: 'method not allowed.'})
  }
}