import express from 'express';

const app = express();
const port = 8080;

app.get('/test', (req, res) => {
  res.send('Test route working');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
