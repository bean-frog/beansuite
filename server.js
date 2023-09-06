const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.raw({ type: 'application/json' }));
app.use(express.static('saves'))
app.post('/save-tinymce-content', (req, res) => {
  const requestData = JSON.parse(req.body);
  const title = requestData.title;
  const content = requestData.content;
  if (!fs.existsSync('saves')) {
    fs.mkdirSync('saves');
  }
  const filePath = `saves/docs/${title}.html`;
  const htmlTemplate = `
 ${content}
`;
app.post('/getHtml', (req, res) => {
  if (err) {
    console.error(err);
    res.status(500).send('you dob fucked up lol')
  } else {
    console.log(req.body)
  }
})
  fs.writeFile(filePath, htmlTemplate, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error saving content');
    } else {
      res.status(200).send('Content saved successfully');
    }
  });
});

app.get('/getDocs', (req, res) => {
  const docsDirectory = path.join(__dirname, 'saves', 'docs');
  fs.readdir(docsDirectory, (err, files) => {
      if (err) {
          console.error('Error reading directory:', err);
          return res.status(500).json({ error: 'Internal server error' });
      }
      const fileInfoArray = [];
      files.forEach(file => {
          const filePath = path.join(docsDirectory, file);
          const stats = fs.statSync(filePath);
          fileInfoArray.push({
              filename: file,
              lastModified: stats.mtime
          });
      });
      res.json(fileInfoArray);
  });
});
const port = 3000; //If you change this, remember to change the fetch calls in tiny.js
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
