/* ============================================================
    1️⃣ KONSTANTA & VARIABEL GLOBAL
============================================================ */
const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOK_APPS";

/* ============================================================
    2️⃣ FUNGSI UTILITAS DASAR
============================================================ */
function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
  return { id, title, author, year, isCompleted };
}

function isStorageExist() {
  if (typeof Storage === "undefined") {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

/* ============================================================
    3️⃣ FUNGSI PENYIMPANAN (LOCAL STORAGE)
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
    books.push(book);
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener(SAVED_EVENT, () => {
  console.log("Data tersimpan:", localStorage.getItem(STORAGE_KEY));
});

/* ============================================================
    4️⃣ FUNGSI DOM: MEMBUAT & MERENDER ELEMEN
============================================================ */
function makeBook(bookObject) {
  const { id, title, author, year, isCompleted } = bookObject;

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
  toggleButton.textContent = isCompleted ? "Belum selesai" : "Selesai dibaca";
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
    5️⃣ FUNGSI AKSI BUKU
============================================================ */
function addBook() {
  const title = document.getElementById("bookFormTitle").value;
  const author = document.getElementById("bookFormAuthor").value;
  const year = document.getElementById("bookFormYear").value;
  const isCompleted = document.getElementById("bookFormIsComplete").checked;

  const generatedID = generateId();
  const bookObject = generateBookObject(
    generatedID,
    title,
    author,
    year,
    isCompleted
  );

  books.push(bookObject);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  resetForm();
}

function toggleBookCompletion(bookId) {
  const targetBook = books.find((book) => book.id === bookId);
  if (!targetBook) return;

  targetBook.isCompleted = !targetBook.isCompleted;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function deleteBook(bookId) {
  const bookIndex = books.findIndex((book) => book.id === bookId);
  if (bookIndex === -1) return;

  books.splice(bookIndex, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function editBook(bookId) {
  const targetBook = books.find((book) => book.id === bookId);
  if (!targetBook) return;

  document.getElementById("bookFormTitle").value = targetBook.title;
  document.getElementById("bookFormAuthor").value = targetBook.author;
  document.getElementById("bookFormYear").value = targetBook.year;
  document.getElementById("bookFormIsComplete").checked =
    targetBook.isCompleted;

  deleteBook(bookId);
}

function resetForm() {
  document.getElementById("bookForm").reset();
}

/* ============================================================
    6️⃣ FUNGSI PENCARIAN BUKU
============================================================ */
// function searchBooks(keyword) {
//   const normalizedKeyword = keyword.toLowerCase();

//   const incompleteBookList = document.getElementById("incompleteBookList");
//   const completeBookList = document.getElementById("completeBookList");

//   incompleteBookList.innerHTML = "";
//   completeBookList.innerHTML = "";

//   const filteredBooks = books.filter((book) =>
//     book.title.toLowerCase().includes(normalizedKeyword)
//   );

//   for (const bookItem of filteredBooks) {
//     const bookElement = makeBook(bookItem);
//     if (!bookItem.isCompleted) {
//       incompleteBookList.append(bookElement);
//     } else {
//       completeBookList.append(bookElement);
//     }
//   }
// }

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
    if (bookItem.isCompleted) {
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

  // Reset status tab
  [incompleteTab, completeTab].forEach((t) => t.classList.remove("active"));
  [incompletePanel, completePanel].forEach((p) => p.classList.remove("active"));

  if (hasIncomplete && !hasComplete) {
    // Hanya hasil belum selesai
    incompleteTab.classList.add("active");
    incompletePanel.classList.add("active");
  } else if (!hasIncomplete && hasComplete) {
    // Hanya hasil selesai dibaca
    completeTab.classList.add("active");
    completePanel.classList.add("active");
  } else {
    // Tidak ada hasil
    incompleteBookList.innerHTML =
      "<p style='color:var(--muted);text-align:center;'>📭 Buku tidak ditemukan.</p>";
    incompleteTab.classList.add("active");
    incompletePanel.classList.add("active");

    setTimeout(() => {
      document.dispatchEvent(new Event(RENDER_EVENT));
      incompletePanel.classList.add("active");
      incompleteTab.classList.add("active");
    }, 1500);
  }
}

/* ============================================================
    7️⃣ EVENT RENDER
============================================================ */
document.addEventListener(RENDER_EVENT, () => {
  const incompleteBookList = document.getElementById("incompleteBookList");
  const completeBookList = document.getElementById("completeBookList");

  incompleteBookList.innerHTML = "";
  completeBookList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isCompleted) incompleteBookList.append(bookElement);
    else completeBookList.append(bookElement);
  }
});

/* ============================================================
    8️⃣ TAB SWITCHING
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
    9️⃣ DOM READY
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
