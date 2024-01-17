// app.js
const authenticate = require('./auth');
const { listMessages, sendAutoReply, labelMessage } = require('./gmail');
const { google } = require('googleapis');

const labelName = 'VacationAutoReply';

const startApp = async () => {
  const auth = await authenticate();

  setInterval(async () => {
    try {
      const messages = await listMessages(auth);

      for (const message of messages) {
        const messageId = message.id;

        // Check if this message has been replied to before
        const hasBeenReplied = await hasMessageBeenReplied(auth, messageId);

        // If no prior replies, send auto-reply, label, and mark as replied
        if (!hasBeenReplied) {
          await sendAutoReply(auth, messageId);
          await labelMessage(auth, messageId, labelName);
          await markMessageAsReplied(auth, messageId);
        }

        // Log the processed message ID
        console.log(`Processed message: ${messageId}`);
      }
    } catch (error) {
      console.error('Error processing emails:', error);
    }
  }, getRandomInterval());
};

const hasMessageBeenReplied = async (auth, messageId) => {
  // Implement logic to check if the message has been replied to before
  // This could involve checking for specific labels, custom headers, or other indicators
  // For simplicity, let's assume checking for the "Replied" label
  const labels = await getMessageLabels(auth, messageId);
  return labels.includes('Replied');
};

const getMessageLabels = async (auth, messageId) => {
  const gmail = google.gmail({ version: 'v1', auth });
  const response = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
  });

  return response.data.labelIds || [];
};

const markMessageAsReplied = async (auth, messageId) => {
  // Implement logic to mark the message as replied
  // This could involve adding a custom label or updating a database
  // For simplicity, let's add a label named "Replied"
  await labelMessage(auth, messageId, 'Replied');
};

const getRandomInterval = () => {
  // Returns a random interval between 45 and 120 seconds
  return Math.floor(Math.random() * (120000 - 45000)) + 45000;
};

startApp();
