import * as jose from 'jose';
import axios from 'axios';

const sessionId = process.env.SESSION_ID || "";
const txnId = process.env.TXN_ID || "";
const privateKeyPEM = process.env.PRIVATE_KEY || "";
const fiuToken = process.env.FIU_TOKEN || "";
const recipientId = process.env.AA_RECIPIENT_ID || "";
const routerUrl = process.env.ROUTER_URL || "https://api.sandbox.sahamati.org.in/router/v2";

if (!sessionId || !privateKeyPEM || !fiuToken) {
    console.error("Missing required environment variables!");
    process.exit(1);
}

let metaInfo = {
    "recipient-id": recipientId
};
let metaInfoStr = JSON.stringify(metaInfo);
let base64MetaInfo = btoa(metaInfoStr);

const privateKey = `-----BEGIN PRIVATE KEY----- ${privateKeyPEM} -----END PRIVATE KEY-----`

const payload = { "ver": "2.0.0", "timestamp": new Date().toISOString(), "txnid": txnId, "sessionId": sessionId, "fipId": "FIP-SIMULATOR" }
console.log("Payload:", payload);
// Function to import private key
async function importKey() {
    try {
        return await jose.importPKCS8(privateKey, 'RS256');
    } catch (error) {
        console.error('Error importing private key:', error);
        process.exit(1);
    }
}

// Function to sign payload using JWS
async function signData(data) {
    try {
        const privateKey = await importKey();
        return await new jose.CompactSign(new TextEncoder().encode(data))
            .setProtectedHeader({ alg: 'RS256', b64: false, crit: ['b64'] })
            .sign(privateKey);
    } catch (error) {
        console.error('Error signing data:', error);
        process.exit(1);
    }
}
// Execute signing and request
(async () => {
    try {
        const signedJWS = await signData(JSON.stringify(payload));
        console.log("JWS Signature Generated");
        const response = await axios.post(`${routerUrl}/FI/fetch`,
            payload,
            {
                headers: {
                    "Content-Type": "application/json",
                    "client_api_key": `Bearer ${fiuToken}`,
                    "x-jws-signature": signedJWS,
                    "x-request-meta": base64MetaInfo
                }
            }
        );
        console.log("API Response:", JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error("Request Failed:", error.response ? error.response.data : error.message);
        process.exit(1);
    }
})();