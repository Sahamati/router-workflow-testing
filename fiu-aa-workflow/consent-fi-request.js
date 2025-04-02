import * as jose from 'jose';
import axios from 'axios';

const API_BASE_URL = "https://api.sandbox.sahamati.org.in/router/v2";
const FIU_TOKEN = process.env.FIU_TOKEN || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const CONSENT_HANDLE = process.env.CONSENT_HANDLE || "";
const TXN_ID = process.env.TXN_ID || "";
const recipientId = process.env.AA_RECIPIENT_ID || ""
const privateKey = `-----BEGIN PRIVATE KEY----- ${PRIVATE_KEY} -----END PRIVATE KEY-----`


async function executeWorkflow() {
    try {
        const consentHandlePayload = {
            "ver": "2.0.0",
            "timestamp": new Date().toISOString(),
            "txnid": TXN_ID,
            "ConsentHandle": CONSENT_HANDLE,
        };
        let metaInfo = {
            "recipient-id": recipientId
        };
        let metaInfoStr = JSON.stringify(metaInfo);
        let base64MetaInfo = btoa(metaInfoStr);
        const signedConsentHandlePayload = await signData(JSON.stringify(consentHandlePayload));
        const consentHandleResponse = await sendRequest("/Consent/handle", consentHandlePayload, signedConsentHandlePayload, base64MetaInfo);
        (consentHandleResponse.status === 200) ? console.log("Consent Handle Response:", consentHandleResponse.data) : (console.error("Error in Consent Handle Response:", consentHandleResponse.data), process.exit(1));
        console.log("---------------- Consent Handle request is completed successfully -----------------------");
        // Step 2: Send Consent Fetch Request
        const consentFetchPayload = {
            "ver": "2.0.0",
            "timestamp": new Date().toISOString(),
            "txnid": TXN_ID,
            "consentId": consentHandleResponse.data.ConsentStatus.id, // Extract consentId from response
        };
        const signedConsentFetchPayload = await signData(JSON.stringify(consentFetchPayload));
        const consentFetchResponse = await sendRequest("/Consent/fetch", consentFetchPayload, signedConsentFetchPayload, base64MetaInfo);
        (consentFetchResponse.status === 200) ? console.log("Consent Fetch Response:", consentFetchResponse.data?.consentId) : (console.error("Error in Consent Fetch Response:", consentFetchResponse.data), process.exit(1));
        console.log("---------------- Consent fetch request is completed successfully -----------------------");
        let signedConsent = consentFetchResponse.data.signedConsent;
        let jwtParts = signedConsent.split('.');
        let signature = jwtParts.length === 3 ? jwtParts[2] : '';

        // Step 3: Send FI Request
        const FIRequestPayload = {
            "ver": "2.0.0",
            "timestamp": new Date().toISOString(),
            "txnid": TXN_ID,
            "Consent": {
              "id": consentFetchResponse.data?.consentId,
              "digitalSignature": signature
            },
            "FIDataRange": {
              "from": "2024-09-27T13:00:00.000Z",
              "to": "2024-11-27T12:59:59.000Z"
            },
            "KeyMaterial": {
              "cryptoAlg": "ECDH",
              "curve": "Curve25519",
              "params": "",
              "DHPublicKey": {
                "expiry": new Date(Date.now() + 86400000).toISOString(),
                "Parameters": "",
                "KeyValue": "-----BEGIN PUBLIC KEY-----MIIBMTCB6gYHKoZIzj0CATCB3gIBATArBgcqhkjOPQEBAiB/////////////////////////////////////////7TBEBCAqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqYSRShRAQge0Je0Je0Je0Je0Je0Je0Je0Je0Je0Je0JgtenHcQyGQEQQQqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq0kWiCuGaG4oIa04B7dLHdI0UySPU1+bXxhsinpxaJ+ztPZAiAQAAAAAAAAAAAAAAAAAAAAFN753qL3nNZYEmMaXPXT7QIBCANCAARL1l2p3iohnf0ykkTtm3+Sbu4P+dYwXBuQ6TUn4WUN/XIMg1kgBR8hrburD1o2/5nuKSPkDbs0miuUi5RU8/hA-----END PUBLIC KEY-----"
              },
              "Nonce": "EfW/2psWHOdfvgtFOv7Y4ZVl0NmLxtcrGZ5ccQg2ATE="
            }
          }
        console.log("FI Request Payload:", FIRequestPayload);
        const signedFIRequestPayload = await signData(JSON.stringify(FIRequestPayload));
        const FIRequestResponse = await sendRequest("/FI/request", FIRequestPayload, signedFIRequestPayload, base64MetaInfo);
        console.log("FI Request API Response:", JSON.stringify(FIRequestResponse?.data, null, 2));
        console.log("---------------- FI request is completed successfully -----------------------");
    } catch (error) {
        console.error("Workflow execution failed:", error);
    }
}

// Utility function to send a signed API request
async function sendRequest(endpoint, payload, signedJWS, base64MetaInfo) {
    return axios.post(`${API_BASE_URL}${endpoint}`, payload, {
        headers: {
            "Content-Type": "application/json",
            "client_api_key": FIU_TOKEN,
            "x-request-meta": base64MetaInfo,
            "x-jws-signature": signedJWS
        }
    });
}

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

// Execute the workflow
executeWorkflow();