import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";

let victimaContract: Contract;
let atacanteContract: Contract;

beforeEach(async() =>{
  const VictimaContractFactory = await ethers.getContractFactory("Victima");
  const AtacanteContractFactory = await ethers.getContractFactory("Atacante");

  victimaContract = await VictimaContractFactory.deploy();
  atacanteContract = await AtacanteContractFactory.deploy();

  await victimaContract.deployed();
  await atacanteContract.deployed();
})

describe("Timestamp idéntico al invocar una función en 2 contratos distintos",async ()=>{
  it("Mismo timestamp atacante y víctima",async ()=>{
    let sonIguales = await atacanteContract.tiempoDeLaVictima(victimaContract.address);
    sonIguales? console.log(`Los timestamp de los contratos son iguales`) : console.log(`Flasheaste mi rey, son distintos`);
    expect(sonIguales).to.be.true;
  })
})