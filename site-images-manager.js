// Site Images Manager - Handles all site images with Supabase

let siteImages = [];
let currentImageEditId = null;

// Page and section definitions
const PAGE_SECTIONS = {
    'index': [
        { section: 'hero-background', description: 'Hero background image' },
        { section: 'how-it-works-icon-1', description: 'How it works step 1 image (optional)' },
        { section: 'how-it-works-icon-2', description: 'How it works step 2 image (optional)' },
        { section: 'how-it-works-icon-3', description: 'How it works step 3 image (optional)' },
        { section: 'beginners-feature-1', description: 'Beginners section feature 1 (optional)' },
        { section: 'beginners-feature-2', description: 'Beginners section feature 2 (optional)' },
        { section: 'beginners-feature-3', description: 'Beginners section feature 3 (optional)' }
    ],
    'landing-page': [
        { section: 'hero-image', description: 'Hero image' },
        { section: 'about-section-image', description: 'About section image (optional)' }
    ],
    'journal': [
        { section: 'featured-post-image', description: 'Featured post placeholder (optional)' },
        { section: 'header-background', description: 'Header background (optional)' }
    ],
    'fiber-producers': [
        { section: 'hero-background', description: 'Hero background image' },
        { section: 'producer-placeholder', description: 'Default producer card image' }
    ],
    'producer-profile': [
        { section: 'default-hero', description: 'Default producer hero banner' },
        { section: 'default-avatar', description: 'Default producer avatar (optional)' },
        { section: 'default-animal-image', description: 'Default animal image (optional)' }
    ]
};

// Load site images from Supabase
async function loadSiteImages() {
    try {
        const { data, error } = await supabase
            .from('site_images')
            .select('*')
            .order('page', { ascending: true });
        
        if (error) throw error;
        siteImages = data || [];
        renderSiteImagesList();
        updateImagesStats();
    } catch (error) {
        console.error('Error loading site images:', error);
        alert('Error loading site images: ' + error.message);
    }
}

// Render site images list in CMS
function renderSiteImagesList() {
    const container = document.getElementById('siteImagesList');
    
    if (siteImages.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No site images yet</h3>
                <p>Add images to customize your site!</p>
            </div>
        `;
        return;
    }

    // Group by page
    const groupedByPage = siteImages.reduce((acc, img) => {
        if (!acc[img.page]) acc[img.page] = [];
        acc[img.page].push(img);
        return acc;
    }, {});

    container.innerHTML = Object.entries(groupedByPage).map(([page, images]) => `
        <div class="page-images-group">
            <h3 style="margin-bottom: 1rem; text-transform: capitalize;">${page.replace('-', ' ')}</h3>
            ${images.map(img => `
                <div class="post-item" style="margin-bottom: 1rem;">
                    <div class="post-info">
                        <div class="image-thumb" style="width: 120px; height: 80px; border-radius: 8px; background: #e5e5e5; margin-right: 1rem; background-image: url('${img.image_url}'); background-size: cover; background-position: center;"></div>
                        <div>
                            <h4 style="margin-bottom: 0.25rem;">${img.section}</h4>
                            <div class="post-meta">
                                <span>${img.description || 'No description'}</span>
                                <span>•</span>
                                <span style="color: ${img.is_active ? '#5CB85C' : '#999'}">${img.is_active ? 'Active' : 'Inactive'}</span>
                            </div>
                            <div style="font-size: 0.875rem; color: #666; margin-top: 0.25rem;">
                                ${img.alt_text || 'No alt text'}
                            </div>
                        </div>
                    </div>
                    <div class="post-actions">
                        <button class="btn btn-small btn-secondary" onclick="editSiteImage('${img.id}')">Edit</button>
                        <button class="btn btn-small btn-danger" onclick="deleteSiteImage('${img.id}')">Delete</button>
                        <button class="btn btn-small btn-secondary" onclick="copyImageUrl('${img.image_url}')">Copy URL</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `).join('');
}

// Update statistics
function updateImagesStats() {
    const total = siteImages.length;
    const active = siteImages.filter(i => i.is_active).length;
    const pages = new Set(siteImages.map(i => i.page)).size;

    document.getElementById('totalImages').textContent = total;
    document.getElementById('activeImages').textContent = active;
    document.getElementById('pagesWithImages').textContent = pages;
}

// Open modal for new image
function openNewImageModal() {
    currentImageEditId = null;
    document.getElementById('imageModalTitle').textContent = 'New Site Image';
    document.getElementById('imageForm').reset();
    document.getElementById('imageId').value = '';
    
    // Set defaults
    document.getElementById('imageActive').checked = true;
    
    // Update section dropdown
    updateSectionDropdown();
    
    document.getElementById('imageModal').style.display = 'block';
}

// Update section dropdown based on selected page
function updateSectionDropdown() {
    const page = document.getElementById('imagePage').value;
    const sectionSelect = document.getElementById('imageSection');
    
    if (!page) {
        sectionSelect.innerHTML = '<option value="">Select a page first...</option>';
        sectionSelect.disabled = true;
        return;
    }
    
    sectionSelect.disabled = false;
    const sections = PAGE_SECTIONS[page] || [];
    
    sectionSelect.innerHTML = '<option value="">Select a section...</option>' +
        sections.map(s => `<option value="${s.section}">${s.section} - ${s.description}</option>`).join('') +
        '<option value="custom">Custom section...</option>';
}

// Handle section dropdown change
document.getElementById('imageSection')?.addEventListener('change', (e) => {
    const customInput = document.getElementById('imageSectionCustom');
    if (e.target.value === 'custom') {
        customInput.style.display = 'block';
        customInput.required = true;
    } else {
        customInput.style.display = 'none';
        customInput.required = false;
        customInput.value = '';
    }
});

// Edit existing image
async function editSiteImage(id) {
    const image = siteImages.find(i => i.id === id);
    if (!image) return;

    currentImageEditId = id;
    document.getElementById('imageModalTitle').textContent = 'Edit Site Image';
    document.getElementById('imageId').value = image.id;
    document.getElementById('imagePage').value = image.page;
    
    updateSectionDropdown();
    
    setTimeout(() => {
        document.getElementById('imageSection').value = image.section;
        document.getElementById('imageDescription').value = image.description || '';
        document.getElementById('imageUrl').value = image.image_url;
        document.getElementById('imageAltText').value = image.alt_text || '';
        document.getElementById('imageActive').checked = image.is_active;
    }, 100);
    
    document.getElementById('imageModal').style.display = 'block';
}

// Delete site image
async function deleteSiteImage(id) {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    try {
        const { error } = await supabase
            .from('site_images')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        await loadSiteImages();
        alert('Image deleted successfully!');
    } catch (error) {
        console.error('Error deleting image:', error);
        alert('Error deleting image: ' + error.message);
    }
}

// Copy image URL to clipboard
function copyImageUrl(url) {
    navigator.clipboard.writeText(url).then(() => {
        alert('Image URL copied to clipboard!');
    }).catch(err => {
        console.error('Error copying URL:', err);
        alert('Error copying URL');
    });
}

// Close modal
function closeImageModal() {
    document.getElementById('imageModal').style.display = 'none';
    document.getElementById('imageForm').reset();
    currentImageEditId = null;
    document.getElementById('imageSectionCustom').style.display = 'none';
}

// Handle form submission
document.getElementById('imageForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    let section = document.getElementById('imageSection').value;
    if (section === 'custom') {
        section = document.getElementById('imageSectionCustom').value;
    }

    if (!section) {
        alert('Please select or enter a section!');
        return;
    }

    const imageData = {
        page: document.getElementById('imagePage').value,
        section: section,
        description: document.getElementById('imageDescription').value || null,
        image_url: document.getElementById('imageUrl').value,
        alt_text: document.getElementById('imageAltText').value || null,
        is_active: document.getElementById('imageActive').checked,
        updated_at: new Date().toISOString()
    };

    try {
        if (currentImageEditId) {
            // Update existing image
            const { error } = await supabase
                .from('site_images')
                .update(imageData)
                .eq('id', currentImageEditId);
            
            if (error) throw error;
            alert('Image updated successfully!');
        } else {
            // Create new image
            const { error } = await supabase
                .from('site_images')
                .insert([imageData]);
            
            if (error) throw error;
            alert('Image created successfully!');
        }

        closeImageModal();
        await loadSiteImages();
    } catch (error) {
        console.error('Error saving image:', error);
        alert('Error saving image: ' + error.message);
    }
});

// Page dropdown change handler
document.getElementById('imagePage')?.addEventListener('change', updateSectionDropdown);

// Bulk upload images
function bulkUploadImages() {
    alert('Bulk upload feature coming soon! For now, please add images one at a time.');
}