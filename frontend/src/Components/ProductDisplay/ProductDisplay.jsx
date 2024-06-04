import React, { useContext } from "react";
import "./ProductDisplay.css";
import { ShopContext } from "../../Context/ShopContext";

const ProductDisplay = (props) => {
    const { product } = props;
    const { addToCart } = useContext(ShopContext);

    return (
        <div className="productdisplay">
            <div className="productdisplay-left">
                <div className="productdisplay-img">
                    <img
                        className="productdisplay-main-img"
                        src={product.image}
                        alt=""
                    />
                </div>
            </div>
            <div className="productdisplay-right">
                <h1>{product.name}</h1>
                <div className="productdisplay-right-prices">
                    {product.old_price !== product.new_price && (
                        <div className="productdisplay-right-price-old">
                            ${product.old_price}
                        </div>
                    )}
                    <div className="productdisplay-right-price-new">
                        ${product.new_price}
                    </div>
                </div>
                <div className="productdisplay-right-description">
                    Size: {product.size}
                </div>
                <div className="productdisplay-right-description">
                    {product.description}
                </div>
                <button onClick={() => {addToCart(product.id)}}>
                    ADD TO CART
                </button>
            </div>
        </div>
    );
};

export default ProductDisplay;