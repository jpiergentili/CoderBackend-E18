import { Router } from "express";
import productModel from '../dao/models/product.models.js'

import CustomError from '../services/errors/custom_errors.js';
import EErros from '../services/errors/enums.js';
import {
  generateProductLoadErrorInfo,
  generateProductCreateErrorInfo,
  generateProductUpdateErrorInfo,
  generateProductDeleteErrorInfo
} from '../services/errors/info.js';

const router = Router()

const auth = (req, res, next) => {
  if (req.session.user) return next()
  return res.send('Error de autenticación')
}

// Ruta para la vista Home donde se van a mostrar todos los productos
router.get('/', auth, async (req, res, next) => {
  try {
    let page = parseInt(req.query.page);
    let limit = parseInt(req.query.limit);
    let sort = req.query.sort;
    let query = req.query.query;
    const user = req.session.user
    const isAdmin = user.role == 'admin' ? true : false

    let querySort = {};
    let queryFilter = {};


    if (!page) page = 1;
    if (!limit) limit = 10;

    if (sort === 'asc' || sort === 'desc') {
      querySort.price = sort === 'asc' ? 'asc' : 'desc';
    }
    if (query) {
      queryFilter.title = { $regex: query, $options: 'i' };
    }
    const products = await productModel.paginate(queryFilter, { page, limit, sort: querySort, lean: true });
    products.prevLink = products.hasPrevPage ? `/products?page=${products.prevPage}` : ''
    products.nextLink = products.hasNextPage ? `/products?page=${products.nextPage}` : ''
    res.render('products', { products, user, isAdmin }) 
  } catch (error) {
    const customError = CustomError.createError({
      name: 'Error al cargar los productos',
      message: 'Hubo un error al intentar cargar los productos',
      cause: generateProductLoadErrorInfo(),
      code: EErros.DATABASE_ERROR
    });
    return next(customError); // Pasar el error al siguiente middleware (errorMiddleware)
  }
});

router.get('/create', (req, res, next) => {
  try {
    res.render('createProduct', {})    
  } catch (error) {
    const customError ={
      name: 'Error al crear el producto',
      message: 'Hubo un error al intentar crear el producto',
      cause: generateProductCreateErrorInfo(), // Asegúrate de que esta función devuelva una cadena de texto
      code: EErros.DATABASE_ERROR
    }
    return next(customError);
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const product = await productModel.findOne({ _id: id }).lean().exec();
    res.render('productForId', { product });
  } catch (error) {
    const customError = {
      name: 'Error al cargar el producto',
      message: 'Hubo un error al intentar cargar el producto',
      cause: 'Detalles específicos sobre el error de carga del producto',
      code: EErros.DATABASE_ERROR
    }
    return next(customError); // Pasar el error al siguiente middleware (errorMiddleware)
  }
});

router.get('/update/:id', async (req, res) => {
  const id = req.params.id
  const product = await productModel.findOne({ _id: id }).lean().exec()
  res.render('updateProduct', { product })
})

// Ruta para crear un nuevo producto
router.post('/', async (req, res, next) => {
  try {
    const newProduct = await productModel.create(req.body);
    res.redirect(`/products/${newProduct._id}`)
  } catch (error) {
    const customError = {
      name: 'Error al crear el producto',
      message: 'Hubo un error al intentar crear el producto',
      cause: generateProductCreateErrorInfo(),
      code: EErros.DATABASE_ERROR
    };
    return next(customError); // Pasar el error al siguiente middleware (errorMiddleware)
  }
});

// Ruta para actualizar un producto existente
router.put('/:id', async (req, res, next) => {
  try {
    const updatedProduct = await productModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.json(updatedProduct);
  } catch (error) {
    const customError = {
      name: 'Error al actualizar el producto',
      message: 'Hubo un error al intentar actualizar el producto',
      cause: generateProductUpdateErrorInfo(),
      code: EErros.DATABASE_ERROR
    }
    return next(customError); // Pasar el error al siguiente middleware (errorMiddleware)
  }
});

// Ruta para eliminar un producto existente
router.delete('/delete/:id', async (req, res, next) => {
  try {
    await productModel.findByIdAndRemove(req.params.id);
    res.sendStatus(204);
  } catch (error) {
    const customError = {
      name: 'Error al eliminar el producto',
      message: 'Hubo un error al intentar eliminar el producto',
      cause: generateProductDeleteErrorInfo(),
      code: EErros.DATABASE_ERROR
    }
    return next(customError); // Pasar el error al siguiente middleware (errorMiddleware)
  }
});

export default router;