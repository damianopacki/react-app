import React, { Component, Fragment } from 'react';

import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import axios from '../../axios-orders'
import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandler from '../../components/withErrorHandler/withErrorHandler';

const INGREDIENT_PRICES = {
    salad: 0.5,
    meat: 1.3,
    cheese: 0.4,
    bacon: 0.8
};

class BurgerBuilder extends Component {
    state = {
        ingredients: null,
        totalPrice: 4,
        purchasable: false,
        purchasing: false,
        loading: false,
        error: false
    }

    componentDidMount() {
        axios.get('https://react-my-burger-fc323.firebaseio.com/ingredients.json')
            .then(response => {
                this.setState({ingredients: response.data})
            })
            .catch(error => {
                this.setState({error: true})
            });
    }

    updatePurchaseState() {
        this.setState((prevState, props) => {
            const ingredients = {...prevState.ingredients}
            const sum = Object.keys(ingredients)
                .map(igKey => (ingredients[igKey]))
                .reduce((prevSum, curSum) => (prevSum + curSum), 0);
            return {
                purchasable: sum > 0
            }
        })
    }

    purchaseHandler = () => {
        this.setState({purchasing: true});
    }

    purchaseCancelHandler = () => {
        this.setState({purchasing: false});
    }

    purchaseContinueHandler = () => {
        this.setState({loading: true});
        const order = {
            ingredients: this.state.ingredients,
            price: this.state.totalPrice,
            customer: {
                name: 'Damian Opacki',
                address: {
                    street: 'test street',
                    zipCode: '12882',
                    country: 'Poland'
                },
                email: 'test.test@com',
                deliveryMethod: 'fastest'
            }
        }
        axios.post('/orders.json', order)
            .then(response => this.setState({loading: false, purchasing: false}))
            .catch(error => this.setState({loading: false, purchasing: false}));
    }

    addIngredientHandler = (type) => {
        this.setState((prevState, props) => {
            const updatedIngredients = {...prevState.ingredients};
            updatedIngredients[type] += 1;
            return (
                {
                    ingredients: updatedIngredients,
                    totalPrice: prevState.totalPrice + INGREDIENT_PRICES[type]
                }
            );
        });
        this.updatePurchaseState();
    }

    removeIngredientHandler = (type) => {
        this.setState((prevState, props) => {
            const updatedIngredients = {...prevState.ingredients};
            if (updatedIngredients[type] > 0) {
                updatedIngredients[type] -= 1;
            } else {
                return;
            }
            return (
                {
                    ingredients: updatedIngredients,
                    totalPrice: prevState.totalPrice - INGREDIENT_PRICES[type]
                }
            );
        });
        this.updatePurchaseState();
    }

    render () {
        const disabledInfo = {
            ...this.state.ingredients
        };
        for (let key in disabledInfo) {
            disabledInfo[key] = disabledInfo[key] <= 0;
        }
        let orderSummary = null;
        if (this.state.loading) {
            orderSummary = <Spinner />;
        }
        let burger = this.state.error ? <p>Ingredients can't be loaded!</p> : <Spinner />
        if (this.state.ingredients) {
            burger = (
                <Fragment>
                    <Burger ingredients={this.state.ingredients}/>
                    <BuildControls 
                        ingredientAdded={this.addIngredientHandler}
                        ingredientRemoved={this.removeIngredientHandler}
                        disabled={disabledInfo}
                        price={this.state.totalPrice}
                        purchasable={this.state.purchasable}
                        ordered={this.purchaseHandler}
                    />
                </Fragment>
            );
            orderSummary = <OrderSummary 
                ingredients={this.state.ingredients}
                price={this.state.totalPrice}
                purchaseCancelled={this.purchaseCancelHandler}
                purchaseContinued={this.purchaseContinueHandler}
            />;
        }
        return (
            <Fragment>
                <Modal show={this.state.purchasing} modalClosed={this.purchaseCancelHandler}>
                    {orderSummary}
                </Modal>
                {burger}
            </Fragment>
        );
    }
}

export default withErrorHandler(BurgerBuilder, axios);