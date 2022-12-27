import React from "react";
import "./WalletPicker.css";

class AddWalletModal extends React.Component {
  state = {  
    json: {
      "type": "all",
      "scripts":
      [
        {
          "type": "sig",
          "name" : "Test",
          "keyHash": "487b9485cf18d99e875e7aef9b80c4d3a89cccddefbc2641c87da293"
        },
        {
          "type": "sig",
          "name": "Leo",
          "keyHash": "7190ae1c26a87ed572e8d72049454ddc874d360293c1eb43aef490e3"
        },
      ]
    } , 
    WName : ""
  } 
  options = [{name:"All", value:"all"},
              {name:"Any", value:"any"},
              {name:"At least", value:"atLeast"},
              {name:"Before", value:"before"},
              {name:"After", value:"after"},
              {name:"Signatory", value:"sig"} ]

  setJson(json){
    this.setState({json})
  }

  setWName(WName){
    this.setState({WName})
  }  

  handleSubmit(event){

    event.preventDefault();
    this.props.root.addWallet(this.state.json,this.state.WName)
    this.props.setOpenModal(false)
  }


  allComponent(json,coordinates){
    return (
    <div>
       {json.scripts.map( (item,index) => (this.rootComponenent(item, [...coordinates,index])))}
       <button onClick={ (event) => this.handleAddScript(coordinates)}>Add</button>
    </div>)
  }

  anyComponent(json,coordinates){
    return (
    <div>
       {json.scripts.map( (item,index) => (this.rootComponenent(item, [...coordinates,index])))}
       <button onClick={ (event) => this.handleAddScript(coordinates)}>Add</button>
    </div>)
  }

  atLeastComponent(json,coordinates){
    return (
    <div>
        <label>
            At Least:
            <input
              type="text"
              name="amount"
              value={json.required}
              onChange={event => this.handleRequiredChange(event.target.value, coordinates)}
            />
          </label>
       {json.scripts.map( (item,index) => (this.rootComponenent(item, [...coordinates,index])))}
       <button onClick={ (event) => this.handleAddScript(coordinates)}>Add</button>
    </div>)
  }
  
  handleAddScript(coordinates){
    const json=this.state.json;
    console.log("In handle Type Change")
    console.log(coordinates)
    let current = json;
    for (const index of coordinates) {
      current = current.scripts[index];
    }
    current.scripts.push({ "type": "sig","name" : "","keyHash": "" })

    console.log(json)
    this.setState({json})
  }

  handleRequiredChange(value,coordinates){
    const json=this.state.json;
    console.log("In handle Type Change")
    console.log(coordinates)
    console.log(value)
    let current = json;
    for (const index of coordinates) {
      current = current.scripts[index];
    }
    current.required=Number.parseInt(value)

    console.log(json)
    this.setState({json})
  }

  handleSignatoryNameChange(value,coordinates){
    const json=this.state.json;
    console.log("In handle Type Change")
    console.log(coordinates)
    console.log(value)
    let current = json;
    for (const index of coordinates) {
      current = current.scripts[index];
    }
    current.name=value

    console.log(json)
    this.setState({json})
    
  }


  handleKeyHashChange(value,coordinates){
    const json=this.state.json;
    console.log("In handle Type Change")
    console.log(coordinates)
    console.log(value)
    let current = json;
    for (const index of coordinates) {
      current = current.scripts[index];
    }
    current.keyHash=value

    console.log(json)
    this.setState({json})
    
  }

  sigComponent(json,coordinates){
   // console.log("In Sig component")
   // console.log(json)
    //console.log(coordinates)
    return (
        <div>
          <label>
            Name:
            <input
              type="text"
              name="amount"
              value={json.name}
              onChange={event => this.handleSignatoryNameChange(event.target.value, coordinates)}
            />
          </label>
          <br />
          <label>
            KeyHash:
            <input
              type="text"
              name="amount"
              value={json.keyHash}
              onChange={event => this.handleKeyHashChange(event.target.value, coordinates)}
            />
          </label>
          <br/>
          <br/>
        </div>
    )
  }

  beforeComponent(json,coordinates){
    // console.log("In Sig component")
    // console.log(json)
     //console.log(coordinates)
     return (
         <div>
  
           <br />
           <label>
             Before Slot:
             <input
               type="text"
               name="amount"
               value={json.keyHash}
               onChange={event => this.handleKeyHashChange(event.target.value, coordinates)}
             />
           </label>
           <br/>
           <br/>
         </div>
     )
   }

   afterComponent(json,coordinates){
    // console.log("In Sig component")
    // console.log(json)
     //console.log(coordinates)
     return (
         <div>
  
           <br />
           <label>
             After Slot:
             <input
               type="text"
               name="amount"
               value={json.keyHash}
               onChange={event => this.handleKeyHashChange(event.target.value, coordinates)}
             />
           </label>
           <br/>
           <br/>
         </div>
     )
   }

  
  handleTypeChange(value,coordinates){
    const json=this.state.json;
    console.log("In handle Type Change")
    console.log(coordinates)
    console.log(value)
    let current = json;
    for (const index of coordinates) {
      current = current.scripts[index];
    }

    console.log("hey leo")
    current.type=value
    switch(value){
      case "all": 
           current.scripts=[{ "type": "sig","name" : "","keyHash": "" },
          { "type": "sig","name": "", "keyHash": "" }]
            delete current.name
            delete current.keyHash
            delete current.required

            break;
      case "any": 
           current.scripts=[{ "type": "sig","name" : "","keyHash": "" },
          { "type": "sig","name": "", "keyHash": "" }]
            delete current.name
            delete current.keyHash
            delete current.required

            break;   
      case "atLeast": 
            current.scripts=[{ "type": "sig","name" : "","keyHash": "" },
           { "type": "sig","name": "", "keyHash": "" }]
            current.required=1
             delete current.name
             delete current.keyHash
             break;     
      case "before":
            current.slot=0
            delete current.name
            delete current.required
            delete current.keyHash
            delete current.scripts
            
      case "after":
            current.slot=0
            delete current.name
            delete current.keyHash
            delete current.scripts  
            delete current.required
          
      case "sig":
            current.name=""
            current.keyHash=""
            delete current.scripts
            delete current.required
            delete current.slot
            break;
    }
    console.log(json)
    this.setState({json})
    
  }
  
  rootComponenent(json, coordinates=[]){
  //  console.log("In root component")
 //   console.log(json)
 //   console.log(coordinates)
    var content 
    
    switch (json.type) {
      case "all": 
            content =  this.allComponent(json,coordinates)
            break;
      case "any": 
            content =  this.anyComponent(json,coordinates)
            break;
      case "atLeast" :
            content =  this.atLeastComponent(json,coordinates)
            break;
      case "before" :
            content =  this.beforeComponent(json,coordinates)
            break;
      case "after" :
            content =  this.afterComponent(json,coordinates)
            break;
      case "sig":
            content =  this.sigComponent(json,coordinates)
            break;
  };

  
  console.log(content)
  return (
  <div key={coordinates} >
    <select value={json.type } onChange={(event) => this.handleTypeChange(event.target.value,coordinates)}>
      {this.options.map(option => (
        <option key={option.name} value={option.value} > 
          {option.name}
        </option>
      ))}
    </select>
    {content}
  </div>
  )
}

  anyComponenent(json){

  }


  render() { 
    return  (
    <div className="modalBackground">
      <div className="modalContainer"  >
        <div className="titleCloseBtn">
          <button
            onClick={() => {
              this.props.setOpenModal(false);
            }}
          >
            X
          </button>
        </div>
  
        <div className="title">
          <h1>Create Wallet</h1>
        </div>
        <div className="body">
      <label>
        Name:
        <input
          type="text"
          name="name"
          value={this.WName}
          onChange={event => this.setWName(event.target.value)}
        />
      </label>

          {this.rootComponenent(this.state.json)}
            
        </div>
        <div className="footer">
      <button onClick={(event) => this.handleSubmit(event)}>addWallet</button>
          <button
            onClick={() => {
              this.props.setOpenModal(false);
              
            }}
            id="cancelBtn">
            Cancel
          </button>
        </div>
      </div>
    </div>
    );
}}

export default AddWalletModal;