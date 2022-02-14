// Interesante leer https://github.com/ethereumbook/ethereumbook/blob/develop/06transactions.asciidoc y si es posible recuperar una public key.

import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";

let PUBLIC_KEY_CHALLENGE_ADDRESS: string = "0x7DF7A66ceFA8e2200A8981b07Fd20414C03d7272";
let publicKeyChallengeContract: Contract;
let accounts: Signer[];
let eoa: Signer;


beforeEach(async () => {
  accounts = await ethers.getSigners();
  [eoa] = accounts;

  let publicKeyFactory = await ethers.getContractFactory("PublicKeyChallenge");
  publicKeyChallengeContract = publicKeyFactory.attach(PUBLIC_KEY_CHALLENGE_ADDRESS);
})

describe("Public Key", async () => {
  it("Resuelve el Accounts challenge - Public Key", async () => {
    //Primero obtenemos la información de la transacción creada al instanciar el contrato.
    const txOutHash = "0xabc467bedd1d17462fcc7942d0af7874d6f8bdefee2b299c9168a216d3ff0edb";
    const txOut = await eoa.provider!.getTransaction(txOutHash); //El "!" es para inferir en typescript que la variable no va a ser null o undefined. Si no vscode nos marca un error gede.

    console.log(`txOut: ${JSON.stringify(txOut, null, 2)}`);

    //Segundo reconstruimos la serialización de la transacción.
    const txData = {
      nonce: txOut.nonce,
      gasPrice: txOut.gasPrice,
      gasLimit: txOut.gasLimit, //Es el "startGas"
      to: txOut.to,
      value: txOut.value,
      data: txOut.data,
      chainId: txOut.chainId
    };
    const dataSerializada = ethers.utils.serializeTransaction(txData);

    //Tercero obtenemos su hash keccak256 (sería el hash de todo el mensaje con la data)
    const hash = ethers.utils.keccak256(dataSerializada);

    //Cuarto usamos la función recoverPublicKey de ethers js. La misma recibe primero el hash keccak256 conseguido, junto con la firma (valores de r,s y v en formato JSON)
    const firmaEnJSON = { //Le ponemos el "!" para que no se queje nuevamente
      r: txOut.r!,
      s: txOut.s!,
      v: txOut.v!
    };    

    let publicKey = ethers.utils.recoverPublicKey(hash, firmaEnJSON);

    // console.log(`PUBLIC KEY: ${publicKey}`);
    
    //Cuidado. Estuve un tiempo largo sin saber por qué no funcionaba el script. Resulta que las public key tienen un 0x04 + posicionEnEjeX + posicionEnEjeY. Las coordenadas ya sabemos para qué se utilizan (repasar ECDSA), pero el 0x04 no. Este prefijo sirve para indicar que la public key no está comprimida, caso contrario empezaría con 0x03 o 0x02. Solución: quitar el prefijo 0x04 para dejar la public key tal y como la conocemos (dejamos el 0x, no seamo gile').
    
    let publicKeySinPrefijo = "0x" +   publicKey.slice(4);

    console.log(`LA PUBLIC KEY RECUPERADA ES: ${publicKeySinPrefijo}`);

    const txAuthenticate = await publicKeyChallengeContract.authenticate(publicKeySinPrefijo);
    await txAuthenticate.wait();

    //Chequeo si isComplete es true
    let isComplete = await publicKeyChallengeContract.isComplete();
    expect(isComplete, "DESAFIO INCOMPLETO").to.be.true;
  })
})