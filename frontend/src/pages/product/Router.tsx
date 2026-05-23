import React from "react";
import { Route, Switch } from "react-router-dom";
import { ProductList } from "./ProductList/ProductList";
import { ProductEdit } from "./ProductEdit/ProductEdit";
import { urlResolver } from "utils/navigation";

export const ProductRouter: React.FC = () => (
  <Switch>
    <Route path={urlResolver.product.paths.edit} component={ProductEdit} />
    <Route path={urlResolver.product.paths.listing} component={ProductList} />
  </Switch>
);
