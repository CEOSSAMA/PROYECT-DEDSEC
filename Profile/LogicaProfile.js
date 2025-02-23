document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("cyberToken");
    if (!token) {
      alert("Token no encontrado. Inicia sesión, humano.");
      window.location.href = "/login";
      return;
    }
  
    // Actualiza la función loadProfile
    async function loadProfile() {
      try {
          const response = await fetch("/api/profile", {
              headers: {"Authorization": `Bearer ${token}`}
          });
  
          const profile = await response.json();
  
          // Avatar con efecto de fallback
          const avatarImage = document.getElementById("avatarImage");
          avatarImage.src = profile.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMDAwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiMwZjAiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPlVTRVI8L3RleHQ+PC9zdmc+';
          avatarImage.onerror = function() {
              this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMDAwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiMwZjAiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPlVTRVI8L3RleHQ+PC9zdmc+';
          };
  
          // Banner con efecto de fallback
          const banner = document.getElementById("profileBanner");
          banner.style.background = `
              linear-gradient(45deg, rgba(0,30,0,0.9), rgba(0,0,0,0.8)),
              url(${profile.banner || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSIzMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzAwMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjQwIiBmaWxsPSIjMGYwIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5DWVBFUiBQUk9GSUxFPC90ZXh0Pjwvc3ZnPg=='})
          `;
  
          // Nueva sección de información de usuario
          const userInfo = `
              <div class="user-info-core">
                  <div class="terminal">USER: ${profile.username || 'unknown'}</div>
                  <div class="terminal">ACCESS LEVEL: ${profile.accessLevel || '0'}</div>
                  <div class="terminal">LAST CONNECTION: ${profile.lastLogin || 'N/A'}</div>
                  <div class="terminal">TOTAL HACKS: ${profile.totalHacks || '0'}</div>
              </div>
          `;
          document.querySelector('.main-data').insertAdjacentHTML('afterbegin', userInfo);
  
      } catch (error) {
          console.error("Error:", error);
          document.getElementById("userNickname").textContent = "ERROR LOADING PROFILE";
      }
    }
  
    loadProfile();
  
    const updateForm = document.getElementById("profileUpdateForm");
    if (updateForm) {
      updateForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const formData = new FormData(updateForm);
  
        try {
          const response = await fetch("/api/profile/update", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`
            },
            body: formData
          });
  
          const result = await response.json();
          if (result.success) {
            alert("Perfil actualizado exitosamente. ¡Ahora brillas más que yo!");
            loadProfile();
          } else {
            alert("Error al actualizar el perfil: " + result.error);
          }
        } catch (error) {
          console.error("Error actualizando el perfil:", error);
          alert("Error al actualizar el perfil. Inténtalo de nuevo, si es que puedes con ello.");
        }
      });
    }
  });
  
  // Agrega efecto de glitch al cargar
  window.addEventListener('load', () => {
      document.body.style.animation = 'terminalBoot 1s steps(20)';
  });