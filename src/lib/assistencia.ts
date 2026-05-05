import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";

export type OSStatus = "aguardando" | "em_andamento" | "concluido" | "cancelado";

export interface ClienteAT {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  criadoEm: string;
}

export interface OrdemServico {
  id: string;
  clienteId: string;
  clienteNome: string;
  equipamento: string;
  problema: string;
  diagnostico: string;
  valor: number;
  status: OSStatus;
  dataEntrada: string;
  dataSaida: string | null;
  criadoEm: string;
}

export interface AgendaItem {
  id: string;
  titulo: string;
  clienteNome: string;
  data: string;
  hora: string;
  observacao: string;
  criadoEm: string;
}

// Clientes AT
export function subscribeClientesAT(cb: (clientes: ClienteAT[]) => void): Unsubscribe {
  const q = query(collection(db, "at_clientes"), orderBy("criadoEm", "desc"));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ClienteAT))));
}
export async function addClienteAT(data: Omit<ClienteAT, "id">): Promise<string> {
  const ref = await addDoc(collection(db, "at_clientes"), data);
  return ref.id;
}
export async function updateClienteAT(id: string, data: Partial<Omit<ClienteAT, "id">>): Promise<void> {
  await updateDoc(doc(db, "at_clientes", id), data as Record<string, unknown>);
}
export async function deleteClienteAT(id: string): Promise<void> {
  await deleteDoc(doc(db, "at_clientes", id));
}

// Ordens de serviço
export function subscribeOS(cb: (ordens: OrdemServico[]) => void): Unsubscribe {
  const q = query(collection(db, "at_ordens"), orderBy("criadoEm", "desc"));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as OrdemServico))));
}
export async function addOS(data: Omit<OrdemServico, "id">): Promise<string> {
  const ref = await addDoc(collection(db, "at_ordens"), data);
  return ref.id;
}
export async function updateOS(id: string, data: Partial<Omit<OrdemServico, "id">>): Promise<void> {
  await updateDoc(doc(db, "at_ordens", id), data as Record<string, unknown>);
}
export async function deleteOS(id: string): Promise<void> {
  await deleteDoc(doc(db, "at_ordens", id));
}

// Agenda
export function subscribeAgenda(cb: (items: AgendaItem[]) => void): Unsubscribe {
  const q = query(collection(db, "at_agenda"), orderBy("data", "asc"));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as AgendaItem))));
}
export async function addAgendaItem(data: Omit<AgendaItem, "id">): Promise<void> {
  await addDoc(collection(db, "at_agenda"), data);
}
export async function deleteAgendaItem(id: string): Promise<void> {
  await deleteDoc(doc(db, "at_agenda", id));
}
