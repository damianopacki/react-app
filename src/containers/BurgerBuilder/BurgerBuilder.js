import React, { Component, Fragment } from 'react';

import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';

const INGREDIENT_PRICES = {
    salad: 0.5,
    meat: 1.3,
    cheese: 0.4,
    bacon: 0.8
};

class BurgerBuilder extends Component {
    state = {
        ingredients: {
            salad: 0,
            bacon: 0,
            cheese: 0,
            meat: 0
        },
        totalPrice: 4,
        purchasable: false,
        purchasing: false
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
        alert('You continue!');
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
        return (
            <Fragment>
                <Modal show={this.state.purchasing} modalClosed={this.purchaseCancelHandler}>
                    <OrderSummary 
                        ingredients={this.state.ingredients}
                        price={this.state.totalPrice}
                        purchaseCancelled={this.purchaseCancelHandler}
                        purchaseContinued={this.purchaseContinueHandler}
                    />
                </Modal>
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
    }
}

export default BurgerBuilder;