'use strict';

// ============================================================
// モックAPI（書き換え禁止 / このまま使うこと）
// ------------------------------------------------------------
// fetchBooks() は実際のAPI呼び出しを模したダミー関数です。
//  - 300ms 待ってから書籍データを返します
//  - 30% の確率でエラーを返します（サーバーエラーのシミュレーション）
// ============================================================
function fetchBooks() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.3) {
        reject(new Error('サーバーエラー: 書籍データの取得に失敗しました'));
        return;
      }
      resolve([
        { id: 1, title: 'JavaScript入門',         author: '山田太郎', price: 2500, stock: 5 },
        { id: 2, title: 'HTML/CSSの基礎',         author: '佐藤花子', price: 1800, stock: 0 },
        { id: 3, title: 'モダンJS実践',           author: '鈴木一郎', price: 3200, stock: 10 },
        { id: 4, title: 'Webデザインの教科書',    author: '田中美咲', price: 2800, stock: 3 },
        { id: 5, title: 'React完全ガイド',        author: '高橋健',   price: 4500, stock: 0 },
        { id: 6, title: 'Vue.jsスターターキット', author: '中村悟',   price: 3500, stock: 8 },
      ]);
    }, 300);
  });
}

// ============================================================
// アプリ本体（この下にバグがいくつか潜んでいます）
// ============================================================

// ---- 定数 ----
const OUT_OF_STOCK = 0;          // 在庫切れを表す在庫数
const REMOVE_COUNT = 1;          // カートから一度に削除する件数
const AMOUNT_TOTAL = 0;         // 合計金額の初期値

const CLASS_NAMES = {
  STOCK_OUT: 'stock-out',
  ERROR: 'error',
  EMPTY: 'empty',
};

const DOM_EL = {
  BOOK_LIST: 'book-list',
  CART_LIST: 'cart-list',
  TOTAL_PRICE: 'total-price',
  SEARCH_INPUT: 'search-input',
  SEARCH_BUTTON: 'search-button',
  RESET_BUTTON: 'reset-button',
};

let allBooks = [];
let cart = [];

// --- 初期ロード ---
async function loadBooks() {
  try {
    allBooks = await fetchBooks();
    renderBookList(allBooks);
  } catch (error) {
    console.error(error);
    renderError(error.message);
  }
}

// --- エラー表示 ---
function renderError(message) {
  const listEl = document.getElementById(DOM_EL.BOOK_LIST);
  const errorEl = document.createElement('p');
  errorEl.className = CLASS_NAMES.ERROR;
  errorEl.textContent = message;
  listEl.replaceChildren(errorEl);
}

// --- 検索 ---
function searchBooks(keyword) {
  if (!keyword) {
    renderBookList(allBooks);
    return;
  }
  const lower = keyword.toLowerCase();
  const filtered = allBooks.filter(book =>
    book.title.toLowerCase().includes(lower) ||
    book.author.toLowerCase().includes(lower)
  );
  renderBookList(filtered);
}

// --- 一覧描画 ---
function renderBookList(books) {
  const listEl = document.getElementById(DOM_EL.BOOK_LIST);

  if (books.length === 0) {
    listEl.textContent = '書籍が見つかりませんでした。';
    return;
  }

  const html = books.map(book => {
    const { id, title, author, price, stock } = book;

    const stockText = stock ?? '在庫なし';
    const isOutOfStock = stock === OUT_OF_STOCK;
    const stockClass = isOutOfStock ? CLASS_NAMES.STOCK_OUT : '';
    const disabledAttr = isOutOfStock ? 'disabled' : '';

    return `
      <div class="book">
        <h3>${title}</h3>
        <p>著者: ${author}</p>
        <p class="price">${price}円</p>
        <p class="${stockClass}">在庫: ${stockText}冊</p>
        <button onclick="addToCart(${id})" ${disabledAttr}>カートに追加</button>
      </div>
    `;
  });

  listEl.innerHTML = html.join('');
}

// --- カートに追加 ---
function addToCart(bookId) {
  const book = allBooks.find(b => b.id === bookId);
  if (!book) return;
  cart.push(book);
  renderCart();
}

// --- カートから削除 ---
function removeFromCart(bookId) {
  const index = cart.findIndex(b => b.id === bookId);
  if (index === -1) return;
  cart.splice(index, REMOVE_COUNT);
  renderCart();
}

// --- カート描画 ---
function renderCart() {
  const listEl = document.getElementById(DOM_EL.CART_LIST);
  const totalEl = document.getElementById(DOM_EL.TOTAL_PRICE);

  if (cart.length === 0) {
    listEl.innerHTML = '<li class="empty">カートは空です</li>';
    totalEl.textContent = AMOUNT_TOTAL;
    return;
  }

  listEl.innerHTML = cart.map(book => `
    <li>
      <span>${book.title}（${book.price}円）</span>
      <button onclick="removeFromCart(${book.id})">削除</button>
    </li>
  `).join('');

  const total = cart.reduce((sum, book) => sum + book.price, AMOUNT_TOTAL);
  totalEl.textContent = total;
}

// --- イベント登録 ---
document.getElementById(DOM_EL.SEARCH_BUTTON).addEventListener('click', () => {
  const keyword = document.getElementById(DOM_EL.SEARCH_INPUT).value.trim();
  searchBooks(keyword);
});

document.getElementById(DOM_EL.RESET_BUTTON).addEventListener('click', () => {
  document.getElementById(DOM_EL.SEARCH_INPUT).value = '';
  renderBookList(allBooks);
});

loadBooks();