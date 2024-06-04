import React, { useEffect, useState } from 'react';
import './Orders.css';
import cross_icon from '../../assets/cross_icon.png';
import tick_icon from '../../assets/tick_icon.png';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [productDetails, setProductDetails] = useState({});

    const fetchInfo = async () => {
        try {
            const response = await fetch('http://localhost:4000/allorders');
            const data = await response.json();
            setOrders(data);
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    useEffect(() => {
        fetchInfo();
    }, []);

    const reject_order = async (id) => {
        try {
            await fetch('http://localhost:4000/rejectorder', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: id })
            });
            await fetchInfo();
        } catch (error) {
            console.error("Error rejecting order:", error);
        }
    };

    const accept_order = async (id) => {
        try {
            await fetch('http://localhost:4000/acceptorder', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: id })
            });
            await fetchInfo();
        } catch (error) {
            console.error("Error accepting order:", error);
        }
    };

    const getProductDetailsFromCart = async (cartData, orderId) => {
        const productIds = Object.keys(cartData).filter(key => cartData[key] > 0);
        const productDetails = {};

        try {
            for (const productId of productIds) {
                const response = await fetch(`http://localhost:4000/getproductname/${productId}`);
                const data = await response.json();

                if (data.success) {
                    const { productName, productSize } = data;
                    productDetails[productName] = {
                        quantity: cartData[productId],
                        size: productSize
                    };
                } else {
                    console.error(`Error fetching product details for product ID ${productId}: ${data.message}`);
                }
            }
        } catch (error) {
            console.error("Error fetching product details:", error);
        }

        setProductDetails(prevState => ({
            ...prevState,
            [orderId]: productDetails
        }));
    };

    useEffect(() => {
        orders.forEach(order => {
            getProductDetailsFromCart(order.cartData, order.id);
        });
    }, [orders]);

    return (
        <div className='list-order'>
            <h1>All Orders List</h1>
            <div className='listorder-format-main'>
                <p>Email</p>
                <p>Total cost</p>
                <p>Status</p>
                <p>Accept</p>
                <p>Reject</p>
                <p>Products</p>
            </div>
            <div className='listorder-orders'>
                <hr />
                {orders.map((order, index) => (
                    <div key={index} className='listorder-format-main listorder-format'>
                        <p>{order.email}</p>
                        <p>${order.totalcost}</p>
                        <p>{order.status}</p>
                        <img onClick={() => accept_order(order.id)} className='listorder-remove-icon' src={tick_icon} alt="" />
                        <img onClick={() => reject_order(order.id)} className='listorder-remove-icon' src={cross_icon} alt="" />
                        <div>
                            {productDetails[order.id] 
                                ? Object.entries(productDetails[order.id]).map(([name, details]) => (
                                    <p key={name}>{name} x {details.quantity} - {details.size}</p>
                                )) 
                                : 'Loading...'}
                        </div>
                    </div>
                ))}
                <hr />
            </div>
        </div>
    );
};

export default Orders;
