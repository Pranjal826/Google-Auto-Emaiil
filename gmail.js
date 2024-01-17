const { google } = require('googleapis');

const listMessages = async (auth) => {
  const gmail = google.gmail({ version: 'v1', auth });
  const response = await gmail.users.messages.list({
    userId: 'me',
    labelIds: ['INBOX'],
  });
  return response.data.messages || [];
};

const sendAutoReply = async (auth, messageId) => {
    const gmail = google.gmail({ version: 'v1', auth });
  
    // Get the sender's email address
    const senderEmail = await getSenderEmail(auth, messageId);
  
    // Check if the message has been replied to before
    const hasBeenReplied = await hasMessageBeenReplied(auth, messageId);
  
    if (!hasBeenReplied) {
      // Compose the auto-reply
      const autoReply = "This is for testing purpose";
  
      // Send the auto-reply to the sender's email
      await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: Buffer.from(`To: ${senderEmail}\r\nSubject: Re: Your Subject\r\n\r\n${autoReply}`).toString('base64'),
        },
      });
  
      console.log(`Auto-reply sent for message: ${messageId}`);
    }
  };
  

const labelMessage = async (auth, messageId, labelName) => {
  const gmail = google.gmail({ version: 'v1', auth });
  const labelId = await getLabelId(auth, labelName);

  await gmail.users.messages.modify({
    userId: 'me',
    id: messageId,
    resource: {
      addLabelIds: [labelId],
    },
  });

  console.log(`Message labeled: ${messageId}`);
};

const hasMessageBeenReplied = async (auth, messageId) => {

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

const getLabelId = async (auth, labelName) => {
  const gmail = google.gmail({ version: 'v1', auth });
  const response = await gmail.users.labels.list({
    userId: 'me',
  });

  const label = response.data.labels.find((label) => label.name === labelName);

  if (label) {
    return label.id;
  } else {
    const newLabel = await gmail.users.labels.create({
      userId: 'me',
      resource: {
        name: labelName,
      },
    });

    return newLabel.data.id;
  }
};

const getSenderEmail = async (auth, messageId) => {
    // Implement logic to retrieve the sender's email address from the message
    // For simplicity, let's assume the sender is the first "From" address
    const gmail = google.gmail({ version: 'v1', auth });
    const response = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
    });
  
    const headers = response.data.payload.headers;
    const fromHeader = headers.find(header => header.name === 'From');
  
    if (fromHeader) {
      return fromHeader.value;
    } else {
      return '';
    }
  };
  

module.exports = { listMessages, sendAutoReply, labelMessage };
