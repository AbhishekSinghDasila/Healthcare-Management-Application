const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { Server } = require('socket.io');
const http = require('http');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3009;

// Mock Ethereal Email Setup
let transporter;
nodemailer.createTestAccount().then(account => {
  transporter = nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: {
      user: account.user,
      pass: account.pass
    }
  });
  console.log('Ethereal Email transporter created');
}).catch(console.error);

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Notification Service is running' });
});

// Endpoint to send email and emit socket event
app.post('/notify', async (req, res) => {
  const { to, subject, text, eventType, payload } = req.body;
  try {
    if (transporter && to) {
      let info = await transporter.sendMail({
        from: '"Healthcare Platform" <no-reply@healthcare.com>',
        to: to,
        subject: subject,
        text: text,
      });
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    if (eventType && payload) {
      io.emit(eventType, payload);
    }
    
    res.status(200).json({ message: 'Notification sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

server.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
});
