// Supabase Configuration
// Replace these with your actual Supabase credentials

const SUPABASE_CONFIG = {
    url: 'https://yzuoujjzupbbekmmymqn.supabase.co', // Replace with your project URL
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6dW91amp6dXBiYmVrbW15bXFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMjYwOTgsImV4cCI6MjA4MDYwMjA5OH0.Ri9ibTKIin_oA0vsHthU_zbnuNnnKQsXkmF5Es8UJWc' // Replace with your anon public key
};

// Initialize Supabase client
let supabase = null;

// Load Supabase client library
function initSupabase() {
    return new Promise((resolve, reject) => {
        // Load Supabase library from CDN
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.onload = () => {
            // Initialize Supabase client
            supabase = window.supabase.createClient(
                SUPABASE_CONFIG.url,
                SUPABASE_CONFIG.anonKey
            );
            resolve(supabase);
        };
        script.onerror = () => {
            reject(new Error('Failed to load Supabase library'));
        };
        document.head.appendChild(script);
    });
}

// Database operations for posts
const PostsDB = {
    // Get all posts
    async getAll() {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
    },

    // Get published posts only
    async getPublished() {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('status', 'published')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
    },

    // Get single post by ID
    async getById(id) {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        return data;
    },

    // Get single post by slug
    async getBySlug(slug) {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('slug', slug)
            .single();
        
        if (error) throw error;
        return data;
    },

    // Get posts by category
    async getByCategory(category) {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('category', category)
            .eq('status', 'published')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
    },

    // Create new post
    async create(post) {
        const { data, error } = await supabase
            .from('posts')
            .insert([{
                ...post,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    // Update existing post
    async update(id, updates) {
        const { data, error } = await supabase
            .from('posts')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    // Delete post
    async delete(id) {
        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        return true;
    },

    // Get statistics
    async getStats() {
        const { data, error } = await supabase
            .from('posts')
            .select('status');
        
        if (error) throw error;
        
        return {
            total: data.length,
            published: data.filter(p => p.status === 'published').length,
            drafts: data.filter(p => p.status === 'draft').length
        };
    }
};

// Helper function to handle errors
function handleDBError(error, message = 'Database error') {
    console.error(message, error);
    alert(`${message}: ${error.message}`);
}

// Check if Supabase is configured
function isSupabaseConfigured() {
    return SUPABASE_CONFIG.url !== 'YOUR_SUPABASE_URL' && 
           SUPABASE_CONFIG.anonKey !== 'YOUR_SUPABASE_ANON_KEY';
}