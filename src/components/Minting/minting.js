import React from "react";
import "./minting.css"
import { Lucid ,Blockfrost, Kupmios, Data, Constr } from "lucid-cardano";
import WalletPicker from "../WalletPicker";
import { Program } from "@hyperionbt/helios"
import mintingScript from '!!raw-loader!./minting.hl';

class Minting extends React.Component {
    state = {
         mintingSettings : [{name: "Name" , description: "", amount : 1, image: ""}],
         walletPickerOpen: false
    }
    paymentAddress = "addr_test1qpceptsuy658a4tjartjqj29fhwgwnfkq2fur66r4m6fpc73h7m9jt9q7mt0k3heg2c6sckzqy2pvjtrzt3wts5nnw2q9z6p9m"

    
    setName = (name, index) => {
        console.log(name, index)
        let mintingSettings = [...this.state.mintingSettings];
        mintingSettings[index].name = name;
        this.setState({mintingSettings});
    }

    setDescription = (description, index) => {
        let mintingSettings = [...this.state.mintingSettings];
        mintingSettings[index].description = description;
        this.setState({mintingSettings});
    }
    
    changeImage = (value, index) => {
        let mintingSettings = [...this.state.mintingSettings];
        mintingSettings[index].image = value;
        this.setState({mintingSettings});
    }

    uploadImage = (event, index) => {
        const file = event.target.files[0]; // Get the first file from the input
        if (!file) {
          console.log("No file selected");
          return;
        }
    
        const reader = new FileReader();
    
        reader.onerror = (error) => {
          console.error("An error occurred while reading the file:", error);
        };
    
        reader.readAsArrayBuffer(file);
    
        reader.onloadend = () => {
            if (reader.readyState === FileReader.DONE) {
              const arrayBuffer = reader.result;
              const uint8Array = new Uint8Array(arrayBuffer);
          
              let mintingSettings = [...this.state.mintingSettings];
              const updatedSetting = { ...mintingSettings[index], CustomImage: uint8Array };
              mintingSettings[index] = updatedSetting;
          
              this.setState({ mintingSettings });
            }
          };
      };
    

    setAmount = (amount, index) => {
        let mintingSettings = [...this.state.mintingSettings];
        if (amount < 1) amount = 1;
        mintingSettings[index].amount = amount;
        this.setState({mintingSettings});
    }

    addMintingSetting = () => {
        let mintingSettings = [...this.state.mintingSettings];
        mintingSettings.push({name: "Name" , description: "", amount : 1, image: ""});
        this.setState({mintingSettings});
    }

    removeMintingSetting = (index) => { 
        let mintingSettings = [...this.state.mintingSettings];
        mintingSettings.splice(index, 1);
        this.setState({mintingSettings});
    }

    startMint = () => {
        this.setState({walletPickerOpen: true})
    }

    mintWithWallet = (wallet) =>{
        const mintingSettings = this.state.mintingSettings;
        this.mint(mintingSettings, wallet , this.props.root.state.settings)
    }

    async mint(mintingSettings, wallet , settings){
      const AfiliateSchema  = Data.Object({ 
        paymentAddressCredential : String
    })
    
      
        const api = await window.cardano[wallet].enable();
        const lucid = await this.newLucidInstance(settings)
        lucid.selectWallet(api)
        const program = Program.new(mintingScript)
        const simplify = true
        const myUplcProgram = program.compile(simplify)
        //const mintingRawScript = { type: "PlutusV2", script : JSON.parse(myUplcProgram.serialize()).cborHex }
        const mintingRawScript = { type: "PlutusV2", script : "59062e0100003232323232323232323232223253330083232533300a3370e900000089919191919299980799999191919191111919191919299980e19b87480000044cc028dd61980c180d004240084a66603a66ebccc064c06ccc064c06c005200048000cdd2a400066042660326036008900225eb804cdc398051bab33019301b00148008cdc11bad33019301b0044800001852809919299980f198061bac3301a301c00a4801094ccc07ccdd79980d980e9980d980e800a4000900019ba548000cc08ccc06cc07401920044bd70099b87300c375666036603a002900119b82337026eb4cc06cc0740192000375a66036603a00c90010040a5013300c375866034603801490021299980f999119299981119b87480000044c8c8cdd7998101811002a400066e95200033028375200297ae0375c605000260400042646466ebccc080c08801520003374a9001198141ba90014bd701bae3028001302000230200013301b301d001480000084cdc398061bab3301b301d00148008cdc11bad3301b301d006480080205280a503022001301a006301a00532533301b3370e90000008991919191919299981218138010a4c2c6eb8c094004c094008dd6981180098118011bad30210013019002163019001332232533301c3370e900100088010991811000980d001980d00119299980d19b87480080045300103d87a8000132323374a9000198101919299980f19b87480100044c8c090004c07000858c070004cc060c068cc060c0680052002480112f5c060400026030004603000298103d87a800032323300100100222533301e00114c0103d87a800013232533301d3371090001998061bab33019301b33019301b0024800920024891c72ff4773518459890ea5224018c10f7487a339ea0a9e42ac6826f8290048810841646d696e4b65790013374a90001981080125eb804cc010010004c088008c080004dd61980a180b002240046460100026601460126eaccc04cc05400d200800223330030014890048810022323300100100322533301900114a026464a666030600a00429444cc010010004c074008c06c004888c8c8c94ccc05ccdc3a4004002290000991bad301d001301500230150013253330163370e90010008a6103d87a800013232323300100100222533301d00114c103d87a8000132323232533301e3371e016004266e95200033022375000297ae0133006006003375a603e0066eb8c074008c084008c07c004dd5980e000980a001180a00099804001801180080091299980a0008a400026466e0120023300300300130170013300b300d009480000100284ccc8c888c8c8cc004004008894ccc06400452889919299980c19b87332232333001001003480008894ccc08000840044c8c8ccc0140140054ccc07cc0180084cdc0001a40042006604800660440046eb0cc050c05801d2000253330193371e6eb8cc054c05ccc054c05ccc054c05c005200048001200000313370e6eb4cc054c05ccc054c05c005200048009200014a090010998020020008a50301d002375c60360026460080026600c600a6eaccc03cc0440092008001300100122533301400114bd7009919191980c1ba900133005005002375c60280046030004602c00266016601a01290000020a502323300100100222533301400114bd6f7b630099191919299980a99b8f4881000021003133019337606ea4008dd3000998030030019bab3016003375c60280046030004602c002446464a66602266e1d200200114bd6f7b6300991bab3017001300f002300f0013300300200122323300100100322533301300114c103d87a800013232323253330143371e00e004266e95200033018374c00297ae01330060060033756602a0066eb8c04c008c05c008c054004dd7180800098040010a50300800133004300600248008526163253330083370e90000008a99980598030018a4c2c2a66601066e1d200200113232533300d3010002132498c94ccc02ccdc3a400000226464a66602060260042930b1bae301100130090021533300b3370e900100089919299980818098010a4c2c6eb8c044004c02400858c02400458c038004c01800c58c018008cc0040052000222233330073370e0020060184666600a00a66e000112002300e001002002230053754002460066ea80055cd2ab9d5573caae7d5d02ba157441" }
        const policyId = lucid.utils.mintingPolicyToId(mintingRawScript)
    
        const adminKey = "72ff4773518459890ea5224018c10f7487a339ea0a9e42ac6826f82941646d696e4b6579"
        const adminUtxo = await lucid.provider.getUtxoByUnit(adminKey)
        const adminDatum =  Data.from(adminUtxo.datum)
        const mintPrice = adminDatum.fields[0]
        const afiliateBounty = adminDatum.fields[1]
        const utxos = await lucid.wallet.getUtxos()
        const validUtxos =  utxos.filter(utxo =>  utxo.outputIndex === 0)
        const assets = {  }
        const consumingTxs = []
        const metadata =  {}
        metadata[policyId] ={}
        mintingSettings.forEach((mintingSetting, index) => { 
             assets[policyId+validUtxos[index].txHash] =  mintingSetting.amount;
             consumingTxs.push( lucid.newTx().collectFrom([validUtxos[index]]))
             metadata[policyId][validUtxos[index].txHash] =  {name: mintingSetting.name, description: mintingSetting.description, image: mintingSetting.image}
    }) 
    const afiliateAddress = undefined // "addr_test1xpvjlv8emrk3tsrgtqgc6y6dt39hcaejq5rczrlwntpdm72e97c0nk8dzhqxskq335f56hzt03mnypg8sy87axkzmhusvk0ya2"
      const paymentTx = afiliateAddress ?  
                  lucid.newTx().payToAddress(this.paymentAddress, {lovelace : mintPrice - afiliateBounty  })
                               .payToAddress(afiliateAddress, {lovelace : afiliateBounty })  :
                  lucid.newTx().payToAddress(this.paymentAddress, {lovelace : mintPrice   })
      

       
       const redeemer   = afiliateAddress ?  
                 Data.to(new Constr(1, [new Constr( lucid.utils.getAddressDetails(afiliateAddress).paymentCredential.type === "Key" ? 0 : 1, [ lucid.utils.getAddressDetails(afiliateAddress).paymentCredential.hash])])) :
                 Data.void()
      
        console.log(adminUtxo)
        console.log(mintPrice, afiliateBounty, lucid.utils.getAddressDetails(this.paymentAddress), adminDatum , redeemer)
        const tx = lucid.newTx()
                   .mintAssets(assets, redeemer)
                   .attachMintingPolicy(mintingRawScript )
                   .attachMetadata( 721 , metadata )
                   .readFrom([adminUtxo])
                   .compose(paymentTx)
        
        consumingTxs.map(consumingTx => {tx.compose(consumingTx)})
        console.log(await tx.toString())
        const completedTx = await tx.complete()
        console.log(completedTx)
        const signature = await completedTx.sign().complete();
          
        const txHash = await signature.submit();
        console.log(txHash)
        console.log(adminDatum,mintPrice,afiliateBounty)
    }

    async newLucidInstance(settings) {
        if (settings.provider === "Blockfrost") {
          return await Lucid.new(
            new Blockfrost(settings.api.url, settings.api.projectId),
            settings.network
          );
        } else if (settings.provider === "Kupmios") {
          return await Lucid.new(
            new Kupmios(settings.api.kupoUrl, settings.api.ogmiosUrl),
            settings.network
          );
        } else if (settings.provider === "MWallet") {
          return await Lucid.new(
            new Blockfrost(settings.api.url, settings.api.projectId),
            settings.network
          );
        }
      }
    setWalletPickerOpen = (value) => {
        this.setState({walletPickerOpen: value})
    }

    description = <div name="mintingDescription"><h1>Here you can mint your Tokenized Wallet</h1><br/>
            <h3>This process uses a plutus script to mint a Uniqe token for you that will unlock your token-wallet</h3><br/>
            <h4>You can select any metadata you want for your token, this metadata will help you to identify your token in the future for a better user experience<br/>
            The default image is a generated image based on the content of your token-wallet, generated centraly and served from the BroClan server<br/> 
            You can use a Custom image if you want, but you will have to host it yourself on IPFS<br/>
            Important to note that minting a token with the same name will NOT unlock the same token-wallet<br/>

            When tokenized Multisig is released for BroClan, you will be able to reuse this tokens in that setting</h4></div>

   

    render() {
        return (
            <div className='MintingModule'>
                 {this.state.walletPickerOpen && <WalletPicker setOpenModal={this.setWalletPickerOpen} operation={this.mintWithWallet} />}
                    {this.description}
                    <div key={this.state.mintingSettings}> 
                {this.state.mintingSettings.map((mintingSetting, index) => 
                    <div key={index}>
                        {index > 0 && <button onClick={() => this.removeMintingSetting(index)}>x</button> }
                        Name:<input type="text" value={mintingSetting.name} onChange={(event) => this.setName(event.target.value, index) }/> 
                        <br/>
                        Description:<input type="text"   value={mintingSetting.description} onChange={(event) => this.setDescription(event.target.value, index)} /> 
                        <br/>
                        Copies:<input type="number"   value={mintingSetting.amount}  onChange={(event) => this.setAmount(event.target.value, index)}/>
                        <br/>
                        Image:
                            <select  value={mintingSetting.image}  onChange={(event) => this.changeImage(event.target.value, index) } > 
                                <option value="">default</option>
                                <option value="custom">Custom</option>
                            </select>
                            {mintingSetting.image === "custom" &&
                               <div> <input type="file"  onChange={(event)=> this.uploadImage(event, index)}/> 
                                    {mintingSetting.CustomImage && <img className="CustomImageSelection" src={URL.createObjectURL(new Blob([mintingSetting.CustomImage]))} alt="custom" />}
                               </div>}
                            <br/>
                            {/* <button onClick={() => this.addMintingSetting()}>Mint More</button> */}
                            <br/>
                            <button onClick={() => this.startMint()}>Mint Now</button>
                    </div>
                    )}
              </div>

                <br />
            </div>
        );
    }

}

export default Minting