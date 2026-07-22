export const formatFirestoreDate = (value) => {
  if (!value) return "";

  // Firestore Timestamp
  if (typeof value.toDate === "function") {
    return value.toDate().toLocaleDateString();
  }

  // ISO string or JS Date
  return new Date(value).toLocaleDateString();
};