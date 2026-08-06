const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(bodyParser.json());
app.use(cors());

const messages = [];

app.get('/webhook', (req, res) => {
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (token === process.env.VERIFY_TOKEN) {
    res.send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', (req, res) => {
  const body = req.body;
  if (body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
    const msg = body.entry[0].changes[0].value.messages[0];
    messages.push({
      id: Date.now(),
      from: msg.from,
      text: msg.text?.body || '',
      time: new Date().toLocaleTimeString(),
      type: 'incoming'
    });
    console.log('📱', msg.text?.body);
  }
  res.send('ok');
});

app.get('/api/messages', (req, res) => res.json(messages));

app.post('/api/send', (req, res) => {
  const { to, text } = req.body;
  messages.push({ id: Date.now(), to, text, time: new Date().toLocaleTimeString(), type: 'outgoing' });
  res.json({ ok: true });
});

app.get('/', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server on port ${PORT}`));
