import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import internal from "stream";

let guessTheSecretNumberContract: Contract;
let secretNumber;
let coincidencia: boolean;
let answerHash = "0xdb81b4d58595fbbbb592d3661a34cdca14d7ab379441400cbfa1b78bc447c365";

function averiguarValorPorKeccak() {
  for (let numero = 0; !coincidencia; numero++) {
    let numeroKeccakeado = ethers.utils.keccak256([numero]);
    if (numeroKeccakeado == answerHash) {
      coincidencia = true;
      console.log(`MATCH!! [✔] ---------------------> Numero: ${numero}`);
      return numero;
    } else {
      console.log(`Intento fallido [X] ---------------------> Numero: ${numero}`);
    }
  }
}

beforeEach(async () => {
  coincidencia = false;
  const guessTheSecretNumberFactory = await ethers.getContractFactory(
    "GuessTheSecretNumberChallenge"
  );
  guessTheSecretNumberContract = guessTheSecretNumberFactory.attach(
    "0xA4Fc5f2ED35A3247e3643b947d2336E4B36FE4A8"
  );
});

describe("Guess The Secret Number", async () => {
  it("Resuelve el Lottery challenge - Guess The Secret Number", async () => {
    secretNumber = averiguarValorPorKeccak();
    console.log(`El numero encontrado por la función es: ${secretNumber}`);
    const tx = await guessTheSecretNumberContract.guess(secretNumber, {
      value: ethers.utils.parseEther("1"),
      gasLimit: 1e5,
    });
    expect(tx.hash).not.to.be.undefined;
  });
});
