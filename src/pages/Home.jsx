import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import ProductCard from '../components/ProductCard';
import RadioButon from '../components/RadioButon';
import { getCategories, getCategoryId,
  getProductsFromCategoryAndQuery } from '../services/api';
import sumQty from '../services/helpers';

import styles from './Home.module.css';
import carrinho from '../images/carrinho.svg';
import logo from '../images/logo.svg';
import lupa from '../images/lupa.svg';

export default class Home extends Component {
  state = {
    search: '',
    filtro: '',
    apiResults: [],
    categories: [],
    renderQty: 0,
  };

  async componentDidMount() {
    const categories = await getCategories();
    this.setState({ categories });

    const sum = await sumQty();
    this.setState({ renderQty: sum });
  }

  // shouldComponentUpdate(_nextProps, nextState) {
  //   this.setState({ renderQty: ne})
  // }

  // Função criada pra passar a logica do value dos inputes pro estado, assim pode ser utilizada no envio da props pro documento e no para renderização
  onInputChange = ({ target: { name, value } }) => {
    this.setState({ [name]: value }, () => name === 'filtro' && this.handleCategoryId());
  };

  handleCategoryId = async () => {
    const { filtro } = this.state;
    const categoryApi = await getCategoryId(filtro);
    this.setState({ apiResults: categoryApi });
  };

  // logica que faz a renderização durante o click
  onSaveButton = async () => {
    const { search } = this.state;
    const queryApi = await getProductsFromCategoryAndQuery('', search);
    this.setState({ apiResults: queryApi.results });
  };

  addToCart = async (item) => {
    const { id, title, price, thumbnail, available_quantity: available } = item;
    const products = JSON.parse(localStorage.getItem('cart')) || [];
    let filteredProducts = [];
    const existsProduct = products?.some((prod) => prod.id === id);
    if (!existsProduct) {
      filteredProducts = [...products, { id,
        title,
        price,
        thumbnail,
        qty: 1,
        available }];
    } else {
      filteredProducts = products.map((prod) => {
        if (prod.id === id) {
          return {
            ...prod,
            qty: prod.qty + 1,
          };
        }
        return prod;
      });
    }
    const sum = sumQty();
    this.setState({ renderQty: sum + 1 });
    localStorage.setItem('cart', JSON.stringify(filteredProducts));
  };

  render() {
    const { search, apiResults, categories, renderQty } = this.state;
    return (
      <div className={ styles.homeContainer }>

        <div className={ styles.headerContainer }>

          <section className={ styles.search }>
            <Input value={ search } onInputChange={ this.onInputChange } />
            <Button
              buttonText={ lupa }
              onSaveButton={ this.onSaveButton }
              testid="query-button"
            />
          </section>

          <img src={ logo } alt="" />

          <section className={ styles.cartBtn }>
            <Link to="/shoppingCart" data-testid="shopping-cart-button">
              <img src={ carrinho } alt="carrinho" />
            </Link>
            <span
              data-testid="shopping-cart-size"
              className={ styles.cartQty }
            >
              {renderQty}
            </span>
          </section>
        </div>

        <div className={ styles.categoryContainer }>
          <section className={ styles.categories }>
            <h2>Categorias</h2>
            {categories.length > 0 && categories.map((category) => (
              <RadioButon
                key={ category.id }
                id={ category.id }
                name={ category.name }
                onInputChange={ this.onInputChange }
              />
            ))}
          </section>

          <section className={ styles.products }>
            {apiResults.length < 1
              && (
                <span data-testid="home-initial-message">
                  Digite algum termo de pesquisa ou escolha uma categoria.
                </span>
              )}
            {
              apiResults.length > 0
                ? apiResults.map((item) => (
                  <div key={ item.id }>
                    <ProductCard
                      title={ item.title }
                      price={ item.price }
                      thumbnail={ item.thumbnail }
                      id={ item.id }
                      shipping={ item.shipping }
                    />
                    <button
                      type="button"
                      data-testid="product-add-to-cart"
                      onClick={ () => this.addToCart(item) }
                    >
                      Adicionar ao carrinho
                    </button>
                  </div>

                ))
                : (<span>Nenhum produto foi encontrado</span>)
            }
          </section>
        </div>
      </div>
    );
  }
}
// pr
