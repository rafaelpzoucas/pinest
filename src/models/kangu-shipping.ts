export type VolumeType = {
  peso: number
  altura: number
  largura: number
  comprimento: number
  tipo: string
  valor: number
  quantidade: number
}

export type ProdutoType = {
  produto: string
  peso: number
  altura: number
  largura: number
  comprimento: number
  valor: number
  quantidade: number
}

type PedidoType = {
  tipo: 'D' | 'N'
  numero?: string
  serie?: string
  chave?: string
  chaveCTe?: string
  xml?: string
  numeroCli?: string
  vlrMerc?: number
  pesoMerc?: number
}

type DestinoType = {
  nome: string
  cnpjCpf?: string
  endereco: {
    logradouro: string
    numero: string
    complemento: string
    bairro: string
    cep: string
    cidade: string
    uf: string
  }
  contato?: string
  email?: string
  telefone?: string
  celular?: string
}

type ServicosType = 'P' | 'C' | 'R' | 'V' | 'E' | 'X' | 'M'

export type RequestSimularType = {
  cepOrigem: string
  cepDestino: string
  vlrMerc: number
  pesoMerc: number
  volumes: VolumeType[]
  produtos: ProdutoType[]
  servicos: ServicosType[]
  ordernar: 'preco' | 'prazo'
}

export type ShippingType = {
  alertas: any[]
  cnpjTransp: string
  cnpjTranspResp: string
  descricao: string
  dtPrevEnt: Date
  dtPrevEntMin: Date
  dtPrevPostagem: Date
  error: { codigo: string; mensagem: string }
  idSimulacao: number
  idTransp: number
  idTranspResp: number
  nf_obrig: 'N' | 'S'
  prazoEnt: number
  prazoEntMin: number
  prazoEntTransp: number
  prazoEntTranspMin: number
  referencia: string
  servico: ServicosType
  tarifas: {
    descricao: string
    faixa: any | null
    valor: number
  }[]
  transp_nome: string
  url_logo: string
  vlrFrete: number
}

export type RequestSolicitarType = {
  gerarPdf: boolean
  formatoPdf?: string
  pedido: PedidoType
  remetente: DestinoType
  destinatario: DestinoType
  volumes?: VolumeType[]
  produtos: ProdutoType[]
  pontoPostagem?: string
  pontoEntrega?: string
  transportadora?: string
  referencia?: string
  usarTransportadoraContrato: boolean
  servicos: ServicosType[]
}
