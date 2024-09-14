require('dotenv').config();
const Product = require('../models/Product')
const Category = require('../models/Categories');

const addProduct = async (req, res) => {
    try {
        const user = req.user;

        if(!user) {
            res.status(401).json({ message: 'Unauthorized: Please log in' });
        }

        const {name, description, category, price, stock, available, tags, images, ratings} = req.body;

        const newProduct = new Product({
            name,
            description,
            category,
            price,
            stock,
            available,
            tags,
            images,
            ratings,
            seller: user.userId
        })

        await newProduct.save();

        res.status(200).json({ message: 'Product created successfully' });
    }
    catch(error){
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}

const getProduct = async (req, res) => {
    try {
        const product = await Product.find();
        
        if(!product) {
            res.status(404).json({ message: 'Product not found' })
        }
        res.status(200).json(product);
    }
    catch(error){
        res.status(500).json({ message: 'Internal server error' , error: error.message});
    }
}

const getProductById = async (req, res) => {
    try {
        const productId = req.params.id;

        const product = await Product.findById(productId);

        if(!product) {
            res.status(404).json({ message: 'Product not found' })
        }
        res.status(200).json(product);
    }
    catch(error){
        res.status(500).json({ message: 'Internal server error', error:error.message });
    }
}

const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const updatedProduct = await Product.findByIdAndUpdate(productId, req.body);

        if(!updatedProduct) {
            res.status(404).json({ message: 'Product not found' })
        }

        res.status(200).json({ message: 'Product updated successfully', updatedProduct })
    }
    catch(error){
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const deletedProduct = await Product.findByIdAndDelete(productId);

        if(!deletedProduct) {
            res.status(404).json({ message: 'Product not found' })
        }

        res.status(200).json({ message: 'Product deleted sucessfully'})
    }
    catch(error){
        res.status(500).json({ message: 'Internal server error',  error: error.message})
    }
}

const searchProducts = async (req, res) => {
    const { q } = req.query;

    // Trim and validate the search query
    const searchQuery = q ? q.trim() : '';

    if (!searchQuery) {
        return res.status(400).json({ message: 'Search query cannot be empty' });
    }

    try {
        // Split query into words for flexible matching
        const searchTerms = searchQuery.split(' ').filter(term => term.length > 0);

        // Build regex for each term to match in both 'name' and 'description'
        const regexPatterns = searchTerms.map(term => ({
            $or: [
                { name: { $regex: term, $options: 'i' } },
                { description: { $regex: term, $options: 'i' } },
                { tags: { $in: [term] } }
            ]
        }));

        // Search for products that match the query
        const products = await Product.find({ $and: regexPatterns })

        // Send the result
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error searching products', error });
    }
}

const filterProducts = async (req, res) => {
    try {
        const { category, minPrice, maxPrice } = req.query;

        // Initialize query object
        let query = {};

        // Check if category filter is provided
        if (category) {
            const categoryObj = await Category.findOne({ name: category });
            if (categoryObj) {
                query.category = categoryObj._id;  // Use the ObjectId of the category
            } else {
                return res.status(404).json({ message: 'Category not found' });
            }
        }

        // Add price filters
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = minPrice;
            if (maxPrice) query.price.$lte = maxPrice;
        }

        // Fetch products based on query
        const filteredProducts = await Product.find(query)
            .populate('category')  // Include category details
            .populate('seller');    // Include seller details

        res.status(200).json(filteredProducts);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

module.exports = { getProduct, getProductById, addProduct, updateProduct, deleteProduct, searchProducts, filterProducts };