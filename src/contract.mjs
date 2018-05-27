import contract from '@legend-of-ether/sol'
import Web3 from 'web3'

const web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/'))

export const contractInstance = new web3.eth.Contract(contract.abi, contract.networks['3'].address)

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