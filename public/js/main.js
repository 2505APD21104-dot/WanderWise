// public/js/main.js

document.addEventListener('DOMContentLoaded', () => {
  // --- AUTHENTICATION CHECK ---
  const token = localStorage.getItem('wanderwise_token');
  const currentPath = window.location.pathname.split('/').pop();

  // If not logged in and not on the auth page, redirect to auth page
  if (!token && currentPath !== 'auth.html' && currentPath !== '') {
    window.location.href = 'auth.html';
    return;
  }

  // --- THEME TOGGLE ---
  const themeToggleBtn = document.getElementById('theme-toggle');
  const currentTheme = localStorage.getItem('theme') || 'light';
  
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      let theme = document.documentElement.getAttribute('data-theme');
      let newTheme = theme === 'light' ? 'dark' : 'light';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcon(newTheme);
    });
  }

  function updateThemeIcon(theme) {
    if (themeToggleBtn) {
      themeToggleBtn.innerHTML = theme === 'light' ? '🌙' : '☀️';
    }
  }

  // --- MOBILE MENU ---
  const menuBtn = document.getElementById('menu-btn');
  const navLinks = document.getElementById('nav-links');

  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }

  // --- ACTIVE NAV LINK ---
  const links = document.querySelectorAll('.nav-links a');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // --- ADD LOGOUT BUTTON TO NAVBAR ---
  if (token && navLinks) {
    const user = localStorage.getItem('wanderwise_user') || 'User';
    const logoutBtn = document.createElement('a');
    logoutBtn.href = '#';
    logoutBtn.style.cssText = 'color: #ef4444; font-weight: bold; margin-left: 10px; cursor: pointer;';
    logoutBtn.innerHTML = `Logout (${user})`;
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('wanderwise_token');
      localStorage.removeItem('wanderwise_user');
      window.location.href = 'auth.html';
    });
    
    navLinks.appendChild(logoutBtn);
  }
});