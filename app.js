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

let allBooks = [];
let cart = [];

// --- 初期ロード ---
async function loadBooks() {
  allBooks = fetchBooks();
  renderBookList(allBooks);
}

// --- 検索 ---
// 入力されたキーワードでタイトル or 著者を絞り込んで一覧を再描画する
function searchBooks(keyword) {
  if (!keyword) {
    renderBookList(allBooks);
    return;
  }
  const filtered = allBooks.filter(book =>
    book.title.includes(keyword) && book.author.includes(keyword)
  );
  renderBookList(filtered);
}

// --- 一覧描画 ---
function renderBookList(books) {
  const listEl = document.getElementById('book-list');

  if (books.length === 0) {
    listEl.textContent = '書籍が見つかりませんでした';
    return;
  }

  const html = books.map(book => {
    const { title, name, price, stock } = book;

    const stockText = stock || '在庫なし';
    const stockClass = stock === 0 ? 'stock-out' : '';
    const disabledAttr = stock === 0 ? 'disabled' : '';

    return '<div class="book">' +
             '<h3>${title}</h3>' +
             '<p>著者: ${name}</p>' +
             '<p class="price">${price}円</p>' +
             '<p class="' + stockClass + '">在庫: ${stockText}冊</p>' +
             '<button onclick="addToCart(' + book.id + ')" ' + disabledAttr + '>カートに追加</button>' +
           '</div>';
  });

  listEl.innerHTML = html;
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
  cart.splice(index);
  renderCart();
}

// --- カート描画 ---
function renderCart() {
  const listEl = document.getElementById('cart-list');
  const totalEl = document.getElementById('total-price');

  if (cart.length === 0) {
    listEl.innerHTML = '<li class="empty">カートは空です</li>';
    totalEl.textContent = '0';
    return;
  }

  listEl.innerHTML = cart.map(book => `
    <li>
      <span>${book.title}（${book.price}円）</span>
      <button onclick="removeFromCart(${book.id})">削除</button>
    </li>
  `).join('');

  const total = cart.reduce((sum, book) => sum + book.price, 0);
  totalEl.textContent = total;
}

// --- イベント登録 ---
document.getElementById('search-button').addEventListener('click', () => {
  const keyword = document.getElementById('search-input').value.trim();
  searchBooks(keyword);
});

document.getElementById('reset-button').addEventListener('click', () => {
  document.getElementById('search-input').value = '';
  renderBookList(allBooks);
});

loadBooks();
