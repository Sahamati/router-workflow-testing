```markdown
# Router Workflow Testing

This repository contains GitHub Actions workflows for handling Consent API requests and Financial Information (FI) requests. The workflows are designed to automate the process of initiating consent requests, handling consent handles, and sending FI requests.

## Workflows

### Consent API Request - Workflow

This workflow allows you to initiate a consent request using GitHub Actions. The workflow is triggered manually via `workflow_dispatch` and requires several inputs.

#### Inputs

- **fiu_token**: Access token issued to FIU for initiating the consent request (required)
- **private_key**: FIU private key for signing the request (required)
- **mobile_number**: Customer's registered mobile number (default: "8889997771", required)
- **aa_recipient_id**: Account Aggregator recipient ID (default: "AA-SIMULATOR", required)

#### Jobs

##### consent_workflow

This job runs on `ubuntu-latest` and performs the following steps:

1. **Install Dependencies**: Installs the required dependencies (`axios`, `jose`, and `uuid`).
2. **Sign JWS and Send Request**: Runs the `consent.js` script to sign the JWS and send the consent request. The following environment variables are used:
   - `CUSTOMER_ID`
   - `MOBILE_NUMBER`
   - `PRIVATE_KEY`
   - `FIU_TOKEN`
   - `AA_RECIPIENT_ID`
3. **Upload Consent Data Artifact**: Uploads the consent data as an artifact named `consent_data` with the path `consent.json`.

### Consent Handle, Fetch and FI Request API Request - Workflow

This workflow allows you to handle consent requests and send FI requests using GitHub Actions. The workflow is triggered manually via `workflow_dispatch` and requires several inputs.

#### Inputs

- **fiu_token**: Access token issued to FIU for initiating the consent request (required)
- **private_key**: FIU private key for signing the request (required)
- **aa_recipient_id**: Account Aggregator recipient ID (default: "AA-SIMULATOR", required)
- **txn_id**: Transaction ID (required)
- **consent_handle**: Consent Handle (required)

#### Jobs

##### consent_workflow

This job runs on `ubuntu-latest` and performs the following steps:

1. **Install Dependencies**: Installs the required dependencies (`axios`, `jose`, and `uuid`).
2. **Sign JWS and Send Request**: Runs the `consent-fi-request.js` script to sign the JWS and send the FI request. The following environment variables are used:
   - `PRIVATE_KEY`
   - `FIU_TOKEN`
   - `AA_RECIPIENT_ID`
   - `TXN_ID`
   - `CONSENT_HANDLE`
3. **Upload FI Request Data Artifact**: Uploads the FI request data as an artifact named `fi_request` with the path `fi_request.json`.

### FI Fetch API Request - Workflow

This workflow allows you to fetch Financial Information (FI) using GitHub Actions. The workflow is triggered manually via `workflow_dispatch` and requires several inputs.

#### Inputs

- **fiu_token**: Access token issued to FIU for initiating the consent request (required)
- **private_key**: FIU private key for signing the request (required)
- **aa_recipient_id**: Account Aggregator recipient ID (default: "AA-SIMULATOR", required)
- **txn_id**: Transaction ID (required)
- **session_id**: Session ID (required)

#### Jobs

##### fi_fetch_workflow

This job runs on `ubuntu-latest` and performs the following steps:

1. **Install Dependencies**: Installs the required dependencies (`axios`, `jose`, and `uuid`).
2. **Sign JWS and Send Request**: Runs the `fi-fetch.js` script to sign the JWS and send the FI request. The following environment variables are used:
   - `CUSTOMER_ID`
   - `MOBILE_NUMBER`
   - `PRIVATE_KEY`
   - `FIU_TOKEN`
   - `AA_RECIPIENT_ID`
   - `TXN_ID`
   - `SESSION_ID`
3. **Upload FI Request Data Artifact**: Uploads the FI request data as an artifact named `fi_request` with the path `fi_request.json`.

### Usage

To trigger any of the workflows, navigate to the "Actions" tab in the repository, select the desired workflow, and click "Run workflow". Provide the required inputs and run the workflow.

```