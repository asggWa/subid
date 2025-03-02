import { FormInstance } from 'antd'
import { tokenSelectorEncoder } from './TokenSelector'
import { getCrossChainAdapter } from './configs/cross-chain'

export type TransferFormData = {
  recipient: string
  amount: string
  token: string
  sourceChain: string
  destChain?: string
  tokenId: any
}

export type FormFields = {
  token: string
  crossChainToken: string
  amount: string
  source: string
  dest: string
  recipient: string
}
export const transferFormField = (name: keyof FormFields) => name

type MinimalFormInstance = { getFieldsValue: FormInstance['getFieldsValue'] }
export function getTransferFormData (form: MinimalFormInstance, crossChain: boolean): TransferFormData {
  const formValues = form.getFieldsValue()
  const tokenData = formValues[transferFormField(crossChain ? 'crossChainToken' : 'token')]
  const { token, network = '', tokenId } = tokenSelectorEncoder.decode(tokenData)

  const source = formValues[transferFormField('source')]
  const dest = formValues[transferFormField('dest')]

  const usedSource = crossChain ? source : network
  
  return {
    recipient: formValues[transferFormField('recipient')],
    amount: formValues[transferFormField('amount')],
    sourceChain: usedSource,
    destChain: crossChain ? dest : undefined,
    token,
    tokenId: crossChain ? undefined : tokenId
  }
}

export type CrossChainFee = { balance: number; token: string }
export const getCrossChainFee = (form: MinimalFormInstance): CrossChainFee => {
  const { destChain, sourceChain, token } = getTransferFormData(form, true)

  const adapter = getCrossChainAdapter(sourceChain)
  if (!destChain || !token || !adapter) return { balance: 0, token: '' }

  try {
    const fee = adapter.getCrossChainFee(token, (destChain ?? '') as any)
    return {
      balance: fee.balance.toNumber(),
      token: fee.token
    }
  } catch {
    return { balance: 0, token: '' }
  }
}
