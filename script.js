document.addEventListener("DOMContentLoaded", function () {
  const MIN = 100;
  const MAX = 999;
  const pinInput = document.getElementById('pin');
  const sha256HashView = document.getElementById('sha256-hash');
  const resultView = document.getElementById('result');
  const checkButton = document.getElementById('check');
  const pageCountView = document.getElementById('page-count');

  if (!pinInput || !sha256HashView || !resultView || !checkButton || !pageCountView) {
      console.error("❌ Missing required elements in HTML.");
      return;
  }

  // Function to store in local storage
  function store(key, value) {
      localStorage.setItem(key, value);
  }

  // Function to retrieve from local storage
  function retrieve(key) {
      return localStorage.getItem(key);
  }

  // Generate a random 3-digit number
  function getRandomArbitrary(min, max) {
      return Math.floor(Math.random() * (max - min) + min);
  }

  // Clear local storage
  function clearStorage() {
      localStorage.clear();
  }

  // Generate SHA256 hash of a string
  async function sha256(message) {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  async function getSHA256Hash() {
      let cached = retrieve('sha256');
      if (cached) return cached;
      cached = await sha256(getRandomArbitrary(MIN, MAX));
      store('sha256', cached);
      return cached;
  }

  async function main() {
      sha256HashView.innerHTML = 'Calculating...';
      const hash = await getSHA256Hash();
      sha256HashView.innerHTML = hash;

      // Update page view count using cookies
      let count = parseInt(getCookie("pageViews") || "0") + 1;
      document.cookie = `pageViews=${count}; path=/`;
      pageCountView.innerHTML = count;
  }

  async function test() {
      const pin = pinInput.value;
      if (pin.length !== 3) {
          resultView.innerHTML = '💡 Not 3 digits';
          resultView.classList.remove('hidden');
          return;
      }

      const hashedPin = await sha256(pin);
      if (hashedPin === sha256HashView.innerHTML) {
          resultView.innerHTML = '🎉 Success';
          resultView.classList.add('success');
      } else {
          resultView.innerHTML = '❌ Failed';
      }
      resultView.classList.remove('hidden');
  }

  // Ensure pinInput only accepts numbers and is 3 digits long
  pinInput.addEventListener('input', (e) => {
      const { value } = e.target;
      pinInput.value = value.replace(/\D/g, '').slice(0, 3);
  });

  // Attach test function to button
  checkButton.addEventListener('click', test);

  // Function to get a cookie value
  function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
  }

  main();
});
