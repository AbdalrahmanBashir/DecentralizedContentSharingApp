
---

# **Decentralized Content Sharing App: User Manual**


![diagram-export-11-18-2024-12_41_38-AM](https://github.com/user-attachments/assets/546bfd4b-1532-486a-9ca6-39b19be74815)

---
## **Demo**
[![Decentralized Content Sharing App](http://img.youtube.com/vi/NH30di3vP6g/0.jpg)](http://www.youtube.com/watch?v=NH30di3vP6g "A video demo")


## **Table of Contents**

1. [Introduction](#introduction)
2. [System Requirements](#system-requirements)
3. [Installation and Setup](#installation-and-setup)
4. [IPFS Configuration](#ipfs-configuration)
5. [Running the Application](#running-the-application)
6. [Identity Verification with Privado ID](#identity-verification-with-privado-id)
7. [Connecting to the Amoy Testnet](#connecting-to-the-amoy-testnet)
8. [Features](#features)

---

## **Introduction**

Welcome to the **Decentralized Content Sharing App**, a DApp built to enable users to share, register, and verify content on the blockchain. This application leverages IPFS for decentralized storage and integrates Privado ID for secure identity verification.



---

## **System Requirements**

- **Metamask**: Installed on your web browser. [Download Metamask](https://metamask.io/)
- **Node.js**: Ensure Node.js is installed. [Download Node.js](https://nodejs.org/)
- **IPFS Desktop**: Installed and configured locally. [Install IPFS](https://docs.ipfs.tech/install/ipfs-desktop/)
- **Privado ID App**: Installed on your smartphone. [Download Privado ID](https://privado.id/)
- **Git**: For cloning the repository. [Download Git](https://git-scm.com/downloads)

---

## **Installation and Setup**

### **Step 1: Clone the Repository**

```bash
git clone https://github.com/AbdalrahmanBashir/DecentralizedContentSharingApp.git
cd DecentralizedContentSharingApp
```

### **Step 2: Install Frontend Dependencies**

```bash
cd frontend
npm install
```

### **Step 3: Install Backend Dependencies**

```bash
cd ../backend
npm install
```

### **Step 4: Install IPFS Local Node**

Follow the official IPFS installation guide: [Install IPFS](https://docs.ipfs.tech/install/ipfs-desktop/#windows).

---

## **IPFS Configuration**

1. Open the IPFS configuration file or use the following command in the terminal:

   ```bash
   ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
   ```

2. Alternatively, on IPFS Desktop:
   - Go to **Settings** → **Advanced** → **Edit JSON Configuration**.
   - Add the following entry under the `"API.HTTPHeaders"` section:

     ```json
     "Access-Control-Allow-Origin": ["*"]
     ```

3. Save the changes and **restart the IPFS local node**.

---

## **Running the Application**

Open **two terminals**:

### **Terminal 1: Start the Verifier Server**

```bash
cd backend/VerifierServer
node verifier
```

### **Terminal 2: Start the Frontend Application**

```bash
cd frontend
npm start
```

---

## **Identity Verification with Privado ID**

1. **Install Privado ID** on your smartphone. [Download Privado ID](https://privado.id/)
2. Open the **Privado ID Issuer UI** on your browser.
3. Search for the **Age Credential Testing** identity.
4. Go to **Credentials** and follow the prompts to issue a credential.
   - The issued credential will be stored in your Privado ID wallet.
5. Go back to the DApp website and **scan the QR code** using your Privado ID wallet.
6. Follow the prompts to **connect** and **verify** your identity.
   - Once verified, you will have full access to the DApp.

---

## **Connecting to the Amoy Testnet**

To connect to the Polygon Amoy Testnet:

1. Follow this guide to add the Amoy Testnet to your Metamask: [Amoy Testnet Guide](https://polygon.technology/blog/introducing-the-amoy-testnet-for-polygon-pos).
2. Use the [Polygon Faucet](https://faucet.polygon.technology/) to request test tokens for transactions.

---

## **Features**

- **View Content**: Browse registered content on the platform.
- **Add Content**: Upload files to IPFS and register them on the blockchain.
- **Manage Content**: Update details, add collaborators, and transfer ownership.
- **Identity Verification**: Secure access with Privado ID for credential verification.

---




## **License**

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more details.

---

