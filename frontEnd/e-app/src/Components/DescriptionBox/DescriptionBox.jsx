import React from 'react'
import './DescriptionBox.css'

export const DescriptionBox = () => {
  return (
    <div className='descriptionbox'>
        <div className="descriptionbox-navigator">
            <div className="descriptionbox-nav-box">Description</div>
            <div className="descriptionbox-nav-box fade"> Reviews(122)</div>
        </div>
        <div className="descriptionbox-description">
            <p>An e-commerce website is a digital marketplace where businesses and consumers engage in the purchase and sale of goods and services. These platforms are equipped with various functionalities, including product listings, shopping carts, payment processing, and customer reviews, to ensure a seamless shopping experience. E-commerce websites have transformed the retail landscape by eliminating geographical barriers, providing convenience, and often personalized shopping experiences. They leverage data analytics to offer targeted recommendations, enhancing customer satisfaction and loyalty.</p>
        </div>
    </div>
  )
}
