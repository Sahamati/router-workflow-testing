import * as jose from 'jose';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import fs from 'fs';

const mobileNumber = process.env.MOBILE_NUMBER || "";
const privateKeyPEM = process.env.PRIVATE_KEY || "";
const fiuToken = process.env.FIU_TOKEN || "";
const recipientId =  process.env.AA_RECIPIENT_ID || ""
const routerUrl = process.env.ROUTER_URL || "https://api.sandbox.sahamati.org.in/router/v2";

if (!mobileNumber || !privateKeyPEM || !fiuToken) {
    console.error("Missing required environment variables!");
    process.exit(1);
}

let customerId =  `${mobileNumber}@${recipientId}`

let metaInfo = {
    "recipient-id": recipientId
};
let metaInfoStr = JSON.stringify(metaInfo);
let base64MetaInfo = btoa(metaInfoStr);

const privateKey = `-----BEGIN PRIVATE KEY----- ${privateKeyPEM} -----END PRIVATE KEY-----`

// Generate transaction ID
const txnid = uuidv4();
const payload = {
    "ver": "2.0.0",
    "timestamp": new Date().toISOString(),
    "txnid": txnid,
    "ConsentDetail": {
        "consentStart": "2025-02-21T06:29:09.251Z",
        "consentExpiry": "2026-03-27T12:59:59.000Z",
        "consentMode": "VIEW",
        "fetchType": "PERIODIC",
        "consentTypes": ["PROFILE"],
        "fiTypes": ["DEPOSIT"],
        "DataConsumer": { "id": "FIU-SIMULATOR", "type": "FIU" },
        "Customer": {
            "id": customerId,
            "Identifiers": [{ "type": "MOBILE", "value": mobileNumber }]
        },
        "Purpose": {
            "code": "101",
            "refUri": "https://api.rebit.org.in/aa/purpose/101.xml",
            "text": "Wealth management service",
            "Category": { "type": "string" }
        },
        "FIDataRange": {
            "from": "2024-09-27T13:00:00.000Z",
            "to": "2024-11-27T12:59:59.000Z"
        },
        "DataLife": { "unit": "MONTH", "value": 0 },
        "Frequency": { "unit": "DAY", "value": 20 },
        "DataFilter": [{
            "type": "TRANSACTIONAMOUNT",
            "operator": ">=",
            "value": "20000"
        }]
    }
};
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
        // Send request using cURL
        const response = await axios.post(`${routerUrl}/Consent`,
            payload,
            {
                headers: {
                    "Content-Type": "application/json",
                    "client_api_key": `Bearer ${fiuToken}`,
                    "x-jws-signature": signedJWS,
                    "x-request-meta" : base64MetaInfo
                }
            }
        );
        console.log("API Response:", JSON.stringify(response.data, null, 2));
        const artifactData = { TXN_ID: response.data.txnid,  CONSENT_HANDLE: response.data.ConsentHandle};
        fs.writeFileSync("consent.json", JSON.stringify(artifactData, null, 2));
    } catch (error) {
        console.error("Request Failed:", error.response ? error.response.data : error.message);
        process.exit(1);
    }
})();