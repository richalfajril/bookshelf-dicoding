/* ============================================================
    1. KONSTANTA & VARIABEL GLOBAL
============================================================ */
const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOK_APPS";

/* ============================================================
    2. FUNGSI UTILITAS DASAR
============================================================ */
function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return { id, title, author, year, isComplete };
}

function isStorageExist() {
  if (typeof Storage === "undefined") {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

/* ============================================================
    3. FUNGSI PENYIMPANAN (LOCAL STORAGE)
============================================================ */
function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  if (serializedData === null) return;

  const data = JSON.parse(serializedData);
  for (const book of data) {
    // ✅ Perbaikan kompatibilitas
    books.push({
      id: book.id,
      title: book.title,
      author: book.author,
      year: Number(book.year),
      isComplete: book.isComplete ?? book.isCompleted ?? false,
    });
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener(SAVED_EVENT, () => {
  console.log("Data tersimpan:", localStorage.getItem(STORAGE_KEY));
});

/* ============================================================
    4. FUNGSI DOM: MEMBUAT & MERENDER ELEMEN
============================================================ */
function makeBook(bookObject) {
  const { id, title, author, year, isComplete } = bookObject;

  const bookCard = document.createElement("div");
  bookCard.classList.add("book-card");
  bookCard.dataset.bookid = id;
  bookCard.dataset.testid = "bookItem";

  const bookTitle = document.createElement("h3");
  bookTitle.dataset.testid = "bookItemTitle";
  bookTitle.textContent = title;

  const bookAuthor = document.createElement("p");
  bookAuthor.dataset.testid = "bookItemAuthor";
  bookAuthor.textContent = `Penulis: ${author}`;

  const bookYear = document.createElement("p");
  bookYear.dataset.testid = "bookItemYear";
  bookYear.textContent = `Tahun: ${year}`;

  const actionDiv = document.createElement("div");

  const toggleButton = document.createElement("button");
  toggleButton.dataset.testid = "bookItemIsCompleteButton";
  toggleButton.textContent = isComplete ? "Belum selesai" : "Selesai dibaca";
  toggleButton.addEventListener("click", () => toggleBookCompletion(id));

  const deleteButton = document.createElement("button");
  deleteButton.dataset.testid = "bookItemDeleteButton";
  deleteButton.textContent = "Hapus";
  deleteButton.addEventListener("click", () => deleteBook(id));

  const editButton = document.createElement("button");
  editButton.dataset.testid = "bookItemEditButton";
  editButton.textContent = "Edit";
  editButton.addEventListener("click", () => editBook(id));

  actionDiv.append(toggleButton, deleteButton, editButton);
  bookCard.append(bookTitle, bookAuthor, bookYear, actionDiv);

  return bookCard;
}

/* ============================================================
    5. FUNGSI AKSI BUKU
============================================================ */
let editingBookId = null;

function addBook() {
  const title = document.getElementById("bookFormTitle").value.trim();
  const author = document.getElementById("bookFormAuthor").value.trim();
  const year = parseInt(document.getElementById("bookFormYear").value);
  const isComplete = document.getElementById("bookFormIsComplete").checked;

  if (!title || !author || isNaN(year)) {
    showToast("⚠️ Mohon isi semua kolom dengan benar!", "error");
    return;
  }

  // Jika sedang dalam mode edit
  if (editingBookId) {
    const book = books.find((b) => b.id === editingBookId);
    if (book) {
      book.title = title;
      book.author = author;
      book.year = year;
      book.isComplete = isComplete;
      showToast(`✏️ Buku "${title}" berhasil diperbarui!`, "success");
    }
    editingBookId = null;
  } else {
    // Tambah baru
    const generatedID = generateId();
    const bookObject = generateBookObject(
      generatedID,
      title,
      author,
      year,
      isComplete
    );
    books.push(bookObject);
    showToast(`📚 Buku "${title}" berhasil ditambahkan!`, "success");
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  resetForm();
}

function toggleBookCompletion(bookId) {
  const targetBook = books.find((book) => book.id === bookId);
  if (!targetBook) return;

  targetBook.isComplete = !targetBook.isComplete;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();

  showToast(
    targetBook.isComplete
      ? `✅ Buku "${targetBook.title}" selesai dibaca.`
      : `🔁 Buku "${targetBook.title}" dipindahkan ke belum selesai.`,
    "info"
  );
}

function deleteBook(bookId) {
  const bookIndex = books.findIndex((book) => book.id === bookId);
  if (bookIndex === -1) return;

  const deletedBook = books[bookIndex];
  books.splice(bookIndex, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();

  showToast(`🗑️ Buku "${deletedBook.title}" berhasil dihapus.`, "error");
}

function editBook(bookId) {
  const targetBook = books.find((book) => book.id === bookId);
  if (!targetBook) return;

  // Isi form dengan data buku
  document.getElementById("bookFormTitle").value = targetBook.title;
  document.getElementById("bookFormAuthor").value = targetBook.author;
  document.getElementById("bookFormYear").value = targetBook.year;
  document.getElementById("bookFormIsComplete").checked = targetBook.isComplete;

  editingBookId = bookId;

  showToast(`✏️ Mode edit: "${targetBook.title}"`, "warning");
}

function resetForm() {
  document.getElementById("bookForm").reset();
  editingBookId = null;
}

/* ============================================================
    6. FUNGSI PENCARIAN BUKU
============================================================ */
function searchBooks(keyword) {
  const normalizedKeyword = keyword.toLowerCase();

  const incompleteBookList = document.getElementById("incompleteBookList");
  const completeBookList = document.getElementById("completeBookList");

  // Kosongkan isi daftar dulu
  incompleteBookList.innerHTML = "";
  completeBookList.innerHTML = "";

  // Filter buku berdasarkan judul
  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(normalizedKeyword)
  );

  let hasIncomplete = false;
  let hasComplete = false;

  // Render hasil sesuai kategori
  for (const bookItem of filteredBooks) {
    const bookElement = makeBook(bookItem);
    if (bookItem.isComplete) {
      completeBookList.append(bookElement);
      hasComplete = true;
    } else {
      incompleteBookList.append(bookElement);
      hasIncomplete = true;
    }
  }

  // 🔁 Ubah tab aktif sesuai hasil pencarian
  const incompleteTab = document.querySelector(
    '.tab[data-target="incompleteSection"]'
  );
  const completeTab = document.querySelector(
    '.tab[data-target="completeSection"]'
  );
  const incompletePanel = document.getElementById("incompleteSection");
  const completePanel = document.getElementById("completeSection");

  [incompleteTab, completeTab].forEach((t) => t.classList.remove("active"));
  [incompletePanel, completePanel].forEach((p) => p.classList.remove("active"));

  if (filteredBooks.length > 0) {
    showToast(`🔎 Ditemukan ${filteredBooks.length} buku cocok.`, "success");
  }

  if (hasIncomplete && !hasComplete) {
    incompleteTab.classList.add("active");
    incompletePanel.classList.add("active");
  } else if (!hasIncomplete && hasComplete) {
    completeTab.classList.add("active");
    completePanel.classList.add("active");
  } else if (hasIncomplete && hasComplete) {
    incompleteTab.classList.add("active");
    incompletePanel.classList.add("active");
  } else {
    incompleteBookList.innerHTML =
      "<p style='color:var(--muted);text-align:center;'>📭 Buku tidak ditemukan.</p>";
    incompleteTab.classList.add("active");
    incompletePanel.classList.add("active");

    showToast(
      "📭 Buku tidak ditemukan. Mengembalikan tampilan semula...",
      "error"
    );

    setTimeout(() => {
      document.dispatchEvent(new Event(RENDER_EVENT));
      incompletePanel.classList.add("active");
      incompleteTab.classList.add("active");
    }, 1500);
  }
}

/* ============================================================
    7. FUNGSI TOAST NOTIFICATION
============================================================ */
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;

  toast.style.opacity = "0";
  toast.style.transform = "translateY(10px)";

  container.appendChild(toast);

  const toasts = container.querySelectorAll(".toast");
  if (toasts.length > 3) toasts[0].remove();

  // Animasi tampil
  setTimeout(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    } else {
      toast.style.transition = "all 0.3s cubic-bezier(.2,.9,.2,1)";
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    }
  }, 20);

  // Hapus otomatis
  setTimeout(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      toast.remove();
    } else {
      toast.style.transition = "all 0.3s ease";
      toast.style.opacity = "0";
      toast.style.transform = "translateY(20px)";
      setTimeout(() => toast.remove(), 300);
    }
  }, 3000);
}

/* ============================================================
    8. EVENT RENDER
============================================================ */
document.addEventListener(RENDER_EVENT, () => {
  const incompleteBookList = document.getElementById("incompleteBookList");
  const completeBookList = document.getElementById("completeBookList");

  incompleteBookList.innerHTML = "";
  completeBookList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isComplete) incompleteBookList.append(bookElement);
    else completeBookList.append(bookElement);
  }
});

/* ============================================================
    9. TAB SWITCHING
============================================================ */
function initTabs(tabSelector = ".tab", panelSelector = ".tab-panel") {
  const tabs = document.querySelectorAll(tabSelector);
  const panels = document.querySelectorAll(panelSelector);

  if (!tabs.length || !panels.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      panels.forEach((p) => p.classList.remove("active"));

      tab.classList.add("active");
      const targetId = tab.getAttribute("data-target");
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) targetPanel.classList.add("active");
    });
  });
}

/* ============================================================
    10. DOM READY
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  const submitForm = document.getElementById("bookForm");
  const searchForm = document.getElementById("searchBook");
  const searchInput = document.getElementById("searchBookTitle");

  submitForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addBook();
  });

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const keyword = searchInput.value.trim();
    if (keyword === "") {
      document.dispatchEvent(new Event(RENDER_EVENT));
    } else {
      searchBooks(keyword);
    }
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }

  initTabs();
});
