// auth.js

const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const express = require('express');

const SCOPES = ['https://www.googleapis.com/auth/gmail.modify'];
const TOKEN_PATH = 'token.json';

let server; // Declare server in the outer scope

const authenticate = async () => {
  const credentials = require('./credentials.json');
  const { client_secret, client_id, redirect_uris } = credentials.web;
  const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);

  try {
    const token = require(`./${TOKEN_PATH}`);
    oAuth2Client.setCredentials(token);
  } catch (err) {
    await getNewToken(oAuth2Client);
  }

  return oAuth2Client;
};

const getNewToken = async (oAuth2Client) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  const app = express();
  server = app.listen(3000, () => {
    console.log(`Authorize this app by visiting: ${authUrl}`);
  });

  app.get('/auth/callback', async (req, res) => {
    try {
      const code = req.query.code;
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);
      res.send('Authentication successful!');
    } catch (error) {
      console.error('Error getting token:', error);
      res.status(500).send('Error getting token. Please check the console logs.');
    } finally {
      closeServer();
    }
  });
};

const closeServer = () => {
  if (server) {
    server.close(() => {
      console.log('Server closed');
    });
  }
};

module.exports = authenticate;
