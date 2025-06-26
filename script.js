document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const openCameraBtn = document.getElementById('openCamera');
    const uploadPhotoBtn = document.getElementById('uploadPhoto');
    const cameraView = document.getElementById('cameraView');
    const video = document.getElementById('video');
    const takePhotoBtn = document.getElementById('takePhoto');
    const fileInput = document.getElementById('fileInput');
    const photoGallery = document.getElementById('photoGallery');
    
    // Variáveis de estado
    let stream = null;
    let photos = JSON.parse(localStorage.getItem('weddingPhotos')) || [];
    
    // Inicialização
    renderGallery();
    
    // Event Listeners
    openCameraBtn.addEventListener('click', startCamera);
    uploadPhotoBtn.addEventListener('click', () => fileInput.click());
    takePhotoBtn.addEventListener('click', capturePhoto);
    fileInput.addEventListener('change', handleFileUpload);
    
    // Funções
    async function startCamera() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            });
            
            video.srcObject = stream;
            cameraView.style.display = 'block';
            openCameraBtn.disabled = true;
            uploadPhotoBtn.disabled = true;
            
            // Fechar câmera ao clicar fora (opcional)
            document.addEventListener('click', outsideClickHandler);
        } catch (err) {
            console.error('Erro ao acessar câmera:', err);
            alert('Não foi possível acessar a câmera. Por favor, verifique as permissões.');
        }
    }
    
    function outsideClickHandler(e) {
        if (!cameraView.contains(e.target) && e.target !== openCameraBtn) {
            stopCamera();
        }
    }
    
    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        
        cameraView.style.display = 'none';
        openCameraBtn.disabled = false;
        uploadPhotoBtn.disabled = false;
        document.removeEventListener('click', outsideClickHandler);
    }
    
    function capturePhoto() {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        
        // Desenhar a foto
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Adicionar marca d'água
        ctx.font = 'bold 24px "Playfair Display", serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.textAlign = 'center';
        ctx.fillText('D&V • 15/12/2023', canvas.width / 2, canvas.height - 30);
        
        // Converter para data URL
        const photoData = canvas.toDataURL('image/jpeg', 0.85);
        
        // Adicionar à galeria
        photos.push(photoData);
        savePhotos();
        renderGallery();
        
        // Feedback e limpeza
        alert('Foto capturada com sucesso! Obrigado por compartilhar.');
        stopCamera();
    }
    
    function handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Verificar tamanho (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Por favor, selecione uma imagem menor que 5MB.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(event) {
            photos.push(event.target.result);
            savePhotos();
            renderGallery();
            alert('Foto adicionada à galeria!');
        };
        reader.readAsDataURL(file);
        
        // Resetar input para permitir a mesma imagem novamente
        fileInput.value = '';
    }
    
    function renderGallery() {
        photoGallery.innerHTML = '';
        
        if (photos.length === 0) {
            photoGallery.innerHTML = '<div class="empty-gallery">A galeria está vazia. Seja o primeiro a compartilhar uma foto!</div>';
            return;
        }
        
        // Limitar a 30 fotos para performance
        if (photos.length > 30) {
            photos = photos.slice(photos.length - 30);
            savePhotos();
        }
        
        photos.forEach((photo, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            
            const img = document.createElement('img');
            img.src = photo;
            img.alt = `Foto ${index + 1} do casamento`;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '×';
            deleteBtn.onclick = () => deletePhoto(index);
            
            galleryItem.appendChild(img);
            galleryItem.appendChild(deleteBtn);
            photoGallery.appendChild(galleryItem);
        });
    }
    
    function deletePhoto(index) {
        if (confirm('Remover esta foto da galeria?')) {
            photos.splice(index, 1);
            savePhotos();
            renderGallery();
        }
    }
    
    function savePhotos() {
        localStorage.setItem('weddingPhotos', JSON.stringify(photos));
    }
});
