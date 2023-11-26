// Desc: Messaging helper for communicating with background script
// Usage: Messaging(this);
//

import {Buffer} from 'buffer';
 
import { Lucid, utxoToCore , C , assetsToValue} from "lucid-cardano";

function toHexString(byteArray) {
    return Array.from(byteArray, function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
  }

class Messaging {   

    constructor(wallet) {
        this.wallet = wallet;
        this.port = null;
        this.connect();

    }

    // getUtxos: (amount = undefined, paginate= undefined) => chrome.runtime.sendMessage(EXTENSION_ID, { action: 'getUtxos' , amount : amount, paginate: paginate}),
    // getCollateral: (amount = undefined) => chrome.runtime.sendMessage(EXTENSION_ID, { action: 'getCollateral' , amount : amount}),
    // getBalance: () => chrome.runtime.sendMessage(EXTENSION_ID, { action: 'getBalance' }),
    // getUsedAddresses: () => chrome.runtime.sendMessage(EXTENSION_ID, { action: 'getUsedAddresses' }),
    // getUnusedAddresses: () => chrome.runtime.sendMessage(EXTENSION_ID, { action: 'getUnusedAddresses' }),
    // getChangeAddress: () => chrome.runtime.sendMessage(EXTENSION_ID, { action: 'getChangeAddress' }),
    // getRewardAddresses: () => chrome.runtime.sendMessage(EXTENSION_ID, { action: 'getRewardAddresses' }),
    // submitTx: (tx) => chrome.runtime.sendMessage(EXTENSION_ID, { action: 'submitTx', tx: tx }),
    // submitUnsignedTx: (tx) => chrome.runtime.sendMessage(EXTENSION_ID, { action: 'submitUnsignedTx', tx: tx }),
    // getCollateralAddress: () => chrome.runtime.sendMessage(EXTENSION_ID, { action: 'getCollateralAddress' }),
    // getScriptRequirements: () => chrome.runtime.sendMessage(EXTENSION_ID, { action: 'getScriptRequirements' }),
    // getScript: () => chrome.runtime.sendMessage(EXTENSION_ID, { action: 'getScript' }),
    // getCompletedTx(txId) { return chrome.runtime.sendMessage(EXTENSION_ID, { action: 'getCompletedTx', txId: txId }) },

   async connect() {

        this.port = chrome.runtime.connect("jfjmokidpopgdhcilhkoanmjcimijgng");
        this.port.onMessage.addListener( async (message) => {
            if(message.request){
                let response
                try{
                switch (message.request) {  
                        case "ping":
                            response = "pong";
                            break;
                        case "getData":
                            response = {
                                walletName : this.wallet.getName(), 
                                ballance: this.wallet.getBalance(),
                                signers: this.wallet.getSigners(),
                                signersValid: this.wallet.defaultSignersValid()
                             }
                            break;        
                        case "getBalance": 
                            response =Buffer.from(assetsToValue(this.wallet.getBalanceFull()).to_bytes(), 'hex').toString('hex');
                           // response = assetsToValue(this.wallet.getBalanceFull());
                            break;
                        case "getUtxos":
                            response = this.wallet.getUtxos().map((utxo) => ( toHexString(utxoToCore(utxo).to_bytes())));
                            break;    
                        case "getUsedAddresses":
                            response =  [Buffer.from( C.Address.from_bech32(this.wallet.getAddress()).to_bytes(), 'hex').toString('hex')];
                            break;
                        case "getUnusedAddresses":
                            response =[Buffer.from( C.Address.from_bech32(this.wallet.getAddress()).to_bytes(), 'hex').toString('hex')];
                            break;
                        case "getChangeAddress":
                            response =[Buffer.from( C.Address.from_bech32(this.wallet.getAddress()).to_bytes(), 'hex').toString('hex')];
                            break;
                        case "getRewardAddresses":
                            response = [Buffer.from( C.Address.from_bech32( this.wallet.getStakingAddress()).to_bytes(), 'hex').toString('hex')]; 
                            break;
                        case "submitTx":
                            response = await this.wallet.submitTx(message.tx);
                            break;
                        case "submitUnsignedTx":
                            response = await  this.wallet.importTransaction(message.tx);
                            break;
                        case "getScriptRequirements":
                            signers = this.wallet.getSigners(); 
                            
                             this.wallet.defaultSignersValid();
                            response = signers.filter((signer) => signer.isDefault).map((signer) => signer.hash);
                            response
                            break;
                    }
                }catch(e){
                    response = {error: e.message}
            }
                this.port.postMessage({ method: message.request, response: response });
            }
            else{
                console.log(this.wallet.getUtxos());
            }
        }
        );
    }
    
    changeWallet(wallet){
        this.wallet = wallet;
    }
    disconnect() {
        this.port.disconnect();
    }   
}

export default Messaging;