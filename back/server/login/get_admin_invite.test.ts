import assert from 'node:assert/strict';
import { AddressInfo } from 'node:net';
import test from 'node:test';
import express from 'express';
import { inviteRateLimiter } from './get_admin_invite';

const makeInviteRequest = async (url: string, adminEmail: string) => {
  return await fetch(`${url}/send_admin_invite_if_exists`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ adminEmail }),
  });
};

test('inviteRateLimiter blocks the 6th request in the configured window', async () => {
  const app = express();
  app.use(express.json());
  app.post('/send_admin_invite_if_exists', inviteRateLimiter, (_req, res) => {
    return res.status(200).json({ success: true });
  });

  const server = app.listen(0);

  try {
    await new Promise<void>((resolve) => {
      server.once('listening', () => resolve());
    });

    const address = server.address() as AddressInfo;
    const url = `http://127.0.0.1:${address.port}`;
    const adminEmail = 'admin@example.com';

    for (let i = 0; i < 5; i += 1) {
      const response = await makeInviteRequest(url, adminEmail);
      assert.equal(response.status, 200);
    }

    const blockedResponse = await makeInviteRequest(url, adminEmail);
    assert.equal(blockedResponse.status, 429);

    const body = (await blockedResponse.json()) as { message?: string };
    assert.equal(body.message, 'Too many invite requests, please try again later.');
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }
});
