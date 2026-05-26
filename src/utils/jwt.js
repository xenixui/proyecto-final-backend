const crypto = require('crypto');

function base64url(input) {
  return Buffer.from(JSON.stringify(input))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64urlBuffer(buffer) {
  return buffer
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function getSecret() {
  return process.env.JWT_SECRET || 'dev_secret_cambiar_en_produccion';
}

function signToken(payload, expiresInSeconds = 60 * 60 * 24) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  const body = { ...payload, iat: now, exp: now + expiresInSeconds };

  const unsignedToken = `${base64url(header)}.${base64url(body)}`;
  const signature = crypto
    .createHmac('sha256', getSecret())
    .update(unsignedToken)
    .digest();

  return `${unsignedToken}.${base64urlBuffer(signature)}`;
}

function verifyToken(token) {
  const [encodedHeader, encodedPayload, receivedSignature] = token.split('.');
  if (!encodedHeader || !encodedPayload || !receivedSignature) {
    throw new Error('Token inválido');
  }

  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = base64urlBuffer(
    crypto.createHmac('sha256', getSecret()).update(unsignedToken).digest()
  );

  if (receivedSignature !== expectedSignature) {
    throw new Error('Firma inválida');
  }

  const payload = JSON.parse(Buffer.from(encodedPayload, 'base64').toString('utf8'));
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expirado');
  }

  return payload;
}

module.exports = {
  signToken,
  verifyToken,
};
