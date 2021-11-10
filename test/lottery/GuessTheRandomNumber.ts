import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, BigNumber } from "ethers";

let randomNumberContract: Contract;
const contractAddress: string = "0xd0A2996CAA3Dd998718627F2923dCcECaF321DF5";

beforeEach(async()=>{
  const randomNumberFactory = await ethers.getContractFactory("GuessTheRandomNumberChallenge");
  randomNumberContract = randomNumberFactory.attach(contractAddress);
});

describe("Guess The Random Number", async ()=>{
  it("Resuelve el Lottery challenge - Guess The Random Number", async ()=>{
    const randomNumber:BigNumber = BigNumber.from(await randomNumberContract.provider.getStorageAt(contractAddress,0));
    console.log(`El número random buscado es: ${randomNumber}`);

    const tx = await randomNumberContract.guess(randomNumber,{
      value: ethers.utils.parseEther("1"),
      gasLimit: 1e5
    });
    expect(tx.hash).not.to.be.undefined;
    const isComplete:boolean = await randomNumberContract.isComplete();
    console.log(`El valor de isComplete es: ${isComplete}`);
    
    expect(isComplete).to.be.true;
  })
})

//CONOCIMIENTO PARA SU RESOLUCIÓN: Toda la información en la blockchain, aún las variables privadas de un Smart Contract, son públicas. No son posibles de leer desde un contrato, pero desde ethers js o Web3 sí es posible, tal y como se demuestra en este ejercicio. Para mayor información, visitar https://cryptomarketpool.com/access-private-data-on-the-eth-blockchain/

/* EXTRAS:
1) Si a randomNumber no lo tipifico como BigNumber, al querer interactuar con la red pública el método guess se invocaba con otra cosa que no era un número y por eso rompía.
2) El expect de isComplete funcionó mal hasta que tipifique como boolean a isComplete.
3) Cuidado con el blocknumber establecido en hardhat.config.ts -> El mismo debe cambiar challenge a challenge ya que si no ethers nunca podrá hacer el attach(direccionDelContrato);
4) También era posible resolver el problema entrando a un explorador de bloques como etherscan. Buscamos el address donde se deployó el contrato -> Internal Txns -> Elegimos la transacción con la que se creó -> State -> Buscamos el cambio de estado de 0 ETH a 1 ETH, que sería cuando se creó el contrato y se modificó el state (variable answer) -> Observamos el storage y al hexadecimal del campo "After" le indicamos desde el desplegable que queremos verlo en formato "Number" -> Observamos el valor oculto y realizamos la llamada guess con el parámetro correspondiente.
*/