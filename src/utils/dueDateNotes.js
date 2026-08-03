const DUE_DATE_MARKER = "data-due-date";

export const formatDueDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  });
};

export const syncDueDateNote = (notesHtml = "", dueDate) => {
  const doc = new DOMParser().parseFromString(notesHtml, "text/html");

  doc.querySelectorAll(`li[${DUE_DATE_MARKER}]`).forEach((li) => {
    const parent = li.parentElement;
    li.remove();
    if (parent && (parent.tagName === "UL" || parent.tagName === "OL") && !parent.children.length) {
      parent.remove();
    }
  });

  if (!dueDate) {
    return doc.body.innerHTML;
  }

  const li = doc.createElement("li");
  li.setAttribute(DUE_DATE_MARKER, "true");
  li.textContent = `Payment due by ${formatDueDate(dueDate)}.`;

  const firstUl = doc.querySelector("ul");

  if (firstUl) {
    firstUl.appendChild(li);
  } else {
    const ul = doc.createElement("ul");
    ul.appendChild(li);
    doc.body.appendChild(ul);
  }

  return doc.body.innerHTML;
};
