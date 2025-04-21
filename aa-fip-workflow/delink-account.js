import * as jose from 'jose';
import axios from 'axios';

const txnId = process.env.TXN_ID || "af5b8023-aabc-4a46-8f37-d3c167129b1e";
const privateKeyPEM = process.env.PRIVATE_KEY || "MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCNWpAqPZxyeSsg\ns0PkTpJzQNn4AehJFeZniCVtZ+A/IU3PgnDZJh0rZQJYMvECSty/lNLlSmXMgK3g\n4S7fPHKJv/ruXYizmyeirIGyyMVbMBsLB0te7+T4g1aJXSyGCARznRQjZF1KW6Di\nNrfCdDrvxkARDrr/FjeNqBGrwOsH5IXvuJHgCvfiDBtjyiP7HNHkcBjPQQ1BOYzi\nqRQlqEeQTmMFN/D24uAdr+zKOUsPUO7kcR8FrP7oCMntgpIqs0ckwHFojKSyzVsZ\nessOQ1sZGy+MhTB0nqhvGgjYkb+zEcX5tOE33voWKrXLBJ1TB9y8LbVuUTrqsPIK\na4TqgHA1AgMBAAECggEAf4jobdQs5XPBn71eUg06QVaP0x4VcGub+Gl0K2P/hbYM\nuF8eZi3nP5HhLaa4oLLevNQP++TGOF8Zgr5pRe0KApL+WjZ18mbYugMe+in/NqkO\nnUK1lDCpzDbjywgP9dYh/hYJZ21UZpSJcdCgt4ea7V9XyowZ17E56ktrtiVXaUQ6\nU8OeyuMHjXRUn+Ql4L2JgIHz43DXWfohGI7SHxTXKBsMVIxV6rLSYH0L8ePfNWJ0\nM12NnkxfNOud6mV9U66P8UbFgb6tKOxR4MF8DJIkig7Ji0h4HSpcKh55YBaNSDeC\nmnS9x2f5ljr6+mXS/9Dn0JW2PvOGa632H1jrNYdbOQKBgQDz2p2stORqzOHDGh38\nCEwsaU08BSUPY0+SCCMte245lBjkwinNHMVyV0LTmaRNHsJrHb2wQydDVpXvZ06K\ngjK6/kSAmytn6DkscbNJdQ56Wb5hnikateSsXfjpY0AlZ5ptbfgtsl7/ZWRBqOE6\nt+CKbRjYymfoGkMGlSfz/jt6ZwKBgQCUZPdZGabZEiuBPBVWKDm/NwuIoLMK4uLt\nSnK8aPXofPUCMvtAxKnn65wj58mbdOr8HAkJ77jJoh0KWOKckZUhmnm6rpaJpAOw\nHBjPSSeA+H8sWx+5+Jd/yuCHn0wf1mUFJvn6q8GF0hVfyaQTgAImiCMPEReiSfSI\nG+ZTJgNXAwKBgQCZLTckOJDO4Zni4zH4kgG/V/oS/KxV6S0fbwsh08neUz/72ldF\np5ADjfrFTlqdsvevL4RrBxPPwcD3HC6C5NwXCAdhvZbbc00OtPFI8EXC50KmsSHi\nzGUzPOhROm4d0OF5Yb2mfsgbp8X9VKb+Kmjaq0MTUrlIW87EgMcTBhy4ewKBgHxJ\nXEmKDI5+g2WIVy6EHmmixsw2G/8gLIQl+JcJKf0Au4yN+pYyoUOXuHzyI49Ki42A\nRanG1/Q5DS2faJ1N6aPtZ8sNcxPxBQ25WqYyVR3WA125LIdsSCdGWmv85Zs8y/tW\nu8RRmpJkdHZ3wi565lIzb3mtDShl3KMrCuvVSLLVAoGBAPBHHTjWdAC7JTeUfKN3\nfzY+xakS9DLPlirYazloGPmCN51Vc7hvq5m8vs/C05eV6tdRIuyNIfKcBxFAHOAj\n4yNfS3KfNACYFGZY6lDRD5U8T5zd4esImNfoEH2W18+9g62lw5pGxgXAl0WWbjz1\ndiz2UTRYU/DC3Ht2/VMSI2cM";
const fipToken = process.env.FIU_TOKEN || "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJhbUpiWmduWDBkd0d6bS1TbE1mbWt1MTNHdjRwSkc2cGxwSmx2MXFqLXpNIn0.eyJleHAiOjE3NDQ2OTQ4MzcsImlhdCI6MTc0NDYwODQzNywianRpIjoiM2VjMWVkOGUtNmQ4NC00ZWQ3LTgxZDgtNzI0NmQ2N2FmNzRmIiwiaXNzIjoiaHR0cHM6Ly9hcGkuc2FuZGJveC5zYWhhbWF0aS5vcmcuaW4vYXV0aC9yZWFsbXMvc2FoYW1hdGkiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiYzFhZjY2NDMtNmZhNi00M2E0LWIyZTItZDVmMTJjYTUwMGE3IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoiQUEtU0lNVUxBVE9SIiwiYWNyIjoiMSIsInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJkZWZhdWx0LXJvbGVzLXNhaGFtYXRpIiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoiZW1haWwgbWljcm9wcm9maWxlLWp3dCBwcm9maWxlIGFkZHJlc3MgcGhvbmUgb2ZmbGluZV9hY2Nlc3MiLCJ1cG4iOiJzZXJ2aWNlLWFjY291bnQtYWEtc2ltdWxhdG9yIiwiY2xpZW50SG9zdCI6IjEwLjIyNC4wLjUiLCJjbGllbnRJZCI6IkFBLVNJTVVMQVRPUiIsImFkZHJlc3MiOnt9LCJyb2xlcyI6IkFBIiwiZ3JvdXBzIjpbImRlZmF1bHQtcm9sZXMtc2FoYW1hdGkiLCJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIl0sInNlY3JldC1leHBpcnktdHMiOiIyMDI1LTEyLTI1VDE2OjI1OjMwLjkyNTMyNjMwNCIsImNsaWVudEFkZHJlc3MiOiIxMC4yMjQuMC41In0.eD1lBr0RaR_Hw7DAkg464zJK97tojzVYjGTV2_3AyfsaClNBJiDHEPzMe3wRlBIJ7KoQm1oIVNIwuQ5mPlPGLVZQL3Kzd1Gkiewk-p6s82_Bhm2Ks4lKP4nnYYryuE9AvlRTe3gPc1qmIDLk2-iNFAP5QCLIF8RNzwQW6xII48-QH9uufXkdflD8p1eaU5458LoG3QSBSrhB3ZPblk693Gy-X1gMchcdO9OeRU0Ck3vKwsLF5Lu_DJPxGCupUK7xS31f6_IFPNLp-4D-cnP9_OcYkaHNxEgh_eoUJ0GNzLNr1N1yVw6j4fvOrw1cQuO6zb5t6780RJQ4sfiYS7DtQQ";
const recipientId = process.env.AA_RECIPIENT_ID || "FIP-SIMULATOR";
const routerUrl = process.env.ROUTER_URL || "https://api.sandbox.sahamati.org.in/router/v2";
const customerAddress = process.env.CUSTOMER_ADDRESS || "customer_address@aa_identifier";
const linkRefNumber = process.env.LINK_REF_NUMBER || "fa9d82a7-df8f-409f-bb0d-73dd7cb3f569";

if (!privateKeyPEM || !fipToken || !txnId || !customerAddress || !linkRefNumber) {
    console.error("Missing required environment variables!");
    process.exit(1);
}

const metaInfo = { "recipient-id": recipientId };
const base64MetaInfo = Buffer.from(JSON.stringify(metaInfo)).toString('base64');
const privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKeyPEM}\n-----END PRIVATE KEY-----`;

async function importKey() {
    try {
        return await jose.importPKCS8(privateKey, 'RS256');
    } catch (error) {
        console.error('Error importing private key:', error);
        process.exit(1);
    }
}

async function signData(data) {
    try {
        const key = await importKey();
        return await new jose.CompactSign(new TextEncoder().encode(data))
            .setProtectedHeader({ alg: 'RS256', b64: false, crit: ['b64'] })
            .sign(key);
    } catch (error) {
        console.error('Error signing data:', error);
        process.exit(1);
    }
}

(async () => {
    const delinkPayload = {
        ver: "2.0.0",
        timestamp: new Date().toISOString(),
        txnid: txnId,
        Account: {
            customerAddress: customerAddress,
            linkRefNumber: linkRefNumber
        }
    };

    try {
        const signedJWS = await signData(JSON.stringify(delinkPayload));
        const response = await axios.post(`${routerUrl}/Accounts/delink`, delinkPayload, {
            headers: {
                "Content-Type": "application/json",
                "client_api_key": `Bearer ${fipToken}`,
                "x-jws-signature": signedJWS,
                "x-request-meta": base64MetaInfo
            }
        });
        console.log("Delink Response:", JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error("Delink Failed:", error.response ? error.response.data : error.message);
        process.exit(1);
    }
})();
