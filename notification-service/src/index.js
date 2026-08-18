require('dotenv').config();

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

// Real SMTP transporter, built synchronously at startup from env vars.
let transporter = null;

if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.warn('[notification-service] SMTP_HOST, SMTP_USER, or SMTP_PASS is not configured. Email sending is disabled; the service will still boot.');
} else {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  console.log('SMTP transporter created');
}

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
      console.log('Email sent:', info.messageId);
    } else if (to) {
      console.log('[notification-service] SMTP not configured, skipping email send');
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
