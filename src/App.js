import './App.css'; // Importa o arquivo de estilos CSS para o componente
//instalei a lib ethers para poder usá-la:npm i ethers
import { ethers } from 'ethers'; // Importa a biblioteca ethers.js para interagir com a blockchain Ethereum
import { useState } from 'react'; // Importa o Hook useState do React para gerenciar o estado
import fileABI from './abi.json'; // Importa o ABI do contrato inteligente (gerado e salvo no arquivo abi.json)
//ABI disponível em: https://testnet.bscscan.com/address/0xE9956c971B72aD74F249E616828df613F03E858b


//importando arquivo ABI que criei 
import fileABI from './abi.json';

function App() {


  const [message, setMessage] = useState(""); // Armazena mensagens, como respostas ou erros
  const [customerId, setCustomerId] = useState(""); // Armazena o ID do cliente a ser pesquisado
  const [name, setName] = useState(""); // Armazena o nome do cliente ao adicionar
  const [age, setAge] = useState(""); // Armazena a idade do cliente ao adicionar

  //Smart Contract que contém CRUD de Customer
  const CONTRACT_ADDRESS = "0xE9956c971B72aD74F249E616828df613F03E858b";

  //Obter um provedor de conexão com a carteira (como MetaMask) do usuário
  async function getProvider() {
    //Verifica se existe Wallet disponível no navegador
    if (!window.ethereum) return setMessage("No Wallet Found!");

    //carregar conexão com a Wallet da Metamask
    const provider = new ethers.BrowserProvider(window.ethereum);

    //solicitar permissão do usuário na wallet
    const accounts = await provider.send("eth_requestAccounts", []);

    //verifica se o usuário não autorizou acesso à Wallet
    if (!accounts || !accounts.length) return setMessage("Access to Wallet was not authorized ");

    return provider;
  }

  //Buscar informações de um cliente no contrato inteligente
  async function doSearch() {

    const provider = await getProvider();

    try {
      //param1: endereço do smart contract
      //param2: ABI do contrato (baixei do smart contract e colei o conteúdo num arquivo abi.jason)
      //param3: objeto de conexão da wallet que instanciamos
      const contract = new ethers.Contract(CONTRACT_ADDRESS, fileABI, provider);

      //a função abaixo sabe que existe um getCustomer por causa do fileABI que carregamos no objeto contract
      const customer = await contract.getCustomer(customerId);

      //Estava dando erro e tive que converter isso abaixo:
      const customerString = JSON.stringify(customer, (key, value) =>
        typeof value === "bigint" ? Number(value) : value,
      );

      setMessage(customerString);

    } catch (err) {
      setMessage(err.message);
    }

  }

  //Escreve na blockchain criando um customer com nome e idade
  async function doSave() {
    try {
      const provider = await getProvider();
      const signer = await provider.getSigner();

      //param1: objeto de conexão da wallet que instanciamos
      const contract = new ethers.Contract(CONTRACT_ADDRESS, fileABI, signer);

      const customer = { name, age }; // Cria um objeto equivalente ao struct do smart contract
      const transacao = await contract.addCustomer(customer);

      // Exibe o hash da transação para o usuário (opcional)
      console.log("Transação enviada. Hash:", transacao.hash);
      //0x0d6592d6973269b1bdaaf156507297c88a1c60d105a8430341304b5428bcf32a

      setMessage(transacao);
    } catch (err) {
      alert(err);
      setMessage(err);
    }
  }

  function onSearchClick() {
    setMessage("");
    doSearch();
  }

  function onSaveClick() {
    setMessage("");
    doSave();
    //alert(JSON.stringify({ name, age })); // Usar para teste
  }

  return (
    <div className="App">
      <header className="App-header">
        <p>
          <label>
            Custumer ID:
            <input type="number" value={customerId} onChange={(evt) => setCustomerId(evt.target.value)} />
            <input type="button" value="Search" onClick={onSearchClick} />
          </label>
          <p>
            {message}
          </p>

          <hr></hr>
          <label>
            Nome: <input type="text" value={name} onChange={(evt) => setName(evt.target.value)} />
          </label>
          <label>
            Idade:<input type="number" value={age} onChange={(evt) => setAge(evt.target.value)} />
          </label>
          <input type="button" value="Add Customer" onClick={onSaveClick} />
        </p>
      </header>
    </div>
  );
}

export default App;
