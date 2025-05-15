console.log('Початок ініціалізації Firebase');
if (typeof firebase === 'undefined') {
  console.error('Firebase SDK не завантажено');
  document.getElementById('content').innerHTML += '<p class="error-message">Не вдалося завантажити Firebase. Перевірте підключення до Інтернету.</p>';
} else {
  console.log('Firebase SDK завантажено');
}

const firebaseConfig = {
  apiKey: "AIzaSyBa7fBEThNMnOfmri5M9PG4qZ-fD5deRxw",
  authDomain: "my-government-site.firebaseapp.com",
  projectId: "my-government-site",
  storageBucket: "my-government-site.firebasestorage.app",
  messagingSenderId: "1020514447673",
  appId: "1:1020514447673:web:45501a56e45db6dd9038e8"
};

let db;
try {
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
  console.log('Firestore ініціалізовано');
} catch (error) {
  console.error('Помилка ініціалізації Firebase:', error);
  document.getElementById('content').innerHTML += '<p class="error-message">Не вдалося підключитися до бази даних: ' + error.message + '</p>';
}

const data = {
  countries: [
    {
      name: "Україна",
      id: "ukraine",
      ministries: [
        {
          name: "Міністерство внутрішніх справ",
          id: "mvs",
          description: "Відповідає за безпеку та правопорядок.",
          departments: [
            { name: "Департамент юридичного забезпечення", id: "mvs-legal" },
            { name: "Департамент інформатизації", id: "mvs-it" }
          ],
          enterprises: [
            { name: "ДП 'Укрспецзахист'", id: "ukrspeczahist" }
          ],
          officials: [
            { name: "Інна", position: "Державний секретар", id: "inna" },
            { name: "Богдан", position: "Заступник міністра", id: "bogdan" }
          ]
        },
        {
          name: "Міністерство закордонних справ",
          id: "mzs",
          description: "Займається зовнішньою політикою.",
          departments: [
            { name: "Управління закордонного українства", id: "mzs-ukrainians" },
            { name: "Управління цифровізації архіву", id: "mzs-digital" }
          ],
          enterprises: [],
          officials: [
            { name: "Олександр", position: "Державний секретар", id: "oleksandr" },
            { name: "Сергій", position: "Перший заступник", id: "serhiy" }
          ]
        }
      ]
    }
  ]
};

function showHome() {
  const content = document.getElementById('content');
  content.innerHTML = `
    <h1>Країни</h1>
    <ul class="list-group">
      ${data.countries.map(country => `
        <li class="list-group-item">
          <a href="#" onclick="showCountry('${country.id}')">${country.name}</a>
        </li>
      `).join('')}
    </ul>
    <p class="legal-notice">Відгуки є думками користувачів і не відображають позицію сайту.</p>
  `;
}

function showCountry(countryId) {
  const country = data.countries.find(c => c.id === countryId);
  const content = document.getElementById('content');
  content.innerHTML = `
    <h1>${country.name}</h1>
    <h2>Міністерства</h2>
    <div class="row">
      ${country.ministries.map(ministry => `
        <div class="col-md-6">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">
                <a href="#" onclick="showMinistry('${country.id}', '${ministry.id}')">${ministry.name}</a>
              </h5>
              <p class="card-text">${ministry.description}</p>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function showMinistry(countryId, ministryId) {
  const country = data.countries.find(c => c.id === countryId);
  const ministry = country.ministries.find(m => m.id === ministryId);
  const content = document.getElementById('content');
  content.innerHTML = `
    <h1>${ministry.name}</h1>
    <p>${ministry.description}</p>
    <h3>Підрозділи</h3>
    <ul class="list-group">
      ${ministry.departments.map(dep => `
        <li class="list-group-item">${dep.name}</li>
      `).join('')}
    </ul>
    <h3>Державні підприємства</h3>
    <ul class="list-group">
      ${ministry.enterprises.length > 0 ? ministry.enterprises.map(ent => `
        <li class="list-group-item">${ent.name}</li>
      `).join('') : '<li class="list-group-item">Немає</li>'}
    </ul>
    <h3>Чиновники</h3>
    <div class="row">
      ${ministry.officials.map(official => `
        <div class="col-md-6">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">
                <a href="#" onclick="showOfficial('${country.id}', '${ministry.id}', '${official.id}')">${official.name}</a>
              </h5>
              <p class="card-text">${official.position}</p>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function showOfficial(countryId, ministryId, officialId) {
  const country = data.countries.find(c => c.id === countryId);
  const ministry = country.ministries.find(m => m.id === ministryId);
  const official = ministry.officials.find(o => o.id === officialId);
  const content = document.getElementById('content');
  content.innerHTML = `
    <h1>${official.name}</h1>
    <p><strong>Посада:</strong> ${official.position}</p>
    <p><strong>Міністерство:</strong> ${ministry.name}</p>
    <h3>Відгуки</h3>
    <div class="comment-form">
      <input id="comment-author" class="form-control mb-2" placeholder="Ваше ім'я (необов’язково)">
      <textarea id="comment-text" class="form-control" rows="4" placeholder="Залиште ваш відгук"></textarea>
      <button onclick="addComment('${official.id}')" class="btn btn-primary mt-2">Надіслати</button>
    </div>
    <div id="comment-list" class="comment-list"></div>
  `;
  loadComments(officialId);
}

async function addComment(officialId) {
  console.log('Спроба додати коментар для officialId:', officialId);
  const author = document.getElementById('comment-author').value.trim() || 'Анонім';
  const text = document.getElementById('comment-text').value.trim();
  if (!text) {
    alert('Будь ласка, введіть відгук');
    console.log('Текст коментаря порожній');
    return;
  }
  if (!db) {
    console.error('Firestore не ініціалізовано');
    alert('Помилка підключення до бази даних');
    return;
  }
  try {
    const docRef = await db.collection('comments').add({
      officialId: officialId,
      author: author,
      text: text,
      date: new Date().toISOString()
    });
    console.log('Коментар додано з ID:', docRef.id);
    document.getElementById('comment-author').value = '';
    document.getElementById('comment-text').value = '';
    loadComments(officialId);
  } catch (error) {
    console.error('Помилка при додаванні коментаря:', error);
    alert('Не вдалося додати коментар: ' + error.message);
  }
}

async function loadComments(officialId) {
  console.log('Завантаження коментарів для officialId:', officialId);
  const commentList = document.getElementById('comment-list');
  if (!db) {
    console.error('Firestore не ініціалізовано');
    commentList.innerHTML = '<p>Помилка підключення до бази даних</p>';
    return;
  }
  try {
    const snapshot = await db.collection('comments')
      .where('officialId', '==', officialId)
      .orderBy('date', 'desc')
      .get();
    const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('Завантажено коментарів:', comments.length);
    commentList.innerHTML = comments.length > 0 ? comments.map(comment => `
      <div class="comment">
        <p><strong>${comment.author}</strong>: ${comment.text}</p>
        <small>${new Date(comment.date).toLocaleString('uk-UA')}</small>
      </div>
    `).join('') : '<p>Ще немає відгуків</p>';
  } catch (error) {
    console.error('Помилка при завантаженні коментарів:', error);
    commentList.innerHTML = '<p>Помилка при завантаженні відгуків: ' + error.message + '</p>';
  }
}

showHome();