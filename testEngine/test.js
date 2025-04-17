// DOM Elements
const counterDisplay = document.getElementById('counter');
const incrementBtn = document.getElementById('increment');
const decrementBtn = document.getElementById('decrement');
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const accordionHeaders = document.querySelectorAll('.accordion-header');
const modal = document.getElementById('modal');
const openModalBtn = document.getElementById('open-modal');
const closeModalBtn = document.getElementById('close-modal');

// Counter functionality
let count = 0;

function updateCounter() {
    counterDisplay.textContent = count;
}

incrementBtn.addEventListener('click', () => {
    count++;
    updateCounter();
});

decrementBtn.addEventListener('click', () => {
    count--;
    updateCounter();
});

// Todo List functionality
function createTodoItem(text) {
    const li = document.createElement('li');
    li.innerHTML = `
        <span>${text}</span>
        <button class="delete-btn">Delete</button>
    `;
    
    const deleteBtn = li.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => {
        li.remove();
    });
    
    return li;
}

todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const todoText = todoInput.value.trim();
    if (todoText) {
        const todoItem = createTodoItem(todoText);
        todoList.appendChild(todoItem);
        todoInput.value = '';
    }
});

// Accordion functionality
accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
        const content = header.nextElementSibling;
        const isActive = content.classList.contains('active');
        
        // Close all accordion items
        document.querySelectorAll('.accordion-content').forEach(item => {
            item.classList.remove('active');
        });
        
        // Toggle current item
        if (!isActive) {
            content.classList.add('active');
        }
    });
});

// Modal functionality
openModalBtn.addEventListener('click', () => {
    modal.style.display = 'block';
});

closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Form validation
const form = document.getElementById('test-form');
const formInputs = form.querySelectorAll('input');

formInputs.forEach(input => {
    input.addEventListener('input', () => {
        if (input.checkValidity()) {
            input.classList.remove('invalid');
        } else {
            input.classList.add('invalid');
        }
    });
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;
    
    formInputs.forEach(input => {
        if (!input.checkValidity()) {
            input.classList.add('invalid');
            isValid = false;
        }
    });
    
    if (isValid) {
        alert('Form submitted successfully!');
        form.reset();
    }
});

// Animation controls
const animationBox = document.querySelector('.animation-box');
const toggleAnimationBtn = document.getElementById('toggle-animation');

toggleAnimationBtn.addEventListener('click', () => {
    if (animationBox.style.animationPlayState === 'paused') {
        animationBox.style.animationPlayState = 'running';
        toggleAnimationBtn.textContent = 'Pause Animation';
    } else {
        animationBox.style.animationPlayState = 'paused';
        toggleAnimationBtn.textContent = 'Play Animation';
    }
});

// Media controls
const video = document.querySelector('video');
const audio = document.querySelector('audio');
const playPauseBtn = document.getElementById('play-pause');
const muteBtn = document.getElementById('mute');

playPauseBtn.addEventListener('click', () => {
    if (video.paused) {
        video.play();
        playPauseBtn.textContent = 'Pause';
    } else {
        video.pause();
        playPauseBtn.textContent = 'Play';
    }
});

muteBtn.addEventListener('click', () => {
    if (video.muted) {
        video.muted = false;
        muteBtn.textContent = 'Mute';
    } else {
        video.muted = true;
        muteBtn.textContent = 'Unmute';
    }
});

// Initialize components
document.addEventListener('DOMContentLoaded', () => {
    updateCounter();
}); 