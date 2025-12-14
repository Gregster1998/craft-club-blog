// Animals Manager - Handles animal adoption listings with Supabase

let animals = [];
let currentAnimalEditId = null;
let currentFilterProducerId = null;

// Load animals from Supabase
async function loadAnimals() {
    try {
        const { data, error } = await supabase
            .from('animals')
            .select(`
                *,
                producer:producers(name, slug)
            `)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        animals = data || [];
        renderAnimalsList();
        updateAnimalsStats();
    } catch (error) {
        console.error('Error loading animals:', error);
        alert('Error loading animals: ' + error.message);
    }
}

// Render animals list in CMS
function renderAnimalsList() {
    const container = document.getElementById('animalsList');
    
    let displayAnimals = animals;
    if (currentFilterProducerId) {
        displayAnimals = animals.filter(a => a.producer_id === currentFilterProducerId);
    }
    
    if (displayAnimals.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No animals yet</h3>
                <p>Add your first animal for adoption!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = displayAnimals.map(animal => `
        <div class="post-item">
            <div class="post-info">
                <div class="animal-thumb" style="width: 80px; height: 80px; border-radius: 8px; background: #e5e5e5; margin-right: 1rem; background-image: url('${animal.image_url || ''}'); background-size: cover;"></div>
                <div>
                    <h3>${animal.name}</h3>
                    <div class="post-meta">
                        <span>${animal.producer?.name || 'Unknown Producer'}</span>
                        <span>•</span>
                        <span>${animal.animal_type} • ${animal.breed}</span>
                        <span>•</span>
                        <span>${animal.age} years • ${animal.color}</span>
                        <span>•</span>
                        <span>${animal.currency}${animal.price_per_year}/year</span>
                        <span>•</span>
                        <span style="color: ${animal.is_available ? '#5CB85C' : '#999'}">${animal.is_available ? 'Available' : 'Adopted'}</span>
                    </div>
                </div>
            </div>
            <div class="post-actions">
                <button class="btn btn-small btn-secondary" onclick="editAnimal('${animal.id}')">Edit</button>
                <button class="btn btn-small btn-danger" onclick="deleteAnimal('${animal.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Update statistics
function updateAnimalsStats() {
    const total = animals.length;
    const available = animals.filter(a => a.is_available).length;
    const adopted = animals.filter(a => !a.is_available).length;

    document.getElementById('totalAnimalCount').textContent = total;
    document.getElementById('availableAnimals').textContent = available;
    document.getElementById('adoptedAnimals').textContent = adopted;
}

// Filter animals by producer
function filterAnimalsByProducer(producerId) {
    currentFilterProducerId = producerId;
    renderAnimalsList();
}

// Clear producer filter
function clearProducerFilter() {
    currentFilterProducerId = null;
    renderAnimalsList();
}

// Open modal for new animal
async function openNewAnimalModal() {
    currentAnimalEditId = null;
    document.getElementById('animalModalTitle').textContent = 'New Animal';
    document.getElementById('animalForm').reset();
    document.getElementById('animalId').value = '';
    
    // Load producers for dropdown
    await loadProducersDropdown();
    
    // Set defaults
    document.getElementById('animalAvailable').checked = true;
    document.getElementById('animalFeatured').checked = false;
    document.getElementById('animalCurrency').value = 'EUR';
    
    document.getElementById('animalModal').style.display = 'block';
}

// Load producers for dropdown
async function loadProducersDropdown() {
    try {
        const { data, error } = await supabase
            .from('producers')
            .select('id, name')
            .eq('is_active', true)
            .order('name');
        
        if (error) throw error;
        
        const select = document.getElementById('animalProducer');
        select.innerHTML = '<option value="">Select a producer...</option>' +
            data.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        
    } catch (error) {
        console.error('Error loading producers:', error);
    }
}

// Edit existing animal
async function editAnimal(id) {
    const animal = animals.find(a => a.id === id);
    if (!animal) return;

    currentAnimalEditId = id;
    
    // Load producers dropdown first
    await loadProducersDropdown();
    
    document.getElementById('animalModalTitle').textContent = 'Edit Animal';
    document.getElementById('animalId').value = animal.id;
    document.getElementById('animalProducer').value = animal.producer_id;
    document.getElementById('animalName').value = animal.name;
    document.getElementById('animalType').value = animal.animal_type;
    document.getElementById('animalBreed').value = animal.breed;
    document.getElementById('animalAge').value = animal.age || '';
    document.getElementById('animalColor').value = animal.color || '';
    document.getElementById('animalPersonality').value = animal.personality || '';
    document.getElementById('animalImageUrl').value = animal.image_url || '';
    document.getElementById('animalPrice').value = animal.price_per_year;
    document.getElementById('animalCurrency').value = animal.currency;
    document.getElementById('animalAvailable').checked = animal.is_available;
    document.getElementById('animalFeatured').checked = animal.is_featured;
    
    document.getElementById('animalModal').style.display = 'block';
}

// Delete animal
async function deleteAnimal(id) {
    if (!confirm('Are you sure you want to delete this animal?')) return;
    
    try {
        const { error } = await supabase
            .from('animals')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        await loadAnimals();
        // Update producer stats
        await loadProducers();
        alert('Animal deleted successfully!');
    } catch (error) {
        console.error('Error deleting animal:', error);
        alert('Error deleting animal: ' + error.message);
    }
}

// Close modal
function closeAnimalModal() {
    document.getElementById('animalModal').style.display = 'none';
    document.getElementById('animalForm').reset();
    currentAnimalEditId = null;
}

// Handle form submission
document.getElementById('animalForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const animalData = {
        producer_id: document.getElementById('animalProducer').value,
        name: document.getElementById('animalName').value,
        animal_type: document.getElementById('animalType').value,
        breed: document.getElementById('animalBreed').value,
        age: parseInt(document.getElementById('animalAge').value) || null,
        color: document.getElementById('animalColor').value || null,
        personality: document.getElementById('animalPersonality').value || null,
        image_url: document.getElementById('animalImageUrl').value || null,
        price_per_year: parseFloat(document.getElementById('animalPrice').value),
        currency: document.getElementById('animalCurrency').value,
        is_available: document.getElementById('animalAvailable').checked,
        is_featured: document.getElementById('animalFeatured').checked,
        updated_at: new Date().toISOString()
    };

    if (!animalData.producer_id) {
        alert('Please select a producer!');
        return;
    }

    try {
        if (currentAnimalEditId) {
            // Update existing animal
            const { error } = await supabase
                .from('animals')
                .update(animalData)
                .eq('id', currentAnimalEditId);
            
            if (error) throw error;
            alert('Animal updated successfully!');
        } else {
            // Create new animal
            const { error } = await supabase
                .from('animals')
                .insert([animalData]);
            
            if (error) throw error;
            alert('Animal created successfully!');
        }

        closeAnimalModal();
        await loadAnimals();
        // Update producer stats
        await updateProducerAnimalsCount();
    } catch (error) {
        console.error('Error saving animal:', error);
        alert('Error saving animal: ' + error.message);
    }
});

// Update producer animals count
async function updateProducerAnimalsCount() {
    try {
        // Get count of available animals per producer
        const { data: counts, error } = await supabase
            .from('animals')
            .select('producer_id')
            .eq('is_available', true);
        
        if (error) throw error;
        
        // Count animals per producer
        const countsMap = counts.reduce((acc, item) => {
            acc[item.producer_id] = (acc[item.producer_id] || 0) + 1;
            return acc;
        }, {});
        
        // Update each producer
        for (const [producerId, count] of Object.entries(countsMap)) {
            await supabase
                .from('producers')
                .update({ animals_available: count })
                .eq('id', producerId);
        }
        
        // Reload producers to show updated counts
        await loadProducers();
    } catch (error) {
        console.error('Error updating producer counts:', error);
    }
}