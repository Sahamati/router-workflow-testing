import * as jose from 'jose';
import axios from 'axios';

// Load from environment variables or hardcoded for testing
const txnId = process.env.TXN_ID || "fa9d82a7-df8f-409f-bb0d-73dd7cb3f569";
const privateKeyPEM = process.env.PRIVATE_KEY || "MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCNWpAqPZxyeSsg\ns0PkTpJzQNn4AehJFeZniCVtZ+A/IU3PgnDZJh0rZQJYMvECSty/lNLlSmXMgK3g\n4S7fPHKJv/ruXYizmyeirIGyyMVbMBsLB0te7+T4g1aJXSyGCARznRQjZF1KW6Di\nNrfCdDrvxkARDrr/FjeNqBGrwOsH5IXvuJHgCvfiDBtjyiP7HNHkcBjPQQ1BOYzi\nqRQlqEeQTmMFN/D24uAdr+zKOUsPUO7kcR8FrP7oCMntgpIqs0ckwHFojKSyzVsZ\nessOQ1sZGy+MhTB0nqhvGgjYkb+zEcX5tOE33voWKrXLBJ1TB9y8LbVuUTrqsPIK\na4TqgHA1AgMBAAECggEAf4jobdQs5XPBn71eUg06QVaP0x4VcGub+Gl0K2P/hbYM\nuF8eZi3nP5HhLaa4oLLevNQP++TGOF8Zgr5pRe0KApL+WjZ18mbYugMe+in/NqkO\nnUK1lDCpzDbjywgP9dYh/hYJZ21UZpSJcdCgt4ea7V9XyowZ17E56ktrtiVXaUQ6\nU8OeyuMHjXRUn+Ql4L2JgIHz43DXWfohGI7SHxTXKBsMVIxV6rLSYH0L8ePfNWJ0\nM12NnkxfNOud6mV9U66P8UbFgb6tKOxR4MF8DJIkig7Ji0h4HSpcKh55YBaNSDeC\nmnS9x2f5ljr6+mXS/9Dn0JW2PvOGa632H1jrNYdbOQKBgQDz2p2stORqzOHDGh38\nCEwsaU08BSUPY0+SCCMte245lBjkwinNHMVyV0LTmaRNHsJrHb2wQydDVpXvZ06K\ngjK6/kSAmytn6DkscbNJdQ56Wb5hnikateSsXfjpY0AlZ5ptbfgtsl7/ZWRBqOE6\nt+CKbRjYymfoGkMGlSfz/jt6ZwKBgQCUZPdZGabZEiuBPBVWKDm/NwuIoLMK4uLt\nSnK8aPXofPUCMvtAxKnn65wj58mbdOr8HAkJ77jJoh0KWOKckZUhmnm6rpaJpAOw\nHBjPSSeA+H8sWx+5+Jd/yuCHn0wf1mUFJvn6q8GF0hVfyaQTgAImiCMPEReiSfSI\nG+ZTJgNXAwKBgQCZLTckOJDO4Zni4zH4kgG/V/oS/KxV6S0fbwsh08neUz/72ldF\np5ADjfrFTlqdsvevL4RrBxPPwcD3HC6C5NwXCAdhvZbbc00OtPFI8EXC50KmsSHi\nzGUzPOhROm4d0OF5Yb2mfsgbp8X9VKb+Kmjaq0MTUrlIW87EgMcTBhy4ewKBgHxJ\nXEmKDI5+g2WIVy6EHmmixsw2G/8gLIQl+JcJKf0Au4yN+pYyoUOXuHzyI49Ki42A\nRanG1/Q5DS2faJ1N6aPtZ8sNcxPxBQ25WqYyVR3WA125LIdsSCdGWmv85Zs8y/tW\nu8RRmpJkdHZ3wi565lIzb3mtDShl3KMrCuvVSLLVAoGBAPBHHTjWdAC7JTeUfKN3\nfzY+xakS9DLPlirYazloGPmCN51Vc7hvq5m8vs/C05eV6tdRIuyNIfKcBxFAHOAj\n4yNfS3KfNACYFGZY6lDRD5U8T5zd4esImNfoEH2W18+9g62lw5pGxgXAl0WWbjz1\ndiz2UTRYU/DC3Ht2/VMSI2cM";
const fipToken = process.env.FIP_TOKEN || "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJhbUpiWmduWDBkd0d6bS1TbE1mbWt1MTNHdjRwSkc2cGxwSmx2MXFqLXpNIn0.eyJleHAiOjE3NDQ4NzA3NTYsImlhdCI6MTc0NDc4NDM1NiwianRpIjoiODZhOTg0MjQtMTBkNy00YmQ1LThlNDItZGRkMjk3MzgxOGNhIiwiaXNzIjoiaHR0cHM6Ly9hcGkuc2FuZGJveC5zYWhhbWF0aS5vcmcuaW4vYXV0aC9yZWFsbXMvc2FoYW1hdGkiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiYzFhZjY2NDMtNmZhNi00M2E0LWIyZTItZDVmMTJjYTUwMGE3IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoiQUEtU0lNVUxBVE9SIiwiYWNyIjoiMSIsInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJkZWZhdWx0LXJvbGVzLXNhaGFtYXRpIiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoiZW1haWwgbWljcm9wcm9maWxlLWp3dCBwcm9maWxlIGFkZHJlc3MgcGhvbmUgb2ZmbGluZV9hY2Nlc3MiLCJ1cG4iOiJzZXJ2aWNlLWFjY291bnQtYWEtc2ltdWxhdG9yIiwiY2xpZW50SG9zdCI6IjEwLjIyNC4wLjE4IiwiY2xpZW50SWQiOiJBQS1TSU1VTEFUT1IiLCJhZGRyZXNzIjp7fSwicm9sZXMiOiJBQSIsImdyb3VwcyI6WyJkZWZhdWx0LXJvbGVzLXNhaGFtYXRpIiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdLCJzZWNyZXQtZXhwaXJ5LXRzIjoiMjAyNS0xMi0yNVQxNjoyNTozMC45MjUzMjYzMDQiLCJjbGllbnRBZGRyZXNzIjoiMTAuMjI0LjAuMTgifQ.e_zPrTGQEPgZlGPBWVuj-WILVJc_VJHmdoExjZQyDGz1OgPp299wDHl0iDujV45599uOWSm82pdo-o-deDtpfgk_xeUBMJK2wnBCUrVX6_szcBnfdkvAC-oWgI7guf6uPpy57KnVsrfRL3zAvp0CnI5yLWODL9xUxhDOjz26iBVbsqFeT2tcACnLfQ_b4wpKztgocfOTXMNk10m--tifWoABQJVdPJIhgoleRmU38c2EFeW_QqqGKtw84qmUy7POC85-Y08gX_I2pbSf5n-fpv8yHyAyJd3v7hnPOhBL2_D_Ib6ahoM2-pFCjMrtlazkOqovKaxO8jFXsAOMvtT3qA";
const recipientId = process.env.AA_RECIPIENT_ID || "FIP-SIMULATOR";
const routerUrl = process.env.ROUTER_URL || "https://api.sandbox.sahamati.org.in/router/v2";
const consentId = process.env.CONSENT_ID || "fa9d82a7-df8f-409f-bb0d-73dd7cb3f569";
const digitalSignature = process.env.CONSENT_SIGNATURE || "signed_consent_signature";
const dhKeyValue = process.env.DH_KEY_VALUE || "MIIBMTCB6gYHKoZIzj0CATCB3gIBATArBgcqhkjOPQEBAiB";
const dhParams = process.env.DH_PARAMS || "";
const nonce = process.env.NONCE || "yourEfW/2psWHOdfvgtFOv7Y4ZVl0NmLxtcrGZ5ccQg2ATE=_nonce";

const base64MetaInfo = Buffer.from(JSON.stringify({ "recipient-id": recipientId })).toString("base64");

// Wrap key if it's not already
const privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKeyPEM}\n-----END PRIVATE KEY-----`;

async function importKey() {
    return await jose.importPKCS8(privateKey, 'RS256');
}

async function signData(data) {
    const key = await importKey();
    return await new jose.CompactSign(new TextEncoder().encode(data))
        .setProtectedHeader({ alg: 'RS256', b64: false, crit: ['b64'] })
        .sign(key);
}

(async () => {
    const now = new Date();
    const fiRequestPayload = {
        ver: "2.0.0",
        timestamp: now.toISOString(),
        txnid: txnId,
        Consent: {
            id: consentId,
            digitalSignature: digitalSignature
        },
        FIDataRange: {
            from: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).toISOString(),
            to: now.toISOString()
        },
        KeyMaterial: {
            cryptoAlg: "ECDH",
            curve: "Curve25519",
            params: "cipher=AES/GCM/NoPadding;KeyPairGenerator=ECDH",
            DHPublicKey: {
                expiry: new Date(Date.now() + 86400000).toISOString(),
                Parameters: dhParams,
                KeyValue: dhKeyValue
            },
            Nonce: nonce
        }
    };

    try {
        const jwsSignature = await signData(JSON.stringify(fiRequestPayload));

        const response = await axios.post(`${routerUrl}/FI/request`, fiRequestPayload, {
            headers: {
                "Content-Type": "application/json",
                "client_api_key": `Bearer ${fipToken}`,
                "x-jws-signature": jwsSignature,
                "x-request-meta": base64MetaInfo
            }
        });

        console.log("FI Request Response:", JSON.stringify(response.data, null, 2));
    } catch (err) {
        console.error("FI Request Error:", err.response?.data || err.message);
        process.exit(1);
    }
})();
