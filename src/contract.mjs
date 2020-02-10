import contract from '@legend-of-ether/sol'
import Web3 from 'web3'

const web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/25915a33d3264e5d975f8759231b9d10'))

export const contractInstance = new web3.eth.Contract(contract.abi, contract.networks['3'].address, { from: '0x209f210ec4dd7beae894a45666faadf0b6be0dbf' })

export function getPoolItemCount(itemId) {
  return contractInstance.methods.addressToItems(0, itemId).call()
}

export function getAllPoolItemCounts(items) {
  return Promise.all(items.map((item, index) => getPoolItemCount(index)))
}

export async function getItems() {
  const itemCount = parseInt(await contractInstance.methods.getItemCount().call())
  return Promise.all(
    Array(itemCount)
      .fill(0)
      .map((el, i) => contractInstance.methods.items(i).call())
  )
}

export async function grabItem(who, what) {
  console.log('grabItem', who, what)
  console.log('contract address', contract.networks['3'].address)

  const PRIVATE_KEY = '0xf0db0a4c7668cefdfce4e53522ecbebdbe6fbc21463d4da4c2a4351004e0f3d4'
  const SENDER_ADDRESS = '0x209f210ec4dd7beae894a45666faadf0b6be0dbf'
  const method = contractInstance.methods.addItem(who, what)
  const gas = await method.estimateGas()
  const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY)
  const data = method.encodeABI()
  const nonce = await web3.eth.getTransactionCount(SENDER_ADDRESS, 'pending')
  const payload = {
    nonce,
    data,
    gas,
    from: who,
    to: contract.networks['3'].address
  }
  const signedTx = await account.signTransaction(payload)
  const { rawTransaction } = signedTx
  const response = await web3.eth.sendSignedTransaction(rawTransaction)

  console.log('grabItem response', response)
}

async function createItem() {
  console.log('createItem', who, what)
}
