import {
  collection, doc, addDoc, deleteDoc,
  onSnapshot, query, orderBy, Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import { Pagamento } from "./types";

const COL = "pagamentos";

export function subscribePagamentos(cb: (pagamentos: Pagamento[]) => void): Unsubscribe {
  const q = query(collection(db, COL), orderBy("data", "desc"));
  return onSnapshot(q, (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Pagamento)))
  );
}

export async function addPagamento(data: Omit<Pagamento, "id">): Promise<string> {
  const ref = await addDoc(collection(db, COL), data);
  return ref.id;
}

export async function deletePagamento(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}
