export type VolumeType = {
  peso: number
  altura: number
  largura: number
  comprimento: number
  tipo: 'C' | 'E' // Caixa ou envelope
  valor: number
  quantidade: number
  produto: string
}

type PedidoType = {
  tipo: 'D' | 'N' // Declaração ou Nota fiscal
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
  cnpjCpf: string
  endereco: {
    cep: string
    logradouro: string
    complemento: string
    numero: string
    bairro: string
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
  produtos: VolumeType[]
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
    faixa: string
    valor: number
  }[]
  transp_nome: string
  url_logo: string
  vlrFrete: number
}

export type RequestSolicitarType = {
  gerarPdf: boolean
  pedido: PedidoType
  remetente: DestinoType
  destinatario: DestinoType
  volumes: VolumeType[]
  produtos: VolumeType[]
  usarTransportadoraContrato: boolean
  servicos: ServicosType[]
  formatoPdf?: string
  pontoPostagem?: string
  pontoEntrega?: string
  transportadora?: string
  referencia?: string
}
