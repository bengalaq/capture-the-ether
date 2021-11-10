// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Victima {
    constructor(){

    }

    function tiempo() public view returns (uint) {
      console.log("Timestamp al invocar funcion en contrato victima: %d", block.timestamp);
      return block.timestamp;
    }
}

contract Atacante {
    constructor(){
      
    }
    function tiempoDeLaVictima(address _address) public view returns (bool){
        Victima contratoVictima = Victima(_address);
        console.log("Timestamp al invocar funcion en contrato atacante: %d", block.timestamp);
        return (contratoVictima.tiempo() == block.timestamp);
    }
}