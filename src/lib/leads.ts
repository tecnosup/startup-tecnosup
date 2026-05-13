import {
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    doc,
    serverTimestamp,
    query,
    orderBy,
    Timestamp,
    arrayUnion,
} from "firebase/firestore";
import { db } from "./firebase";
import { Lead, LeadStatus, HistoricoItem } from "./types";

const COL = "leads";

export function subscribeLeads(cb: (leads: Lead[]) => void) {
    const q = query(collection(db, COL), orderBy("criadoEm", "desc"));
    return onSnapshot(q, (snap) => {
          cb(
                  snap.docs.map((d) => {
                            const data = d.data();
                            return {
                                        ...data,
                                        id: d.id,
                                        criadoEm:
                                                      data.criadoEm instanceof Timestamp
                                            ? data.criadoEm.toDate().toISOString()
                                                        : data.criadoEm ?? "",
                                        atualizadoEm:
                                                      data.atualizadoEm instanceof Timestamp
                                            ? data.atualizadoEm.toDate().toISOString()
                                                        : data.atualizadoEm ?? "",
                            } as Lead;
                  })
                );
    });
}

export async function addLead(
    lead: Omit<Lead, "id" | "criadoEm" | "atualizadoEm">
  ) {
    await addDoc(collection(db, COL), {
          ...lead,
          criadoEm: serverTimestamp(),
          atualizadoEm: serverTimestamp(),
    });
}

export async function updateLeadStatus(
    id: string,
    status: LeadStatus,
    acao?: string
  ) {
    const hist: HistoricoItem = {
          acao: acao ?? `Status → ${status}`,
          data: new Date().toISOString(),
    };
    await updateDoc(doc(db, COL, id), {
          status,
          historico: arrayUnion(hist),
          atualizadoEm: serverTimestamp(),
    });
}

export async function updateLeadMensagem(id: string, mensagem: string) {
    const hist: HistoricoItem = {
          acao: "Mensagem personalizada gerada",
          data: new Date().toISOString(),
    };
    await updateDoc(doc(db, COL, id), {
          mensagemPronta: mensagem,
          status: "mensagem_pronta" as LeadStatus,
          historico: arrayUnion(hist),
          atualizadoEm: serverTimestamp(),
    });
}

export async function updateLeadNotas(id: string, notas: string) {
    await updateDoc(doc(db, COL, id), {
          notas,
          atualizadoEm: serverTimestamp(),
    });
}
