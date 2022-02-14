pragma solidity 0.7.3; //Utilizar versión distinta de la 0.4.21 que usábamos antes, ya que tiene problemas con la instrucción "create2" (no es soportada por la versión de la VM del compilador).

contract Deployer {
  //DATO: Tuve mil problemas para que este contrato funcione. Resultó que todo se redujo a que si no uso hex"606060..." en lugar de "0x6060..." la variable queda con cualquier cosa (no respeta el bytecode).
  bytes smarxContractBytecode = hex"6060604052341561000f57600080fd5b6101748061001e6000396000f30060606040526004361061004c576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806306fdde03146100515780636c42640b14610082575b600080fd5b341561005c57600080fd5b610064610097565b60405180826000191660001916815260200191505060405180910390f35b341561008d57600080fd5b6100956100bf565b005b60007f736d617278000000000000000000000000000000000000000000000000000000905090565b73a9371616488ed006dfd48838360d32872bba6f3473ffffffffffffffffffffffffffffffffffffffff1663380c7a676040518163ffffffff167c0100000000000000000000000000000000000000000000000000000000028152600401600060405180830381600087803b151561013657600080fd5b5af1151561014357600080fd5b5050505600a165627a7a7230582022ebcb126129cd0cfec902e5247d394c0736c86fc04da2b189f0f7bdd076b3500029";
  address public addressDondeDeployo;
  function deployDeSmarx (bytes32 salt) public{
   bytes memory bytecode = smarxContractBytecode;
   address create2Address;

  //parámetros de create2: wei a mandar al nuevo contrato + la ubicación del bytecode EN MEMORIA (inicio,fin) + salt
   assembly {
     create2Address := create2(0, add(bytecode,0x20), mload(bytecode),salt)
   }
   addressDondeDeployo = create2Address;
  }
}