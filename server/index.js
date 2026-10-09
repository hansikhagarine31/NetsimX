import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const storageDir = path.join(__dirname, 'savedProjects');
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

// REST Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', name: 'NetSimX Express API Server', version: '1.0.0' });
});

app.get('/api/projects', (req, res) => {
  try {
    const files = fs.readdirSync(storageDir).filter(f => f.endsWith('.json'));
    const projects = files.map(filename => {
      const filePath = path.join(storageDir, filename);
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return {
        id: filename.replace('.json', ''),
        filename,
        name: content.name || filename,
        timestamp: content.timestamp || new Date()
      };
    });
    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/projects', (req, res) => {
  try {
    const { name, devices, connections, logs } = req.body;
    const projectId = `proj_${Date.now()}`;
    const filePath = path.join(storageDir, `${projectId}.json`);

    const dataToSave = {
      id: projectId,
      name: name || 'Untitled Network Topology',
      timestamp: new Date().toISOString(),
      devices,
      connections,
      logs
    };

    fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2));
    res.json({ success: true, projectId, data: dataToSave });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[NetSimX Server] Express Backend running on http://localhost:${PORT}`);
});
