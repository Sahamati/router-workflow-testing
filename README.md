# Router Workflow Testing

This repository contains GitHub Actions workflows for handling Consent API requests and Financial Information (FI) requests. These workflows automate the process of initiating consent requests, handling consent handles, and sending FI requests efficiently.

## Workflows

### 1. Consent API Request Workflow

This workflow allows you to initiate a consent request using GitHub Actions. It is triggered manually via `workflow_dispatch` and requires the following inputs:

#### **Inputs**

- **`fiu_token`**: Access token issued to FIU for initiating the consent request (**Required**).
- **`private_key`**: FIU private key for signing the request (**Required**).
- **`mobile_number`**: Customer's registered mobile number (**Default: `8889997771`**, Required).
- **`aa_recipient_id`**: Account Aggregator recipient ID (**Default: `AA-SIMULATOR`**, Required).

#### **Jobs**

##### `consent_workflow`

Runs on `ubuntu-latest` and performs the following steps:

1. **Install Dependencies**: Installs `axios`, `jose`, and `uuid`.
2. **Sign JWS and Send Request**: Executes `consent.js` to sign the JWS and send the consent request using environment variables:
   - `MOBILE_NUMBER`
   - `PRIVATE_KEY`
   - `FIU_TOKEN`
   - `AA_RECIPIENT_ID`
3. **Upload Consent Data Artifact**: Stores the consent data as an artifact named `consent_data` at `consent.json`.

---

### 2. Consent Handle, Fetch, and FI Request API Workflow

This workflow handles consent requests and sends FI requests. It is triggered manually via `workflow_dispatch` and requires the following inputs:

#### **Inputs**

- **`fiu_token`**: Access token issued to FIU for initiating the consent request (**Required**).
- **`private_key`**: FIU private key for signing the request (**Required**).
- **`aa_recipient_id`**: Account Aggregator recipient ID (**Default: `AA-SIMULATOR`**, Required).
- **`txn_id`**: Transaction ID (**Required**).
- **`consent_handle`**: Consent Handle (**Required**).

#### **Jobs**

##### `consent_fi_request_workflow`

Runs on `ubuntu-latest` and performs the following steps:

1. **Install Dependencies**: Installs `axios`, `jose`, and `uuid`.
2. **Sign JWS and Send Request**: Executes `consent-fi-request.js` to sign the JWS and send the FI request using environment variables:
   - `PRIVATE_KEY`
   - `FIU_TOKEN`
   - `AA_RECIPIENT_ID`
   - `TXN_ID`
   - `CONSENT_HANDLE`
3. **Upload FI Request Data Artifact**: Stores the FI request data as an artifact named `fi_request` at `fi_request.json`.

---

### 3. FI Fetch API Request Workflow

This workflow allows you to fetch Financial Information (FI) using GitHub Actions. It is triggered manually via `workflow_dispatch` and requires the following inputs:

#### **Inputs**

- **`fiu_token`**: Access token issued to FIU for initiating the consent request (**Required**).
- **`private_key`**: FIU private key for signing the request (**Required**).
- **`aa_recipient_id`**: Account Aggregator recipient ID (**Default: `AA-SIMULATOR`**, Required).
- **`txn_id`**: Transaction ID (**Required**).
- **`session_id`**: Session ID (**Required**).

#### **Jobs**

##### `fi_fetch_workflow`

Runs on `ubuntu-latest` and performs the following steps:

1. **Install Dependencies**: Installs `axios`, `jose`, and `uuid`.
2. **Sign JWS and Send Request**: Executes `fi-fetch.js` to sign the JWS and send the FI request using environment variables:
   - `PRIVATE_KEY`
   - `FIU_TOKEN`
   - `AA_RECIPIENT_ID`
   - `TXN_ID`
   - `SESSION_ID`
3. **Upload FI Request Data Artifact**: Stores the FI request data as an artifact named `fi_request` at `fi_request.json`.

---

## Usage

To trigger any of the workflows:

1. Navigate to the **"Actions"** tab in the repository.
2. Select the desired workflow.
3. Click **"Run workflow"**.
4. Provide the required inputs and execute the workflow.

This setup ensures an automated and seamless process for handling Consent API and FI requests using GitHub Actions.