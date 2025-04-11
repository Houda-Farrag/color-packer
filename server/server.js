const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();

const COLOR_PATH = path.join(__dirname, '../data/colors.json');
const PROJECTS_PATH = path.join(__dirname, '../data/projects.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

function parseJSONSafe(content, fallback = []) {
  try {
    return JSON.parse(content);
  } catch {
    return fallback;
  }
}

// ========= COLOR ROUTES =========
app.get('/api/colors', (req, res) => {
  fs.readFile(COLOR_PATH, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read colors' });
    res.json(parseJSONSafe(data));
  });
});

app.post('/api/colors', (req, res) => {
  const newColor = req.body.color;
  if (!newColor) return res.status(400).json({ error: 'No color provided' });

  fs.readFile(COLOR_PATH, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Read error' });
    let colors = parseJSONSafe(data);
    if (!colors.includes(newColor)) colors.push(newColor);
    fs.writeFile(COLOR_PATH, JSON.stringify(colors, null, 2), err => {
      if (err) return res.status(500).json({ error: 'Write error' });
      res.json({ success: true, colors });
    });
  });
});

app.delete('/api/colors/:color', (req, res) => {
  const color = decodeURIComponent(req.params.color);
  fs.readFile(COLOR_PATH, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Read error' });
    const colors = parseJSONSafe(data);
    const updated = colors.filter(c => c !== color);
    fs.writeFile(COLOR_PATH, JSON.stringify(updated, null, 2), err => {
      if (err) return res.status(500).json({ error: 'Write error' });
      res.json({ success: true, colors: updated });
    });
  });
});

// ========= PROJECT ROUTES =========
app.get('/api/projects', (req, res) => {
  fs.readFile(PROJECTS_PATH, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read projects' });
    res.json(parseJSONSafe(data));
  });
});

app.post('/api/projects', (req, res) => {
  const { name, primary, secondary, others = [] } = req.body;
  if (!name || !primary || !secondary) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  fs.readFile(PROJECTS_PATH, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Read error' });

    let projects = parseJSONSafe(data);
    if (projects.find(p => p.name === name)) {
      return res.status(400).json({ error: 'Project already exists' });
    }

    const newProject = { name, primary, secondary, others };
    projects.push(newProject);

    fs.writeFile(PROJECTS_PATH, JSON.stringify(projects, null, 2), err => {
      if (err) return res.status(500).json({ error: 'Write error' });
      res.json({ success: true, project: newProject });
    });
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Color Viewer API running at http://localhost:${PORT}`);
});