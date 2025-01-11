import React from 'react'
import './NewsLetter.css'

export const NewsLetter = () => {
  return (
    <div className='newsletter'>
      <h1>Get Exclusive Offers on Your Email</h1>  
      <p>Subscribe to our News Letter and Stay Updated</p>
      <div>
      <input type="email" />
      <button>Subscribe</button>
      </div>
    </div>

     
  )
}
