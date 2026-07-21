import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";

const invoiceCollection = collection(db, "invoices");
const invoiceItemCollection = collection(db, "invoiceItems");

// =====================
// Invoice Service
// =====================

export const invoiceService = {
  async createInvoice(data) {
    const docRef = await addDoc(invoiceCollection, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  },

  async getInvoice(id) {
    const snapshot = await getDoc(doc(invoiceCollection, id));

    if (!snapshot.exists()) return null;

    return {
      id: snapshot.id,
      ...snapshot.data(),
    };
  },

  async getInvoices() {
    const snapshot = await getDocs(invoiceCollection);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  },

  async getInvoiceWithItems(invoiceId) {
    const [invoice, items] = await Promise.all([
      this.getInvoice(invoiceId),
      invoiceItemService.getItems(invoiceId),
    ]);

    if (!invoice) return null;

    return {
      ...invoice,
      items,
    };
  },

  async updateInvoice(id, data) {
    await updateDoc(doc(invoiceCollection, id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteInvoice(id) {
    await deleteDoc(doc(invoiceCollection, id));
  },

  async deleteInvoiceWithItems(invoiceId) {
    const items = await invoiceItemService.getItems(invoiceId);

    await Promise.all(
      items.map((item) => invoiceItemService.deleteItem(item.id)),
    );

    await this.deleteInvoice(invoiceId);
  },

  async getLatestInvoiceNumber() {
    const q = query(
      invoiceCollection,
      orderBy("invoiceNumber", "desc"),
      limit(1),
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return 1000;
    }

    const latestInvoice = snapshot.docs[0].data();

    return Number(latestInvoice.invoiceNumber);
  },

  async getAllInvoiceNumbers() {
    const snapshot = await getDocs(invoiceCollection);

    return snapshot.docs.map((doc) => doc.data().invoiceNumber);
  },
};

// =====================
// Invoice Item Service
// =====================

export const invoiceItemService = {
  async createItem(data) {
    const docRef = await addDoc(invoiceItemCollection, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  },

  async createItems(invoiceId, items) {
    return Promise.all(
      items.map((item) =>
        this.createItem({
          ...item,
          invoiceId,
        }),
      ),
    );
  },

  async getItem(id) {
    const snapshot = await getDoc(doc(invoiceItemCollection, id));

    if (!snapshot.exists()) return null;

    return {
      id: snapshot.id,
      ...snapshot.data(),
    };
  },

  async getItems(invoiceId) {
    const q = query(invoiceItemCollection, where("invoiceId", "==", invoiceId));

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  },

  async updateItem(id, data) {
    await updateDoc(doc(invoiceItemCollection, id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteItem(id) {
    await deleteDoc(doc(invoiceItemCollection, id));
  },
};
