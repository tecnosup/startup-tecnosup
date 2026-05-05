import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, Unsubscribe, arrayUnion,
} from "firebase/firestore";
import { db } from "./firebase";
import { Cliente, ChecklistItem, HistoricoItem } from "./types";

const COL = "clientes";

export function subscribeClientes(cb: (clientes: Cliente[]) => void): Unsubscribe {
  const q = query(collection(db, COL), orderBy("criadoEm", "desc"));
  return onSnapshot(q, (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Cliente)))
  );
}

export async function getClientes(): Promise<Cliente[]> {
  const snap = await getDocs(query(collection(db, COL), orderBy("criadoEm", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Cliente));
}

export async function addCliente(data: Omit<Cliente, "id">): Promise<string> {
  const ref = await addDoc(collection(db, COL), data);
  return ref.id;
}

export async function updateCliente(id: string, data: Partial<Omit<Cliente, "id">>): Promise<void> {
  await updateDoc(doc(db, COL, id), data as Record<string, unknown>);
}

export async function deleteCliente(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

export async function updateChecklist(id: string, checklist: ChecklistItem[]): Promise<void> {
  await updateDoc(doc(db, COL, id), { checklist });
}

export async function updateNotas(id: string, notas: string): Promise<void> {
  await updateDoc(doc(db, COL, id), { notas });
}

export async function addHistorico(id: string, item: HistoricoItem): Promise<void> {
  await updateDoc(doc(db, COL, id), { historico: arrayUnion(item) });
}
