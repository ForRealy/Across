"use strict";
const sidebar = document.querySelector('.library-sidebar');
const toggleBtn = document.getElementById('toggleSidebar');
let lastScrollY = window.scrollY;
let sidebarVisible = true;
if (sidebar && toggleBtn) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > lastScrollY && sidebarVisible) {
            sidebar.classList.add('hidden');
            toggleBtn.style.display = 'block';
            toggleBtn.textContent = '➤';
            toggleBtn.style.left = '8px';
            sidebarVisible = false;
        }
        lastScrollY = window.scrollY;
    });
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('hidden');
        sidebarVisible = !sidebarVisible;
        toggleBtn.textContent = sidebarVisible ? '⮜' : '➤';
        toggleBtn.style.left = sidebarVisible ? '210px' : '8px';
    });
}
