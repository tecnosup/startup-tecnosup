export type ClienteStatus = "ativo" | "dev" | "inadimplente";

export interface ChecklistItem {
  tarefa: string;
  feito: boolean;
}

export interface HistoricoItem {
  acao: string;
  data: string;
}

export interface Cliente {
  id: string;
  nome: string;
  segmento: string;
  status: ClienteStatus;
  plano: number;
  renovacao: string | null;
  whatsapp: string | null;
  site: string | null;
  vercel: string | null;
  firebase: string | null;
  cloudinary: string | null;
  checklist: ChecklistItem[];
  notas: string;
  historico: HistoricoItem[];
  criadoEm: string;
}

export interface Pagamento {
  id: string;
  clienteId: string;
  clienteNome: string;
  valor: number;
  data: string;
  descricao: string;
  tipo: "mensalidade" | "setup" | "avulso";
}
