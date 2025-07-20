import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import Card from './UI/Card'
import Button from './UI/Button'
import Input from './UI/Input'
import ContactModal from './ContactModal'

export default function BuySell({ user }) {
  const [items, setItems] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [imageURL, setImageURL] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const handleContactSeller = (item) => {
    setSelectedItem(item)
    setShowModal(true)
  }

  const sendContactRequest = async ({ phone, facebook }) => {
    await supabase.from('contact_requests').insert([{
      item_id: selectedItem.item_id,
      seller_username: selectedItem.seller_username,
      buyer_username: user,
      phone_number: phone,
      facebook_username: facebook
    }])

    alert('Contact info sent to seller!')
    setShowModal(false)
  }

  const fetchItems = async () => {
    const { data } = await supabase
      .from('items')
      .select('*')
      .eq('is_sold', false)
      .order('created_at', { ascending: false })

    setItems(data || [])
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const handlePostItem = async () => {
    if (!title || !price) {
      alert('Title and Price are required')
      return
    }

    const { error } = await supabase.from('items').insert([{
      seller_username: user,
      title,
      description,
      price,
      image_url: imageURL
    }])

    if (error) {
      alert('Failed to post item')
    } else {
      alert('Item posted!')
      setTitle('')
      setDescription('')
      setPrice('')
      setImageURL('')
      fetchItems()
    }
  }

  const markAsSold = async (item_id) => {
    const { error } = await supabase
      .from('items')
      .update({ is_sold: true })
      .eq('item_id', item_id)

    if (error) {
      alert('Failed to mark as sold')
    } else {
      fetchItems()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
      <div className="max-w-3xl mx-auto">
        <Card>
          <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">Buy & Sell</h2>

          <h3 className="text-xl font-semibold mb-4 text-gray-700">Post New Item</h3>

          <Input
            type="text"
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Price"
            value={price}
            onChange={e => setPrice(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Image URL (optional)"
            value={imageURL}
            onChange={e => setImageURL(e.target.value)}
          />
          <Button color="green" onClick={handlePostItem}>Post Item</Button>
        </Card>

        <h3 className="text-2xl font-semibold my-6 text-gray-800">Available Items</h3>

        {items.length === 0 ? (
          <p className="text-center text-gray-500 italic">No items available right now.</p>
        ) : (
          <div className="grid gap-5">
            {items.map(item => (
              <Card key={item.item_id}>
                <h4 className="text-xl font-bold text-blue-700 mb-2">{item.title}</h4>
                {item.image_url && (
                  <img src={item.image_url} alt="Item"
                    className="w-full h-48 object-cover mb-3 rounded-xl shadow"
                  />
                )}
                <p className="mb-2 text-gray-700">{item.description}</p>
                <p className="text-green-600 font-bold mb-1">₹{item.price}</p>
                <p className="text-sm text-gray-500 mb-3">Seller: {item.seller_username}</p>

                {item.seller_username === user ? (
                  <Button color="red" onClick={() => markAsSold(item.item_id)}>Mark as Sold</Button>
                ) : (
                  <Button color="blue" onClick={() => handleContactSeller(item)}>Contact Seller</Button>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      <ContactModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={sendContactRequest}
      />
    </div>
  )
}
