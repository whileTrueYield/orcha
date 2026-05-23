import { CreateProductResolver } from "./createProduct.resolver";
import { UpdateProductResolver } from "./updateProduct.resolver";
import { ProductResolver } from "./product.resolver";
import { ProductsResolver } from "./products.resolver";
import { ProductByCodeResolver } from "./productByCode.resolver";
import { DeleteProductResolver } from "./deleteProduct.resolver";
import { MiniProductsResolver } from "./miniProducts.resolver";

export default [
  CreateProductResolver,
  UpdateProductResolver,
  ProductResolver,
  ProductByCodeResolver,
  ProductsResolver,
  DeleteProductResolver,
  MiniProductsResolver,
];
