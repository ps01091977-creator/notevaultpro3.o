const jwt = require('jsonwebtoken');

let publicKeys = {};
let cacheExpiry = 0;

/**
 * Fetches Google's public certificates used to sign Firebase ID tokens.
 * Caches the results for 1 hour.
 */
async function getGooglePublicKeys() {
  const now = Date.now();
  if (Object.keys(publicKeys).length > 0 && now < cacheExpiry) {
    return publicKeys;
  }

  try {
    const response = await fetch('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');
    if (!response.ok) {
      throw new Error(`Failed to fetch Firebase public keys: HTTP status ${response.status}`);
    }

    publicKeys = await response.json();
    cacheExpiry = now + 3600000; // Cache for 1 hour
    return publicKeys;
  } catch (error) {
    console.error('Error fetching Google public certificates:', error);
    throw new Error('Failed to fetch public keys for token verification');
  }
}

/**
 * Decodes and verifies a Firebase ID Token using Google's public certificates.
 * Checks the expiration, issuer, audience, and signature.
 * 
 * @param {string} idToken - The raw Firebase ID Token (JWT) sent by the client.
 * @param {string} projectId - The Firebase Project ID.
 * @returns {Promise<object>} The decoded token payload containing user info.
 */
async function verifyFirebaseToken(idToken, projectId) {
  if (!idToken) {
    throw new Error('No Firebase ID token provided');
  }
  if (!projectId || projectId === 'your_firebase_project_id_here') {
    throw new Error('Firebase Project ID is not configured in backend environment variables');
  }

  // 1. Decode token to extract the Key ID (kid) from header
  const decodedHeader = jwt.decode(idToken, { complete: true });
  if (!decodedHeader || !decodedHeader.header || !decodedHeader.header.kid) {
    throw new Error('Invalid Firebase ID token format');
  }

  const kid = decodedHeader.header.kid;

  // 2. Retrieve public certificates from Google
  const keys = await getGooglePublicKeys();
  const cert = keys[kid];

  if (!cert) {
    throw new Error('Public certificate corresponding to the token key ID not found');
  }

  // 3. Verify signature, expiration, issuer, and audience
  try {
    const decoded = jwt.verify(idToken, cert, {
      algorithms: ['RS256'],
      audience: projectId,
      issuer: `https://securetoken.google.com/${projectId}`
    });

    return decoded;
  } catch (error) {
    console.error('Firebase ID token signature verification failed:', error);
    throw new Error('Unauthorized: Invalid or expired Firebase ID token');
  }
}

module.exports = { verifyFirebaseToken };
