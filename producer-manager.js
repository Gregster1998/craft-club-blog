// Producers Manager - Handles fiber producer operations with Supabase

let producers = [];
let currentProducerEditId = null;

// Load producers from Supabase
async function loadProducers() {
    try {
        const { data, error } = await supabase
            .from('producers')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        producers = data || [];
        renderProducersList();
        updateProducersStats();
    } catch (error) {
        console.error('Error loading producers:', error);
        alert('Error loading producers: ' + error.message);
    }
}

// Render producers list in CMS
function renderProducersList() {
    const container = document.getElementById('producersList');
    
    if (producers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No producers yet</h3>
                <p>Add your first fiber producer to get started!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = producers.map(producer => `
        <div class="post-item">
            <div class="post-info">
                <div class="producer-avatar" style="width: 60px; height: 60px; border-radius: 50%; background: #e5e5e5; margin-right: 1rem;"></div>
                <div>
                    <h3>${producer.name}</h3>
                    <div class="post-meta">
                        <span>${producer.location}, ${producer.country}</span>
                        <span>•</span>
                        <span>⭐ ${producer.rating} (${producer.review_count})</span>
                        <span>•</span>
                        <span>${producer.animals_available} animals</span>
                        <span>•</span>
                        <span style="color: ${producer.is_active ? '#5CB85C' : '#999'}">${producer.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                </div>
            </div>
            <div class="post-actions">
                <button class="btn btn-small btn-secondary" onclick="editProducer('${producer.id}')">Edit</button>
                <button class="btn btn-small btn-secondary" onclick="manageAnimals('${producer.id}')">Animals</button>
                <button class="btn btn-small btn-danger" onclick="deleteProducer('${producer.id}')">Delete</button>
                <a href="producer-profile.html?id=${producer.slug}" target="_blank" class="btn btn-small btn-secondary">View</a>
            </div>
        </div>
    `).join('');
}

// Update statistics
function updateProducersStats() {
    const total = producers.length;
    const active = producers.filter(p => p.is_active).length;
    const totalAnimals = producers.reduce((sum, p) => sum + (p.animals_available || 0), 0);

    document.getElementById('totalProducers').textContent = total;
    document.getElementById('activeProducers').textContent = active;
    document.getElementById('totalAnimals').textContent = totalAnimals;
}

// Open modal for new producer
function openNewProducerModal() {
    currentProducerEditId = null;
    document.getElementById('producerModalTitle').textContent = 'New Producer';
    document.getElementById('producerForm').reset();
    document.getElementById('producerId').value = '';
    
    // Reset checkboxes
    document.getElementById('producerSustainable').checked = true;
    document.getElementById('producerOrganic').checked = false;
    document.getElementById('producerAnimalWelfare').checked = false;
    document.getElementById('producerHeritage').checked = false;
    
    document.getElementById('producerModal').style.display = 'block';
}

// Edit existing producer
async function editProducer(id) {
    const producer = producers.find(p => p.id === id);
    if (!producer) return;

    currentProducerEditId = id;
    document.getElementById('producerModalTitle').textContent = 'Edit Producer';
    document.getElementById('producerId').value = producer.id;
    document.getElementById('producerName').value = producer.name;
    document.getElementById('producerSlug').value = producer.slug;
    document.getElementById('producerTagline').value = producer.tagline || '';
    document.getElementById('producerLocation').value = producer.location;
    document.getElementById('producerCountry').value = producer.country;
    document.getElementById('producerDescription').value = producer.description;
    document.getElementById('producerStory').value = producer.story || '';
    document.getElementById('producerAvatarUrl').value = producer.avatar_url || '';
    document.getElementById('producerHeroUrl').value = producer.hero_image_url || '';
    document.getElementById('producerRating').value = producer.rating;
    document.getElementById('producerReviews').value = producer.review_count;
    
    // Certifications
    document.getElementById('producerSustainable').checked = producer.is_sustainable;
    document.getElementById('producerOrganic').checked = producer.is_organic;
    document.getElementById('producerAnimalWelfare').checked = producer.is_animal_welfare_approved;
    document.getElementById('producerHeritage').checked = producer.is_heritage_breed;
    
    // What You'll Receive
    document.getElementById('producerShearing').value = producer.shearing_frequency || '';
    document.getElementById('producerYield').value = producer.avg_yield || '';
    document.getElementById('producerWoolType').value = producer.wool_type || '';
    document.getElementById('producerProcessing').value = producer.processing_options ? producer.processing_options.join(', ') : '';
    
    document.getElementById('producerActive').checked = producer.is_active;
    
    document.getElementById('producerModal').style.display = 'block';
}

// Delete producer
async function deleteProducer(id) {
    if (!confirm('Are you sure you want to delete this producer? This will also delete all their animals.')) return;
    
    try {
        const { error } = await supabase
            .from('producers')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        await loadProducers();
        alert('Producer deleted successfully!');
    } catch (error) {
        console.error('Error deleting producer:', error);
        alert('Error deleting producer: ' + error.message);
    }
}

// Close modal
function closeProducerModal() {
    document.getElementById('producerModal').style.display = 'none';
    document.getElementById('producerForm').reset();
    currentProducerEditId = null;
}

// Handle form submission
document.getElementById('producerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const processingOptions = document.getElementById('producerProcessing').value
        .split(',')
        .map(opt => opt.trim())
        .filter(opt => opt);

    const producerData = {
        name: document.getElementById('producerName').value,
        slug: document.getElementById('producerSlug').value,
        tagline: document.getElementById('producerTagline').value,
        location: document.getElementById('producerLocation').value,
        country: document.getElementById('producerCountry').value,
        description: document.getElementById('producerDescription').value,
        story: document.getElementById('producerStory').value,
        avatar_url: document.getElementById('producerAvatarUrl').value || null,
        hero_image_url: document.getElementById('producerHeroUrl').value || null,
        rating: parseFloat(document.getElementById('producerRating').value),
        review_count: parseInt(document.getElementById('producerReviews').value),
        is_sustainable: document.getElementById('producerSustainable').checked,
        is_organic: document.getElementById('producerOrganic').checked,
        is_animal_welfare_approved: document.getElementById('producerAnimalWelfare').checked,
        is_heritage_breed: document.getElementById('producerHeritage').checked,
        shearing_frequency: document.getElementById('producerShearing').value,
        avg_yield: document.getElementById('producerYield').value,
        wool_type: document.getElementById('producerWoolType').value,
        processing_options: processingOptions,
        is_active: document.getElementById('producerActive').checked,
        updated_at: new Date().toISOString()
    };

    try {
        if (currentProducerEditId) {
            // Update existing producer
            const { error } = await supabase
                .from('producers')
                .update(producerData)
                .eq('id', currentProducerEditId);
            
            if (error) throw error;
            alert('Producer updated successfully!');
        } else {
            // Create new producer
            const { error } = await supabase
                .from('producers')
                .insert([producerData]);
            
            if (error) throw error;
            alert('Producer created successfully!');
        }

        closeProducerModal();
        await loadProducers();
    } catch (error) {
        console.error('Error saving producer:', error);
        alert('Error saving producer: ' + error.message);
    }
});

// Auto-generate slug from name
document.getElementById('producerName')?.addEventListener('input', (e) => {
    if (!currentProducerEditId) {
        const slug = e.target.value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        document.getElementById('producerSlug').value = slug;
    }
});

// Navigate to animals management
function manageAnimals(producerId) {
    // Switch to animals tab and filter by producer
    document.querySelector('[data-tab="animals"]').click();
    setTimeout(() => {
        filterAnimalsByProducer(producerId);
    }, 100);
}