    // Control del menú
    const menuToggle = document.querySelector('.menu-toggle');
    const hackerMenu = document.getElementById('hackerMenu');

    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        hackerMenu.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!hackerMenu.contains(e.target) && !menuToggle.contains(e.target)) {
            hackerMenu.classList.remove('active');
        }
    });

    // Efecto Matrix
    const canvas = document.getElementById('matrix-canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
    const drops = Array(Math.floor(canvas.width / 20)).fill(1);

    function drawMatrix() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#0F0';
        ctx.font = '15px monospace';

        drops.forEach((drop, i) => {
            const char = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(char, i * 20, drop * 20);
            
            if (drop * 20 > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        });
    }

    setInterval(drawMatrix, 50);

    // Efecto de glitch aleatorio
    setInterval(() => {
        if (Math.random() < 0.1) {
            menuToggle.style.textShadow = `
                ${Math.random() * 5}px ${Math.random() * 5}px ${Math.random() * 5}px #0f0,
                ${Math.random() * -5}px ${Math.random() * -5}px ${Math.random() * 5}px #0f0
            `;
            
            setTimeout(() => {
                menuToggle.style.textShadow = 'none';
            }, 50);
        }
    }, 100);

    // Secuencia de animaciones
    setTimeout(() => {
        // Oculta el trazado SVG
        document.querySelector('svg').style.display = 'none';
        
        // Muestra el logo
        const logo = document.getElementById('logo');
        logo.style.display = 'block';

        // Después de 2 segundos, oculta el logo y muestra contenido
        setTimeout(() => {
            logo.style.animation = 'logoReveal 1s reverse forwards';
            
            setTimeout(() => {
                document.getElementById('hiddenContent').style.display = 'block';
            }, 1000);
            
        }, 2000);
        
    }, 3000); // Tiempo total de la animación de trazado

    // Optimizar Matrix para móviles
function initMatrix() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Reducir densidad en móviles
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const dropCount = isMobile ? Math.floor(canvas.width / 30) : Math.floor(canvas.width / 20);
    drops.length = dropCount;
    drops.fill(1);
  }
  
  // Redimensionar al girar dispositivo
  window.addEventListener('resize', initMatrix);
  initMatrix();
  
  // Mejorar interacción táctil
  document.addEventListener('touchstart', (e) => {
    if (!hackerMenu.contains(e.target) && !menuToggle.contains(e.target)) {
      hackerMenu.classList.remove('active');
    }
  });
  
  // Ajustar animación inicial
  document.addEventListener('DOMContentLoaded', () => {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const initialDelay = isMobile ? 2000 : 3000;
    
    setTimeout(() => {
      document.querySelector('svg').style.display = 'none';
      const logo = document.getElementById('logo');
      logo.style.display = 'block';
  
      setTimeout(() => {
        logo.style.animation = 'logoReveal 1s reverse forwards';
        setTimeout(() => {
          document.getElementById('hiddenContent').style.display = 'block';
        }, 1000);
      }, isMobile ? 1500 : 2000);
    }, initialDelay);
  });