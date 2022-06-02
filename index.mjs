import http from 'http'
import https from 'https'
import tweetnacl from 'tweetnacl';
import fetch from 'node-fetch'
import 'dotenv/config'
import fs from 'fs'

const options = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem')
}

// Your public key can be found on your application in the Developer Portal
const PUBLIC_KEY = '0b91c5aee984a385dd9453eb591668c9d481a018ba12e7213c627aa4c184c58a';

import express from 'express'

const app = express()
const port = 8080
const ports = 8443

http.createServer(app).listen(port, '127.0.0.1', function() {
  console.log("HTTP Server listening on port " + port)
})
https.createServer(app).listen(ports, '127.0.0.1', function() {
  console.log("HTTPS Server listening on port " + ports)
})

app.get('/', (req, res) => {
  res.send('IWL API')
	console.log("here")
})

app.post('/evaluator', (req, res) => {
  const signature = req.get('X-Signature-Ed25519');
  const timestamp = req.get('X-Signature-Timestamp');
  const body = req.rawBody; // rawBody is expected to be a string, not raw bytes

  const isVerified = tweetnacl.sign.detached.verify(
    Buffer.from(timestamp + body),
    Buffer.from(signature, 'hex'),
    Buffer.from(PUBLIC_KEY, 'hex')
  );

  if (!isVerified) {
    return res.status(401).end('invalid request signature');
  }

  body = req.body

  switch (body.type) {
    case '1':
      return res.status(200).send(JSON.stringify({type: 1}))

    case '2':
      res.send(JSON.stringify({type: 2, data: {content: "Hello World"}}))
  }
})

app.get('/evaluator/init', async function(req, res)  {
  fetch('https://discord.com/api/v10/applications/977803682534019082/commands', {
    method: 'POST',
    body: JSON.stringify({
      name: "changelog",
      description: "Publishes a new changelog. Must have Manage Events to use.",
      default_member_permissions: 8589934592
    }),
    headers: {
      Authorization: process.env.TOKEN,
      "Content-Type": "application/json"
    }
  })

  fetch('https://discord.com/api/v10/applications/977803682534019082/commands', {
    method: 'POST',
    body: JSON.stringify({
      name: "repo",
      description: "Sends you a link to the Evaluate GitHub repository."
    }),
    headers: {
      Authorization: process.env.TOKEN,
      "Content-Type": "application/json"
    }
  })

  fetch('https://discord.com/api/v10/applications/977803682534019082/commands', {
    method: 'POST',
    body: JSON.stringify({
      name: "download",
      description: "Sends you a link to the Evaluate Sourceforge page."
    }),
    headers: {
      Authorization: process.env.TOKEN,
      "Content-Type": "application/json"
    }
  })

  res.status(200).send("Commands initialised")
})

