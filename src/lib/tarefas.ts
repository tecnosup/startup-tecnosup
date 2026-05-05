import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";

export interface Tarefa {
  id: string;
  texto: string;
  feito: boolean;
  prioridade: "alta" | "media" | "baixa";
  criadoEm: string;
}

const COL = "tarefas";

export function subscribeTarefas(cb: (tarefas: Tarefa[]) => void): Unsubscribe {
  const q = query(collection(db, COL), orderBy("criadoEm", "desc"));
  return onSnapshot(q, (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Tarefa)))
  );
}

export async function addTarefa(data: Omit<Tarefa, "id">): Promise<void> {
  await addDoc(collection(db, COL), data);
}

export async function toggleTarefa(id: string, feito: boolean): Promise<void> {
  await updateDoc(doc(db, COL, id), { feito });
}

export async function deleteTarefa(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}
