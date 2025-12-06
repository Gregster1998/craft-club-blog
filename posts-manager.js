// Posts Manager - Handles all blog post operations
// Data is stored in browser localStorage

// Initialize posts array
let posts = [];
let currentEditId = null;

// Load posts from localStorage
function loadPosts() {
    const savedPosts = localStorage.getItem('craftClubPosts');
    if (savedPosts) {
        posts = JSON.parse(savedPosts);
    } else {
        // Initialize with sample posts
        posts = getSamplePosts();
        savePosts();
    }
    renderPostsList();
}

// Save posts to localStorage
function savePosts() {
    localStorage.setItem('craftClubPosts', JSON.stringify(posts));
}

// Render posts list in CMS
function renderPostsList() {
    const container = document.getElementById('postsList');
    
    if (posts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No posts yet</h3>
                <p>Create your first blog post to get started!</p>
            </div>
        `;
        return;
    }

    // Sort posts by date (newest first)
    const sortedPosts = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));

    container.innerHTML = sortedPosts.map(post => `
        <div class="post-item">
            <div class="post-info">
                <div class="post-category">${getCategoryLabel(post.category)}</div>
                <h3>${post.title}</h3>
                <div class="post-meta">
                    <span>By ${post.author}</span>
                    <span>•</span>
                    <span>${formatDate(post.date)}</span>
                    <span>•</span>
                    <span>${post.readTime} min read</span>
                    <span>•</span>
                    <span style="color: ${post.status === 'published' ? '#5CB85C' : '#F0AD4E'}">${post.status}</span>
                </div>
            </div>
            <div class="post-actions">
                <button class="btn btn-small btn-secondary" onclick="editPost('${post.id}')">Edit</button>
                <button class="btn btn-small btn-danger" onclick="deletePost('${post.id}')">Delete</button>
                <a href="post.html?id=${post.id}" target="_blank" class="btn btn-small btn-secondary">View</a>
            </div>
        </div>
    `).join('');
}

// Update statistics
function updateStats() {
    const total = posts.length;
    const published = posts.filter(p => p.status === 'published').length;
    const drafts = posts.filter(p => p.status === 'draft').length;

    document.getElementById('totalPosts').textContent = total;
    document.getElementById('publishedPosts').textContent = published;
    document.getElementById('draftPosts').textContent = drafts;
}

// Open modal for new post
function openNewPostModal() {
    currentEditId = null;
    document.getElementById('modalTitle').textContent = 'New Post';
    document.getElementById('postForm').reset();
    document.getElementById('postId').value = '';
    document.getElementById('postModal').style.display = 'block';
}

// Edit existing post
function editPost(id) {
    const post = posts.find(p => p.id === id);
    if (!post) return;

    currentEditId = id;
    document.getElementById('modalTitle').textContent = 'Edit Post';
    document.getElementById('postId').value = post.id;
    document.getElementById('postTitle').value = post.title;
    document.getElementById('postSlug').value = post.slug;
    document.getElementById('postCategory').value = post.category;
    document.getElementById('postExcerpt').value = post.excerpt;
    document.getElementById('postContent').value = post.content;
    document.getElementById('postImage').value = post.image || '';
    document.getElementById('postAuthor').value = post.author;
    document.getElementById('postReadTime').value = post.readTime;
    document.getElementById('postStatus').value = post.status;
    
    document.getElementById('postModal').style.display = 'block';
}

// Delete post
function deletePost(id) {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    posts = posts.filter(p => p.id !== id);
    savePosts();
    renderPostsList();
    updateStats();
}

// Close modal
function closeModal() {
    document.getElementById('postModal').style.display = 'none';
    document.getElementById('postForm').reset();
    currentEditId = null;
}

// Handle form submission
document.getElementById('postForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const postData = {
        id: currentEditId || generateId(),
        title: document.getElementById('postTitle').value,
        slug: document.getElementById('postSlug').value,
        category: document.getElementById('postCategory').value,
        excerpt: document.getElementById('postExcerpt').value,
        content: document.getElementById('postContent').value,
        image: document.getElementById('postImage').value || null,
        author: document.getElementById('postAuthor').value,
        readTime: parseInt(document.getElementById('postReadTime').value),
        status: document.getElementById('postStatus').value,
        date: currentEditId ? posts.find(p => p.id === currentEditId).date : new Date().toISOString()
    };

    if (currentEditId) {
        // Update existing post
        const index = posts.findIndex(p => p.id === currentEditId);
        posts[index] = postData;
    } else {
        // Add new post
        posts.push(postData);
    }

    savePosts();
    closeModal();
    renderPostsList();
    updateStats();
});

// Export posts as JSON
function exportPosts() {
    const dataStr = JSON.stringify(posts, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `craft-club-posts-${Date.now()}.json`;
    link.click();
}

// Import posts
function importPosts() {
    document.getElementById('importFile').click();
}

function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedPosts = JSON.parse(e.target.result);
            if (confirm(`Import ${importedPosts.length} posts? This will replace all existing posts.`)) {
                posts = importedPosts;
                savePosts();
                renderPostsList();
                updateStats();
                alert('Posts imported successfully!');
            }
        } catch (error) {
            alert('Error importing posts. Please check the file format.');
        }
    };
    reader.readAsText(file);
}

// Helper functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function getCategoryLabel(category) {
    const labels = {
        'slow-living': 'SLOW LIVING',
        'techniques': 'TECHNIQUES',
        'tutorials': 'TUTORIALS',
        'community': 'COMMUNITY',
        'leather-craft': 'LEATHER CRAFT'
    };
    return labels[category] || category.toUpperCase();
}

// Sample posts for initial setup
function getSamplePosts() {
    return [
        {
            id: 'sample-1',
            title: 'Slow Stitching as Meditation: Finding Peace in Every Thread',
            slug: 'slow-stitching-meditation',
            category: 'slow-living',
            excerpt: 'In a world that demands constant productivity, there\'s something radical about sitting down with needle and thread, making one stitch at a time.',
            content: `# Slow Stitching as Meditation

In a world that demands constant productivity, there's something radical about sitting down with needle and thread, making one stitch at a time.

## The Practice of Presence

When you slow stitch, you're forced into the present moment. Unlike machine sewing with its mechanical hum and rapid completion, hand stitching demands your full attention. Each stitch is a small meditation—thread through fabric, pull gently, repeat.

## Why It Matters

Our hands were made to create. For thousands of years, humans have worked with fiber, with thread, with the slow accumulation of stitches that become something whole. In our hurried modern world, we've lost touch with this ancient rhythm.

## Getting Started

You don't need fancy equipment. A needle, thread, and a scrap of fabric are enough. Start with a simple running stitch. Feel the resistance of the fabric, the slide of thread, the rhythm of your breathing synchronized with your hands.

## The Radical Act of Slow

In a culture of fast fashion and instant gratification, choosing to create slowly is an act of rebellion. It's a statement that not everything should be optimized for speed. Some things—beautiful things—take time.

And that's exactly the point.`,
            image: null,
            author: 'Elena Rosetti',
            readTime: 6,
            status: 'published',
            date: '2024-12-01T10:00:00.000Z'
        },
        {
            id: 'sample-2',
            title: 'Natural Dyes from Your Kitchen: A Beginner\'s Guide',
            slug: 'natural-dyes-kitchen-guide',
            category: 'techniques',
            excerpt: 'Onion skins, avocado pits, and black beans—your kitchen scraps hold beautiful colors waiting to be discovered.',
            content: `# Natural Dyes from Your Kitchen

Before synthetic dyes, all color came from nature. Plants, insects, minerals—people extracted beauty from the world around them. Today, we can rediscover these ancient techniques right in our own kitchens.

## What You'll Need

- White or light-colored natural fabric (cotton, linen, wool)
- Large pot (not for cooking food!)
- Water
- Kitchen scraps (see below)
- Fixative (salt for berries, vinegar for other plants)

## The Best Kitchen Scraps for Dyeing

### Onion Skins
Creates gorgeous yellow to orange-brown colors depending on concentration. Save outer skins from yellow or red onions.

### Avocado Pits & Skins
Produces a beautiful dusty pink. Yes, really! The same avocado you put on toast.

### Black Beans
The soaking water creates stunning blue-purple hues.

### Coffee Grounds
Rich browns and tans. Use leftover grounds from your morning coffee.

## The Basic Process

1. **Prepare fabric**: Wash to remove any residues
2. **Make dye bath**: Simmer your scraps in water for 1-2 hours
3. **Strain**: Remove plant material
4. **Add fixative**: Salt or vinegar helps color bond
5. **Add fabric**: Simmer 1 hour, stirring occasionally
6. **Rinse & dry**: Rinse until water runs clear

## Embrace Imperfection

Natural dyes are unpredictable. Colors vary by season, water, timing. This isn't a flaw—it's the beauty. Each piece becomes unique, unrepeatable, yours.

Start saving those scraps!`,
            image: null,
            author: 'Maya Chen',
            readTime: 8,
            status: 'published',
            date: '2024-11-28T14:00:00.000Z'
        },
        {
            id: 'sample-3',
            title: 'Your First Crochet Project: The Granny Square',
            slug: 'first-crochet-granny-square',
            category: 'tutorials',
            excerpt: 'Every master was once a beginner. Start your crochet journey with this timeless, forgiving pattern.',
            content: `# Your First Crochet Project: The Granny Square

The granny square is where most crocheters begin, and for good reason. It's forgiving, versatile, and teaches you all the fundamental stitches you'll need.

## What You'll Need

- Worsted weight yarn (any color you love)
- Size H/8 (5mm) crochet hook
- Scissors
- Patience

## Why Start with Granny Squares?

1. **Forgiving**: Mistakes are easy to fix
2. **Repetitive**: You'll memorize the pattern quickly
3. **Modular**: Make many and join them together
4. **Functional**: Blankets, bags, coasters—endless possibilities

## The Basic Pattern

### Round 1
Start with a magic ring (or chain 4 and join).

**Pattern**: Chain 3 (counts as first double crochet), 2 double crochet in ring, chain 2, [3 double crochet, chain 2] three times. Join to top of beginning chain 3.

### Round 2
Slip stitch to corner space. Chain 3, 2 double crochet in same space, chain 2, 3 double crochet in same corner space. *3 double crochet in next corner space, chain 2, 3 double crochet in same space.* Repeat from * around. Join.

### Continue
Each round adds clusters of 3 double crochet in corner spaces and between clusters.

## Your First Square Will Be Ugly

Let me save you some anxiety: your first square will probably be wonky. The tension will be off, maybe you'll drop a stitch, the corners won't be quite square.

Make it anyway.

Then make another. And another. By your fifth square, you'll see improvement. By your twentieth, you'll be proud.

Every master was once a beginner who kept going.`,
            image: null,
            author: 'Elena Rosetti',
            readTime: 12,
            status: 'published',
            date: '2024-11-25T09:00:00.000Z'
        }
    ];
}